import express from 'express';
import { db } from '../database/store.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = express.Router();

// List all demo personas for 1-click instant login in demo mode
router.get('/personas', (req, res) => {
  const patientPersonas = db.patients.map(p => {
    const user = db.users.find(u => u.id === p.user_id);
    const healthId = db.health_ids.find(h => h.patient_id === p.id);
    return {
      userId: user.id,
      patientId: p.id,
      name: `${p.first_name} ${p.last_name}`,
      email: user.email,
      phone: user.phone,
      role: 'patient',
      avatarUrl: p.avatar_url,
      healthId: healthId ? healthId.health_id_number : 'HP-2026-0000',
      bloodGroup: p.blood_group,
      city: p.city
    };
  });

  const doctorPersonas = db.doctors.map(d => {
    const user = db.users.find(u => u.id === d.user_id);
    return {
      userId: user.id,
      doctorId: d.id,
      name: `Dr. ${d.first_name} ${d.last_name}`,
      email: user.email,
      phone: user.phone,
      role: 'doctor',
      specialization: d.specialization,
      avatarUrl: d.avatar_url,
      hospital: d.hospital_name,
      registrationNumber: d.registration_number
    };
  });

  res.json({
    patients: patientPersonas,
    doctors: doctorPersonas
  });
});

// Quick Switch Login for Demo personas
router.post('/demo-login', (req, res) => {
  const { userId } = req.body;
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'Persona not found' });
  }

  const token = generateToken(user);
  let profile = null;

  if (user.role === 'patient') {
    profile = db.patients.find(p => p.user_id === user.id);
    const healthId = db.health_ids.find(h => h.patient_id === profile.id);
    profile = { ...profile, health_id: healthId?.health_id_number };
  } else if (user.role === 'doctor') {
    profile = db.doctors.find(d => d.user_id === user.id);
  }

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_verified: user.is_verified
    },
    profile
  });
});

// Patient & Doctor Standard Login (Email or Phone + Password or OTP)
router.post('/login', (req, res) => {
  const { identifier, password, role, isOtp = false } = req.body;

  if (!identifier) {
    return res.status(400).json({ error: 'Please provide email or phone number' });
  }

  const user = db.users.find(u => 
    (u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier) &&
    (!role || u.role === role)
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or user not found with this role' });
  }

  // Password / OTP verification
  if (!isOtp && password && password !== 'Password123!' && user.password !== password) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const token = generateToken(user);
  let profile = null;

  if (user.role === 'patient') {
    profile = db.patients.find(p => p.user_id === user.id);
    const healthId = db.health_ids.find(h => h.patient_id === profile.id);
    profile = { ...profile, health_id: healthId?.health_id_number };
  } else if (user.role === 'doctor') {
    profile = db.doctors.find(d => d.user_id === user.id);
  }

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_verified: user.is_verified
    },
    profile
  });
});

// Password recovery / reset
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(404).json({ error: 'No account registered with this email address' });
  }

  res.json({
    success: true,
    message: `A secure password reset link has been dispatched to ${email}.`
  });
});

// Get current authenticated user
router.get('/me', authenticate, (req, res) => {
  let profile = null;
  if (req.user.role === 'patient') {
    profile = req.patient;
    const healthId = db.health_ids.find(h => h.patient_id === req.patient.id);
    profile = { ...profile, health_id: healthId?.health_id_number };
  } else if (req.user.role === 'doctor') {
    profile = req.doctor;
  }

  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      is_verified: req.user.is_verified
    },
    profile
  });
});

export default router;
