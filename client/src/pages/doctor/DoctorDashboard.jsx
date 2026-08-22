import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PatientSearchBar } from '../../components/doctor/PatientSearchBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Stethoscope, 
  Calendar, 
  KeyRound, 
  UserCheck, 
  Clock, 
  Search, 
  History, 
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Users
} from 'lucide-react';
import { formatDate, formatDateTime, getCategoryLabel } from '../../utils/helpers';

export const DoctorDashboard = () => {
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDoctorDashboard = async () => {
    try {
      const res = await doctorAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const todayAppointments = data?.today_appointments || [];
  const upcomingAppointments = data?.upcoming_appointments || [];
  const pendingConsents = data?.pending_consents || [];
  const activePatients = data?.active_authorized_patients || [];
  const recentAudit = data?.recent_audit || [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-700/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Healthcare Provider Workspace
            </span>
            <h2 className="text-xl sm:text-2xl font-bold">
              Dr. {profile?.first_name} {profile?.last_name}
            </h2>
            <div className="text-xs text-indigo-200">
              {profile?.specialization} • {profile?.hospital_name || 'Apollo Multi-Specialty Hospital'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Medical Reg No: {profile?.registration_number}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/doctor/patients"
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition"
            >
              <Search className="w-4 h-4" />
              Patient Health ID Search
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Visits</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{todayAppointments.length} Patients</div>
        </div>

        <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-indigo-800 block">Authorized Patients</span>
          <div className="text-2xl font-black text-indigo-950 mt-1">{activePatients.length} Active</div>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-800 block">Pending Consents</span>
          <div className="text-2xl font-black text-amber-950 mt-1">{pendingConsents.length} Pending</div>
        </div>

        <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-teal-800 block">Upcoming Consultations</span>
          <div className="text-2xl font-black text-teal-950 mt-1">{upcomingAppointments.length} Booked</div>
        </div>
      </div>

      {/* Patient Search Quick Box */}
      <PatientSearchBar />

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Active Authorized Patients */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Authorized Patient Records ({activePatients.length})
            </h3>
            <Link to="/doctor/authorized-patients" className="text-xs font-semibold text-teal-600 hover:text-teal-800">
              View All
            </Link>
          </div>

          {activePatients.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No authorized patients right now. Search patient by Health ID and request consent.
            </div>
          ) : (
            <div className="space-y-3">
              {activePatients.map((p) => (
                <div
                  key={p.consent_id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-teal-300 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                      alt="Patient"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{p.patient_name}</h4>
                      <div className="text-[10px] text-teal-700 font-mono font-semibold">{p.health_id_number}</div>
                      <div className="text-[10px] text-slate-500">
                        Permitted: {p.approved_categories?.map(getCategoryLabel).join(', ')}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/doctor/authorized-patients?patientId=${p.patient_id}`}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition"
                  >
                    <span>Open File</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Today's Appointment Queue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Today's Consultation Schedule
            </h3>
            <Link to="/doctor/appointments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              Manage Schedule
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No appointments scheduled for today. Check upcoming appointments tab.
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                      {apt.start_time.slice(0, 5)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{apt.patient_name}</h4>
                      <div className="text-[11px] text-slate-500">{apt.chief_complaint}</div>
                    </div>
                  </div>

                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
