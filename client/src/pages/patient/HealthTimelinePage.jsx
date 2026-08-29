import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI, recordAPI, appointmentAPI } from '../../services/api';
import { formatDate, getCategoryLabel } from '../../utils/helpers';
import {
  Calendar, Pill, FileText, Stethoscope, Leaf, Zap,
  Activity, Filter, ChevronRight, ArrowRight
} from 'lucide-react';

const EVENT_TYPES = {
  record_medical_history:  { color: 'bg-violet-500', border: 'border-violet-200', bg: 'bg-violet-50', text: 'text-violet-700', emoji: '🩺' },
  record_lab_reports:      { color: 'bg-sky-500',    border: 'border-sky-200',    bg: 'bg-sky-50',    text: 'text-sky-700',    emoji: '🧪' },
  record_prescriptions:    { color: 'bg-emerald-500',border: 'border-emerald-200',bg: 'bg-emerald-50',text: 'text-emerald-700',emoji: '📋' },
  record_diagnoses:        { color: 'bg-red-500',    border: 'border-red-200',    bg: 'bg-red-50',    text: 'text-red-700',    emoji: '🏥' },
  record_consultations:    { color: 'bg-indigo-500', border: 'border-indigo-200', bg: 'bg-indigo-50', text: 'text-indigo-700', emoji: '💬' },
  record_scans:            { color: 'bg-pink-500',   border: 'border-pink-200',   bg: 'bg-pink-50',   text: 'text-pink-700',   emoji: '🔬' },
  record_hospital_records: { color: 'bg-amber-500',  border: 'border-amber-200',  bg: 'bg-amber-50',  text: 'text-amber-700',  emoji: '🏨' },
  appointment:             { color: 'bg-purple-500', border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-700', emoji: '📅' },
  medicine:                { color: 'bg-orange-500', border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-700', emoji: '💊' },
};

const getStyle = (type) => EVENT_TYPES[type] || EVENT_TYPES['record_medical_history'];

const FILTERS = [
  { id: 'all',          label: 'All Events' },
  { id: 'records',      label: '📄 Records' },
  { id: 'appointments', label: '📅 Appointments' },
  { id: 'medicines',    label: '💊 Medicines' },
];

export const HealthTimelinePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      recordAPI.getRecords({}),
      patientAPI.getDashboard(),
    ]).then(([recsRes, dashRes]) => {
      const allEvents = [];

      // Records → timeline events
      (recsRes.data?.records || []).forEach(r => {
        allEvents.push({
          id: r.id,
          type: `record_${r.category}`,
          kind: 'records',
          title: r.title,
          subtitle: getCategoryLabel(r.category),
          date: r.record_date || r.created_at,
          description: r.description,
          to: '/patient/records',
        });
      });

      // Upcoming appointments → timeline events
      (dashRes.data?.upcoming_appointments || []).forEach(a => {
        allEvents.push({
          id: a.id,
          type: 'appointment',
          kind: 'appointments',
          title: `Appointment with ${a.doctor_name}`,
          subtitle: a.specialization || 'Consultation',
          date: a.appointment_date,
          description: a.chief_complaint || 'Scheduled consultation',
          to: '/patient/appointments',
        });
      });

      // Active medicines → timeline events
      (dashRes.data?.active_medicines || []).forEach(m => {
        allEvents.push({
          id: m.id,
          type: 'medicine',
          kind: 'medicines',
          title: `${m.name} started`,
          subtitle: `${m.dosage} · ${m.frequency}`,
          date: m.start_date || m.created_at,
          description: `Prescribed by ${m.prescription_source || 'Doctor'}`,
          to: '/patient/medicines',
        });
      });

      // Sort by date descending
      allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEvents(allEvents);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? events : events.filter(e => e.kind === filter);

  // Group by year
  const byYear = {};
  filtered.forEach(e => {
    const year = new Date(e.date).getFullYear() || 'Unknown';
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(e);
  });
  const years = Object.keys(byYear).sort((a, b) => b - a);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">📅 Health Timeline</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your complete health journey over time</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Events', value: events.length, color: 'text-slate-700' },
          { label: 'This Year',    value: events.filter(e => new Date(e.date).getFullYear() === new Date().getFullYear()).length, color: 'text-sky-600' },
          { label: 'Upcoming',     value: events.filter(e => e.kind === 'appointments').length, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition btn-inline ${
              filter === f.id
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-700">No health events yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Upload records and book appointments to build your health timeline.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/patient/records" className="px-4 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200 hover:bg-sky-100 transition link-inline">
              Upload Records
            </Link>
            <Link to="/patient/appointments" className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 hover:bg-purple-100 transition link-inline">
              Book Appointment
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {years.map(year => (
            <div key={year}>
              {/* Year Label */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg font-bold text-slate-800">{year}</span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">{byYear[year].length} event{byYear[year].length !== 1 ? 's' : ''}</span>
              </div>

              {/* Events for this year */}
              <div className="relative border-l-2 border-slate-200 ml-3 sm:ml-5 space-y-4">
                {byYear[year].map(event => {
                  const style = getStyle(event.type);
                  return (
                    <div key={event.id} className="relative pl-6 sm:pl-8">
                      {/* Dot */}
                      <div className={`absolute -left-[9px] top-3.5 w-4 h-4 rounded-full ${style.color} ring-2 ring-white shadow-sm flex items-center justify-center text-[10px]`}>
                      </div>

                      <Link to={event.to} className={`block bg-white rounded-2xl border ${style.border} shadow-sm p-4 hover:shadow-md transition group`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl ${style.bg} flex items-center justify-center text-lg shrink-0`}>
                              {event.emoji || getStyle(event.type).emoji}
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-slate-900 leading-snug">{event.title}</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-bold ${style.text}`}>{event.subtitle}</span>
                                <span className="text-[10px] text-slate-400">·</span>
                                <span className="text-[10px] text-slate-400">{formatDate(event.date)}</span>
                              </div>
                              {event.description && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{event.description}</p>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-1 group-hover:translate-x-0.5 transition" />
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
