import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  ArrowRight,
  Stethoscope,
  Volume2
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const { addToast } = useNotification();

  const fetchAppointments = async () => {
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
  }, []);

  const handleUpdateStatus = async (aptId, status) => {
    try {
      await appointmentAPI.updateStatus(aptId, { status });
      addToast({
        title: 'Status Updated',
        message: `Appointment marked as ${status}.`,
        type: 'success'
      });
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcastDelay = async (e) => {
    e.preventDefault();
    if (!selectedApt) return;

    try {
      await appointmentAPI.updateStatus(selectedApt.id, {
        delay_minutes: Number(delayMinutes)
      });

      addToast({
        title: 'Delay Alert Broadcasted',
        message: `Patient notified about ${delayMinutes} mins delay.`,
        type: 'info'
      });

      setShowDelayModal(false);
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filter === 'today') return a.appointment_date === new Date().toISOString().split('T')[0];
    if (filter === 'upcoming') return a.status === 'scheduled';
    if (filter === 'completed') return a.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Doctor Consultations Schedule & Queue
          </h2>
          <p className="text-xs text-slate-500">
            Real-time outpatient queue management, status updates, and automated patient delay broadcasts.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({appointments.length})
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'today' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today's Visits
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'completed' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs animate-pulse">Loading schedule...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            No consultations matching this filter.
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 font-mono font-bold flex flex-col items-center justify-center text-xs shrink-0 border border-indigo-100">
                    <span>{apt.start_time.slice(0, 5)}</span>
                    <span className="text-[9px] text-slate-400 font-sans">Slot</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{apt.patient_name}</h4>
                      <span className="font-mono text-xs text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {apt.health_id_number || 'HP-2026-1001'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Blood: <strong className="text-rose-600">{apt.patient_blood_group || 'O+'}</strong></span>
                      <span>•</span>
                      <span>{formatDate(apt.appointment_date)}</span>
                      <span>•</span>
                      <span className="capitalize">{apt.consultation_type === 'video_consult' ? 'Video' : 'Clinic'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {apt.delay_minutes > 0 && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      +{apt.delay_minutes}m Delay
                    </span>
                  )}
                  <StatusBadge status={apt.status} />
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong>Chief Complaint: </strong> {apt.chief_complaint}
              </div>

              {/* Doctor Control Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedApt(apt);
                      setDelayMinutes(15);
                      setShowDelayModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200 transition flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Broadcast Delay
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {apt.status !== 'completed' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'completed')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'absent')}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                      >
                        Mark Absent
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Delay Broadcast Modal */}
      {showDelayModal && (
        <Modal isOpen={showDelayModal} onClose={() => setShowDelayModal(false)} title="Broadcast Schedule Delay to Patient">
          <form onSubmit={handleBroadcastDelay} className="space-y-4">
            <p className="text-xs text-slate-600">
              Notify <strong>{selectedApt?.patient_name}</strong> about a delay in outpatient schedule.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Estimated Delay (Minutes):</label>
              <select
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
              >
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>1 Hour (60 Minutes)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDelayModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20"
              >
                Broadcast Alert Now
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
