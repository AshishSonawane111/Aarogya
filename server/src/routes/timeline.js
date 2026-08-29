import express from 'express';
import { db } from '../database/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/timeline — Fetch chronological composite health timeline for a patient
router.get('/', authenticate, (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.patient.id : req.query.patientId;
    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required.' });
    }

    const patient = db.patients.find(p => p.id === patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const timelineEvents = [];

    // Helper to format ISO strings to date format (YYYY-MM-DD)
    const formatDate = (isoStr) => {
      if (!isoStr) return new Date().toISOString().split('T')[0];
      return isoStr.split('T')[0];
    };

    // 1. Compile Medical Records
    const medicalRecords = db.medical_records.filter(r => r.patient_id === patientId);
    medicalRecords.forEach(r => {
      let icon = '📄';
      if (r.category === 'prescriptions') icon = '💊';
      else if (r.category === 'lab_reports') icon = '🧪';
      else if (r.category === 'scans') icon = '🔬';
      else if (r.category === 'consultations') icon = '🩺';

      let status = 'patient_reported';
      if (r.metadata?.verified_by_doctor || r.doctor_id) {
        status = 'verified';
      } else if (r.metadata?.digitization_session_id) {
        // check corresponding digitization session status
        const session = db.document_digitizations.find(s => s.id === r.metadata.digitization_session_id);
        if (session) {
          status = session.status === 'verified' ? 'verified' : 'needs_verification';
        } else {
          status = 'needs_verification';
        }
      }

      timelineEvents.push({
        id: `med-${r.id}`,
        date: formatDate(r.record_date),
        type: 'medical_record',
        icon,
        title: r.title || 'Medical Record',
        subtitle: r.category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: r.description || '',
        status,
        metadata: {
          file_url: r.file_url,
          file_type: r.file_type,
          doctor_name: r.metadata?.doctor_name || 'Not detected',
          hospital_name: r.metadata?.hospital_name || 'Not detected',
          findings: r.metadata?.findings || [],
          medicines: r.metadata?.medicines || [],
          treatments: r.metadata?.treatments || [],
          verified_by_doctor: r.metadata?.verified_by_doctor
        }
      });
    });

    // 2. Compile Ayurvedic Assessments (Dashavidha Pariksha)
    const ayurvedaAssessments = db.ayurveda_assessments.filter(a => a.patient_id === patientId);
    ayurvedaAssessments.forEach(a => {
      timelineEvents.push({
        id: `ayur-assess-${a.id}`,
        date: formatDate(a.created_at),
        type: 'ayurveda_assessment',
        icon: '🌿',
        title: 'Ayurvedic Consultation',
        subtitle: 'Dashavidha Pariksha Assessment',
        description: `Vaidya assessment completed. Prakriti: ${a.assessment_data?.prakriti || 'Vata-Pitta'}, Vikriti: ${a.assessment_data?.vikriti || 'Pitta'}`,
        status: 'verified',
        metadata: a.assessment_data
      });
    });

    // 3. Compile Ayurvedic Treatments
    const ayurvedaTreatments = db.ayurveda_treatments.filter(t => t.patient_id === patientId);
    ayurvedaTreatments.forEach(t => {
      timelineEvents.push({
        id: `ayur-treat-${t.id}`,
        date: formatDate(t.treatment_date),
        type: 'ayurveda_treatment',
        icon: '🧘',
        title: t.treatment_name || 'Ayurvedic Treatment',
        subtitle: t.treatment_type || 'Panchakarma',
        description: t.notes || 'Ayurvedic therapy administered.',
        status: 'patient_reported',
        metadata: {
          practitioner: t.practitioner,
          duration: t.duration,
          follow_up_date: t.follow_up_date
        }
      });
    });

    // 4. Compile AI Clinical Histories
    const clinicalHistories = db.clinical_histories.filter(h => h.patient_id === patientId);
    clinicalHistories.forEach(h => {
      timelineEvents.push({
        id: `ai-intake-${h.id}`,
        date: formatDate(h.created_at),
        type: 'ai_intake',
        icon: '🤖',
        title: 'AI Clinical Intake History',
        subtitle: 'Intake Assessment',
        description: `Chief Complaint: ${h.chief_complaint || 'General health evaluation'}`,
        status: h.status === 'verified' ? 'verified' : 'patient_reported',
        metadata: {
          symptoms: h.symptoms || [],
          lifestyle_factors: h.lifestyle_factors || {},
          ai_summary: h.ai_summary || ''
        }
      });
    });

    // 5. Compile Medicine Regimens
    const medicines = db.medicines.filter(m => m.patient_id === patientId);
    medicines.forEach(m => {
      timelineEvents.push({
        id: `med-reg-${m.id}`,
        date: formatDate(m.created_at),
        type: 'medicine',
        icon: m.medicine_type === 'ayurvedic' ? '🌿' : '💊',
        title: `Medicine Added: ${m.name}`,
        subtitle: m.medicine_type === 'ayurvedic' ? 'Ayurvedic Regimen' : 'Modern Medicine',
        description: `${m.dosage} — ${m.frequency}. Prescribed by ${m.prescribing_vaidya || 'Clinician'}.`,
        status: m.is_active ? 'verified' : 'patient_reported',
        metadata: {
          dosage: m.dosage,
          frequency: m.frequency,
          route: m.route,
          duration_days: m.duration_days,
          safety_notes: m.safety_notes
        }
      });
    });

    // 6. Compile Consultations / Appointments
    const appointments = db.appointments.filter(ap => ap.patient_id === patientId);
    appointments.forEach(ap => {
      let status = 'scheduled';
      if (ap.status === 'completed') status = 'completed';
      else if (ap.status === 'cancelled') status = 'cancelled';

      timelineEvents.push({
        id: `appt-${ap.id}`,
        date: formatDate(ap.appointment_date),
        type: 'appointment',
        icon: '🩺',
        title: ap.reason || 'Clinical Consultation',
        subtitle: 'Doctor Appointment',
        description: `Consultation with Dr. ${ap.doctor_name || 'Medical Specialist'}.`,
        status,
        metadata: {
          time_slot: ap.time_slot,
          department: ap.department,
          status: ap.status
        }
      });
    });

    // Sort events chronologically (newest first)
    timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      timeline: timelineEvents
    });

  } catch (err) {
    console.error('[Timeline Fetch Error]', err);
    res.status(500).json({ error: 'Failed to retrieve composite health timeline.' });
  }
});

export default router;
