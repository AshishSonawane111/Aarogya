import express from 'express';
import { db } from '../database/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Retrieve immutable audit access log history
router.get('/', authenticate, (req, res) => {
  let logs = [];

  if (req.user.role === 'patient') {
    // Patient views who accessed their medical data
    logs = db.access_logs.filter(al => al.patient_id === req.patient.id);
  } else if (req.user.role === 'doctor') {
    // Doctor views their access history
    logs = db.access_logs.filter(al => al.doctor_id === req.doctor.id || al.actor_id === req.user.id);
  } else {
    logs = db.access_logs;
  }

  logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({
    total_logs: logs.length,
    logs
  });
});

export default router;
