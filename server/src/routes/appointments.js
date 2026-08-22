import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, createNotification, recordAuditLog } from '../database/store.js';
import { authenticate } from '../middleware/auth.js';
import { getAvailableSlots } from '../services/scheduler.js';

const router = express.Router();

// Get available slots for a doctor on a specific date (Scheduling engine)
router.get('/slots', authenticate, (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ error: 'doctorId and date parameters are required' });
  }

  try {
    const slotData = getAvailableSlots({ doctorId, dateStr: date });
    res.json(slotData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List appointments (role-filtered)
router.get('/', authenticate, (req, res) => {
  let appointments = [];

  if (req.user.role === 'patient') {
    appointments = db.appointments
      .filter(a => a.patient_id === req.patient.id)
      .map(a => {
        const doc = db.doctors.find(d => d.id === a.doctor_id);
        const hospital = db.hospitals.find(h => h.id === a.hospital_id);
        return {
          ...a,
          doctor_name: doc ? `Dr. ${doc.first_name} ${doc.last_name}` : 'Specialist',
          specialization: doc ? doc.specialization : 'Medical Officer',
          consultation_fee: doc ? doc.consultation_fee : 500,
          hospital_name: hospital ? hospital.name : 'Health City Clinic',
          avatar_url: doc?.avatar_url
        };
      });
  } else if (req.user.role === 'doctor') {
    appointments = db.appointments
      .filter(a => a.doctor_id === req.doctor.id)
      .map(a => {
        const patient = db.patients.find(p => p.id === a.patient_id);
        const healthId = db.health_ids.find(h => h.patient_id === a.patient_id);
        return {
          ...a,
          patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Patient',
          patient_dob: patient?.dob,
          patient_gender: patient?.gender,
          patient_blood_group: patient?.blood_group,
          health_id_number: healthId?.health_id_number,
          avatar_url: patient?.avatar_url
        };
      });
  }

  appointments.sort((a, b) => {
    const d1 = `${a.appointment_date}T${a.start_time}`;
    const d2 = `${b.appointment_date}T${b.start_time}`;
    return new Date(d1) - new Date(d2);
  });

  res.json({ appointments });
});

// Patient books a new appointment
router.post('/book', authenticate, (req, res) => {
  const {
    doctor_id,
    hospital_id,
    appointment_date,
    start_time,
    end_time,
    chief_complaint,
    consultation_type = 'in_person'
  } = req.body;

  let patientId = req.user.role === 'patient' ? req.patient.id : req.body.patient_id;
  if (!patientId || !doctor_id || !appointment_date || !start_time) {
    return res.status(400).json({ error: 'Missing required appointment parameters' });
  }

  const doctor = db.doctors.find(d => d.id === doctor_id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

  // Conflict check
  const conflict = db.appointments.find(
    a => a.doctor_id === doctor_id &&
         a.appointment_date === appointment_date &&
         a.start_time.slice(0, 5) === start_time.slice(0, 5) &&
         a.status !== 'cancelled'
  );

  if (conflict) {
    const nextOptions = getAvailableSlots({ doctorId: doctor_id, dateStr: appointment_date });
    return res.status(409).json({
      error: 'Selected slot is already reserved. Please select another slot.',
      alternative_slots: nextOptions.slots.filter(s => s.is_available)
    });
  }

  const newAppointment = {
    id: uuidv4(),
    patient_id: patientId,
    doctor_id,
    hospital_id: hospital_id || 'h1000000-0000-0000-0000-000000000001',
    appointment_date,
    start_time,
    end_time: end_time || `${parseInt(start_time.split(':')[0]) + 1}:${start_time.split(':')[1]}`,
    status: 'scheduled',
    chief_complaint: chief_complaint || 'General consultation',
    consultation_type,
    delay_minutes: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.appointments.unshift(newAppointment);

  // Notify Doctor
  createNotification({
    user_id: doctor.user_id,
    type: 'appointment',
    title: 'New Appointment Scheduled',
    message: `A new appointment has been booked for ${appointment_date} at ${start_time}. Reason: "${chief_complaint || 'Consultation'}"`,
    link_url: '/doctor/appointments'
  });

  // Notify Patient
  if (req.user.role === 'patient') {
    createNotification({
      user_id: req.user.id,
      type: 'appointment',
      title: 'Appointment Booked Successfully',
      message: `Your appointment with Dr. ${doctor.first_name} ${doctor.last_name} is confirmed for ${appointment_date} at ${start_time}.`,
      link_url: '/patient/appointments'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Appointment scheduled successfully',
    appointment: newAppointment
  });
});

// Reschedule appointment
router.post('/:appointmentId/reschedule', authenticate, (req, res) => {
  const { appointmentId } = req.params;
  const { appointment_date, start_time, end_time } = req.body;

  const apt = db.appointments.find(a => a.id === appointmentId);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });

  apt.appointment_date = appointment_date;
  apt.start_time = start_time;
  if (end_time) apt.end_time = end_time;
  apt.status = 'rescheduled';
  apt.updated_at = new Date().toISOString();

  res.json({
    success: true,
    message: 'Appointment rescheduled successfully',
    appointment: apt
  });
});

// Cancel appointment
router.post('/:appointmentId/cancel', authenticate, (req, res) => {
  const { appointmentId } = req.params;
  const { reason = 'Cancelled by user' } = req.body;

  const apt = db.appointments.find(a => a.id === appointmentId);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });

  apt.status = 'cancelled';
  apt.cancellation_reason = reason;
  apt.updated_at = new Date().toISOString();

  res.json({
    success: true,
    message: 'Appointment cancelled',
    appointment: apt
  });
});

// Doctor Updates Appointment Status / Delays
router.patch('/:appointmentId/status', authenticate, (req, res) => {
  const { appointmentId } = req.params;
  const { status, delay_minutes } = req.body;

  const apt = db.appointments.find(a => a.id === appointmentId);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });

  if (status) apt.status = status;
  if (delay_minutes !== undefined) {
    apt.delay_minutes = Number(delay_minutes);

    if (apt.delay_minutes > 0) {
      const patient = db.patients.find(p => p.id === apt.patient_id);
      const doctor = db.doctors.find(d => d.id === apt.doctor_id);
      if (patient) {
        createNotification({
          user_id: patient.user_id,
          type: 'delay',
          title: 'Doctor Schedule Delay Alert',
          message: `Dr. ${doctor ? doctor.last_name : 'Physician'} is currently running approximately ${delay_minutes} minutes delayed for appointments today.`,
          link_url: '/patient/appointments'
        });
      }
    }
  }

  apt.updated_at = new Date().toISOString();

  res.json({
    success: true,
    message: 'Appointment status updated',
    appointment: apt
  });
});

export default router;
