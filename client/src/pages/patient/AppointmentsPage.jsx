import React, { useState, useEffect } from 'react';
import { appointmentAPI, doctorAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  MapPin, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Plus,
  ArrowRight,
  User
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';

export const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const { addToast } = useNotification();

  // Booking Flow State
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [slotData, setSlotData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [consultType, setConsultType] = useState('in_person');
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentAPI.listAppointments();
      setAppointments(res.data?.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    doctorAPI.listDoctors().then((res) => {
      setDoctors(res.data?.doctors || []);
      if (res.data?.doctors?.length > 0) {
        setSelectedDoctorId(res.data.doctors[0].id);
      }
    }).catch((err) => console.error(err));
  }, []);

  // Fetch slots whenever doctor or date changes in booking modal
  useEffect(() => {
    if (selectedDoctorId && selectedDate && showBookModal) {
      setCheckingSlots(true);
      setSelectedSlot('');
      appointmentAPI.getSlots(selectedDoctorId, selectedDate).then((res) => {
        setSlotData(res.data);
      }).catch((err) => {
        setSlotData(null);
      }).finally(() => {
        setCheckingSlots(false);
      });
    }
  }, [selectedDoctorId, selectedDate, showBookModal]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedDate || !selectedSlot) {
      alert('Please select a doctor, date, and available time slot.');
      return;
    }

    setBooking(true);
    try {
      const selectedSlotObj = slotData?.slots?.find((s) => s.start_time === selectedSlot);

      await appointmentAPI.bookAppointment({
        doctor_id: selectedDoctorId,
        appointment_date: selectedDate,
        start_time: selectedSlot,
        end_time: selectedSlotObj ? selectedSlotObj.end_time : '11:00',
        chief_complaint: chiefComplaint,
        consultation_type: consultType
      });

      addToast({
        title: 'Appointment Confirmed',
        message: `Consultation confirmed for ${selectedDate} at ${selectedSlot}.`,
        type: 'success'
      });

      setShowBookModal(false);
      setChiefComplaint('');
      fetchAppointments();
    } catch (err) {
      addToast({
        title: 'Booking Conflict',
        message: err.response?.data?.error || 'Failed to book slot',
        type: 'error'
      });
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (aptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentAPI.cancelAppointment(aptId, 'Cancelled by patient');
      addToast({
        title: 'Appointment Cancelled',
        message: 'Your slot has been released.',
        type: 'info'
      });
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Appointments & Doctor Consultations
          </h2>
          <p className="text-xs text-slate-500">
            Intelligent scheduling engine with real-time doctor availability and automated reminders.
          </p>
        </div>

        <button
          onClick={() => setShowBookModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Book New Appointment
        </button>
      </div>

      {/* Appointment Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-slate-400 text-xs animate-pulse">
            Loading consultations schedule...
          </div>
        ) : appointments.length === 0 ? (
          <div className="col-span-2 bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">No appointments scheduled</h4>
            <p className="text-xs text-slate-400">Book your specialist consultation online in seconds.</p>
            <button
              onClick={() => setShowBookModal(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Book Consultation
            </button>
          </div>
        ) : (
          appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={apt.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face'}
                    alt="Doctor"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{apt.doctor_name}</h4>
                    <div className="text-xs text-teal-700 font-semibold">{apt.specialization}</div>
                    <div className="text-[11px] text-slate-500">{apt.hospital_name}</div>
                  </div>
                </div>

                <StatusBadge status={apt.status} />
              </div>

              {/* Timing and Reason Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Date & Time</span>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-teal-600" />
                    {formatDate(apt.appointment_date)}
                  </div>
                  <div className="text-[11px] text-teal-700 font-mono font-bold">
                    {apt.start_time.slice(0, 5)} - {apt.end_time?.slice(0, 5) || '11:00'}
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Consultation Mode</span>
                  <div className="font-bold text-slate-800 capitalize">
                    {apt.consultation_type === 'video_consult' ? '🎥 Video Consult' : '🏥 In-Person Clinic'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold">
                    Fee: {formatCurrency(apt.consultation_fee || 800)}
                  </div>
                </div>
              </div>

              {/* Chief complaint */}
              <div className="text-xs text-slate-600 bg-teal-50/40 p-2.5 rounded-xl border border-teal-100">
                <span className="font-bold text-teal-900">Reason: </span>
                <span>{apt.chief_complaint}</span>
              </div>

              {/* Actions */}
              {apt.status === 'scheduled' && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleCancel(apt.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition"
                  >
                    Cancel Slot
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Book Appointment Modal */}
      <Modal isOpen={showBookModal} onClose={() => setShowBookModal(false)} title="Schedule Medical Consultation" maxWidth="max-w-xl">
        <form onSubmit={handleBookSubmit} className="space-y-4">
          
          {/* Select Doctor */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Select Physician / Specialist:</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.first_name} {d.last_name} — {d.specialization} ({d.hospital_name}) • ₹{d.consultation_fee}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Preferred Date:</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Consultation Mode:</label>
              <select
                value={consultType}
                onChange={(e) => setConsultType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="in_person">In-Person Hospital Visit</option>
                <option value="video_consult">Secure Telehealth Video</option>
              </select>
            </div>
          </div>

          {/* Available Slots Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Available Time Slots on {formatDate(selectedDate)}:
              </label>
              {checkingSlots && (
                <span className="text-[10px] text-teal-600 font-semibold animate-pulse">
                  Checking Engine...
                </span>
              )}
            </div>

            {!slotData?.available ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  {slotData?.reason || 'Doctor is unavailable on this date.'}
                </div>
                {slotData?.alternative_dates?.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-slate-700">Recommended Alternative Dates:</div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {slotData.alternative_dates.map((alt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedDate(alt.date)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold text-[11px] hover:bg-amber-100 transition"
                        >
                          {formatDate(alt.date)} ({alt.available_slots_count} slots)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                {slotData.slots?.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!slot.is_available}
                    onClick={() => setSelectedSlot(slot.start_time)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition border ${
                      !slot.is_available
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                        : selectedSlot === slot.start_time
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-white hover:bg-teal-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    {slot.start_time}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chief Complaint */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Chief Complaint / Reason for Visit:
            </label>
            <textarea
              rows={2}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. Routine blood pressure check, persistent cough, allergy review..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowBookModal(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={booking || !selectedSlot}
              className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-600/20"
            >
              {booking ? 'Reserving Slot...' : 'Confirm Appointment'}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
