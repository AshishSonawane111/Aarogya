import React, { useState, useEffect } from 'react';
import { medicineAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { 
  Pill, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Calendar, 
  ShieldCheck, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const MedicinesPage = () => {
  const [data, setData] = useState({ active: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [loggedDoses, setLoggedDoses] = useState({});
  const { addToast } = useNotification();

  const fetchMedicines = async () => {
    try {
      const res = await medicineAPI.listMedicines();
      setData({
        active: res.data?.active || [],
        completed: res.data?.completed || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleLogDose = async (medId, medName) => {
    try {
      await medicineAPI.logDose(medId);
      setLoggedDoses((prev) => ({ ...prev, [medId]: true }));
      addToast({
        title: 'Dose Logged',
        message: `Marked ${medName} as taken for today. Keep up the adherence!`,
        type: 'success'
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-sky-600" />
            Active Medicines & Daily Reminders
          </h2>
          <p className="text-xs text-slate-500">
            Track active pharmacotherapy, dosage timings, adherence logs, and prescribing doctor source.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
            {data.active.length} Active Prescriptions
          </span>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-950 block mb-0.5">Informational Safety Notice</span>
          <p className="leading-relaxed text-amber-900/90">
            This module displays medications prescribed by your attending physicians. Health Passport does not automate medical treatment decisions. If you experience adverse side-effects, consult your doctor immediately.
          </p>
        </div>
      </div>

      {/* Active Medications Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-600" />
          Today's Scheduled Medication Regimen
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
            Loading active medications...
          </div>
        ) : data.active.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            No active medications listed.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.active.map((med) => {
              const isTaken = loggedDoses[med.id];
              return (
                <div
                  key={med.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{med.name}</h4>
                        <div className="text-xs text-sky-700 font-semibold">{med.dosage} • {med.frequency}</div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Active
                      </span>
                    </div>

                    {/* Schedule and Timings */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reminder Times</span>
                        <div className="font-mono font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-sky-600" />
                          {med.reminder_times?.join(', ') || '08:30'}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Duration Period</span>
                        <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                          Until {formatDate(med.end_date)}
                        </div>
                      </div>
                    </div>

                    {/* Source and instructions */}
                    <div className="text-xs text-slate-600 bg-sky-50/40 p-2.5 rounded-xl border border-sky-100 space-y-1">
                      <div className="text-[11px] font-bold text-sky-950">
                        Source: {med.prescription_source || 'Doctor Consultation'}
                      </div>
                      <div className="text-[10px] text-slate-500">{med.safety_notes}</div>
                    </div>
                  </div>

                  {/* Dose Logging Action */}
                  <button
                    onClick={() => handleLogDose(med.id, med.name)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                      isTaken
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20'
                    }`}
                  >
                    {isTaken ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Dose Logged for Today</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Mark Today's Dose Taken</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
