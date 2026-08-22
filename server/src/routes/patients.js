import express from 'express';
import { db, recordAuditLog } from '../database/store.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get patient dashboard overview
router.get('/dashboard', authenticate, requireRole(['patient']), (req, res) => {
  const patient = req.patient;
  const healthId = db.health_ids.find(h => h.patient_id === patient.id);
  const emergencyProfile = db.emergency_profiles.find(ep => ep.patient_id === patient.id);
  
  const upcomingAppointments = db.appointments
    .filter(a => a.patient_id === patient.id && a.status === 'scheduled')
    .map(a => {
      const doc = db.doctors.find(d => d.id === a.doctor_id);
      return {
        ...a,
        doctor_name: doc ? `Dr. ${doc.first_name} ${doc.last_name}` : 'Specialist',
        specialization: doc ? doc.specialization : 'General Medicine',
        avatar_url: doc?.avatar_url
      };
    });

  const activeMedicines = db.medicines.filter(m => m.patient_id === patient.id && m.is_active);
  const recentRecords = db.medical_records
    .filter(r => r.patient_id === patient.id)
    .slice(0, 5);

  const pendingConsents = db.consent_requests
    .filter(cr => cr.patient_id === patient.id && cr.status === 'pending')
    .map(cr => {
      const doc = db.doctors.find(d => d.id === cr.doctor_id);
      return {
        ...cr,
        doctor_name: doc ? `Dr. ${doc.first_name} ${doc.last_name}` : 'Doctor',
        specialization: doc ? doc.specialization : 'Specialist',
        hospital_name: doc ? doc.hospital_name : 'Hospital'
      };
    });

  const recentBills = db.bills.filter(b => b.patient_id === patient.id).slice(0, 3);
  const unreadNotifications = db.notifications.filter(n => n.user_id === req.user.id && !n.is_read);

  res.json({
    patient: {
      ...patient,
      email: req.user.email,
      phone: req.user.phone
    },
    health_id: healthId,
    emergency_profile: emergencyProfile,
    upcoming_appointments: upcomingAppointments,
    active_medicines: activeMedicines,
    recent_records: recentRecords,
    pending_consents: pendingConsents,
    recent_bills: recentBills,
    unread_notifications_count: unreadNotifications.length
  });
});

// Get Digital Health ID & QR
router.get('/health-id', authenticate, (req, res) => {
  const patientId = req.user.role === 'patient' ? req.patient.id : req.query.patientId;
  const patient = db.patients.find(p => p.id === patientId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const healthId = db.health_ids.find(h => h.patient_id === patient.id);
  const emergency = db.emergency_profiles.find(e => e.patient_id === patient.id);

  res.json({
    patient_id: patient.id,
    first_name: patient.first_name,
    last_name: patient.last_name,
    dob: patient.dob,
    gender: patient.gender,
    blood_group: patient.blood_group,
    is_blood_group_verified: patient.is_blood_group_verified,
    city: patient.city,
    state: patient.state,
    avatar_url: patient.avatar_url,
    health_id: healthId?.health_id_number || 'HP-2026-9999',
    qr_code_data: healthId?.qr_code_data || `HP:${patient.first_name.toUpperCase()}:${healthId?.health_id_number}`,
    emergency_contact: emergency ? {
      name: emergency.emergency_contact_name,
      phone: emergency.emergency_contact_phone,
      relation: emergency.emergency_contact_relation
    } : null,
    allergies: emergency?.allergies || []
  });
});

// Get Protected Emergency Profile (With mandatory audit log)
router.get('/emergency/:patientId', authenticate, (req, res) => {
  const { patientId } = req.params;
  const patient = db.patients.find(p => p.id === patientId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const emergencyProfile = db.emergency_profiles.find(ep => ep.patient_id === patientId);

  // Mandatory Emergency Access Audit
  recordAuditLog({
    patient_id: patientId,
    actor_id: req.user.id,
    actor_role: req.user.role,
    actor_name: req.user.role === 'doctor' ? `Dr. ${req.doctor.first_name} ${req.doctor.last_name}` : 'Emergency Responder',
    doctor_id: req.doctor ? req.doctor.id : null,
    action: 'view_emergency_profile',
    category_accessed: 'emergency_profile',
    consent_status: 'emergency_override',
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || 'Emergency Gateway',
    details: { reason: 'Emergency medical profile retrieval' }
  });

  res.json({
    patient_name: `${patient.first_name} ${patient.last_name}`,
    gender: patient.gender,
    dob: patient.dob,
    city: patient.city,
    emergency_profile: emergencyProfile
  });
});

// Update Emergency Profile (Patient only)
router.put('/emergency', authenticate, requireRole(['patient']), (req, res) => {
  const patient = req.patient;
  let emergencyProfile = db.emergency_profiles.find(ep => ep.patient_id === patient.id);

  if (!emergencyProfile) {
    emergencyProfile = { id: `ep-${Date.now()}`, patient_id: patient.id };
    db.emergency_profiles.push(emergencyProfile);
  }

  const {
    allergies,
    major_conditions,
    critical_medicines,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relation,
    secondary_contact_name,
    secondary_contact_phone,
    organ_donor
  } = req.body;

  if (allergies) emergencyProfile.allergies = allergies;
  if (major_conditions) emergencyProfile.major_conditions = major_conditions;
  if (critical_medicines) emergencyProfile.critical_medicines = critical_medicines;
  if (emergency_contact_name) emergencyProfile.emergency_contact_name = emergency_contact_name;
  if (emergency_contact_phone) emergencyProfile.emergency_contact_phone = emergency_contact_phone;
  if (emergency_contact_relation) emergencyProfile.emergency_contact_relation = emergency_contact_relation;
  if (secondary_contact_name !== undefined) emergencyProfile.secondary_contact_name = secondary_contact_name;
  if (secondary_contact_phone !== undefined) emergencyProfile.secondary_contact_phone = secondary_contact_phone;
  if (organ_donor !== undefined) emergencyProfile.organ_donor = organ_donor;

  res.json({
    success: true,
    message: 'Emergency profile updated securely',
    emergency_profile: emergencyProfile
  });
});

// Get / Update Patient Settings
router.get('/settings', authenticate, requireRole(['patient']), (req, res) => {
  res.json({
    settings: db.settings.patient
  });
});

router.put('/settings', authenticate, requireRole(['patient']), (req, res) => {
  db.settings.patient = {
    ...db.settings.patient,
    ...req.body
  };
  res.json({
    success: true,
    message: 'Settings saved successfully',
    settings: db.settings.patient
  });
});

export default router;
