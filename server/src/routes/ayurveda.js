/**
 * Ayurveda Routes — Phase 4 / Phase 8 (security hardening)
 *
 * GET    /api/ayurveda/profile                — get patient's ayurveda profile
 * PUT    /api/ayurveda/profile                — create/update ayurveda profile (patient)
 * GET    /api/ayurveda/assessment/:patientId  — get Dashavidha assessment
 * POST   /api/ayurveda/assessment             — add/update assessment (doctor/vaidya only)
 * GET    /api/ayurveda/medicines              — list ayurvedic medicines
 * POST   /api/ayurveda/medicines              — add ayurvedic medicine
 * PATCH  /api/ayurveda/medicines/:id/toggle   — toggle active status
 * GET    /api/ayurveda/treatments             — list treatment history
 * POST   /api/ayurveda/treatments             — add treatment entry
 * GET    /api/ayurveda/responses              — list treatment responses
 * POST   /api/ayurveda/responses              — add treatment response
 *
 * Phase 8 Security: All doctor-facing read and write operations require an
 * active patient consent containing 'ayurveda' in approved_categories.
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, checkActiveConsent, recordAuditLog } from '../database/store.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getPatientId(req) {
  if (req.user.role === 'patient') return req.patient?.id;
  return req.query.patientId || req.body.patient_id;
}

/**
 * Phase 8: Enforce Ayurveda consent for doctor-facing operations.
 * Returns true if allowed; sends a 403 response and returns false if denied.
 */
function enforceAyurvedaConsent(req, res, patientId) {
  if (req.user.role !== 'doctor') return true; // patients always access own data

  const doctor = req.doctor;
  const hasConsent = checkActiveConsent(patientId, doctor.id, 'ayurveda');

  if (!hasConsent) {
    recordAuditLog({
      patient_id: patientId,
      actor_id: req.user.id,
      actor_role: 'doctor',
      actor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
      doctor_id: doctor.id,
      action: 'ayurveda_access_denied',
      category_accessed: 'ayurveda',
      consent_status: 'unauthorized',
      ip_address: req.ip || '127.0.0.1',
      user_agent: req.headers['user-agent'] || 'Doctor Portal',
      details: { reason: 'No active ayurveda consent grant' }
    });

    res.status(403).json({
      error: "Access Denied: Patient has not granted 'Ayurveda & Herbal' access. Request patient consent first.",
      requires_consent: true,
      category: 'ayurveda',
      patient_id: patientId
    });
    return false;
  }
  return true;
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
// GET /api/ayurveda/profile
router.get('/profile', authenticate, async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(400).json({ error: 'patientId required.' });

  // Phase 8: enforce consent for doctor access
  if (!enforceAyurvedaConsent(req, res, patientId)) return;

  let profile = db.ayurveda_profiles.find(p => p.patient_id === patientId);

  // Return empty scaffold if no profile yet
  if (!profile) {
    return res.json({
      success: true,
      profile: null,
      message: 'No Ayurveda profile yet. Use PUT /api/ayurveda/profile to create one.'
    });
  }

  res.json({ success: true, profile });
});

// PUT /api/ayurveda/profile — patient self-report
router.put('/profile', authenticate, async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(400).json({ error: 'patientId required.' });

  // Doctors cannot write a patient's self-reported profile — only patients can
  if (req.user.role === 'doctor') {
    return res.status(403).json({ error: 'Only patients can update their own Ayurveda profile. Use POST /assessment for practitioner assessment.' });
  }

  const {
    reported_prakriti,
    reported_vikriti,
    agni,
    koshtha,
    ahara,
    vihara,
    nidana,
    previous_ayurvedic_treatment,
    notes,
  } = req.body;

  let profile = db.ayurveda_profiles.find(p => p.patient_id === patientId);

  if (profile) {
    // Update existing
    Object.assign(profile, {
      reported_prakriti: reported_prakriti ?? profile.reported_prakriti,
      reported_vikriti: reported_vikriti ?? profile.reported_vikriti,
      agni: agni ?? profile.agni,
      koshtha: koshtha ?? profile.koshtha,
      ahara: ahara ?? profile.ahara,
      vihara: vihara ?? profile.vihara,
      nidana: nidana ?? profile.nidana,
      previous_ayurvedic_treatment: previous_ayurvedic_treatment ?? profile.previous_ayurvedic_treatment,
      notes: notes ?? profile.notes,
      updated_at: new Date().toISOString(),
    });
  } else {
    profile = {
      id: uuidv4(),
      patient_id: patientId,
      reported_prakriti: reported_prakriti || null,
      reported_vikriti: reported_vikriti || null,
      agni: agni || null,
      koshtha: koshtha || null,
      ahara: ahara || {},
      vihara: vihara || {},
      nidana: nidana || null,
      previous_ayurvedic_treatment: previous_ayurvedic_treatment || null,
      notes: notes || null,
      // Practitioner-filled fields (blank until Vaidya adds)
      vaidya_prakriti: null,
      vaidya_vikriti: null,
      vaidya_notes: null,
      verified_by: null,
      verified_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.ayurveda_profiles.unshift(profile);
  }

  res.json({ success: true, profile });
});

// ─── DASHAVIDHA ASSESSMENT (Vaidya/Doctor only) ───────────────────────────────
// GET /api/ayurveda/assessment/:patientId
router.get('/assessment/:patientId', authenticate, async (req, res) => {
  const { patientId } = req.params;

  // Patients can view their own assessment
  if (req.user.role === 'patient' && req.patient?.id !== patientId) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  // Phase 8: enforce consent for doctor access
  if (!enforceAyurvedaConsent(req, res, patientId)) return;

  const assessment = db.ayurveda_assessments
    .filter(a => a.patient_id === patientId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({ success: true, assessments: assessment, latest: assessment[0] || null });
});

// POST /api/ayurveda/assessment — Vaidya records Dashavidha Pariksha
router.post('/assessment', authenticate, requireRole(['doctor']), async (req, res) => {
  const { patient_id, dashavidha, vaidya_notes, prakriti_confirmed, vikriti_confirmed } = req.body;

  if (!patient_id) return res.status(400).json({ error: 'patient_id required.' });

  // Phase 8: enforce consent for write
  if (!enforceAyurvedaConsent(req, res, patient_id)) return;

  const doctor = req.doctor;

  const assessment = {
    id: uuidv4(),
    patient_id,
    // Dashavidha fields — all 10
    dashavidha: {
      prakriti: dashavidha?.prakriti || null,
      vikriti: dashavidha?.vikriti || null,
      sara: dashavidha?.sara || null,
      samhanana: dashavidha?.samhanana || null,
      pramana: dashavidha?.pramana || null,
      satmya: dashavidha?.satmya || null,
      sattva: dashavidha?.sattva || null,
      ahara_shakti: dashavidha?.ahara_shakti || null,
      vyayama_shakti: dashavidha?.vyayama_shakti || null,
      vaya: dashavidha?.vaya || null,
    },
    prakriti_confirmed: prakriti_confirmed || null,
    vikriti_confirmed: vikriti_confirmed || null,
    vaidya_notes: vaidya_notes || null,
    assessed_by: `Dr. ${doctor.first_name} ${doctor.last_name}`,
    assessed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  db.ayurveda_assessments.unshift(assessment);

  // Update profile with confirmed prakriti/vikriti — NEVER overwrites reported_prakriti/reported_vikriti
  let profile = db.ayurveda_profiles.find(p => p.patient_id === patient_id);
  if (!profile) {
    profile = {
      id: uuidv4(),
      patient_id,
      reported_prakriti: null,
      reported_vikriti: null,
      agni: null,
      koshtha: null,
      ahara: {},
      vihara: {},
      nidana: null,
      previous_ayurvedic_treatment: null,
      notes: null,
      vaidya_prakriti: null,
      vaidya_vikriti: null,
      vaidya_notes: null,
      verified_by: null,
      verified_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.ayurveda_profiles.unshift(profile);
  }

  if (prakriti_confirmed) profile.vaidya_prakriti = prakriti_confirmed;
  if (vikriti_confirmed) profile.vaidya_vikriti = vikriti_confirmed;
  if (vaidya_notes) profile.vaidya_notes = vaidya_notes;
  profile.verified_by = `Dr. ${doctor.first_name} ${doctor.last_name}`;
  profile.verified_at = new Date().toISOString();
  profile.updated_at = new Date().toISOString();

  // Audit log
  recordAuditLog({
    patient_id,
    actor_id: req.user.id,
    actor_role: 'doctor',
    actor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
    doctor_id: doctor.id,
    action: 'ayurveda_assessment_recorded',
    category_accessed: 'ayurveda',
    consent_status: 'approved',
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || 'Doctor Portal',
    details: { assessment_id: assessment.id, prakriti_confirmed, vikriti_confirmed }
  });

  res.json({ success: true, assessment });
});

// ─── AYURVEDIC MEDICINES ──────────────────────────────────────────────────────
// GET /api/ayurveda/medicines
router.get('/medicines', authenticate, async (req, res) => {
  const patientId = req.query.patientId || (req.user.role === 'patient' ? req.patient?.id : null);
  if (!patientId) return res.status(400).json({ error: 'patientId required.' });

  // Phase 8: enforce consent for doctor access
  if (!enforceAyurvedaConsent(req, res, patientId)) return;

  const medicines = db.ayurveda_medicines
    .filter(m => m.patient_id === patientId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({ success: true, medicines });
});

// POST /api/ayurveda/medicines
router.post('/medicines', authenticate, async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(400).json({ error: 'patientId required.' });

  // Phase 8: enforce consent for doctor write
  if (!enforceAyurvedaConsent(req, res, patientId)) return;

  const {
    name, form, dose, frequency, duration,
    start_date, end_date, prescriber, purpose, notes
  } = req.body;

  if (!name) return res.status(400).json({ error: 'Medicine name is required.' });

  const doctor = req.user.role === 'doctor' ? req.doctor : null;

  const medicine = {
    id: uuidv4(),
    patient_id: patientId,
    name,
    form: form || 'Tablet',
    dose: dose || null,
    frequency: frequency || null,
    duration: duration || null,
    start_date: start_date || new Date().toISOString().split('T')[0],
    end_date: end_date || null,
    prescriber: prescriber || (doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Self'),
    purpose: purpose || null,
    notes: notes || null,
    is_active: true,
    category: 'ayurvedic',   // always 'ayurvedic' — separate from modern medicines
    recorded_by: req.user.role,
    created_at: new Date().toISOString(),
  };

  db.ayurveda_medicines.unshift(medicine);
  res.status(201).json({ success: true, medicine });
});

// PATCH /api/ayurveda/medicines/:id/toggle
router.patch('/medicines/:id/toggle', authenticate, async (req, res) => {
  const med = db.ayurveda_medicines.find(m => m.id === req.params.id);
  if (!med) return res.status(404).json({ error: 'Medicine not found.' });

  // Phase 8: consent check
  if (!enforceAyurvedaConsent(req, res, med.patient_id)) return;

  if (req.user.role === 'patient' && med.patient_id !== req.patient?.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  med.is_active = !med.is_active;
  res.json({ success: true, medicine: med });
});

// ─── AYURVEDIC TREATMENT HISTORY ─────────────────────────────────────────────
// GET /api/ayurveda/treatments
router.get('/treatments', authenticate, async (req, res) => {
  const patientId = req.query.patientId || (req.user.role === 'patient' ? req.patient?.id : null);
  if (!patientId) return res.status(400).json({ error: 'patientId required.' });

  // Phase 8: enforce consent for doctor access
  if (!enforceAyurvedaConsent(req, res, patientId)) return;

  const treatments = db.ayurveda_treatments
    .filter(t => t.patient_id === patientId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ success: true, treatments });
});

// POST /api/ayurveda/treatments
router.post('/treatments', authenticate, async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(400).json({ error: 'patientId required.' });

  // Phase 8: enforce consent for doctor write
  if (!enforceAyurvedaConsent(req, res, patientId)) return;

  const {
    treatment_name, treatment_type, date, practitioner,
    duration, notes, response, follow_up_date
  } = req.body;

  if (!treatment_name) return res.status(400).json({ error: 'treatment_name is required.' });

  const doctor = req.user.role === 'doctor' ? req.doctor : null;

  const treatment = {
    id: uuidv4(),
    patient_id: patientId,
    treatment_name,
    treatment_type: treatment_type || 'Panchakarma',
    date: date || new Date().toISOString().split('T')[0],
    practitioner: practitioner || (doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : null),
    duration: duration || null,
    notes: notes || null,
    response: response || null,
    follow_up_date: follow_up_date || null,
    recorded_by: req.user.role,
    created_at: new Date().toISOString(),
  };

  db.ayurveda_treatments.unshift(treatment);
  res.status(201).json({ success: true, treatment });
});

// ─── TREATMENT RESPONSES ──────────────────────────────────────────────────────
// GET /api/ayurveda/responses
router.get('/responses', authenticate, async (req, res) => {
  const patientId = req.query.patientId || (req.user.role === 'patient' ? req.patient?.id : null);
  if (!patientId) return res.status(400).json({ error: 'patientId required.' });

  // Phase 8: enforce consent for doctor access
  if (!enforceAyurvedaConsent(req, res, patientId)) return;

  const responses = db.treatment_responses
    .filter(r => r.patient_id === patientId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({ success: true, responses });
});

// POST /api/ayurveda/responses
router.post('/responses', authenticate, async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(400).json({ error: 'patientId required.' });

  // Phase 8: enforce consent for doctor write
  if (!enforceAyurvedaConsent(req, res, patientId)) return;

  const { treatment_id, period, symptom_score, sleep_quality, energy_level, digestion, notes, recorded_by_role } = req.body;

  const response = {
    id: uuidv4(),
    patient_id: patientId,
    treatment_id: treatment_id || null,
    period: period || 'current',   // 'before' | 'during' | 'after' | 'current'
    symptom_score: symptom_score != null ? Number(symptom_score) : null,   // 0–10
    sleep_quality: sleep_quality || null,   // 'poor' | 'fair' | 'good' | 'excellent'
    energy_level: energy_level || null,
    digestion: digestion || null,
    notes: notes || null,
    recorded_by: recorded_by_role || req.user.role,
    created_at: new Date().toISOString(),
  };

  db.treatment_responses.unshift(response);
  res.status(201).json({ success: true, response });
});

export default router;
