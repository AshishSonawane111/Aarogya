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

export default router;
