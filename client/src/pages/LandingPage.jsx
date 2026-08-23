import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Sparkles, 
  Languages, 
  FileHeart, 
  KeyRound, 
  CheckCircle2, 
  UserCheck, 
  Stethoscope, 
  ArrowRight, 
  QrCode, 
  FileText, 
  Zap, 
  Hospital, 
  Clock,
  PhoneCall,
  Activity,
  Globe
} from 'lucide-react';

export const LandingPage = () => {
  const { personas, switchPersona } = useAuth();
  const { languages } = useLanguage();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('patient');

  const handleLaunchDemo = async (userId, role) => {
    await switchPersona(userId);
    if (role === 'patient') {
      navigate('/patient/dashboard');
    } else {
      navigate('/doctor/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Top Banner Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">HEALTH PASSPORT</span>
              <span className="text-[10px] text-sky-600 block font-semibold uppercase tracking-wider">
                Universal Health Ecosystem
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-sky-600 transition">How It Works</a>
            <a href="#patient-benefits" className="hover:text-sky-600 transition">Patients</a>
            <a href="#doctor-benefits" className="hover:text-sky-600 transition">Doctors & Hospitals</a>
            <a href="#ai-intelligence" className="hover:text-sky-600 transition">AI & Translation</a>
            <a href="#consent-security" className="hover:text-sky-600 transition">Zero-Trust Privacy</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/auth/doctor"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
            >
              Doctor Login
            </Link>
            <Link
              to="/auth/patient"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition"
            >
              Patient Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs animate-in fade-in-50">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            AI-Powered & Multilingual Digital Health Platform
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Your Health. Your Records.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600">
              Your Control.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A secure, AI-powered and multilingual digital health ecosystem that puts patients in control of their medical information with zero-trust granular consent.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              to="/auth/patient"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition"
            >
              <UserCheck className="w-4 h-4" />
              Get Started as Patient
            </Link>

            <Link
              to="/auth/doctor"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 transition"
            >
              <Stethoscope className="w-4 h-4 text-indigo-400" />
              Healthcare Provider Login
            </Link>
          </div>

          {/* 1-Click Interactive Persona Switcher Card */}
          <div className="mt-14 max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
              <div>
                <span className="text-[11px] uppercase font-bold text-sky-600 tracking-wider">
                  Live Interactive Demo Sandbox
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Select a Demo Persona for Instant 1-Click Access
                </h3>
              </div>

              {/* Persona Tabs */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setSelectedRole('patient')}
                  className={`px-4 py-1.5 rounded-lg transition ${
                    selectedRole === 'patient'
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Patients (5)
                </button>
                <button
                  onClick={() => setSelectedRole('doctor')}
                  className={`px-4 py-1.5 rounded-lg transition ${
                    selectedRole === 'doctor'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Doctors (5)
                </button>
              </div>
            </div>

            {/* Persona Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedRole === 'patient'
                ? personas.patients?.map((p) => (
                    <div
                      key={p.userId}
                      onClick={() => handleLaunchDemo(p.userId, 'patient')}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 cursor-pointer transition flex items-center gap-3 group bg-white shadow-xs"
                    >
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 truncate group-hover:text-sky-700">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">{p.healthId}</div>
                        <div className="text-[11px] text-slate-400">
                          {p.bloodGroup} • {p.city}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition shrink-0" />
                    </div>
                  ))
                : personas.doctors?.map((d) => (
                    <div
                      key={d.userId}
                      onClick={() => handleLaunchDemo(d.userId, 'doctor')}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer transition flex items-center gap-3 group bg-white shadow-xs"
                    >
                      <img
                        src={d.avatarUrl}
                        alt={d.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 truncate group-hover:text-indigo-700">
                          {d.name}
                        </div>
                        <div className="text-xs text-indigo-600 font-medium truncate">
                          {d.specialization}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{d.hospital}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition shrink-0" />
                    </div>
                  ))}
            </div>
          </div>

        </div>
      </section>

      {/* Zero-Trust Flow Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Core Security Principle
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              Zero-Trust Consent Architecture
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">
              Searching for a patient never automatically exposes medical records. Patient ownership is cryptographically enforced server-side.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {[
              {
                step: '01',
                title: 'Doctor Searches',
                desc: 'Doctor looks up Digital Health ID or scans QR code.',
                icon: QrCode
              },
              {
                step: '02',
                title: 'Basic Identity Only',
                desc: 'Name & basic ID shown. Medical records remain encrypted.',
                icon: ShieldAlert
              },
              {
                step: '03',
                title: 'Consent Requested',
                desc: 'Doctor specifies required categories, duration & reason.',
                icon: KeyRound
              },
              {
                step: '04',
                title: 'Patient Approves',
                desc: 'Patient grants selected categories with auto-expiry.',
                icon: CheckCircle2
              },
              {
                step: '05',
                title: 'Audited Access',
                desc: 'Doctor receives approved records. Immutable log recorded.',
                icon: ShieldCheck
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group hover:border-sky-500 hover:bg-sky-50/20 transition shadow-xs"
                >
                  <div className="text-2xl font-black text-slate-300 group-hover:text-sky-400 transition">
                    {item.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sky-600/10 text-sky-600 flex items-center justify-center my-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="patient-benefits" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                Patient Portal
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                Complete Digital Health Passport in Your Pocket
              </h2>
              <p className="text-slate-600 mt-4 text-sm leading-relaxed">
                Universal access to your entire clinical history with granular privacy controls, medicine adherence tracking, emergency profiles, and instant AI explanations.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { title: 'Digital Health ID & QR Card', desc: 'Instant ABHA-aligned digital ID with emergency medical credentials.' },
                  { title: 'Unified Medical Timeline', desc: 'Lab reports, prescriptions, scans, and consultation notes in one place.' },
                  { title: 'AI Report Explainer', desc: 'Translates complex laboratory numbers into plain English and discussion questions.' },
                  { title: 'Granular Consent Center', desc: 'Approve, deny, or revoke doctor access with category-level precision.' }
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-slate-900">{f.title}</div>
                      <div className="text-[11px] text-slate-500">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Health Card Mock */}
            <div className="bg-gradient-to-br from-sky-900 via-sky-800 to-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-sky-700/50 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-sky-700/50 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-sky-400" />
                  <span className="font-bold text-base">HEALTH PASSPORT</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40">
                  Active Verified
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-sky-800/40">
                  <div className="text-sky-300 text-[10px] uppercase font-bold">Patient Name</div>
                  <div className="text-base font-bold text-white">Rajesh Kumar</div>
                  <div className="text-sky-400 font-mono text-xs">HP-2026-1001</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-sky-800/40">
                    <span className="text-sky-300 text-[10px] uppercase block font-semibold">Blood Group</span>
                    <span className="font-bold text-white text-sm">B+ Positive</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-sky-800/40">
                    <span className="text-sky-300 text-[10px] uppercase block font-semibold">Allergies</span>
                    <span className="font-bold text-amber-300 text-sm">Penicillin, Peanuts</span>
                  </div>
                </div>

                <div className="p-3 bg-sky-800/30 rounded-xl border border-sky-700/40 text-[11px] text-sky-200">
                  🔒 Gated Record Vault — 5 Lab Reports, 3 Prescriptions, 2 Scans
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Multilingual and AI Section */}
      <section id="ai-intelligence" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Multilingual AI Health Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 max-w-2xl mx-auto">
            Breaking Linguistic Barriers in Healthcare
          </h2>
          <p className="text-slate-600 mt-3 text-sm max-w-xl mx-auto">
            Real-time speech-to-text translation and voice playback across 7 official Indian languages.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            {languages.map((l) => (
              <div
                key={l.code}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-xs"
              >
                <span>{l.flag}</span>
                <span>{l.native}</span>
                <span className="text-slate-400 font-normal text-[11px]">({l.name})</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold tracking-tight">HEALTH PASSPORT</div>
              <div className="text-[10px] text-slate-400">Your Health. Your Records. Your Control.</div>
            </div>
          </div>

          <div className="text-slate-400 text-center sm:text-right text-[11px]">
            Production Full-Stack Architecture • React + Vite + Tailwind CSS + Node.js + Supabase PostgreSQL
          </div>
        </div>
      </footer>

    </div>
  );
};
