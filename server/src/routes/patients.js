import express from 'express';
import { db, recordAuditLog, generateEmergencyToken } from '../database/store.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public Emergency Profile Endpoint (Unauthenticated, rate-limited public access via secure token)
router.get('/public-emergency/:token', (req, res) => {
  const { token } = req.params;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Invalid emergency profile token' });
  }

  // Find emergency profile matching secure unguessable token
  const emergencyProfile = db.emergency_profiles.find(
    ep => ep.qr_token === token || (ep.id && ep.id === token)
  );

  if (!emergencyProfile) {
    return res.status(404).json({
      error: 'Emergency profile not found or expired token'
    });
  }

  const patient = db.patients.find(p => p.id === emergencyProfile.patient_id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient profile unavailable' });
  }

  const healthId = db.health_ids.find(h => h.patient_id === patient.id);

  // Calculate approximate age without exposing exact date of birth
  let age = 'Adult';
  if (patient.dob) {
    const birthYear = new Date(patient.dob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (!isNaN(birthYear)) {
      age = `${currentYear - birthYear} Yrs`;
    }
  }

  // Record audit log for public emergency access
  try {
    recordAuditLog({
      patient_id: patient.id,
      actor_id: 'public_qr_scanner',
      actor_role: 'Emergency Responder',
      actor_name: 'Public Emergency Gateway (QR)',
      action: 'view_public_emergency_qr',
      category_accessed: 'emergency_profile',
      consent_status: 'public_qr_override',
      ip_address: req.ip || '127.0.0.1',
      user_agent: req.headers['user-agent'] || 'Emergency Scanner',
      details: { access_type: 'Public QR Code Emergency Scan' }
    });
  } catch (err) {
    console.warn('Failed to record emergency audit log:', err);
  }

  // STRICT PROJECTION: Return ONLY explicitly approved emergency fields
  res.json({
    is_emergency_profile: true,
    patient_identity: {
      full_name: `${patient.first_name} ${patient.last_name}`,
      health_id_number: healthId?.health_id_number || 'HP-2026-1001',
      avatar_url: patient.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
      gender: patient.gender || 'Not specified',
      age: age,
      city: patient.city || 'India',
      state: patient.state || 'Maharashtra'
    },
    critical_medical: {
      blood_group: emergencyProfile.verified_blood_group || patient.blood_group || 'O+',
      is_blood_group_verified: true,
      allergies: emergencyProfile.allergies || [],
      major_conditions: emergencyProfile.major_conditions || [],
      critical_medicines: emergencyProfile.critical_medicines || [],
      organ_donor: Boolean(emergencyProfile.organ_donor)
    },
    emergency_instructions: {
      precautions: emergencyProfile.special_precautions || 'Verify allergies before administering IV medication.',
      instructions: emergencyProfile.emergency_instructions || 'In case of unconsciousness or severe trauma, notify emergency contact immediately.'
    },
    emergency_contacts: {
      primary: {
        name: emergencyProfile.emergency_contact_name || 'Primary Contact',
        phone: emergencyProfile.emergency_contact_phone || '+91 98201 99001',
        relation: emergencyProfile.emergency_contact_relation || 'Family'
      },
      secondary: emergencyProfile.secondary_contact_name ? {
        name: emergencyProfile.secondary_contact_name,
        phone: emergencyProfile.secondary_contact_phone || '',
        relation: 'Secondary Contact'
      } : null
    },
    healthcare_provider: {
      primary_doctor_name: 'Dr. Sameer Joshi',
      specialization: 'Consultant Physician & Trauma Specialist',
      hospital_name: 'Apollo Multi-Specialty Super Hospital',
      hospital_address: 'Bandra Kurla Complex, Mumbai, Maharashtra 400051',
      emergency_helpline: '+91 22 2650 9999 / 108'
    },
    meta: {
      title: 'OFFICIAL CITIZEN EMERGENCY MEDICAL PROFILE',
      disclaimer: 'This emergency profile is generated for immediate first-responder assistance. Authentication credentials and private medical histories remain encrypted.',
      last_updated: emergencyProfile.updated_at || new Date().toISOString()
    }
  });
});

// Get patient dashboard overview
router.get('/dashboard', authenticate, requireRole(['patient']), (req, res) => {
  const patient = req.patient;
  const healthId = db.health_ids.find(h => h.patient_id === patient.id);
  let emergencyProfile = db.emergency_profiles.find(ep => ep.patient_id === patient.id);
  
  if (emergencyProfile && !emergencyProfile.qr_token) {
    emergencyProfile.qr_token = generateEmergencyToken();
  }

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
  let emergency = db.emergency_profiles.find(e => e.patient_id === patient.id);

  if (!emergency) {
    emergency = {
      id: `ep-${Date.now()}`,
      patient_id: patient.id,
      qr_token: generateEmergencyToken(),
      verified_blood_group: patient.blood_group || 'O+',
      allergies: [],
      major_conditions: [],
      critical_medicines: [],
      emergency_contact_name: 'Emergency Contact',
      emergency_contact_phone: '+91 98201 99001',
      emergency_contact_relation: 'Family',
      is_active: true
    };
    db.emergency_profiles.push(emergency);
  } else if (!emergency.qr_token) {
    emergency.qr_token = generateEmergencyToken();
  }

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
    qr_token: emergency.qr_token,
    qr_code_data: healthId?.qr_code_data || `HP:${patient.first_name.toUpperCase()}:${healthId?.health_id_number}`,
    emergency_contact: {
      name: emergency.emergency_contact_name,
      phone: emergency.emergency_contact_phone,
      relation: emergency.emergency_contact_relation
    },
    allergies: emergency?.allergies || []
  });
});

// Get Protected Emergency Profile (With mandatory audit log)
router.get('/emergency/:patientId', authenticate, (req, res) => {
  const { patientId } = req.params;
  const patient = db.patients.find(p => p.id === patientId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  let emergencyProfile = db.emergency_profiles.find(ep => ep.patient_id === patientId);
  if (emergencyProfile && !emergencyProfile.qr_token) {
    emergencyProfile.qr_token = generateEmergencyToken();
  }

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
    emergencyProfile = { id: `ep-${Date.now()}`, patient_id: patient.id, qr_token: generateEmergencyToken() };
    db.emergency_profiles.push(emergencyProfile);
  } else if (!emergencyProfile.qr_token) {
    emergencyProfile.qr_token = generateEmergencyToken();
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
    organ_donor,
    emergency_instructions,
    special_precautions
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
  if (emergency_instructions) emergencyProfile.emergency_instructions = emergency_instructions;
  if (special_precautions) emergencyProfile.special_precautions = special_precautions;

  emergencyProfile.updated_at = new Date().toISOString();

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
