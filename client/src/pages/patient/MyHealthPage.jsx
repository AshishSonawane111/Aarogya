import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { HealthIDCard } from '../../components/patient/HealthIDCard';
import { formatDate } from '../../utils/helpers';
import {
  User, Phone, MapPin, Droplets, Heart, Shield, AlertCircle,
  CheckCircle2, Edit3, ChevronRight, UserCheck, PhoneCall,
  Calendar, Activity, ArrowRight
} from 'lucide-react';

// ── Profile Completeness ─────────────────────────────────────
const calcItems = (patient, healthId, emergency) => [
  { label: 'Name & Gender',     done: !!(patient?.first_name && patient?.gender) },
  { label: 'Date of Birth',     done: !!patient?.dob },
  { label: 'Blood Group',       done: !!(patient?.blood_group && patient?.blood_group !== 'unknown') },
  { label: 'City / Location',   done: !!patient?.city },
  { label: 'Digital Health ID', done: !!healthId },
  { label: 'Emergency Contact', done: !!emergency?.emergency_contact_name },
  { label: 'Allergies Listed',  done: !!(emergency?.allergies?.length > 0) },
  { label: 'Medical Records',   done: false }, // filled later
];

export const MyHealthPage = () => {
  const { profile } = useAuth();
  const { addToast } = useNotification();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientAPI.getDashboard()
      .then(res => setData(res.data))
      .catch(() => addToast({ title: 'Error', message: 'Could not load profile', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse pb-12">
        <div className="h-48 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-56 bg-slate-200 rounded-2xl" />
          <div className="h-56 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const patient   = data?.patient || profile;
  const healthId  = data?.health_id;
  const emergency = data?.emergency_profile;
  const medicines = data?.active_medicines || [];
  const records   = data?.recent_records || [];

  const completionItems = calcItems(patient, healthId, emergency);
  completionItems[7].done = records.length > 0;
  const completionScore = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);

  const age = patient?.dob
    ? Math.floor((Date.now() - new Date(patient.dob)) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            👤 My Health
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Your health identity, profile and emergency information</p>
        </div>
        <Link
          to="/patient/settings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-md shadow-sky-600/20 transition"
        >
          <Edit3 className="w-4 h-4" /> Edit Profile
        </Link>
      </div>

      {/* Health ID Card */}
      <HealthIDCard patient={patient} healthId={healthId} emergencyProfile={emergency} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-sky-600" />
            <h2 className="font-bold text-sm text-slate-800">Personal Information</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Full Name',  value: `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim() || '—' },
              { label: 'Age',        value: age ? `${age} years` : '—' },
              { label: 'Gender',     value: patient?.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : '—' },
              { label: 'Blood Group',value: patient?.blood_group !== 'unknown' ? patient?.blood_group : 'Not set', icon: Droplets, iconColor: 'text-rose-500' },
              { label: 'City',       value: patient?.city || '—', icon: MapPin, iconColor: 'text-slate-400' },
              { label: 'Language',   value: ({ en: 'English', hi: 'Hindi', mr: 'Marathi', gu: 'Gujarati', ta: 'Tamil', te: 'Telugu', bn: 'Bengali' }[patient?.primary_language]) || 'English' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500 font-medium">{row.label}</span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  {row.icon && <row.icon className={`w-3 h-3 ${row.iconColor}`} />}
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500" />
              <h2 className="font-bold text-sm text-slate-800">Emergency Profile</h2>
            </div>
            <Link to="/patient/emergency" className="text-xs font-semibold text-sky-600 hover:text-sky-800 link-inline">
              Edit →
            </Link>
          </div>
          <div className="p-5 space-y-4">
            {/* Emergency Contact */}
            {emergency?.emergency_contact_name ? (
              <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                <div className="flex items-center gap-2 mb-1">
                  <PhoneCall className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-800">Emergency Contact</span>
                </div>
                <div className="text-sm font-bold text-slate-800">{emergency.emergency_contact_name}</div>
                <div className="text-xs text-slate-500">{emergency.emergency_contact_relation} · {emergency.emergency_contact_phone}</div>
              </div>
            ) : (
              <Link to="/patient/emergency" className="block bg-slate-50 rounded-xl p-3 border border-dashed border-slate-300 text-center text-xs text-slate-500 hover:bg-slate-100 transition">
                ＋ Add emergency contact
              </Link>
            )}

            {/* Allergies */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500" /> Known Allergies
              </div>
              {emergency?.allergies?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {emergency.allergies.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-xs border border-amber-200 font-medium">{a}</span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">No allergies recorded</span>
              )}
            </div>

            {/* Conditions */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Activity className="w-3 h-3 text-sky-500" /> Major Conditions
              </div>
              {emergency?.major_conditions?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {emergency.major_conditions.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 text-xs border border-sky-200 font-medium">{c}</span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">No conditions recorded</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completeness */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-sm text-slate-800">Health Passport Completeness</h2>
            <p className="text-xs text-slate-500 mt-0.5">Complete your profile to get the most out of your Health Passport</p>
          </div>
          <span className={`text-2xl font-bold ${completionScore === 100 ? 'text-emerald-600' : 'text-sky-600'}`}>
            {completionScore}%
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-700 ${completionScore === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-sky-400 to-indigo-500'}`}
            style={{ width: `${completionScore}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {completionItems.map((item) => (
            <div key={item.label} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border ${item.done ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              {item.done
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 shrink-0" />}
              <span className="font-medium truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Medical History', desc: 'View clinical records', to: '/patient/medical-history', color: 'bg-violet-50 border-violet-200 text-violet-700' },
          { label: 'Medicines',       desc: `${medicines.length} active medicines`,  to: '/patient/medicines',        color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Consent Center',  desc: 'Manage doctor access', to: '/patient/consent',          color: 'bg-sky-50 border-sky-200 text-sky-700' },
        ].map(q => (
          <Link key={q.label} to={q.to} className={`flex items-center justify-between p-4 rounded-2xl border ${q.color} hover:shadow-md transition group`}>
            <div>
              <div className="font-bold text-sm">{q.label}</div>
              <div className="text-xs opacity-70 mt-0.5">{q.desc}</div>
            </div>
            <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
};
