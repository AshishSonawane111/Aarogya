import { db } from '../database/store.js';

/**
 * Smart Appointment Scheduling Engine
 * Factors:
 * - Doctor working hours
 * - Working days (Mon-Sun)
 * - Break periods (lunch, tea)
 * - Blocked dates / leave
 * - Existing scheduled & confirmed appointments
 * - Slot duration
 * - Recommends alternative slots on conflicts
 */

export function getAvailableSlots({ doctorId, dateStr }) {
  const doctor = db.doctors.find(d => d.id === doctorId);
  if (!doctor) throw new Error('Doctor not found');

  const availability = db.doctor_availability.find(da => da.doctor_id === doctorId) || {
    working_days: [1, 2, 3, 4, 5],
    start_time: '09:00',
    end_time: '17:00',
    slot_duration_minutes: 30,
    break_start: '13:00',
    break_end: '14:00',
    blocked_dates: []
  };

  const targetDate = new Date(dateStr);
  const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 1 is Monday ...

  // Check if doctor is working on this day of week
  if (!availability.working_days.includes(dayOfWeek)) {
    return {
      available: false,
      reason: 'Doctor is not available on this day of the week.',
      slots: [],
      alternative_dates: findNextAvailableDates(doctorId, targetDate, 3)
    };
  }

  // Check if target date is blocked
  if (availability.blocked_dates.includes(dateStr)) {
    return {
      available: false,
      reason: 'Doctor is on scheduled leave on this date.',
      slots: [],
      alternative_dates: findNextAvailableDates(doctorId, targetDate, 3)
    };
  }

  // Generate all time slots
  const [startHour, startMin] = availability.start_time.split(':').map(Number);
  const [endHour, endMin] = availability.end_time.split(':').map(Number);
  const [breakStartH, breakStartM] = availability.break_start.split(':').map(Number);
  const [breakEndH, breakEndM] = availability.break_end.split(':').map(Number);

  const startTotal = startHour * 60 + startMin;
  const endTotal = endHour * 60 + endMin;
  const breakStartTotal = breakStartH * 60 + breakStartM;
  const breakEndTotal = breakEndH * 60 + breakEndM;
  const step = availability.slot_duration_minutes || 30;

  // Existing appointments for this doctor on this date
  const bookedAppointments = db.appointments.filter(
    apt => apt.doctor_id === doctorId && apt.appointment_date === dateStr && apt.status !== 'cancelled'
  );

  const bookedStarts = bookedAppointments.map(a => a.start_time.slice(0, 5));

  const slots = [];

  for (let current = startTotal; current + step <= endTotal; current += step) {
    // Check if slot falls in break
    const slotEnd = current + step;
    const inBreak = (current >= breakStartTotal && current < breakEndTotal) ||
                    (slotEnd > breakStartTotal && slotEnd <= breakEndTotal);

    if (inBreak) continue;

    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    const timeStr = `${h}:${m}`;

    const endH = Math.floor(slotEnd / 60).toString().padStart(2, '0');
    const endM = (slotEnd % 60).toString().padStart(2, '0');
    const endTimeStr = `${endH}:${endM}`;

    const isBooked = bookedStarts.includes(timeStr);

    slots.push({
      start_time: timeStr,
      end_time: endTimeStr,
      is_available: !isBooked,
      status: isBooked ? 'booked' : 'available'
    });
  }

  const hasAnyAvailable = slots.some(s => s.is_available);

  return {
    available: hasAnyAvailable,
    date: dateStr,
    doctor_id: doctorId,
    doctor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
    slots,
    alternative_dates: !hasAnyAvailable ? findNextAvailableDates(doctorId, targetDate, 3) : []
  };
}

function findNextAvailableDates(doctorId, fromDate, count = 3) {
  const results = [];
  const curr = new Date(fromDate);
  let attempts = 0;

  while (results.length < count && attempts < 14) {
    curr.setDate(curr.getDate() + 1);
    attempts++;
    const dateStr = curr.toISOString().split('T')[0];
    const check = getAvailableSlots({ doctorId, dateStr });
    if (check.available) {
      results.push({
        date: dateStr,
        available_slots_count: check.slots.filter(s => s.is_available).length
      });
    }
  }

  return results;
}
