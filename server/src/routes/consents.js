import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, recordAuditLog, createNotification } from '../database/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// List all consent requests (Role-filtered)
router.get('/', authenticate, (req, res) => {
  let list = [];

  if (req.user.role === 'patient') {
    list = db.consent_requests
      .filter(cr => cr.patient_id === req.patient.id)
      .map(cr => {
        const doc = db.doctors.find(d => d.id === cr.doctor_id);
        return {
          ...cr,
          doctor_name: doc ? `Dr. ${doc.first_name} ${doc.last_name}` : 'Doctor',
          specialization: doc ? doc.specialization : 'Specialist',
          hospital_name: doc ? doc.hospital_name : 'Hospital',
          avatar_url: doc?.avatar_url
        };
      });
  } else if (req.user.role === 'doctor') {
    list = db.consent_requests
      .filter(cr => cr.doctor_id === req.doctor.id)
      .map(cr => {
        const patient = db.patients.find(p => p.id === cr.patient_id);
        const healthId = db.health_ids.find(h => h.patient_id === cr.patient_id);
        return {
          ...cr,
          patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Patient',
          health_id_number: healthId?.health_id_number,
          avatar_url: patient?.avatar_url
        };
      });
  }

  res.json({ consents: list });
});

// Doctor creates a consent request
router.post('/request', authenticate, (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ error: 'Only doctors can request patient record consent' });
  }

  const { patient_id, requested_categories, duration_hours = 24, reason } = req.body;

  if (!patient_id) {
    return res.status(400).json({ error: 'Patient ID is required' });
  }

  if (!requested_categories || !Array.isArray(requested_categories) || requested_categories.length === 0) {
    return res.status(400).json({ error: 'Please select at least one record category to request' });
  }

  if (!reason || reason.trim() === '') {
    return res.status(400).json({ error: 'Clinical purpose / reason for request is required' });
  }

  const patient = db.patients.find(p => p.id === patient_id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const doctor = req.doctor;

  const newConsent = {
    id: uuidv4(),
    patient_id,
    doctor_id: doctor.id,
    hospital_id: 'h1000000-0000-0000-0000-000000000001',
    requested_categories,
    approved_categories: [],
    duration_hours: Number(duration_hours),
    reason,
    status: 'pending',
    valid_from: null,
    valid_until: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.consent_requests.unshift(newConsent);

  // Create Patient Notification
  createNotification({
    user_id: patient.user_id,
    type: 'consent',
    title: `Consent Request from Dr. ${doctor.first_name} ${doctor.last_name}`,
    message: `Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialization}) has requested access to ${requested_categories.join(', ')} for ${duration_hours} hours. Reason: "${reason}"`,
    link_url: '/patient/consent'
  });

  // Audit Log
  recordAuditLog({
    patient_id,
    actor_id: req.user.id,
    actor_role: 'doctor',
    actor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
    doctor_id: doctor.id,
    action: 'request_consent',
    category_accessed: requested_categories.join(','),
    consent_status: 'pending',
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || 'Doctor Portal',
    details: { reason, duration_hours, consent_id: newConsent.id }
  });

  res.status(201).json({
    success: true,
    message: 'Consent request dispatched to patient successfully',
    consent: newConsent
  });
});

// Patient approves consent request (can select/filter categories)
router.post('/:consentId/approve', authenticate, (req, res) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ error: 'Only patients can approve consent requests' });
  }

  const { consentId } = req.params;
  const { approved_categories, duration_hours } = req.body;

  const consent = db.consent_requests.find(cr => cr.id === consentId && cr.patient_id === req.patient.id);
  if (!consent) {
    return res.status(404).json({ error: 'Consent request not found' });
  }

  const duration = Number(duration_hours || consent.duration_hours || 24);
  const now = new Date();
  const validUntil = new Date(now.getTime() + duration * 60 * 60 * 1000);

  // SECURITY: approved_categories must be a strict subset of requested_categories.
  // This is enforced server-side — the backend NEVER grants more than what was requested,
  // regardless of what the client sends.
  const requestedSet = new Set(consent.requested_categories || []);
  const clientApproved = approved_categories && approved_categories.length > 0
    ? approved_categories
    : consent.requested_categories;

  // Clamp to intersection — strip any categories not in the original request
  const categories = clientApproved.filter(cat => requestedSet.has(cat));

  if (categories.length === 0) {
    return res.status(400).json({ error: 'At least one valid requested category must be approved.' });
  }

  consent.status = 'approved';
  consent.approved_categories = categories;
  consent.valid_from = now.toISOString();
  consent.approved_at = now.toISOString();
  consent.valid_until = validUntil.toISOString();
  consent.updated_at = now.toISOString();

  // Create Doctor Notification
  const doctor = db.doctors.find(d => d.id === consent.doctor_id);
  if (doctor) {
    createNotification({
      user_id: doctor.user_id,
      type: 'consent',
      title: `Consent Approved by ${req.patient.first_name} ${req.patient.last_name}`,
      message: `${req.patient.first_name} ${req.patient.last_name} approved access to: ${categories.join(', ')} until ${validUntil.toLocaleDateString()} ${validUntil.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      link_url: `/doctor/authorized-patients`
    });
  }

  // Audit Log — record ONLY the approved categories, not the full request
  recordAuditLog({
    patient_id: req.patient.id,
    actor_id: req.user.id,
    actor_role: 'patient',
    actor_name: `${req.patient.first_name} ${req.patient.last_name}`,
    doctor_id: consent.doctor_id,
    action: 'approve_consent',
    category_accessed: categories.join(','),
    consent_status: 'approved',
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || 'Patient Portal',
    details: {
      approved_categories: categories,
      requested_categories: consent.requested_categories,
      valid_until: validUntil.toISOString()
    }
  });

  res.json({
    success: true,
    message: 'Consent granted successfully',
    consent
  });
});

// Patient denies consent request
router.post('/:consentId/deny', authenticate, (req, res) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ error: 'Only patients can deny consent requests' });
  }

  const { consentId } = req.params;
  const { reason = 'Denied by patient' } = req.body;

  const consent = db.consent_requests.find(cr => cr.id === consentId && cr.patient_id === req.patient.id);
  if (!consent) {
    return res.status(404).json({ error: 'Consent request not found' });
  }

  consent.status = 'denied';
  consent.denial_reason = reason;
  consent.updated_at = new Date().toISOString();

  // Audit Log
  recordAuditLog({
    patient_id: req.patient.id,
    actor_id: req.user.id,
    actor_role: 'patient',
    actor_name: `${req.patient.first_name} ${req.patient.last_name}`,
    doctor_id: consent.doctor_id,
    action: 'deny_consent',
    category_accessed: null,
    consent_status: 'denied',
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || 'Patient Portal',
    details: { reason }
  });

  res.json({
    success: true,
    message: 'Consent request denied',
    consent
  });
});

// Patient revokes active consent
router.post('/:consentId/revoke', authenticate, (req, res) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ error: 'Only patients can revoke consent' });
  }

  const { consentId } = req.params;
  const consent = db.consent_requests.find(cr => cr.id === consentId && cr.patient_id === req.patient.id);
  if (!consent) {
    return res.status(404).json({ error: 'Consent not found' });
  }

  consent.status = 'revoked';
  consent.revoked_at = new Date().toISOString();
  consent.valid_until = new Date().toISOString();
  consent.updated_at = new Date().toISOString();

  // Audit Log
  recordAuditLog({
    patient_id: req.patient.id,
    actor_id: req.user.id,
    actor_role: 'patient',
    actor_name: `${req.patient.first_name} ${req.patient.last_name}`,
    doctor_id: consent.doctor_id,
    action: 'revoke_consent',
    category_accessed: null,
    consent_status: 'revoked',
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || 'Patient Portal',
    details: { consent_id: consentId }
  });

  res.json({
    success: true,
    message: 'Access authorization has been revoked immediately',
    consent
  });
});

export default router;
