import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ConsentApprovalModal } from '../../components/patient/ConsentApprovalModal';
import {
  User, Stethoscope, Leaf, Pill, FileText, Calendar, Bot, Share2,
  ArrowRight, KeyRound, Shield, Droplets, Sparkles, Clock, Activity
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// The EXACTLY 8 dashboard sections — order is fixed
// ─────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'my-health',
    emoji: '👤',
    Icon: User,
    label: 'My Health',
    description: 'Profile, ID & emergency info',
    to: '/patient/my-health',
    gradient: 'from-sky-500 to-blue-700',
    glow: 'shadow-sky-500/25',
    getStat: (d) => d?.patient
      ? `${d.patient.blood_group !== 'unknown' ? d.patient.blood_group : ''} · ${d.patient.city || 'Health Passport'}`
      : 'View your profile',
    getTag: (d) => d?.health_id?.health_id_number || 'No Health ID yet',
  },
  {
    id: 'medical-history',
    emoji: '🩺',
    Icon: Stethoscope,
    label: 'Medical History',
    description: 'Clinical records & diagnoses',
    to: '/patient/medical-history',
    gradient: 'from-violet-500 to-indigo-700',
    glow: 'shadow-violet-500/25',
    getStat: (d) => {
      const conds = d?.emergency_profile?.major_conditions || [];
      return conds.length > 0 ? conds.slice(0, 2).join(', ') : 'No conditions listed';
    },
    getTag: (d) => `${d?.recent_records?.length || 0} records in vault`,
  },
  {
    id: 'ayurveda',
    emoji: '🌿',
    Icon: Leaf,
    label: 'Ayurveda',
    description: 'Prakriti, Vikriti & treatments',
    to: '/patient/ayurveda',
    gradient: 'from-emerald-500 to-teal-700',
    glow: 'shadow-emerald-500/25',
    getStat: () => 'Traditional medicine profile',
    getTag: () => 'Set up Ayurveda profile →',
  },
  {
    id: 'medicines',
    emoji: '💊',
    Icon: Pill,
    label: 'Medicines',
    description: 'Prescriptions & reminders',
    to: '/patient/medicines',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/25',
    getStat: (d) => {
      const meds = d?.active_medicines || [];
      return meds.length > 0 ? `${meds[0].name} · ${meds[0].dosage}` : 'No active medicines';
    },
    getTag: (d) => `${d?.active_medicines?.length || 0} active medicines`,
  },
  {
    id: 'records',
    emoji: '📄',
    Icon: FileText,
    label: 'Reports & Documents',
    description: 'Lab reports, scans & uploads',
    to: '/patient/records',
    gradient: 'from-orange-500 to-red-600',
    glow: 'shadow-orange-500/25',
    getStat: (d) => d?.recent_records?.[0]?.title || 'No documents yet',
    getTag: (d) => `${d?.recent_records?.length || 0} documents stored`,
  },
  {
    id: 'timeline',
    emoji: '📅',
    Icon: Calendar,
    label: 'Health Timeline',
    description: 'Your health journey over time',
    to: '/patient/timeline',
    gradient: 'from-purple-500 to-pink-600',
    glow: 'shadow-purple-500/25',
    getStat: (d) => d?.upcoming_appointments?.[0]?.doctor_name
      ? `Next: ${d.upcoming_appointments[0].doctor_name}`
      : 'View your history',
    getTag: (d) => {
      const n = d?.upcoming_appointments?.length || 0;
      return n > 0 ? `${n} upcoming appointment(s)` : 'No upcoming visits';
    },
  },
  {
    id: 'ai-assistant',
    emoji: '🤖',
    Icon: Bot,
    label: 'AI Health Assistant',
    description: 'Chat, summarise & prepare',
    to: '/patient/ai-assistant',
    gradient: 'from-indigo-600 to-purple-800',
    glow: 'shadow-indigo-600/25',
    getStat: () => 'Ask me anything about your health',
    getTag: () => 'Powered by AI',
  },
  {
    id: 'share',
    emoji: '🔗',
    Icon: Share2,
    label: 'Share Health Passport',
    description: 'Secure QR sharing with doctors',
    to: '/patient/share',
    gradient: 'from-rose-500 to-pink-700',
    glow: 'shadow-rose-500/25',
    getStat: () => 'Zero-trust consent sharing',
    getTag: () => 'Create secure QR →',
  },
];

// ─────────────────────────────────────────────────────────────
// Profile completeness score
// ─────────────────────────────────────────────────────────────
const calcCompleteness = (data) => {
  if (!data) return 0;
  let score = 0;
  const p = data.patient;
  if (p?.first_name)                                    score += 15;
  if (p?.dob)                                           score += 10;
  if (p?.blood_group && p.blood_group !== 'unknown')    score += 10;
  if (p?.city)                                          score += 5;
  if (data.health_id)                                   score += 20;
  if (data.emergency_profile?.emergency_contact_name)   score += 15;
  if ((data.active_medicines || []).length > 0)         score += 10;
  if ((data.recent_records  || []).length > 0)         score += 15;
  return Math.min(100, score);
};

// ─────────────────────────────────────────────────────────────
// Individual section card component
// ─────────────────────────────────────────────────────────────
const SectionCard = ({ section, data }) => {
  const { Icon } = section;
  return (
    <Link
      to={section.to}
      className={`
        group relative block rounded-2xl overflow-hidden
        shadow-lg ${section.glow} hover:shadow-xl
        transition-all duration-300 hover:-translate-y-1
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:ring-offset-2
      `}
      aria-label={`${section.label}: ${section.description}`}
    >
      <div className={`bg-gradient-to-br ${section.gradient} p-5 h-full min-h-[176px] flex flex-col justify-between`}>
        {/* Top row: emoji icon + section icon */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl shadow-inner select-none border border-white/10">
            {section.emoji}
          </div>
          <Icon className="w-5 h-5 text-white/40 mt-0.5" aria-hidden="true" />
        </div>

        {/* Title + description */}
        <div className="mt-auto pt-4">
          <h3 className="text-white font-bold text-[15px] leading-snug">
            {section.label}
          </h3>
          <p className="text-white/70 text-xs mt-0.5 leading-snug">
            {section.description}
          </p>

          {/* Stat chip + arrow */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-white/80 text-[11px] bg-white/15 px-2.5 py-1 rounded-lg line-clamp-1 border border-white/10 flex-1 min-w-0">
              {section.getTag(data)}
            </span>
            <ArrowRight
              className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────
const DashboardSkeleton = () => (
  <div className="space-y-6 pb-12 animate-pulse">
    <div className="h-36 bg-slate-200 rounded-3xl" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-44 bg-slate-200 rounded-2xl" />
      ))}
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 bg-slate-200 rounded-2xl" />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main PatientDashboard
// ─────────────────────────────────────────────────────────────
export const PatientDashboard = () => {
  const { user, profile } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConsent, setSelectedConsent] = useState(null);

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

  useEffect(() => { fetchDashboard(); }, [user]);

  if (loading) return <DashboardSkeleton />;

  const patient        = dashboardData?.patient || profile;
  const healthId       = dashboardData?.health_id;
  const pendingConsents = dashboardData?.pending_consents || [];
  const medicines      = dashboardData?.active_medicines || [];
  const records        = dashboardData?.recent_records || [];
  const appointments   = dashboardData?.upcoming_appointments || [];
  const completeness   = calcCompleteness(dashboardData);

  // Quick stats row data
  const quickStats = [
    {
      label: 'Active Medicines',
      value: medicines.length,
      Icon: Pill,
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-200',
      to: '/patient/medicines',
    },
    {
      label: 'Documents',
      value: records.length,
      Icon: FileText,
      colorClass: 'text-indigo-600',
      bgClass: 'bg-indigo-50',
      borderClass: 'border-indigo-200',
      to: '/patient/records',
    },
    {
      label: 'Upcoming Visits',
      value: appointments.length,
      Icon: Calendar,
      colorClass: 'text-purple-600',
      bgClass: 'bg-purple-50',
      borderClass: 'border-purple-200',
      to: '/patient/appointments',
    },
    {
      label: 'Pending Consents',
      value: pendingConsents.length,
      Icon: KeyRound,
      colorClass: pendingConsents.length > 0 ? 'text-amber-600' : 'text-emerald-600',
      bgClass: pendingConsents.length > 0 ? 'bg-amber-50' : 'bg-emerald-50',
      borderClass: pendingConsents.length > 0 ? 'border-amber-200' : 'border-emerald-200',
      to: '/patient/consent',
    },
  ];

  return (
    <div className="space-y-6 pb-12">

      {/* ── Pending Consent Alert Banner ── */}
      {pendingConsents.length > 0 && (
        <div
          className="bg-amber-50 border-2 border-amber-400/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm"
          role="alert"
        >
          <div className="flex items-center gap-3 text-amber-900">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 text-amber-700" aria-hidden="true" />
            </div>
            <div>
              <div className="font-bold text-sm">
                {pendingConsents.length} Pending Medical Access Request{pendingConsents.length > 1 ? 's' : ''}
              </div>
              <div className="text-xs text-amber-800">
                {pendingConsents[0]?.doctor_name} is requesting access to your medical records.
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedConsent(pendingConsents[0])}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Review & Respond
          </button>
        </div>
      )}

      {/* ── Welcome Hero Banner ── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-800/30 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-xl overflow-hidden shrink-0 ring-2 ring-white/20">
              {patient?.avatar_url ? (
                <img
                  src={patient.avatar_url}
                  alt={`${patient.first_name}'s avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-white" aria-hidden="true" />
              )}
            </div>
            <div>
              <p className="text-sm text-sky-300 font-medium">Namaste 🙏</p>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                {patient?.first_name || 'Health'} {patient?.last_name || 'Passport'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {healthId && (
                  <span className="text-xs bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-500/30 font-mono font-semibold">
                    {healthId.health_id_number}
                  </span>
                )}
                {patient?.blood_group && patient.blood_group !== 'unknown' && (
                  <span className="text-xs bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-500/30 font-semibold flex items-center gap-1">
                    <Droplets className="w-3 h-3" aria-hidden="true" />
                    {patient.blood_group}
                  </span>
                )}
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Shield className="w-3 h-3" aria-hidden="true" /> Verified
                </span>
              </div>
            </div>
          </div>

          {/* Completeness bar */}
          <div className="w-full sm:w-52 shrink-0" aria-label={`Health Passport ${completeness}% complete`}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Health Passport</span>
              <span className="text-sky-400 font-bold">{completeness}%</span>
            </div>
            <div className="h-2.5 bg-slate-700/60 rounded-full overflow-hidden" role="progressbar" aria-valuenow={completeness} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {completeness < 100
                ? 'Complete your profile for better care'
                : '✅ Profile complete'}
            </p>
          </div>
        </div>
      </div>

      {/* ── 8 Section Cards ── */}
      <section aria-labelledby="sections-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="sections-heading" className="text-lg font-bold text-slate-800">
            Your Health Sections
          </h2>
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-medium">
            8 sections
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {SECTIONS.map((section) => (
            <SectionCard key={section.id} section={section} data={dashboardData} />
          ))}
        </div>
      </section>

      {/* ── Quick Stats Row ── */}
      <section aria-label="Quick health statistics">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickStats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.to}
              className={`${stat.bgClass} ${stat.borderClass} border rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow group`}
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                <stat.Icon className={`w-5 h-5 ${stat.colorClass}`} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className={`text-2xl font-bold ${stat.colorClass} leading-none`}>
                  {stat.value}
                </div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5 truncate">
                  {stat.label}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── AI Summary Teaser ── */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-xl border border-sky-600/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-sky-400" aria-hidden="true" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider border border-sky-500/30 mb-1">
              AI Clinical Intelligence
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              AI can generate a consolidated clinical summary from your records — conditions, medicines, lab results and timeline — to help you prepare for your next doctor visit.
            </p>
          </div>
        </div>
        <Link
          to="/patient/ai-assistant"
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition shrink-0"
        >
          Open AI Assistant
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      {/* ── Consent Approval Modal ── */}
      {selectedConsent && (
        <ConsentApprovalModal
          isOpen={!!selectedConsent}
          onClose={() => setSelectedConsent(null)}
          consent={selectedConsent}
          onApprove={async () => { setSelectedConsent(null); fetchDashboard(); }}
          onDeny={async () => { setSelectedConsent(null); fetchDashboard(); }}
        />
      )}
    </div>
  );
};
