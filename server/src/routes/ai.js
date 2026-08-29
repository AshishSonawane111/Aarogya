import express from 'express';
import { db, recordAuditLog } from '../database/store.js';
import { authenticate } from '../middleware/auth.js';
import { generateHealthSummary, explainMedicalReport } from '../services/aiService.js';

const router = express.Router();

// Patient Portal AI Health Summary
router.get('/health-summary', authenticate, async (req, res) => {
  const patientId = req.user.role === 'patient' ? req.patient.id : req.query.patientId;

  if (!patientId) {
    return res.status(400).json({ error: 'patientId is required' });
  }

  const patient = db.patients.find(p => p.id === patientId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const emergencyProfile = db.emergency_profiles.find(ep => ep.patient_id === patientId);
  const records = db.medical_records.filter(r => r.patient_id === patientId);

  const summary = await generateHealthSummary(patient, records, emergencyProfile, 'patient');

  res.json({
    success: true,
    summary
  });
});

// Doctor Portal AI Clinical Summary (STRICT: ONLY uses authorized categories)
router.get('/clinical-summary/:patientId', authenticate, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ error: 'Only doctors can access clinical AI summaries' });
  }

  const { patientId } = req.params;
  const doctor = req.doctor;
  const patient = db.patients.find(p => p.id === patientId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Verify Active Consent
  const activeConsent = db.consent_requests.find(cr => 
    cr.patient_id === patientId &&
    cr.doctor_id === doctor.id &&
    cr.status === 'approved' &&
    new Date(cr.valid_until) > new Date()
  );

  if (!activeConsent) {
    return res.status(403).json({
      error: 'Access Denied: AI Clinical Summary requires an active patient consent grant.',
      requires_consent: true
    });
  }

  // Filter records to ONLY authorized categories
  const approvedCategories = activeConsent.approved_categories;
  const hasComplete = approvedCategories.includes('complete_record');

  const authorizedRecords = db.medical_records.filter(r => {
    if (r.patient_id !== patientId) return false;
    if (hasComplete) return true;
    return approvedCategories.includes(r.category);
  });

  const emergencyProfile = db.emergency_profiles.find(ep => ep.patient_id === patientId);

  const summary = await generateHealthSummary(patient, authorizedRecords, emergencyProfile, 'doctor');

  // Audit Log AI generation
  recordAuditLog({
    patient_id: patientId,
    actor_id: req.user.id,
    actor_role: 'doctor',
    actor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
    doctor_id: doctor.id,
    action: 'generate_ai_clinical_summary',
    category_accessed: approvedCategories.join(','),
    consent_status: 'approved',
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || 'Doctor Portal',
    details: { authorized_records_used: authorizedRecords.length }
  });

  res.json({
    success: true,
    authorized_categories_used: approvedCategories,
    summary
  });
});

// AI Medical Report Explainer
router.post('/report-explainer', authenticate, async (req, res) => {
  const { report_title, report_content, report_type } = req.body;

  if (!report_title && !report_content) {
    return res.status(400).json({ error: 'Please provide a report title or text content to explain' });
  }

  const explanation = await explainMedicalReport({
    reportTitle: report_title,
    reportContent: report_content,
    reportType: report_type
  });

  res.json({
    success: true,
    explanation
  });
});

// ====================================================================
// PHASE 7 — Conversational AI Health Assistant Chat
// ====================================================================

const RED_FLAG_KEYWORDS = [
  'chest pain', 'difficulty breathing', "can't breathe", 'cannot breathe',
  'stroke', 'unconscious', 'severe bleeding', 'sudden weakness', 'paralysis',
  'loss of consciousness', 'severe headache', 'sudden vision loss', 'slurred speech',
  'heart attack', 'seizure', 'convulsion', 'suicidal', 'overdose',
];

function hasRedFlag(text) {
  const lower = text.toLowerCase();
  return RED_FLAG_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Builds a comprehensive patient health context string
 * from live in-memory db — used as the system prompt context for the AI.
 */
function buildPatientContext(patientId) {
  const patient = db.patients.find(p => p.id === patientId);
  if (!patient) return null;

  const emergency = db.emergency_profiles.find(ep => ep.patient_id === patientId);
  const medicines = (db.medicines || []).filter(m => m.patient_id === patientId && m.is_active);
  const records = db.medical_records.filter(r => r.patient_id === patientId);
  const appointments = (db.appointments || [])
    .filter(a => a.patient_id === patientId)
    .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
    .slice(0, 3);

  // Ayurveda
  const ayurvedaProfile = (db.ayurveda_profiles || []).find(ap => ap.patient_id === patientId);
  const ayurvedaMeds = (db.ayurveda_medicines || []).filter(am => am.patient_id === patientId && am.is_active);

  const recentRecords = records
    .sort((a, b) => new Date(b.record_date) - new Date(a.record_date))
    .slice(0, 5)
    .map(r => `• ${r.title || 'Untitled Record'} (${r.category || 'General'}, ${r.record_date || 'Date not recorded'}): ${r.description || 'No description available'}`)
    .join('\n');

  const medicinesList = medicines.length > 0
    ? medicines.map(m => {
        const name = m.name || m.medicine_name || 'Medicine name not recorded';
        const dosage = m.dosage && !name.toLowerCase().includes(m.dosage.toLowerCase()) ? ` ${m.dosage}` : '';
        const frequency = m.frequency ? ` — ${m.frequency}` : '';
        const purpose = m.purpose ? ` (${m.purpose})` : ' (General use)';
        return `• ${name}${dosage}${frequency}${purpose}`;
      }).join('\n')
    : '• No active allopathic medicines recorded';

  const ayurvedaMedsList = ayurvedaMeds.length > 0
    ? ayurvedaMeds.map(m => {
        const name = m.name || m.medicine_name || 'Medicine name not recorded';
        const dosage = (m.dose || m.dosage) && !name.toLowerCase().includes((m.dose || m.dosage).toLowerCase()) ? ` — ${m.dose || m.dosage}` : '';
        const duration = m.duration || m.anupana ? ` (${m.duration || m.anupana})` : ' (as directed)';
        return `• ${name}${dosage}${duration}`;
      }).join('\n')
    : '• No active Ayurvedic medicines';

  const upcomingAppointments = appointments.length > 0
    ? appointments.map(a => {
        const doc = db.doctors.find(d => d.id === a.doctor_id);
        const doctorName = doc ? `Dr. ${doc.first_name} ${doc.last_name}` : 'Unknown Doctor';
        const apptDate = a.appointment_date || 'Date not recorded';
        const apptPurpose = a.chief_complaint || a.purpose || 'Consultation';
        const apptStatus = a.status || 'scheduled';
        return `• ${apptDate} with ${doctorName} — ${apptPurpose} [${apptStatus}]`;
      }).join('\n')
    : '• No upcoming appointments on record';

  const allergies = emergency?.allergies?.join(', ') || 'None documented';
  const conditions = emergency?.major_conditions?.join(', ') || 'None documented';

  // Ayurveda Profile confirmed values
  const prakritiVal = ayurvedaProfile ? (ayurvedaProfile.vaidya_prakriti || ayurvedaProfile.reported_prakriti || 'Not assessed') : 'Not assessed';
  const vikritiVal = ayurvedaProfile ? (ayurvedaProfile.vaidya_vikriti || ayurvedaProfile.reported_vikriti || 'Not assessed') : 'Not assessed';
  const agniVal = ayurvedaProfile ? (ayurvedaProfile.agni || 'Not assessed') : 'Not assessed';
  const koshthaVal = ayurvedaProfile ? (ayurvedaProfile.koshtha || 'Not assessed') : 'Not assessed';

  return `
=== PATIENT HEALTH PASSPORT CONTEXT ===
Patient: ${patient.first_name || ''} ${patient.last_name || ''}, ${patient.gender || 'Gender not specified'}, DOB: ${patient.dob || 'Unknown'}
Blood Group: ${emergency?.blood_group || patient.blood_group || 'Not recorded'}
Known Allergies: ${allergies}
Chronic Conditions: ${conditions}

--- Current Allopathic Medicines ---
${medicinesList}

--- Current Ayurvedic Medicines ---
${ayurvedaMedsList}

--- Ayurveda Profile ---
Prakriti: ${prakritiVal} | Vikriti: ${vikritiVal} | Agni: ${agniVal} | Koshtha: ${koshthaVal}

--- Recent Medical Records (last 5) ---
${recentRecords || '• No records on file'}

--- Upcoming Appointments ---
${upcomingAppointments}

Total records on file: ${records.length}
=== END OF CONTEXT ===
`.trim();
}

/**
 * Rule-based fallback AI chat engine used when OpenAI is unavailable.
 * Produces intelligent, context-aware responses from live patient data.
 */
function ruleBasedChatResponse(message, patientContext, patientId) {
  const lower = message.toLowerCase();
  const patient = db.patients.find(p => p.id === patientId);
  const emergency = db.emergency_profiles.find(ep => ep.patient_id === patientId);
  const medicines = (db.medicines || []).filter(m => m.patient_id === patientId && m.is_active);
  const records = db.medical_records.filter(r => r.patient_id === patientId);
  const ayurvedaMeds = (db.ayurveda_medicines || []).filter(am => am.patient_id === patientId && am.is_active);
  const appointments = (db.appointments || [])
    .filter(a => a.patient_id === patientId)
    .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));

  const name = patient ? patient.first_name : 'there';

  // Medicine questions
  if (lower.includes('medicine') || lower.includes('medication') || lower.includes('drug') || lower.includes('tablet') || lower.includes('pill')) {
    if (medicines.length === 0 && ayurvedaMeds.length === 0) {
      return `Hi ${name}! Based on your Health Passport, no active medicines are currently recorded.\n\nIf you are taking medicines, you can add them in the 💊 Medicines section.\n\n⚠️ Always consult your doctor before starting or stopping any medicines.`;
    }
    let reply = `Here are your currently active medicines from your Health Passport, ${name}:\n\n`;
    if (medicines.length > 0) {
      reply += `**Allopathic Medicines:**\n`;
      medicines.forEach(m => {
        const medName = m.name || m.medicine_name || 'Medicine name not recorded';
        const dosage = m.dosage && !medName.toLowerCase().includes(m.dosage.toLowerCase()) ? ` ${m.dosage}` : '';
        const frequency = m.frequency ? ` — ${m.frequency}` : '';
        const purpose = m.purpose ? `\n  Purpose: ${m.purpose}` : '\n  Purpose: As prescribed';
        reply += `• ${medName}${dosage}${frequency}${purpose}\n`;
      });
    }
    if (ayurvedaMeds.length > 0) {
      reply += `\n**Ayurvedic Medicines:**\n`;
      ayurvedaMeds.forEach(m => {
        const medName = m.name || m.medicine_name || 'Medicine name not recorded';
        const dosage = (m.dose || m.dosage) && !medName.toLowerCase().includes((m.dose || m.dosage).toLowerCase()) ? ` — ${m.dose || m.dosage}` : '';
        reply += `• ${medName}${dosage}\n`;
      });
    }
    reply += `\n⚠️ This information is from your Health Passport records. Always verify your current medicines with your prescribing doctor or pharmacist.`;
    return reply;
  }

  // Allergy questions
  if (lower.includes('allerg')) {
    const allergies = emergency?.allergies || [];
    if (allergies.length === 0) {
      return `No allergies are currently recorded in your Health Passport, ${name}.\n\nIf you have known allergies, please update your Emergency Profile — this is critical information for emergency care.\n\n⚠️ Verify your allergy list with your doctor.`;
    }
    return `Your recorded allergies in your Health Passport, ${name}:\n\n${allergies.map(a => `• ${a || 'Unknown Allergy'}`).join('\n')}\n\n⚠️ Please verify this list with your doctor to ensure it is complete and up to date.`;
  }

  // Condition / diagnosis questions
  if (lower.includes('condition') || lower.includes('diagnosis') || lower.includes('disease') || lower.includes('diagnos') || lower.includes('chronic')) {
    const conditions = emergency?.major_conditions || [];
    if (conditions.length === 0) {
      return `No chronic conditions are recorded in your Health Passport currently, ${name}.\n\nIf you have been diagnosed with any conditions, please update your health profile.\n\n⚠️ AI-assisted information — always verify with your healthcare provider.`;
    }
    return `Your documented conditions in your Health Passport, ${name}:\n\n${conditions.map(c => `• ${c || 'Unknown Condition'}`).join('\n')}\n\n⚠️ This is informational. Discuss your diagnoses and management plan with your doctor.`;
  }

  // Appointment questions
  if (lower.includes('appointment') || lower.includes('doctor visit') || lower.includes('next visit') || lower.includes('schedule')) {
    if (appointments.length === 0) {
      return `You have no appointments recorded in your Health Passport, ${name}.\n\nYou can book an appointment from the Appointments section.\n\n💡 Tip: Prepare for any visit by bringing your Health Passport QR code and a list of current medicines.`;
    }
    const upcoming = appointments.filter(a => a.status === 'scheduled').slice(0, 3);
    if (upcoming.length === 0) {
      const lastAppt = appointments[0];
      const doc = db.doctors.find(d => d.id === lastAppt.doctor_id);
      const doctorName = doc ? `Dr. ${doc.first_name} ${doc.last_name}` : 'Unknown Doctor';
      return `No upcoming scheduled appointments found, ${name}. Your most recent appointment was:\n\n• ${lastAppt.appointment_date || 'Date not recorded'} with ${doctorName} — ${lastAppt.chief_complaint || lastAppt.purpose || 'Consultation'} [${lastAppt.status || 'completed'}]\n\nYou can book a new appointment from the Appointments section.`;
    }
    const upcomingList = upcoming.map(a => {
      const doc = db.doctors.find(d => d.id === a.doctor_id);
      const doctorName = doc ? `Dr. ${doc.first_name} ${doc.last_name}` : 'Unknown Doctor';
      return `• ${a.appointment_date || 'Date not recorded'} with ${doctorName} — ${a.chief_complaint || a.purpose || 'Consultation'} [${a.status || 'scheduled'}]`;
    }).join('\n');
    return `Your upcoming appointments, ${name}:\n\n${upcomingList}\n\n💡 Bring your Health Passport QR code and a list of current symptoms to your appointment.`;
  }

  // Records / history summary
  if (lower.includes('summar') || lower.includes('history') || lower.includes('overview') || lower.includes('record')) {
    const recentRecords = records
      .sort((a, b) => new Date(b.record_date) - new Date(a.record_date))
      .slice(0, 5);
    
    if (recentRecords.length === 0) {
      return `No medical records are currently stored in your Health Passport, ${name}.\n\nYou can upload documents in the 📄 Reports & Documents section.`;
    }
    
    let reply = `Here is a summary of your recent health records, ${name}:\n\n`;
    recentRecords.forEach(r => {
      reply += `• **${r.title || 'Untitled Record'}** (${r.record_date || 'Date not recorded'})\n  Category: ${r.category || 'General'}\n  ${r.description ? r.description.slice(0, 100) : 'No description available'}...\n\n`;
    });
    reply += `📋 Total records on file: ${records.length}\n\n⚠️ AI-assisted summary — verify all information with your healthcare providers.`;
    return reply;
  }

  // Doctor visit preparation
  if (lower.includes('prepar') || lower.includes('bring') || lower.includes('visit') || lower.includes('checklist')) {
    return `Here's a personalised checklist for your next doctor visit, ${name}:\n\n✅ **Your Health Passport QR Code** — share it with your doctor for instant access\n✅ **Current Medicines** — ${medicines.length} active medicines recorded\n✅ **Known Allergies** — ${emergency?.allergies?.join(', ') || 'None recorded'}\n✅ **Recent Lab Reports** — bring any reports from the last 3 months\n✅ **Symptom List** — note any new or worsening symptoms\n✅ **Questions for your doctor** — write them down beforehand\n\n💡 Your doctor can scan your Health Passport QR to instantly view your authorized records.`;
  }

  // Blood group
  if (lower.includes('blood') && (lower.includes('group') || lower.includes('type'))) {
    const bg = emergency?.blood_group || patient?.blood_group;
    if (!bg) return `Your blood group is not recorded in your Health Passport, ${name}. Please update your Emergency Profile with this important information.`;
    return `Your blood group recorded in your Health Passport is: **${bg}**, ${name}.\n\n⚠️ Always verify with a clinical blood test before any medical procedure.`;
  }

  // Ayurveda questions
  if (lower.includes('ayurved') || lower.includes('prakriti') || lower.includes('dosha') || lower.includes('vata') || lower.includes('pitta') || lower.includes('kapha')) {
    const ayurvedaProfile = (db.ayurveda_profiles || []).find(ap => ap.patient_id === patientId);
    if (!ayurvedaProfile) {
      return `No Ayurvedic profile has been set up yet, ${name}.\n\nYou can access your complete Ayurveda module from the 🌿 Ayurveda section in your Health Passport, including:\n• Prakriti (constitution) assessment\n• Dosha analysis\n• Ayurvedic medicine tracking\n• Treatment protocols`;
    }
    const prakriti = ayurvedaProfile.vaidya_prakriti || ayurvedaProfile.reported_prakriti || 'Not assessed';
    const vikriti = ayurvedaProfile.vaidya_vikriti || ayurvedaProfile.reported_vikriti || 'Not assessed';
    const agni = ayurvedaProfile.agni || 'Not assessed';
    const koshtha = ayurvedaProfile.koshtha || 'Not assessed';
    return `Your Ayurvedic profile, ${name}:\n\n• **Prakriti (Constitution):** ${prakriti}\n• **Vikriti (State):** ${vikriti}\n• **Agni (Digestive Fire):** ${agni}\n• **Koshtha:** ${koshtha}\n\nActive Ayurvedic medicines: ${ayurvedaMeds.length}\n\n🌿 View full details in the Ayurveda section.\n\n⚠️ Ayurvedic information is supplementary — always consult a qualified Vaidya.`;
  }

  // Emergency / safety questions
  if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('crisis')) {
    return `If this is a medical emergency, please act immediately:\n\n📞 **Call 112** (Emergency Services)\n🚑 **Ambulance: 102**\n🏥 Go to the nearest hospital emergency department\n\nYour Health Passport Emergency Profile contains your critical medical information for first responders.\n\nBlood Group: ${emergency?.blood_group || 'Not recorded'}\nAllergies: ${emergency?.allergies?.join(', ') || 'None recorded'}\nCritical Medicines: ${emergency?.critical_medicines?.join(', ') || 'None recorded'}\n\n⚠️ Do not rely on AI during a medical emergency. Call for professional help immediately.`;
  }

  // Lab results questions
  if (lower.includes('lab') || lower.includes('test result') || lower.includes('report') || lower.includes('blood test') || lower.includes('scan')) {
    const labRecords = records.filter(r => r.category === 'lab_reports' || r.category === 'scans');
    if (labRecords.length === 0) {
      return `No lab reports or scans are currently in your Health Passport, ${name}.\n\nYou can upload your lab reports in the 📄 Reports & Documents section. Our AI can then help explain the findings.`;
    }
    const latest = labRecords.sort((a, b) => new Date(b.record_date) - new Date(a.record_date))[0];
    return `Your most recent lab report: **${latest.title || 'Untitled Report'}** (${latest.record_date || 'Date not recorded'})\n\n${latest.description || 'No description available.'}\n\n📄 You can use the AI Report Explainer in the AI Health Summary section to get a plain-language explanation of any report.\n\n⚠️ Lab results should always be interpreted by your doctor in the context of your full clinical picture.`;
  }

  // Generic helpful response
  return `Thank you for your question, ${name}. I'm your AI Health Assistant, and I have access to your Health Passport data.\n\nI can help you with:\n• 💊 **Your medicines** — "What medicines am I taking?"\n• 🩺 **Your conditions** — "What conditions do I have?"\n• 📋 **Health summary** — "Summarize my health records"\n• 📅 **Appointments** — "When is my next appointment?"\n• 🌿 **Ayurveda** — "What is my Prakriti?"\n• 🚑 **Emergency info** — "What is my blood group?"\n• 📄 **Lab reports** — "Explain my latest lab results"\n\n⚠️ I provide informational summaries only. All medical decisions should be made by your qualified healthcare professional.`;
}

/**
 * Phase 7: Conversational AI Health Assistant Chat Endpoint
 * POST /api/ai/chat
 * Body: { messages: [{role, content}], message: string }
 */
router.post('/chat', authenticate, async (req, res) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ error: 'Chat is only available for patients' });
  }

  const { message, messages = [] } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'message is required' });
  }

  const patientId = req.patient.id;
  const redFlag = hasRedFlag(message);
  const patientContext = buildPatientContext(patientId);

  if (!patientContext) {
    return res.status(404).json({ error: 'Patient data not found' });
  }

  let reply = '';
  let usedOpenAI = false;

  // Try OpenAI if key is available
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey.startsWith('sk-')) {
    try {
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      const OpenAI = require('openai');
      const client = new OpenAI({ apiKey: openaiKey });

      const systemPrompt = `You are an empathetic, knowledgeable AI Health Assistant for the Aarogya Health Passport — an Indian digital health records platform.

Your role:
- Help patients understand their own health records, medicines, lab results, and appointments
- Answer questions in a warm, clear, non-technical way
- Use the patient's actual health data provided below as your primary source
- Never fabricate diagnoses, lab values, medicine doses, or treatment plans
- If something is not in the health records, say "Not documented in your Health Passport"
- Always end responses with: "⚠️ This is informational — verify with your healthcare professional"
- For emergency symptoms, always direct to 112/102 FIRST before anything else
- Support Hindi/English code-switching naturally

SAFETY RULES:
- NEVER diagnose conditions or interpret lab values clinically
- NEVER recommend starting or stopping medicines
- NEVER suggest specific treatments
- If red-flag symptoms are mentioned, immediately direct to emergency services

${patientContext}`;

      const chatMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ];

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: chatMessages,
        max_tokens: 600,
        temperature: 0.4,
      });

      reply = completion.choices[0]?.message?.content || '';
      usedOpenAI = true;
    } catch (err) {
      console.error('[AI Chat] OpenAI error, falling back to rule-based:', err.message);
    }
  }

  // Rule-based fallback
  if (!reply) {
    reply = ruleBasedChatResponse(message, patientContext, patientId);
    usedOpenAI = false;
  }

  // Audit log the chat
  recordAuditLog({
    patient_id: patientId,
    actor_id: req.user.id,
    actor_role: 'patient',
    actor_name: `${req.patient.first_name || ''} ${req.patient.last_name || ''}`.trim(),
    action: 'ai_chat_query',
    category_accessed: 'ai_assistant',
    consent_status: 'self',
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || 'Health Passport Client',
    details: { message_length: message.length, red_flag: redFlag, used_openai: usedOpenAI }
  });

  return res.json({
    success: true,
    reply,
    red_flag: redFlag,
    used_openai: usedOpenAI,
    disclaimer: 'AI-assisted information — not a substitute for professional medical advice'
  });
});

export default router;
