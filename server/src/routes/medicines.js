import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get medicines for current patient (or authorized doctor viewing patient)
router.get('/', authenticate, (req, res) => {
  const patientId = req.user.role === 'patient' ? req.patient.id : req.query.patientId;

  if (!patientId) {
    return res.status(400).json({ error: 'patientId is required' });
  }

  const medicines = db.medicines.filter(m => m.patient_id === patientId);

  // Group into Active vs Completed
  const active = medicines.filter(m => m.is_active);
  const completed = medicines.filter(m => !m.is_active);

  res.json({
    active_count: active.length,
    active,
    completed_count: completed.length,
    completed
  });
});

// Patient adds a personal medicine
router.post('/', authenticate, (req, res) => {
  const { name, dosage, frequency, start_date, end_date, reminder_times, safety_notes } = req.body;
  const patientId = req.user.role === 'patient' ? req.patient.id : req.body.patient_id;

  if (!patientId || !name || !dosage) {
    return res.status(400).json({ error: 'Medicine name and dosage are required' });
  }

  const newMed = {
    id: uuidv4(),
    patient_id: patientId,
    name,
    dosage,
    frequency: frequency || 'Once daily',
    start_date: start_date || new Date().toISOString().split('T')[0],
    end_date: end_date || null,
    reminder_times: reminder_times || ['09:00'],
    is_active: true,
    prescription_source: req.user.role === 'doctor' ? `Dr. ${req.doctor.first_name} ${req.doctor.last_name}` : 'Self Added / OTC',
    safety_notes: safety_notes || 'Inform physician about regular use.'
  };

  db.medicines.unshift(newMed);

  res.status(201).json({
    success: true,
    message: 'Medicine added to active regimen',
    medicine: newMed
  });
});

// Mark dose as taken today / toggle status
router.post('/:medicineId/log-dose', authenticate, (req, res) => {
  const { medicineId } = req.params;
  const med = db.medicines.find(m => m.id === medicineId);

  if (!med) return res.status(404).json({ error: 'Medicine not found' });

  // Log reminder event
  const reminderEntry = {
    id: uuidv4(),
    medicine_id: medicineId,
    patient_id: med.patient_id,
    scheduled_time: new Date().toISOString(),
    taken_at: new Date().toISOString(),
    is_taken: true
  };

  res.json({
    success: true,
    message: `Dose logged for ${med.name} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    reminder: reminderEntry
  });
});

// Toggle active status
router.patch('/:medicineId/toggle-active', authenticate, (req, res) => {
  const { medicineId } = req.params;
  const med = db.medicines.find(m => m.id === medicineId);

  if (!med) return res.status(404).json({ error: 'Medicine not found' });

  med.is_active = !med.is_active;

  res.json({
    success: true,
    message: `Medicine marked as ${med.is_active ? 'Active' : 'Completed'}`,
    medicine: med
  });
});

export default router;
