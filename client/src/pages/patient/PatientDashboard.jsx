import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { HealthIDCard } from '../../components/patient/HealthIDCard';
import { ConsentApprovalModal } from '../../components/patient/ConsentApprovalModal';
import { QRModal } from '../../components/common/QRModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  ShieldCheck, 
  Calendar, 
  Pill, 
  FileText, 
  Sparkles, 
  KeyRound, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Plus,
  Phone,
  Droplet
} from 'lucide-react';
import { formatDate, getCategoryLabel } from '../../utils/helpers';

export const PatientDashboard = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await patientAPI.getDashboard();
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-48 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const patient = dashboardData?.patient || profile;
  const healthId = dashboardData?.health_id;
  const emergency = dashboardData?.emergency_profile;
  const pendingConsents = dashboardData?.pending_consents || [];
  const appointments = dashboardData?.upcoming_appointments || [];
  const medicines = dashboardData?.active_medicines || [];
  const recentRecords = dashboardData?.recent_records || [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Pending Consent Action Banner */}
      {pendingConsents.length > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2 shadow-sm">
          <div className="flex items-center gap-3 text-amber-900">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">
                {pendingConsents.length} Pending Doctor Medical Access Request(s)
              </div>
              <div className="text-xs text-amber-800">
                {pendingConsents[0]?.doctor_name} has requested permission to view selected records.
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedConsent(pendingConsents[0])}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition shrink-0"
          >
            Review & Approve
          </button>
        </div>
      )}

      {/* Health ID Hero Card */}
      <HealthIDCard
        patient={patient}
        healthId={healthId}
        emergencyProfile={emergency}
      />

      {/* AI Health Summary Highlights Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-sky-600/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider border border-sky-500/30">
              <Sparkles className="w-3 h-3 text-sky-400" />
              AI Clinical Intelligence
            </div>
            <h3 className="text-lg font-bold">Consolidated AI Health Overview</h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Synthesized from your complete medical records. Active conditions: <strong>{emergency?.major_conditions?.join(', ') || 'Hypertension'}</strong>. Active daily medications: <strong>{medicines.length} prescribed items</strong>.
            </p>
            <div className="text-[10px] text-sky-400 font-semibold tracking-wide pt-1">
              AI-GENERATED SUMMARY — VERIFY WITH ORIGINAL MEDICAL RECORDS
            </div>
          </div>

          <Link
            to="/patient/ai-summary"
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition shrink-0"
          >
            <span>Explore Full AI Summary</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Upcoming Appointments Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Upcoming Visits</h4>
              </div>
              <Link to="/patient/appointments" className="text-xs font-semibold text-sky-600 hover:text-sky-800">
                Book Slot
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No upcoming consultations scheduled.
              </div>
            ) : (
              <div className="space-y-2.5">
                {appointments.slice(0, 2).map((apt) => (
                  <div key={apt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{apt.doctor_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-mono">
                        {apt.start_time.slice(0, 5)}
                      </span>
                    </div>
                    <div className="text-[11px] text-sky-700 font-medium">{apt.specialization}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDate(apt.appointment_date)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/patient/appointments"
            className="w-full py-2 text-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition block"
          >
            Manage All Appointments
          </Link>
        </div>

        {/* 2. Active Medicines & Reminders Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Pill className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Active Medicines</h4>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {medicines.length} Active
              </span>
            </div>

            <div className="space-y-2.5">
              {medicines.slice(0, 3).map((med) => (
                <div key={med.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{med.name}</div>
                    <div className="text-[10px] text-slate-500">{med.frequency} • {med.dosage}</div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {med.reminder_times?.[0] || '08:30'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/patient/medicines"
            className="w-full py-2 text-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition block"
          >
            View Daily Medication Schedule
          </Link>
        </div>

        {/* 3. Recent Medical Records Timeline Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Medical Vault</h4>
              </div>
              <Link to="/patient/records" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentRecords.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate max-w-[170px]">{rec.title}</span>
                    <span className="text-[9px] uppercase font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                      {getCategoryLabel(rec.category)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">{formatDate(rec.record_date)}</div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/patient/records"
            className="w-full py-2 text-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition block"
          >
            Access Encrypted Timeline
          </Link>
        </div>

      </div>

      {/* Consent Approval Modal */}
      {selectedConsent && (
        <ConsentApprovalModal
          isOpen={!!selectedConsent}
          onClose={() => setSelectedConsent(null)}
          consent={selectedConsent}
          onApprove={async (consentId, data) => {
            await patientAPI.getDashboard();
            fetchDashboard();
          }}
          onDeny={async (consentId) => {
            await patientAPI.getDashboard();
            fetchDashboard();
          }}
        />
      )}

    </div>
  );
};
