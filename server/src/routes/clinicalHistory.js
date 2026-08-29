/**
 * Clinical History Routes — Phase 3
 * POST /api/clinical-history/start         — start a new intake session
 * POST /api/clinical-history/:id/answer    — submit an answer, get next question
 * GET  /api/clinical-history/:patientId    — get patient's latest clinical history
 * POST /api/clinical-history/:id/complete  — finalise and generate AI summary
 * PUT  /api/clinical-history/:id/verify    — doctor verifies/edits summary (doctor only)
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/store.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  QUESTION_BANK,
  QUESTION_ORDER,
  getFirstQuestion,
  getNextQuestion,
  detectRedFlags,
  generateClinicalSummary,
} from '../services/clinicalHistoryService.js';

const router = express.Router();

// ─── START new intake session ─────────────────────────────────────────────────
router.post('/start', authenticate, async (req, res) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ error: 'Only patients can start clinical history intake.' });
  }

  const patient = req.patient;
  if (!patient) return res.status(404).json({ error: 'Patient profile not found.' });

  // Check if there's already a pending session — reuse it
  const existing = db.clinical_histories.find(
    h => h.patient_id === patient.id && h.status === 'in_progress'
  );
  if (existing) {
    const lastAnswered = existing.answers[existing.answers.length - 1];
    const nextQ = lastAnswered ? getNextQuestion(lastAnswered.question_id) : getFirstQuestion();
    return res.json({
      success: true,
      session_id: existing.id,
      next_question: nextQ,
      answers_so_far: existing.answers.length,
      total_questions: QUESTION_ORDER.length,
      resumed: true,
    });
  }

  const session = {
    id: uuidv4(),
    patient_id: patient.id,
    status: 'in_progress',
    answers: [],
    structured: {},
    red_flags: [],
    ai_summary: null,
    verified_by: null,
    verified_at: null,
    doctor_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.clinical_histories.unshift(session);

  res.json({
    success: true,
    session_id: session.id,
    next_question: getFirstQuestion(),
    answers_so_far: 0,
    total_questions: QUESTION_ORDER.length,
    resumed: false,
  });
});

// ─── SUBMIT an answer ─────────────────────────────────────────────────────────
router.post('/:id/answer', authenticate, async (req, res) => {
  const session = db.clinical_histories.find(h => h.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  if (req.user.role === 'patient' && session.patient_id !== req.patient?.id) {
    return res.status(403).json({ error: 'Not your session.' });
  }

  const { question_id, answer } = req.body;
  if (!question_id || answer === undefined) {
    return res.status(400).json({ error: 'question_id and answer are required.' });
  }

  const question = QUESTION_BANK[question_id];
  if (!question) return res.status(400).json({ error: 'Invalid question_id.' });

  // Red-flag check (deterministic only)
  const flag = detectRedFlags(String(answer));
  if (flag && !session.red_flags.includes(flag)) {
    session.red_flags.push(flag);
  }

  // Remove previous answer for this question (allow retry)
  session.answers = session.answers.filter(a => a.question_id !== question_id);
  session.answers.push({ question_id, answer, timestamp: new Date().toISOString() });

  // Update structured object
  session.structured[question.field] = answer;
  session.updated_at = new Date().toISOString();

  const nextQ = getNextQuestion(question_id);

  res.json({
    success: true,
    red_flag: flag ? { detected: true, label: flag } : { detected: false },
    next_question: nextQ,
    answers_so_far: session.answers.length,
    total_questions: QUESTION_ORDER.length,
    done: !nextQ,
  });
});

// ─── GET patient's clinical history ──────────────────────────────────────────
router.get('/patient/:patientId', authenticate, async (req, res) => {
  let { patientId } = req.params;

  // Allow patient to use 'me' as a shorthand
  if (patientId === 'me') {
    if (req.user.role !== 'patient') {
      return res.status(400).json({ error: "'me' is only valid for patients." });
    }
    patientId = req.patient?.id;
  }

  if (!patientId) return res.status(400).json({ error: 'patientId is required.' });

  // Patients can only see their own
  if (req.user.role === 'patient' && req.patient?.id !== patientId) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const histories = db.clinical_histories
    .filter(h => h.patient_id === patientId)
    .map(h => ({
      id: h.id,
      status: h.status,
      answers_count: h.answers.length,
      total_questions: QUESTION_ORDER.length,
      red_flags: h.red_flags,
      has_summary: !!h.ai_summary,
      verified_by: h.verified_by,
      created_at: h.created_at,
      updated_at: h.updated_at,
      chief_complaint: h.structured?.chiefComplaint || null,
    }));

  const latest = db.clinical_histories.find(h => h.patient_id === patientId);

  res.json({
    success: true,
    histories,
    latest: latest ? {
      id: latest.id,
      status: latest.status,
      structured: latest.structured,
      red_flags: latest.red_flags,
      ai_summary: latest.ai_summary,
      verified_by: latest.verified_by,
      verified_at: latest.verified_at,
      doctor_notes: latest.doctor_notes,
      answers_count: latest.answers.length,
      total_questions: QUESTION_ORDER.length,
      created_at: latest.created_at,
      updated_at: latest.updated_at,
    } : null,
  });
});

// ─── COMPLETE session and generate AI summary ────────────────────────────────
router.post('/:id/complete', authenticate, async (req, res) => {
  const session = db.clinical_histories.find(h => h.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  if (req.user.role === 'patient' && session.patient_id !== req.patient?.id) {
    return res.status(403).json({ error: 'Not your session.' });
  }

  const patient = db.patients.find(p => p.id === session.patient_id);

  try {
    const summary = await generateClinicalSummary(session.structured, patient);
    session.ai_summary = summary;
    session.status = 'completed';
    session.updated_at = new Date().toISOString();

    res.json({
      success: true,
      session_id: session.id,
      ai_summary: summary,
      red_flags: session.red_flags,
      structured: session.structured,
    });
  } catch (err) {
    console.error('[clinical-history] Complete error:', err);
    res.status(500).json({ error: 'Failed to generate summary. Please try again.' });
  }
});

// ─── DOCTOR: view full session ────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  const session = db.clinical_histories.find(h => h.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  if (req.user.role === 'patient' && session.patient_id !== req.patient?.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  res.json({ success: true, session });
});

// ─── DOCTOR: verify / edit summary ───────────────────────────────────────────
router.put('/:id/verify', authenticate, requireRole(['doctor']), async (req, res) => {
  const session = db.clinical_histories.find(h => h.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  const { edited_summary, doctor_notes } = req.body;
  const doctor = req.doctor;

  if (edited_summary) {
    session.ai_summary = { ...session.ai_summary, ...edited_summary };
  }
  if (doctor_notes !== undefined) {
    session.doctor_notes = doctor_notes;
  }
  session.verified_by = `Dr. ${doctor.first_name} ${doctor.last_name}`;
  session.verified_at = new Date().toISOString();
  session.status = 'verified';
  session.updated_at = new Date().toISOString();

  res.json({
    success: true,
    message: 'Clinical history verified successfully.',
    session_id: session.id,
    verified_by: session.verified_by,
    verified_at: session.verified_at,
  });
});

export default router;
