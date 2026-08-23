import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { patientAPI } from '../services/api';
import { 
  ShieldAlert, 
  Droplet, 
  AlertTriangle, 
  PhoneCall, 
  Activity, 
  Pill, 
  User, 
  Building2, 
  Clock, 
  ShieldCheck, 
  Heart,
  FileCheck2,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export const PublicEmergencyProfilePage = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing emergency profile link.');
      setLoading(false);
      return;
    }

    patientAPI.getPublicEmergencyProfile(token)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.error || 'Emergency profile unavailable or invalid URL.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <ShieldAlert className="w-12 h-12 text-sky-400 animate-pulse" />
        <div className="text-base font-bold tracking-wide">Decrypting Citizen Emergency Profile...</div>
        <div className="text-xs text-slate-400 font-mono">Verifying unguessable emergency token...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-955 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Emergency Profile Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || 'The requested emergency profile link is invalid or has expired.'}
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition"
            >
              Go to Aarogya Health Passport Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { patient_identity, critical_medical, emergency_instructions, emergency_contacts, healthcare_provider, meta } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-sky-500 selection:text-white">
      
      {/* Emergency Header Bar */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 text-white px-4 py-3 shadow-lg border-b border-rose-500/30">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 animate-pulse text-white shrink-0" />
            <div>
              <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                OFFICIAL CITIZEN EMERGENCY MEDICAL PROFILE
              </h1>
              <p className="text-[10px] text-rose-100 opacity-90">First-Responder Immediate Access Gateway</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[9px] uppercase font-mono bg-black/30 px-2 py-0.5 rounded text-amber-200 border border-amber-300/30 block">
              Read-Only
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Patient Core Identity Card */}
        <div className="bg-slate-900 rounded-3xl border border-sky-600/40 p-6 shadow-xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={patient_identity.avatar_url}
                alt={patient_identity.full_name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-sky-400/50 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-sky-500 rounded-lg text-slate-950 shadow font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider border border-sky-500/30 mb-1">
                <FileCheck2 className="w-3 h-3 text-sky-400" />
                ABDM Verified Citizen Identity
              </div>
              
              <h2 className="text-2xl font-black text-white tracking-tight">
                {patient_identity.full_name}
              </h2>
              
              <div className="font-mono text-sm text-sky-300 font-bold">
                {patient_identity.health_id_number}
              </div>

              <div className="text-xs text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                <span>Gender: <strong className="text-white capitalize">{patient_identity.gender}</strong></span>
                <span>•</span>
                <span>Age: <strong className="text-white">{patient_identity.age}</strong></span>
                <span>•</span>
                <span>Location: <strong className="text-white">{patient_identity.city}, {patient_identity.state}</strong></span>
              </div>
            </div>
          </div>

          {/* Blood Group & Donor Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-rose-950/60 border-2 border-rose-500/60 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black text-rose-400 tracking-wider block">
                  VERIFIED BLOOD GROUP
                </span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {critical_medical.blood_group}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                <Droplet className="w-7 h-7" />
              </div>
            </div>

            <div className="bg-emerald-950/60 border border-emerald-500/50 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider block">
                  ORGAN DONOR STATUS
                </span>
                <div className="text-sm font-extrabold text-white mt-1">
                  {critical_medical.organ_donor ? 'APPROVED ORGAN DONOR' : 'NOT REGISTERED'}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <Heart className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Critical Medical Information Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            Critical Clinical Alerts & Conditions
          </h3>

          {/* Known Allergies Callout */}
          <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-5 shadow-lg space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              Known Medical & Drug Allergies ({critical_medical.allergies.length})
            </div>
            
            {critical_medical.allergies.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No known drug or environmental allergies logged.</div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {critical_medical.allergies.map((alg, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-500/50 text-xs font-black uppercase tracking-wide"
                  >
                    ⚠️ {alg}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Major Chronic Conditions */}
            <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                <Activity className="w-4 h-4" />
                Chronic Diagnoses & Conditions
              </div>
              {critical_medical.major_conditions.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No chronic conditions listed.</div>
              ) : (
                <ul className="space-y-1.5 text-xs text-slate-200 pt-1">
                  {critical_medical.major_conditions.map((cond, idx) => (
                    <li key={idx} className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Critical Daily Medicines */}
            <div className="bg-slate-900 border border-sky-500/40 rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs uppercase tracking-wider">
                <Pill className="w-4 h-4" />
                Critical Regimens & Medicines
              </div>
              {critical_medical.critical_medicines.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No critical daily medications listed.</div>
              ) : (
                <ul className="space-y-1.5 text-xs text-slate-200 pt-1">
                  {critical_medical.critical_medicines.map((med, idx) => (
                    <li key={idx} className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                      <span>{med}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Instructions & Precautions */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Paramedic & ER Clinical Instructions
          </div>
          <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800 font-medium">
            <p className="font-bold text-amber-200 mb-1">Special Precaution:</p>
            <p className="mb-3">{emergency_instructions.precautions}</p>
            <p className="font-bold text-sky-200 mb-1">Emergency Protocol:</p>
            <p>{emergency_instructions.instructions}</p>
          </div>
        </div>

        {/* Emergency Contacts (Call Action Buttons) */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            Emergency Contacts (Click to Call)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Primary Contact */}
            <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">PRIMARY EMERGENCY CONTACT</span>
                <h4 className="text-base font-bold text-white mt-0.5">{emergency_contacts.primary.name}</h4>
                <div className="text-xs text-slate-400">Relationship: <strong className="text-slate-200">{emergency_contacts.primary.relation}</strong></div>
              </div>

              <a
                href={`tel:${emergency_contacts.primary.phone.replace(/\s+/g, '')}`}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-98"
              >
                <PhoneCall className="w-4 h-4" />
                Call Primary ({emergency_contacts.primary.phone})
              </a>
            </div>

            {/* Secondary Contact */}
            {emergency_contacts.secondary ? (
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">SECONDARY CONTACT</span>
                  <h4 className="text-base font-bold text-white mt-0.5">{emergency_contacts.secondary.name}</h4>
                  <div className="text-xs text-slate-400">Relationship: <strong className="text-slate-200">{emergency_contacts.secondary.relation}</strong></div>
                </div>

                <a
                  href={`tel:${emergency_contacts.secondary.phone.replace(/\s+/g, '')}`}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  <PhoneCall className="w-4 h-4 text-sky-400" />
                  Call Secondary ({emergency_contacts.secondary.phone})
                </a>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-center text-xs text-slate-500 italic">
                No secondary contact registered.
              </div>
            )}
          </div>
        </div>

        {/* Preferred Healthcare Provider & 24/7 ER Helpline */}
        <div className="bg-slate-900 border border-sky-600/30 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 border-b border-slate-800 pb-3">
            <Building2 className="w-4 h-4" />
            Preferred Healthcare Provider & Hospital Helpline
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Attending Physician</span>
              <div className="font-bold text-white text-sm mt-0.5">{healthcare_provider.primary_doctor_name}</div>
              <div className="text-slate-400 text-[11px]">{healthcare_provider.specialization}</div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Preferred Hospital</span>
              <div className="font-bold text-white text-sm mt-0.5">{healthcare_provider.hospital_name}</div>
              <div className="text-slate-400 text-[11px]">{healthcare_provider.hospital_address}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <a
              href="tel:108"
              className="w-full py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition"
            >
              <PhoneCall className="w-4 h-4" />
              Call National Ambulance / Hospital Emergency ({healthcare_provider.emergency_helpline})
            </a>
          </div>
        </div>

        {/* Footer & Privacy Notice */}
        <div className="text-center text-xs text-slate-500 space-y-2 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>{meta.title}</span>
          </div>
          <p className="text-[11px] text-slate-500 max-w-lg mx-auto leading-relaxed">
            {meta.disclaimer}
          </p>
          <div className="text-[10px] font-mono text-slate-600 pt-1">
            Last Updated: {new Date(meta.last_updated).toLocaleString()}
          </div>
        </div>

      </div>
    </div>
  );
};
