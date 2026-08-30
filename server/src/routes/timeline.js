import express from 'express';
import { db } from '../database/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/timeline — Fetch chronological composite health timeline for a patient
router.get('/', authenticate, (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.patient.id : req.query.patientId;
    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required.' });
    }

    const patient = db.patients.find(p => p.id === patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const timelineEvents = [];

    // Helper to format ISO strings to date format (YYYY-MM-DD)
    const formatDateStr = (isoStr) => {
      if (!isoStr) return new Date().toISOString().split('T')[0];
      return isoStr.split('T')[0];
    };

    // 1. Compile Medical Records
    const medicalRecords = db.medical_records.filter(r => r.patient_id === patientId);
    medicalRecords.forEach(r => {
      let icon = '📄';
      if (r.category === 'prescriptions') icon = '💊';
      else if (r.category === 'lab_reports') icon = '🧪';
      else if (r.category === 'scans') icon = '🔬';
      else if (r.category === 'consultations') icon = '🩺';

      let status = 'patient_reported';
      if (r.metadata?.verified_by_doctor || r.doctor_id) {
        status = 'verified';
      } else if (r.metadata?.digitization_session_id) {
        // check corresponding digitization session status
        const session = db.document_digitizations.find(s => s.id === r.metadata.digitization_session_id);
        if (session) {
          status = session.status === 'verified' ? 'verified' : 'needs_verification';
        } else {
          status = 'needs_verification';
        }
      }

      timelineEvents.push({
        id: `med-${r.id}`,
        date: formatDateStr(r.record_date),
        type: 'medical_record',
        icon,
        title: r.title || 'Medical Record',
        subtitle: (r.category || 'general').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: r.description || 'No description available',
        status,
        metadata: {
          file_url: r.file_url,
          file_type: r.file_type,
          doctor_name: r.metadata?.doctor_name || 'Not detected',
          hospital_name: r.metadata?.hospital_name || 'Not detected',
          findings: r.metadata?.findings || [],
          medicines: (r.metadata?.medicines || []).map(m => ({
            name: m.name || m.medicine_name || 'Medicine name not recorded',
            dosage: m.dosage || 'Not recorded',
            frequency: m.frequency || 'Not specified',
            duration: m.duration || (m.duration_days ? `${m.duration_days} days` : 'Ongoing'),
            instructions: m.instructions || null
          })),
          treatments: r.metadata?.treatments || [],
          verified_by_doctor: r.metadata?.verified_by_doctor
        }
      });
    });

    // 2. Compile Ayurvedic Assessments (Dashavidha Pariksha)
    const ayurvedaAssessments = db.ayurveda_assessments.filter(a => a.patient_id === patientId);
    ayurvedaAssessments.forEach(a => {
      timelineEvents.push({
        id: `ayur-assess-${a.id}`,
        date: formatDateStr(a.created_at || a.assessed_at),
        type: 'ayurveda_assessment',
        icon: '🌿',
        title: 'Ayurvedic Consultation',
        subtitle: 'Dashavidha Pariksha Assessment',
        description: `Vaidya assessment completed. Confirmed Prakriti: ${a.prakriti_confirmed || a.assessment_data?.prakriti || 'Not assessed'}, Confirmed Vikriti: ${a.vikriti_confirmed || a.assessment_data?.vikriti || 'Not assessed'}`,
        status: 'verified',
        metadata: {
          ...(a.dashavidha || {}),
          prakriti_confirmed: a.prakriti_confirmed,
          vikriti_confirmed: a.vikriti_confirmed,
          vaidya_notes: a.vaidya_notes,
          assessed_by: a.assessed_by
        }
      });
    });

    // 3. Compile Ayurvedic Treatments
    const ayurvedaTreatments = db.ayurveda_treatments.filter(t => t.patient_id === patientId);
    ayurvedaTreatments.forEach(t => {
      timelineEvents.push({
        id: `ayur-treat-${t.id}`,
        date: formatDateStr(t.treatment_date || t.date),
        type: 'ayurveda_treatment',
        icon: '🧘',
        title: t.treatment_name || 'Ayurvedic Treatment',
        subtitle: t.treatment_type || 'Panchakarma',
        description: t.notes || 'Ayurvedic therapy administered.',
        status: t.recorded_by === 'doctor' ? 'verified' : 'patient_reported',
        metadata: {
          practitioner: t.practitioner || 'Not specified',
          duration: t.duration || 'Not specified',
          follow_up_date: t.follow_up_date || null,
          response: t.response || null
        }
      });
    });

    // 4. Compile AI Clinical Histories
    const clinicalHistories = db.clinical_histories.filter(h => h.patient_id === patientId);
    clinicalHistories.forEach(h => {
      timelineEvents.push({
        id: `ai-intake-${h.id}`,
        date: formatDateStr(h.created_at),
        type: 'ai_intake',
        icon: '🤖',
        title: 'AI Clinical Intake History',
        subtitle: 'Intake Assessment',
        description: `Chief Complaint: ${h.chief_complaint || 'General health evaluation'}`,
        status: h.status === 'verified' ? 'verified' : 'patient_reported',
        metadata: {
          symptoms: h.symptoms || [],
          lifestyle_factors: h.lifestyle_factors || {},
          ai_summary: h.ai_summary || 'AI draft synthesis pending clinician review.'
        }
      });
    });

    // 5. Compile Medicine Regimens (Modern & Ayurvedic)
    const medicines = db.medicines.filter(m => m.patient_id === patientId);
    const ayurvedaMeds = db.ayurveda_medicines.filter(m => m.patient_id === patientId);

    const allMeds = [
      ...medicines.map(m => ({ ...m, medicine_type: m.medicine_type || 'modern' })),
      ...ayurvedaMeds.map(m => ({ ...m, medicine_type: 'ayurvedic', start_date: m.start_date || m.created_at }))
    ];

    allMeds.forEach(m => {
      const medName = m.name || m.medicine_name || 'Unknown Medicine';
      const medDosage = m.dose || m.dosage || 'Dosage not recorded';
      const medFrequency = m.frequency || 'Frequency not recorded';
      const medSource = m.prescription_source || m.prescribing_vaidya || m.prescriber || 'Not specified';
      const isAyurvedic = m.medicine_type === 'ayurvedic';

      timelineEvents.push({
        id: `med-reg-${m.id}`,
        date: formatDateStr(m.start_date || m.created_at),
        type: 'medicine',
        icon: isAyurvedic ? '🌿' : '💊',
        title: `Medicine Added: ${medName}`,
        subtitle: isAyurvedic ? 'Ayurvedic Regimen' : 'Modern Medicine',
        description: `${medDosage} — ${medFrequency}. Source: ${medSource}.`,
        status: m.recorded_by === 'doctor' || m.prescriber ? 'verified' : (m.is_active ? 'verified' : 'patient_reported'),
        metadata: {
          medicine_name: medName,
          dosage: medDosage,
          frequency: medFrequency,
          route: m.route || null,
          duration: m.end_date ? `Until ${m.end_date}` : (m.duration ? m.duration : 'Ongoing'),
          duration_days: m.duration_days || null,
          safety_notes: m.safety_notes || m.notes || null,
          is_active: !!m.is_active,
          prescription_source: medSource,
          start_date: formatDateStr(m.start_date),
          end_date: m.end_date || null
        }
      });
    });

    // 6. Compile Consultations / Appointments
    const appointments = db.appointments.filter(ap => ap.patient_id === patientId);
    appointments.forEach(ap => {
      const doctor = db.doctors.find(d => d.id === ap.doctor_id);
      const doctorName = doctor
        ? `Dr. ${doctor.first_name || ''} ${doctor.last_name || ''}`.trim()
        : 'Medical Specialist';
      const specialization = doctor ? (doctor.specialization || '') : '';
      const hospital = db.hospitals.find(h => h.id === ap.hospital_id);
      const hospitalName = hospital ? hospital.name : 'Hospital not specified';

      let apptStatus = 'scheduled';
      if (ap.status === 'completed') apptStatus = 'completed';
      else if (ap.status === 'cancelled') apptStatus = 'cancelled';

      const chiefComplaint = ap.chief_complaint || ap.purpose || 'General Consultation';
      const consultTypeLabel = ap.consultation_type === 'video_consult' ? '📹 Video Consult' : '🏥 In-Person';

      timelineEvents.push({
        id: `appt-${ap.id}`,
        date: formatDateStr(ap.appointment_date),
        type: 'appointment',
        icon: '🩺',
        title: chiefComplaint,
        subtitle: `Appointment — ${doctorName}`,
        description: `${consultTypeLabel} with ${doctorName}${specialization ? ` (${specialization})` : ''}.`,
        status: apptStatus,
        metadata: {
          doctor_name: doctorName,
          specialization: specialization || 'Specialist',
          time_slot: ap.start_time || 'Time not specified',
          consultation_type: ap.consultation_type || 'in_person',
          consultation_type_label: consultTypeLabel,
          chief_complaint: chiefComplaint,
          appointment_date: formatDateStr(ap.appointment_date),
          status: ap.status || 'scheduled',
          hospital_name: hospitalName
        }
      });
    });

    // 7. Compile Ayurvedic Treatment Responses
    const ayurvedaResponses = db.treatment_responses.filter(r => r.patient_id === patientId);
    ayurvedaResponses.forEach(r => {
      const treatment = db.ayurveda_treatments.find(t => t.id === r.treatment_id);
      const treatmentName = treatment ? treatment.treatment_name : 'General Regimen';
      
      timelineEvents.push({
        id: `ayur-resp-${r.id}`,
        date: formatDateStr(r.created_at),
        type: 'ayurveda_response',
        icon: '📈',
        title: `Ayurvedic Outcome Tracked (${r.period})`,
        subtitle: `Therapeutic Response — ${treatmentName}`,
        description: `Symptom Score: ${r.symptom_score ?? 'N/A'}/10 | Sleep: ${r.sleep_quality || 'N/A'} | Energy: ${r.energy_level || 'N/A'}. Notes: ${r.notes || 'Outcome recorded.'}`,
        status: r.recorded_by === 'doctor' ? 'verified' : 'patient_reported',
        metadata: {
          period: r.period,
          symptom_score: r.symptom_score,
          sleep_quality: r.sleep_quality,
          energy_level: r.energy_level,
          digestion: r.digestion,
          notes: r.notes
        }
      });
    });

    // Sort events chronologically (newest first)
    timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      timeline: timelineEvents
    });

  } catch (err) {
    console.error('[Timeline Fetch Error]', err);
    res.status(500).json({ error: 'Failed to retrieve composite health timeline.' });
  }
});

export default router;
