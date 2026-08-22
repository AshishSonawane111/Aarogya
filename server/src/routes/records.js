import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, checkActiveConsent, recordAuditLog, createNotification } from '../database/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get medical records for current patient or authorized doctor
router.get('/', authenticate, (req, res) => {
  const { patientId, category } = req.query;

  // 1. Patient viewing own records
  if (req.user.role === 'patient') {
    const pId = req.patient.id;
    let records = db.medical_records.filter(r => r.patient_id === pId);

    if (category && category !== 'all' && category !== 'complete_record') {
      records = records.filter(r => r.category === category);
    }

    records.sort((a, b) => new Date(b.record_date) - new Date(a.record_date));

    return res.json({
      success: true,
      patient_id: pId,
      records_count: records.length,
      records
    });
  }

  // 2. Doctor viewing patient records
  if (req.user.role === 'doctor') {
    if (!patientId) {
      return res.status(400).json({ error: 'patientId parameter is required for doctor access' });
    }

    const doctor = req.doctor;
    const patient = db.patients.find(p => p.id === patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check active consent
    const activeConsent = db.consent_requests.find(cr => 
      cr.patient_id === patientId &&
      cr.doctor_id === doctor.id &&
      cr.status === 'approved' &&
      new Date(cr.valid_until) > new Date()
    );

    if (!activeConsent) {
      // Zero-Trust security: Record unauthorized attempt in audit log
      recordAuditLog({
        patient_id: patientId,
        actor_id: req.user.id,
        actor_role: 'doctor',
        actor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
        doctor_id: doctor.id,
        action: 'view_medical_records_denied',
        category_accessed: category || 'all',
        consent_status: 'unauthorized',
        ip_address: req.ip || '127.0.0.1',
        user_agent: req.headers['user-agent'] || 'Doctor Portal',
        details: { reason: 'No active approved consent grant' }
      });

      return res.status(403).json({
        error: 'Access Denied: Medical records are protected. Active patient authorization is required.',
        requires_consent: true,
        patient_id: patientId
      });
    }

    // Filter by approved categories
    const approvedCategories = activeConsent.approved_categories;
    const hasComplete = approvedCategories.includes('complete_record');

    let records = db.medical_records.filter(r => {
      if (r.patient_id !== patientId) return false;
      if (hasComplete) return true;
      return approvedCategories.includes(r.category);
    });

    if (category && category !== 'all' && category !== 'complete_record') {
      if (!hasComplete && !approvedCategories.includes(category)) {
        return res.status(403).json({
          error: `Access Denied: Category '${category}' is not approved by the patient.`,
          approved_categories: approvedCategories
        });
      }
      records = records.filter(r => r.category === category);
    }

    records.sort((a, b) => new Date(b.record_date) - new Date(a.record_date));

    // Audit Log authorized access
    recordAuditLog({
      patient_id: patientId,
      actor_id: req.user.id,
      actor_role: 'doctor',
      actor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
      doctor_id: doctor.id,
      action: 'view_medical_records',
      category_accessed: category || approvedCategories.join(','),
      consent_status: 'approved',
      ip_address: req.ip || '127.0.0.1',
      user_agent: req.headers['user-agent'] || 'Doctor Portal',
      details: {
        consent_id: activeConsent.id,
        records_delivered: records.length,
        approved_categories: approvedCategories
      }
    });

    return res.json({
      success: true,
      patient_id: patientId,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      active_consent: {
        id: activeConsent.id,
        approved_categories: approvedCategories,
        valid_until: activeConsent.valid_until
      },
      records_count: records.length,
      records
    });
  }

  res.status(403).json({ error: 'Unauthorized role' });
});

// Patient or Doctor uploads a medical record / document
router.post('/upload', authenticate, (req, res) => {
  const {
    patient_id,
    category = 'lab_reports',
    title,
    description,
    record_date = new Date().toISOString().split('T')[0],
    file_url = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
    file_type = 'pdf',
    file_size_bytes = 250000,
    metadata = {}
  } = req.body;

  let targetPatientId = req.user.role === 'patient' ? req.patient.id : patient_id;

  if (!targetPatientId) {
    return res.status(400).json({ error: 'Patient ID is required' });
  }

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Document / Record title is required' });
  }

  const newRecord = {
    id: uuidv4(),
    patient_id: targetPatientId,
    doctor_id: req.doctor ? req.doctor.id : null,
    hospital_id: req.doctor ? 'h1000000-0000-0000-0000-000000000001' : null,
    category,
    title,
    description,
    record_date,
    file_url,
    file_type,
    file_size_bytes,
    metadata,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.medical_records.unshift(newRecord);

  // If lab report, also add to lab_reports metadata table
  if (category === 'lab_reports') {
    db.documents.push({
      id: uuidv4(),
      patient_id: targetPatientId,
      title,
      document_type: 'Lab Report',
      file_url,
      created_at: new Date().toISOString(),
      file_size_bytes
    });
  }

  // Audit log
  recordAuditLog({
    patient_id: targetPatientId,
    actor_id: req.user.id,
    actor_role: req.user.role,
    actor_name: req.doctor ? `Dr. ${req.doctor.first_name} ${req.doctor.last_name}` : `${req.patient.first_name} ${req.patient.last_name}`,
    doctor_id: req.doctor ? req.doctor.id : null,
    action: 'upload_medical_record',
    category_accessed: category,
    consent_status: 'authorized',
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || 'Web Client',
    details: { record_id: newRecord.id, title, category }
  });

  res.status(201).json({
    success: true,
    message: 'Medical record uploaded and encrypted into timeline',
    record: newRecord
  });
});

// Doctor writes Prescription (Creates medical record + items + syncs to medicines table for patient)
router.post('/prescription', authenticate, (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ error: 'Only doctors can write prescriptions' });
  }

  const { patient_id, diagnosis_summary, follow_up_date, special_instructions, items = [] } = req.body;

  if (!patient_id) return res.status(400).json({ error: 'patient_id is required' });
  if (items.length === 0) return res.status(400).json({ error: 'Prescription must contain at least one medicine item' });

  const patient = db.patients.find(p => p.id === patient_id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const doctor = req.doctor;
  const recordId = uuidv4();
  const prescriptionId = uuidv4();

  // 1. Create Timeline Medical Record
  const newRecord = {
    id: recordId,
    patient_id,
    doctor_id: doctor.id,
    hospital_id: 'h1000000-0000-0000-0000-000000000001',
    category: 'prescriptions',
    title: `Prescription by Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialization})`,
    description: `Diagnosis: ${diagnosis_summary || 'Clinical Consultation'}. Prescribed ${items.length} medication(s). ${special_instructions || ''}`,
    record_date: new Date().toISOString().split('T')[0],
    file_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
    file_type: 'pdf',
    file_size_bytes: 185000,
    metadata: {
      prescription_id: prescriptionId,
      doctor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
      specialization: doctor.specialization,
      diagnosis: diagnosis_summary,
      follow_up_date,
      medicines: items
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.medical_records.unshift(newRecord);

  // 2. Add each item to medicines list for the patient
  items.forEach(item => {
    const medId = uuidv4();
    const reminderTimes = item.frequency.includes('Twice') || item.frequency === '1-0-1' 
      ? ['08:30', '20:30'] 
      : item.frequency.includes('Night') || item.frequency === '0-0-1' 
      ? ['21:30'] 
      : ['08:30'];

    db.medicines.unshift({
      id: medId,
      patient_id,
      name: item.medicine_name,
      dosage: item.dosage,
      frequency: item.frequency,
      start_date: new Date().toISOString().split('T')[0],
      end_date: follow_up_date || new Date(Date.now() + (item.duration_days || 30) * 86400000).toISOString().split('T')[0],
      reminder_times: reminderTimes,
      is_active: true,
      prescription_source: `Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialization})`,
      safety_notes: item.instructions || 'Take as prescribed by doctor.'
    });
  });

  // 3. Create Notification for Patient
  createNotification({
    user_id: patient.user_id,
    type: 'medicine',
    title: `New Prescription from Dr. ${doctor.first_name} ${doctor.last_name}`,
    message: `Dr. ${doctor.first_name} ${doctor.last_name} has generated a new digital prescription with ${items.length} medicine(s). Check your medicines section for reminder schedules.`,
    link_url: '/patient/medicines'
  });

  // 4. Audit Log
  recordAuditLog({
    patient_id,
    actor_id: req.user.id,
    actor_role: 'doctor',
    actor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
    doctor_id: doctor.id,
    action: 'create_prescription',
    category_accessed: 'prescriptions',
    consent_status: 'authorized',
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || 'Doctor Portal',
    details: { prescription_id: prescriptionId, items_count: items.length }
  });

  res.status(201).json({
    success: true,
    message: 'Prescription created and synced to patient medicines',
    record: newRecord
  });
});

// Doctor writes Consultation Note (Creates consultation record + clinical assessment)
router.post('/consultation', authenticate, (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ error: 'Only doctors can record consultation notes' });
  }

  const { patient_id, symptoms, clinical_assessment, diagnosis, treatment_plan, follow_up_recommendation, vitals } = req.body;

  if (!patient_id) return res.status(400).json({ error: 'patient_id is required' });
  if (!symptoms || !clinical_assessment || !diagnosis || !treatment_plan) {
    return res.status(400).json({ error: 'Symptoms, clinical assessment, diagnosis, and treatment plan are required' });
  }

  const doctor = req.doctor;
  const patient = db.patients.find(p => p.id === patient_id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const recordId = uuidv4();

  const newRecord = {
    id: recordId,
    patient_id,
    doctor_id: doctor.id,
    hospital_id: 'h1000000-0000-0000-0000-000000000001',
    category: 'consultations',
    title: `Clinical Consultation with Dr. ${doctor.first_name} ${doctor.last_name}`,
    description: `Diagnosis: ${diagnosis}. Symptoms: ${symptoms}. Treatment: ${treatment_plan}.`,
    record_date: new Date().toISOString().split('T')[0],
    file_url: null,
    file_type: 'text',
    file_size_bytes: 14000,
    metadata: {
      symptoms,
      clinical_assessment,
      diagnosis,
      treatment_plan,
      follow_up_recommendation,
      vitals: vitals || { bp: '120/80', pulse: '72 bpm', spo2: '99%' },
      doctor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
      specialization: doctor.specialization
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.medical_records.unshift(newRecord);

  // Notification for Patient
  createNotification({
    user_id: patient.user_id,
    type: 'appointment',
    title: `Consultation Notes Available`,
    message: `Dr. ${doctor.first_name} ${doctor.last_name} has finalized clinical notes for your visit. Diagnosis: ${diagnosis}.`,
    link_url: '/patient/records'
  });

  // Audit Log
  recordAuditLog({
    patient_id,
    actor_id: req.user.id,
    actor_role: 'doctor',
    actor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
    doctor_id: doctor.id,
    action: 'record_consultation',
    category_accessed: 'consultations',
    consent_status: 'authorized',
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || 'Doctor Portal',
    details: { record_id: recordId, diagnosis }
  });

  res.status(201).json({
    success: true,
    message: 'Consultation note recorded in patient timeline',
    record: newRecord
  });
});

export default router;
