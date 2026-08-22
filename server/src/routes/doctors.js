import express from 'express';
import { db, recordAuditLog, checkActiveConsent } from '../database/store.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List all doctors (for appointment booking / directory)
router.get('/', (req, res) => {
  const { specialization, hospitalId, search } = req.query;

  let doctors = db.doctors.map(d => {
    const availability = db.doctor_availability.find(da => da.doctor_id === d.id);
    return {
      ...d,
      availability
    };
  });

  if (specialization) {
    doctors = doctors.filter(d => d.specialization.toLowerCase().includes(specialization.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    doctors = doctors.filter(d => 
      `${d.first_name} ${d.last_name}`.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      d.doctor_id.toLowerCase().includes(q)
    );
  }

  res.json({ doctors });
});

// Doctor Dashboard Stats
router.get('/dashboard', authenticate, requireRole(['doctor']), (req, res) => {
  const doctor = req.doctor;
  const today = new Date().toISOString().split('T')[0];

  // Today's and upcoming appointments
  const doctorAppointments = db.appointments
    .filter(a => a.doctor_id === doctor.id)
    .map(a => {
      const patient = db.patients.find(p => p.id === a.patient_id);
      const healthId = db.health_ids.find(h => h.patient_id === a.patient_id);
      return {
        ...a,
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Patient',
        patient_gender: patient?.gender,
        patient_dob: patient?.dob,
        patient_blood_group: patient?.blood_group,
        health_id_number: healthId?.health_id_number,
        avatar_url: patient?.avatar_url
      };
    });

  const todayAppointments = doctorAppointments.filter(a => a.appointment_date === today);
  const upcomingAppointments = doctorAppointments.filter(a => a.appointment_date > today);

  // Pending consent requests
  const pendingConsents = db.consent_requests
    .filter(cr => cr.doctor_id === doctor.id && cr.status === 'pending')
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

  // Active authorized patients
  const activeConsents = db.consent_requests
    .filter(cr => cr.doctor_id === doctor.id && cr.status === 'approved' && new Date(cr.valid_until) > new Date())
    .map(cr => {
      const patient = db.patients.find(p => p.id === cr.patient_id);
      const healthId = db.health_ids.find(h => h.patient_id === cr.patient_id);
      return {
        consent_id: cr.id,
        patient_id: cr.patient_id,
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Patient',
        health_id_number: healthId?.health_id_number,
        approved_categories: cr.approved_categories,
        valid_until: cr.valid_until,
        avatar_url: patient?.avatar_url,
        blood_group: patient?.blood_group
      };
    });

  // Recent access history for this doctor
  const recentAudit = db.access_logs
    .filter(al => al.doctor_id === doctor.id || al.actor_id === req.user.id)
    .slice(0, 10);

  const availability = db.doctor_availability.find(da => da.doctor_id === doctor.id);

  res.json({
    doctor: {
      ...doctor,
      email: req.user.email,
      phone: req.user.phone
    },
    today_appointments: todayAppointments,
    upcoming_appointments: upcomingAppointments,
    pending_consents: pendingConsents,
    active_authorized_patients: activeConsents,
    recent_audit: recentAudit,
    availability
  });
});

// CORE ZERO-TRUST SECURITY: Search Patient by Digital Health ID or QR Code
router.post('/search-patient', authenticate, requireRole(['doctor']), (req, res) => {
  const { query } = req.body; // Can be Health ID (HP-2026-1001) or QR code string
  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Please provide a Digital Health ID or QR code data' });
  }

  const cleanQuery = query.trim().toUpperCase();

  // Match via health ID number or QR string
  const healthIdEntry = db.health_ids.find(h => 
    h.health_id_number.toUpperCase() === cleanQuery ||
    h.qr_code_data.toUpperCase().includes(cleanQuery) ||
    cleanQuery.includes(h.health_id_number.toUpperCase())
  );

  if (!healthIdEntry) {
    return res.status(404).json({ error: 'No patient found matching this Health ID or QR code.' });
  }

  const patient = db.patients.find(p => p.id === healthIdEntry.patient_id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient profile not found' });
  }

  // Check if doctor has active consent
  const doctor = req.doctor;
  const activeConsent = db.consent_requests.find(cr => 
    cr.patient_id === patient.id &&
    cr.doctor_id === doctor.id &&
    cr.status === 'approved' &&
    new Date(cr.valid_until) > new Date()
  );

  const pendingConsent = db.consent_requests.find(cr => 
    cr.patient_id === patient.id &&
    cr.doctor_id === doctor.id &&
    cr.status === 'pending'
  );

  // Mandatory Audit Log of Search
  recordAuditLog({
    patient_id: patient.id,
    actor_id: req.user.id,
    actor_role: 'doctor',
    actor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
    doctor_id: doctor.id,
    action: 'search_patient',
    category_accessed: 'basic_identification',
    consent_status: activeConsent ? 'authorized' : 'unauthorized',
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || 'Doctor Portal',
    details: {
      search_query: query,
      health_id: healthIdEntry.health_id_number,
      records_exposed: activeConsent ? activeConsent.approved_categories.length : 0
    }
  });

  // Return Basic Identity ONLY. Medical records are NEVER returned here!
  res.json({
    patient_id: patient.id,
    health_id_number: healthIdEntry.health_id_number,
    first_name: patient.first_name,
    last_name: patient.last_name,
    gender: patient.gender,
    dob: patient.dob,
    blood_group: patient.is_blood_group_verified ? patient.blood_group : 'Unverified',
    city: patient.city,
    state: patient.state,
    avatar_url: patient.avatar_url,
    has_active_consent: !!activeConsent,
    has_pending_consent: !!pendingConsent,
    active_consent: activeConsent ? {
      id: activeConsent.id,
      approved_categories: activeConsent.approved_categories,
      valid_until: activeConsent.valid_until,
      reason: activeConsent.reason
    } : null,
    pending_consent_id: pendingConsent ? pendingConsent.id : null,
    security_message: activeConsent 
      ? 'Active consent verified. You have access to approved record categories.'
      : 'Medical records are protected. Patient authorization is required.'
  });
});

// Update Doctor Availability
router.put('/availability', authenticate, requireRole(['doctor']), (req, res) => {
  const doctor = req.doctor;
  let availability = db.doctor_availability.find(da => da.doctor_id === doctor.id);

  if (!availability) {
    availability = { doctor_id: doctor.id };
    db.doctor_availability.push(availability);
  }

  const {
    working_days,
    start_time,
    end_time,
    slot_duration_minutes,
    break_start,
    break_end,
    blocked_dates
  } = req.body;

  if (working_days) availability.working_days = working_days;
  if (start_time) availability.start_time = start_time;
  if (end_time) availability.end_time = end_time;
  if (slot_duration_minutes) availability.slot_duration_minutes = Number(slot_duration_minutes);
  if (break_start) availability.break_start = break_start;
  if (break_end) availability.break_end = break_end;
  if (blocked_dates) availability.blocked_dates = blocked_dates;

  res.json({
    success: true,
    message: 'Availability schedule updated successfully',
    availability
  });
});

// Get & Update Doctor Settings
router.get('/settings', authenticate, requireRole(['doctor']), (req, res) => {
  res.json({
    settings: db.settings.doctor
  });
});

router.put('/settings', authenticate, requireRole(['doctor']), (req, res) => {
  db.settings.doctor = {
    ...db.settings.doctor,
    ...req.body
  };
  res.json({
    success: true,
    message: 'Doctor settings updated successfully',
    settings: db.settings.doctor
  });
});

export default router;
