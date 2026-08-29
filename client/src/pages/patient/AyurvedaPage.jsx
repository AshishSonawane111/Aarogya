/**
 * AyurvedaPage — Phase 4
 * The full Ayurveda Clinical Module integrated into the Health Passport.
 *
 * Tabs:
 *   1. Profile     — Prakriti, Vikriti, Agni, Koshtha, Nidana (patient-reported + Vaidya-assessed)
 *   2. Dashavidha  — 10-fold examination (patient-reported observations + Vaidya section)
 *   3. Ahara/Vihara — Diet + Lifestyle in simple cards with icons
 *   4. Medicines   — Ayurvedic medicines separate from modern medicines
 *   5. Treatments  — Treatment history timeline
 *   6. Response    — Before/after outcome tracker
 *
 * Architecture rules:
 *   - t('key') via useLanguage()
 *   - ayurvedaAPI from api.js
 *   - speakText / createSpeechRecognizer via speech.js
 *   - No autonomous AI diagnosis
 *   - Vaidya-section clearly marked
 */

import React, { useState, useEffect, useRef } from 'react';
import { ayurvedaAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { speakText, stopSpeaking } from '../../utils/speech';
import {
  Leaf, Sparkles, Info, CheckCircle, Circle,
  Plus, Flame, Wind, Droplets, Volume2, VolumeX,
  ChevronDown, ChevronUp, Shield, Edit3, Loader2,
  Activity, Moon, Sun, Heart, Clock, User, Star,
  Utensils, Dumbbell, Brain, Zap, BookOpen, AlertTriangle
} from 'lucide-react';

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',   emoji: '🌱', label: 'Profile' },
  { id: 'dashavidha', emoji: '🔟', label: 'Dashavidha' },
  { id: 'lifestyle', emoji: '🧘', label: 'Ahara & Vihara' },
  { id: 'medicines', emoji: '🌿', label: 'Medicines' },
  { id: 'treatments', emoji: '📋', label: 'Treatments' },
  { id: 'response',  emoji: '📈', label: 'Response' },
];

const DOSHAS = [
  { id: 'vata',  name: 'Vāta', name_hi: 'वात', name_mr: 'वात', emoji: '💨', desc: 'Air & Space — movement, creativity, nervous system', color: 'from-sky-400 to-indigo-500', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
  { id: 'pitta', name: 'Pitta', name_hi: 'पित्त', name_mr: 'पित्त', emoji: '🔥', desc: 'Fire & Water — metabolism, digestion, intelligence', color: 'from-orange-400 to-red-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  { id: 'kapha', name: 'Kapha', name_hi: 'कफ', name_mr: 'कफ', emoji: '🌊', desc: 'Earth & Water — structure, stability, immunity', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
];

const DASHAVIDHA = [
  { key: 'prakriti',       name: 'Prakriti',       icon: '🌱', desc: 'Constitutional body type — your inherent nature' },
  { key: 'vikriti',        name: 'Vikriti',        icon: '⚖️', desc: 'Current imbalanced state — deviation from Prakriti' },
  { key: 'sara',           name: 'Sara',           icon: '✨', desc: 'Tissue quality and excellence (Dhatu Sara)' },
  { key: 'samhanana',      name: 'Samhanana',      icon: '🦴', desc: 'Body compactness and structural integrity' },
  { key: 'pramana',        name: 'Pramana',        icon: '📏', desc: 'Body measurements and proportions' },
  { key: 'satmya',         name: 'Satmya',         icon: '🌿', desc: 'Adaptability and homologation to conditions' },
  { key: 'sattva',         name: 'Sattva',         icon: '🧠', desc: 'Mental strength, willpower and stability' },
  { key: 'ahara_shakti',   name: 'Ahara Shakti',   icon: '🍚', desc: 'Digestive and dietary capacity' },
  { key: 'vyayama_shakti', name: 'Vyayama Shakti', icon: '💪', desc: 'Exercise capacity and physical endurance' },
  { key: 'vaya',           name: 'Vaya',           icon: '🕐', desc: 'Age and age-related physical constitution' },
];

const MEDICINE_FORMS = ['Churna (Powder)', 'Vati (Tablet)', 'Kwatha (Decoction)', 'Asava/Arishta', 'Ghrita (Ghee)', 'Taila (Oil)', 'Avaleha (Jam/Linctus)', 'Capsule', 'Other'];
const TREATMENT_TYPES = ['Panchakarma', 'Vamana', 'Virechana', 'Basti', 'Nasya', 'Raktamokshana', 'Abhyanga', 'Shirodhara', 'Swedana', 'Rasayana', 'Other'];
const SLEEP_OPTS = ['poor', 'fair', 'good', 'excellent'];
const PERIOD_OPTS = ['before', 'during', 'after'];

// ─── SMALL HELPERS ─────────────────────────────────────────────────────────────
const Badge = ({ label, type = 'patient' }) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
    type === 'patient'
      ? 'bg-sky-50 text-sky-700 border-sky-200'
      : type === 'vaidya'
      ? 'bg-purple-50 text-purple-700 border-purple-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }`}>
    {type === 'patient' ? '👤 ' : type === 'vaidya' ? '⚕️ ' : '✓ '}{label}
  </span>
);

const SectionHeader = ({ icon, title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
    <div>
      <h2 className="font-bold text-slate-900 flex items-center gap-2 text-base">
        <span className="text-2xl">{icon}</span> {title}
      </h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5 ml-8">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const DohaBar = ({ value = 0, color = 'bg-emerald-500' }) => (
  <div className="mt-2 h-2 bg-white/30 rounded-full overflow-hidden">
    <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
  </div>
);

// ─── TAB: PROFILE ─────────────────────────────────────────────────────────────
const ProfileTab = ({ profile, onSave, loading, t }) => {
  const [editing, setEditing] = useState(!profile);
  const [form, setForm] = useState({
    reported_prakriti: profile?.reported_prakriti || '',
    reported_vikriti: profile?.reported_vikriti || '',
    agni: profile?.agni || '',
    koshtha: profile?.koshtha || '',
    nidana: profile?.nidana || '',
    previous_ayurvedic_treatment: profile?.previous_ayurvedic_treatment || '',
    notes: profile?.notes || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    await onSave(form);
    setEditing(false);
  };

  const fields = [
    { key: 'agni', label: t('agni'), icon: '🔥', placeholder: 'e.g. Sama (balanced), Visham (irregular), Tikshna (sharp), Manda (slow)' },
    { key: 'koshtha', label: t('koshtha'), icon: '🌀', placeholder: 'e.g. Krura (hard), Mridu (soft), Madhya (moderate)' },
    { key: 'nidana', label: t('nidana'), icon: '🔍', placeholder: 'What do you think caused your current health issue?' },
    { key: 'previous_ayurvedic_treatment', label: 'Previous Ayurvedic Treatment', icon: '📋', placeholder: 'Any previous Ayurvedic treatments, Panchakarma, etc.' },
    { key: 'notes', label: 'Additional Notes', icon: '📝', placeholder: 'Any other information you want to share' },
  ];

  return (
    <div className="space-y-5">
      {/* Disclaimer */}
      <div className="flex items-start gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-800 leading-relaxed">
          <strong>Patient-reported information only.</strong> Prakriti, Vikriti and clinical assessment require a qualified Vaidya (Ayurvedic practitioner). AI assists with data collection only — it does not diagnose.
        </p>
      </div>

      {/* Dosha cards — Prakriti */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            🌱 {t('prakriti')}
            <Badge label={t('patientReported')} type="patient" />
          </h3>
          {profile?.vaidya_prakriti && (
            <div className="flex items-center gap-1">
              <Badge label={`${t('vaidyaVerified')}: ${profile.vaidya_prakriti}`} type="vaidya" />
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-3">Select the Dosha(s) you feel best describe your constitution. Your Vaidya will confirm.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DOSHAS.map(d => {
            const selected = form.reported_prakriti?.includes(d.id);
            return (
              <button
                key={d.id}
                onClick={() => {
                  const cur = form.reported_prakriti || '';
                  const arr = cur.split(',').map(x => x.trim()).filter(Boolean);
                  const next = arr.includes(d.id) ? arr.filter(x => x !== d.id) : [...arr, d.id];
                  set('reported_prakriti', next.join(', '));
                }}
                className={`rounded-2xl p-4 text-left transition border-2 btn-inline ${
                  selected
                    ? `bg-gradient-to-br ${d.color} text-white border-transparent shadow-md`
                    : `bg-white ${d.border} ${d.text} hover:${d.bg}`
                }`}
              >
                <div className="text-3xl mb-1">{d.emoji}</div>
                <div className="font-bold text-sm">{d.name}</div>
                <p className={`text-xs mt-1 leading-relaxed ${selected ? 'text-white/75' : 'text-slate-500'}`}>{d.desc}</p>
                {selected && <div className="mt-2 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center"><CheckCircle className="w-3 h-3 text-white" /></div>}
              </button>
            );
          })}
        </div>
        {form.reported_prakriti && (
          <div className="mt-2 text-xs text-slate-500 text-center">
            Selected: <strong className="text-slate-700">{form.reported_prakriti}</strong>
          </div>
        )}
      </div>

      {/* Vikriti */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-bold text-sm text-slate-800">⚖️ {t('vikriti')}</h3>
          <Badge label={t('patientReported')} type="patient" />
        </div>
        <p className="text-xs text-slate-500 mb-2">Which Dosha(s) feel disturbed or imbalanced right now?</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DOSHAS.map(d => {
            const selected = form.reported_vikriti?.includes(d.id);
            return (
              <button
                key={d.id}
                onClick={() => {
                  const cur = form.reported_vikriti || '';
                  const arr = cur.split(',').map(x => x.trim()).filter(Boolean);
                  const next = arr.includes(d.id) ? arr.filter(x => x !== d.id) : [...arr, d.id];
                  set('reported_vikriti', next.join(', '));
                }}
                className={`rounded-xl p-3 text-left transition border-2 btn-inline ${
                  selected
                    ? `bg-gradient-to-br ${d.color} text-white border-transparent shadow-sm`
                    : `bg-white ${d.border} ${d.text} hover:opacity-80`
                }`}
              >
                <span className="text-xl mr-1.5">{d.emoji}</span>
                <span className="font-semibold text-sm">{d.name}</span>
              </button>
            );
          })}
        </div>
        {profile?.vaidya_vikriti && (
          <p className="text-xs mt-2 text-purple-700 font-semibold">
            ⚕️ Vaidya-confirmed Vikriti: <strong>{profile.vaidya_vikriti}</strong>
          </p>
        )}
      </div>

      {/* Other profile fields */}
      <div className="space-y-3">
        {fields.map(f => (
          <div key={f.key} className="bg-white rounded-2xl border border-slate-200 p-4">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <span>{f.icon}</span> {f.label}
            </label>
            <textarea
              value={form[f.key]}
              onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              rows={2}
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none resize-none"
            />
          </div>
        ))}
      </div>

      {/* Vaidya verified section display */}
      {profile?.vaidya_notes && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-600 font-bold text-xs">⚕️ Vaidya Notes</span>
            <Badge label={t('practitionerAssessed')} type="vaidya" />
          </div>
          <p className="text-sm text-purple-900 leading-relaxed">{profile.vaidya_notes}</p>
          {profile.verified_by && (
            <p className="text-xs text-purple-600 mt-2">— {profile.verified_by} on {profile.verified_at?.split('T')[0]}</p>
          )}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg shadow-emerald-200 disabled:opacity-50 btn-inline"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
        Save Ayurveda Profile
      </button>

      <p className="text-[10px] text-slate-400 text-center">
        ⚕️ All assessments require verification by a qualified Vaidya. This information supports clinical history only.
      </p>
    </div>
  );
};

// ─── TAB: DASHAVIDHA ─────────────────────────────────────────────────────────
const DashavidhaTab = ({ assessment, onRequestAssessment, t }) => {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const { currentLanguage } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);

  const speak = (item, idx) => {
    if (isSpeaking && speakingIdx === idx) {
      stopSpeaking(); setIsSpeaking(false); setSpeakingIdx(null);
    } else {
      stopSpeaking();
      setSpeakingIdx(idx); setIsSpeaking(true);
      speakText(`${item.name}. ${item.desc}`, currentLanguage, () => {
        setIsSpeaking(false); setSpeakingIdx(null);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Dashavidha Pariksha</strong> (10-fold examination) is a clinical assessment performed by a qualified Vaidya.
          Patient-reported observations are collected here as a reference. Only a Vaidya can complete the clinical assessment.
        </p>
      </div>

      <div className="space-y-3">
        {DASHAVIDHA.map((item, idx) => {
          const vaidyaData = assessment?.dashavidha?.[item.key];
          const isOpen = expandedIdx === idx;
          return (
            <div key={item.key} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setExpandedIdx(isOpen ? null : idx)}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition btn-inline text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-2xl flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{idx + 1}. {item.name}</span>
                    {vaidyaData && (
                      <Badge label={t('practitionerAssessed')} type="vaidya" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  {vaidyaData && (
                    <p className="text-xs text-purple-700 font-semibold mt-1">⚕️ {vaidyaData}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); speak(item, idx); }}
                    className={`p-1.5 rounded-lg transition btn-inline ${isSpeaking && speakingIdx === idx ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                  >
                    {isSpeaking && speakingIdx === idx ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-slate-600 mb-1.5">👤 Your Observation (optional)</p>
                    <textarea
                      rows={2}
                      placeholder={`Describe your ${item.name} as you experience it...`}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none resize-none bg-white"
                    />
                  </div>
                  {vaidyaData ? (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2">
                      <p className="text-xs font-bold text-purple-700">⚕️ Vaidya Assessment</p>
                      <p className="text-sm text-purple-900 mt-0.5">{vaidyaData}</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-dashed border-slate-300 rounded-xl px-3 py-3 text-center text-xs text-slate-400">
                      ⚕️ Vaidya assessment pending — to be completed by your practitioner
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
        <p className="text-xs text-emerald-800 font-semibold">Share this profile with your Vaidya for a complete Dashavidha Pariksha assessment.</p>
        <p className="text-[10px] text-emerald-600">Assessment completion requires an in-person or teleconsultation with a qualified Ayurvedic practitioner.</p>
      </div>
    </div>
  );
};

// ─── TAB: LIFESTYLE (AHARA & VIHARA) ─────────────────────────────────────────
const LifestyleTab = ({ profile, onSave, loading, t }) => {
  const [form, setForm] = useState({
    ahara: {
      diet_pattern: profile?.ahara?.diet_pattern || '',
      meal_timing: profile?.ahara?.meal_timing || '',
      appetite: profile?.ahara?.appetite || '',
      food_preferences: profile?.ahara?.food_preferences || '',
      food_habits: profile?.ahara?.food_habits || '',
    },
    vihara: {
      sleep_hours: profile?.vihara?.sleep_hours || '',
      sleep_quality: profile?.vihara?.sleep_quality || '',
      exercise: profile?.vihara?.exercise || '',
      daily_routine: profile?.vihara?.daily_routine || '',
      work_lifestyle: profile?.vihara?.work_lifestyle || '',
      stress_level: profile?.vihara?.stress_level || '',
    }
  });

  const setAhara = (k, v) => setForm(f => ({ ...f, ahara: { ...f.ahara, [k]: v } }));
  const setVihara = (k, v) => setForm(f => ({ ...f, vihara: { ...f.vihara, [k]: v } }));

  const aharaFields = [
    { key: 'diet_pattern', icon: '🥗', label: 'Diet Pattern', placeholder: 'e.g. Vegetarian, Vegan, Mixed, Sattvic' },
    { key: 'meal_timing', icon: '🕛', label: 'Meal Timing', placeholder: 'e.g. 3 meals a day, breakfast at 8am...' },
    { key: 'appetite', icon: '😋', label: 'Appetite', placeholder: 'e.g. Good, Low, Excessive, Variable' },
    { key: 'food_preferences', icon: '🍽️', label: 'Food Preferences', placeholder: 'e.g. spicy, sweet, sour, heavy...' },
    { key: 'food_habits', icon: '📝', label: 'Food Habits', placeholder: 'e.g. eating at irregular times, fast food, fasting...' },
  ];

  const viharaFields = [
    { key: 'sleep_hours', icon: '💤', label: 'Sleep Hours', placeholder: 'e.g. 6–7 hours, wake at 6am' },
    { key: 'sleep_quality', icon: '🌙', label: 'Sleep Quality', placeholder: 'e.g. Deep, Light, Disturbed, Insomnia' },
    { key: 'exercise', icon: '🏃', label: 'Exercise / Activity', placeholder: 'e.g. Yoga, Walking 30 min/day, Sedentary' },
    { key: 'daily_routine', icon: '📅', label: 'Daily Routine', placeholder: 'Describe your typical daily routine...' },
    { key: 'work_lifestyle', icon: '💼', label: 'Work & Lifestyle', placeholder: 'e.g. Desk job, Field work, Night shifts' },
    { key: 'stress_level', icon: '🧘', label: 'Stress & Mind', placeholder: 'e.g. Low stress, High anxiety, Meditation practice...' },
  ];

  return (
    <div className="space-y-6">
      {/* AHARA */}
      <div className="space-y-3">
        <SectionHeader icon="🍚" title={t('ahara')} subtitle="Your dietary habits and food patterns" />
        {aharaFields.map(f => (
          <div key={f.key} className="bg-white rounded-2xl border border-slate-200 p-4">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <span>{f.icon}</span> {f.label}
            </label>
            <input
              type="text"
              value={form.ahara[f.key]}
              onChange={e => setAhara(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />
          </div>
        ))}
      </div>

      {/* VIHARA */}
      <div className="space-y-3">
        <SectionHeader icon="🧘" title={t('vihara')} subtitle="Your sleep, activity and daily lifestyle" />
        {viharaFields.map(f => (
          <div key={f.key} className="bg-white rounded-2xl border border-slate-200 p-4">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <span>{f.icon}</span> {f.label}
            </label>
            <input
              type="text"
              value={form.vihara[f.key]}
              onChange={e => setVihara(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => onSave({ ahara: form.ahara, vihara: form.vihara })}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg shadow-emerald-200 disabled:opacity-50 btn-inline"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
        Save Ahara & Vihara
      </button>
    </div>
  );
};

// ─── TAB: MEDICINES ───────────────────────────────────────────────────────────
const MedicinesTab = ({ medicines, onAdd, onToggle, t }) => {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', form: 'Churna (Powder)', dose: '', frequency: '', duration: '', start_date: '', prescriber: '', purpose: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onAdd(form);
    setForm({ name: '', form: 'Churna (Powder)', dose: '', frequency: '', duration: '', start_date: '', prescriber: '', purpose: '' });
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-base text-slate-900">🌿 {t('ayurvedicMedicines')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Recorded separately from modern medicines</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition btn-inline shadow-md shadow-emerald-200"
        >
          <Plus className="w-4 h-4" /> {t('addMedicine')}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold text-emerald-800">🌿 Add Ayurvedic Medicine</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Medicine Name *</label>
              <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-white" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Triphala Churna" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Form</label>
              <select className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-white" value={form.form} onChange={e => set('form', e.target.value)}>
                {MEDICINE_FORMS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Dose</label>
              <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-white" value={form.dose} onChange={e => set('dose', e.target.value)} placeholder="e.g. 5g, 2 tablets" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Frequency</label>
              <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-white" value={form.frequency} onChange={e => set('frequency', e.target.value)} placeholder="e.g. Twice daily, Before meals" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Duration</label>
              <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-white" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 30 days, 3 months" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Start Date</label>
              <input type="date" className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-white" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Prescribed By</label>
              <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-white" value={form.prescriber} onChange={e => set('prescriber', e.target.value)} placeholder="Vaidya / Practitioner name" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Purpose / Notes</label>
              <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-white" value={form.purpose} onChange={e => set('purpose', e.target.value)} placeholder="e.g. For digestion, anxiety..." />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd} disabled={saving || !form.name} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-40 btn-inline">
              {saving ? 'Saving...' : '+ Add Medicine'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold btn-inline">Cancel</button>
          </div>
        </div>
      )}

      {/* Medicine list */}
      {medicines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <div className="text-4xl mb-2">🌿</div>
          <p className="text-sm font-semibold text-slate-700">No Ayurvedic medicines recorded yet</p>
          <p className="text-xs text-slate-400 mt-1">Add medicines prescribed by your Vaidya</p>
        </div>
      ) : (
        <div className="space-y-3">
          {medicines.map(med => (
            <div key={med.id} className={`bg-white rounded-2xl border ${med.is_active ? 'border-emerald-200' : 'border-slate-200'} p-4 flex items-start justify-between gap-3`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${med.is_active ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                  🌿
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{med.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${med.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {med.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">AYURVEDIC</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{med.form}{med.dose ? ` · ${med.dose}` : ''}{med.frequency ? ` · ${med.frequency}` : ''}</p>
                  {med.prescriber && <p className="text-xs text-emerald-700 mt-0.5">Prescribed by: {med.prescriber}</p>}
                  {med.purpose && <p className="text-xs text-slate-500 mt-0.5 italic">{med.purpose}</p>}
                  {med.start_date && <p className="text-xs text-slate-400 mt-0.5">Started: {med.start_date}</p>}
                </div>
              </div>
              <button
                onClick={() => onToggle(med.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition btn-inline shrink-0 ${med.is_active ? 'border-slate-300 text-slate-600 hover:bg-slate-100' : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'}`}
              >
                {med.is_active ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── TAB: TREATMENTS ─────────────────────────────────────────────────────────
const TreatmentsTab = ({ treatments, onAdd, t }) => {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ treatment_name: '', treatment_type: 'Panchakarma', date: '', practitioner: '', duration: '', notes: '', response: '', follow_up_date: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = async () => {
    if (!form.treatment_name.trim()) return;
    setSaving(true);
    await onAdd(form);
    setForm({ treatment_name: '', treatment_type: 'Panchakarma', date: '', practitioner: '', duration: '', notes: '', response: '', follow_up_date: '' });
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-base text-slate-900">📋 {t('treatmentHistory')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Timeline of Ayurvedic treatments received</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition btn-inline shadow-md shadow-teal-200">
          <Plus className="w-4 h-4" /> {t('addTreatment')}
        </button>
      </div>

      {showForm && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold text-teal-800">📋 Add Treatment Record</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Treatment Name *</label>
              <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-400 focus:outline-none bg-white" value={form.treatment_name} onChange={e => set('treatment_name', e.target.value)} placeholder="e.g. Panchakarma at ABC Clinic" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Treatment Type</label>
              <select className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-400 focus:outline-none bg-white" value={form.treatment_type} onChange={e => set('treatment_type', e.target.value)}>
                {TREATMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Date</label>
              <input type="date" className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-400 focus:outline-none bg-white" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Practitioner</label>
              <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-400 focus:outline-none bg-white" value={form.practitioner} onChange={e => set('practitioner', e.target.value)} placeholder="Vaidya name" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Duration</label>
              <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-400 focus:outline-none bg-white" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 7 days, 2 weeks" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Follow-Up Date</label>
              <input type="date" className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-400 focus:outline-none bg-white" value={form.follow_up_date} onChange={e => set('follow_up_date', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Notes</label>
              <textarea rows={2} className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-400 focus:outline-none resize-none bg-white" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes..." />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Response / Outcome (Patient-reported)</label>
              <textarea rows={2} className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-400 focus:outline-none resize-none bg-white" value={form.response} onChange={e => set('response', e.target.value)} placeholder="How did you respond to this treatment?" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd} disabled={saving || !form.treatment_name} className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold disabled:opacity-40 btn-inline">
              {saving ? 'Saving...' : '+ Add Treatment'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold btn-inline">Cancel</button>
          </div>
        </div>
      )}

      {treatments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm font-semibold text-slate-700">No treatment history recorded</p>
          <p className="text-xs text-slate-400 mt-1">Add past Ayurvedic treatments to build your health timeline</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-teal-200 ml-4 space-y-5">
          {treatments.map(tr => (
            <div key={tr.id} className="relative pl-6">
              <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-white border-2 border-teal-400 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-teal-500" />
              </div>
              <div className="bg-white rounded-2xl border border-teal-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{tr.treatment_name}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">{tr.treatment_type}</span>
                      {tr.date && <span className="text-xs text-slate-400">{tr.date}</span>}
                      {tr.practitioner && <span className="text-xs text-emerald-700">⚕️ {tr.practitioner}</span>}
                    </div>
                  </div>
                  {tr.duration && <span className="text-xs text-slate-400 shrink-0">{tr.duration}</span>}
                </div>
                {tr.notes && <p className="text-xs text-slate-600 mt-2 leading-relaxed">{tr.notes}</p>}
                {tr.response && (
                  <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <p className="text-[10px] font-bold text-amber-700 mb-0.5">👤 Patient-reported Response</p>
                    <p className="text-xs text-amber-900">{tr.response}</p>
                  </div>
                )}
                {tr.follow_up_date && <p className="text-xs text-slate-400 mt-2">📅 Follow-up: {tr.follow_up_date}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── TAB: RESPONSE ────────────────────────────────────────────────────────────
const ResponseTab = ({ responses, treatments, onAdd, t }) => {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ period: 'before', treatment_id: '', symptom_score: '', sleep_quality: 'fair', energy_level: '', digestion: '', notes: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = async () => {
    setSaving(true);
    await onAdd(form);
    setShowForm(false);
    setSaving(false);
  };

  // Group before/after for visual comparison
  const before = responses.filter(r => r.period === 'before');
  const after = responses.filter(r => r.period === 'after');
  const current = responses.filter(r => r.period === 'current');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-base text-slate-900">📈 {t('treatmentResponse')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track symptoms before, during and after treatment</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition btn-inline shadow-md shadow-indigo-200">
          <Plus className="w-4 h-4" /> {t('addResponse')}
        </button>
      </div>

      {showForm && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold text-indigo-800">📈 Add Treatment Response</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Period</label>
              <select className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white" value={form.period} onChange={e => set('period', e.target.value)}>
                {PERIOD_OPTS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} Treatment</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Symptom Score (1–10)</label>
              <input type="number" min="1" max="10" className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white" value={form.symptom_score} onChange={e => set('symptom_score', e.target.value)} placeholder="1 = no symptoms, 10 = severe" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Sleep Quality</label>
              <select className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white" value={form.sleep_quality} onChange={e => set('sleep_quality', e.target.value)}>
                {SLEEP_OPTS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Energy Level</label>
              <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white" value={form.energy_level} onChange={e => set('energy_level', e.target.value)} placeholder="e.g. Low, Moderate, High" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Digestion</label>
              <input className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white" value={form.digestion} onChange={e => set('digestion', e.target.value)} placeholder="e.g. Good, Bloating, Constipation" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Notes</label>
              <textarea rows={2} className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none bg-white" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Describe how you are feeling..." />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-40 btn-inline">{saving ? 'Saving...' : '+ Add Response'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold btn-inline">Cancel</button>
          </div>
          <p className="text-[10px] text-indigo-600">👤 Patient-reported outcomes. These are personal observations, not clinical assessments.</p>
        </div>
      )}

      {/* Before vs After comparison */}
      {(before.length > 0 || after.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {[{ label: t('beforeTreatment'), data: before, color: 'border-red-200 bg-red-50', textColor: 'text-red-800', icon: '📉' },
            { label: t('afterTreatment'), data: after, color: 'border-emerald-200 bg-emerald-50', textColor: 'text-emerald-800', icon: '📈' }].map(col => (
            <div key={col.label} className={`rounded-2xl border p-4 ${col.color}`}>
              <div className={`text-xs font-bold mb-2 ${col.textColor}`}>{col.icon} {col.label}</div>
              {col.data.length === 0 ? (
                <p className="text-xs text-slate-400">Not recorded</p>
              ) : col.data.slice(0, 1).map(r => (
                <div key={r.id} className="space-y-1.5">
                  {r.symptom_score && (
                    <div>
                      <p className="text-[10px] text-slate-500">{t('symptomScore')}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${parseInt(r.symptom_score) > 6 ? 'bg-red-500' : parseInt(r.symptom_score) > 3 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${(r.symptom_score / 10) * 100}%` }} />
                        </div>
                        <span className={`text-sm font-bold ${col.textColor}`}>{r.symptom_score}/10</span>
                      </div>
                    </div>
                  )}
                  {r.sleep_quality && <p className="text-xs text-slate-600">💤 Sleep: <strong>{r.sleep_quality}</strong></p>}
                  {r.energy_level && <p className="text-xs text-slate-600">⚡ Energy: <strong>{r.energy_level}</strong></p>}
                  {r.digestion && <p className="text-xs text-slate-600">🌀 Digestion: <strong>{r.digestion}</strong></p>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* All responses */}
      {responses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-sm font-semibold text-slate-700">No treatment responses recorded</p>
          <p className="text-xs text-slate-400 mt-1">Track how you feel before, during and after treatment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {responses.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge label={`${r.period.charAt(0).toUpperCase() + r.period.slice(1)} Treatment`} type={r.period === 'before' ? 'patient' : 'verified'} />
                <span className="text-[10px] text-slate-400">{r.created_at?.split('T')[0]}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {r.symptom_score && <div><span className="text-slate-500">Symptoms:</span> <strong>{r.symptom_score}/10</strong></div>}
                {r.sleep_quality && <div><span className="text-slate-500">Sleep:</span> <strong>{r.sleep_quality}</strong></div>}
                {r.energy_level && <div><span className="text-slate-500">Energy:</span> <strong>{r.energy_level}</strong></div>}
                {r.digestion && <div><span className="text-slate-500">Digestion:</span> <strong>{r.digestion}</strong></div>}
              </div>
              {r.notes && <p className="text-xs text-slate-600 mt-2 leading-relaxed italic">"{r.notes}"</p>}
              <p className="text-[10px] text-slate-400 mt-2">👤 Patient-reported</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export const AyurvedaPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      ayurvedaAPI.getProfile().catch(() => null),
      ayurvedaAPI.getMedicines().catch(() => null),
      ayurvedaAPI.getTreatments().catch(() => null),
      ayurvedaAPI.getResponses().catch(() => null),
    ]).then(([profileRes, medsRes, treatsRes, respRes]) => {
      if (profileRes?.data?.profile) setProfile(profileRes.data.profile);
      if (medsRes?.data?.medicines) setMedicines(medsRes.data.medicines);
      if (treatsRes?.data?.treatments) setTreatments(treatsRes.data.treatments);
      if (respRes?.data?.responses) setResponses(respRes.data.responses);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (data) => {
    setSaving(true);
    try {
      const res = await ayurvedaAPI.updateProfile(data);
      setProfile(res.data.profile);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleAddMedicine = async (data) => {
    const res = await ayurvedaAPI.addMedicine(data);
    setMedicines(prev => [res.data.medicine, ...prev]);
  };

  const handleToggleMedicine = async (id) => {
    const res = await ayurvedaAPI.toggleMedicine(id);
    setMedicines(prev => prev.map(m => m.id === id ? res.data.medicine : m));
  };

  const handleAddTreatment = async (data) => {
    const res = await ayurvedaAPI.addTreatment(data);
    setTreatments(prev => [res.data.treatment, ...prev]);
  };

  const handleAddResponse = async (data) => {
    const res = await ayurvedaAPI.addResponse(data);
    setResponses(prev => [res.data.response, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-slate-500">Loading Ayurveda module...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-green-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">🌿 Ayurveda</h1>
              <p className="text-emerald-100 text-sm mt-1">Prakriti · Vikriti · Dashavidha Pariksha · Lifestyle</p>
            </div>
            <div className="text-4xl opacity-60">🪷</div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {[
              { label: 'Profile', value: profile ? '✓ Set' : 'Pending', ok: !!profile },
              { label: 'Medicines', value: `${medicines.filter(m => m.is_active).length} Active`, ok: medicines.length > 0 },
              { label: 'Treatments', value: `${treatments.length} Records`, ok: treatments.length > 0 },
            ].map(s => (
              <div key={s.label} className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${s.ok ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'}`}>
                {s.label}: {s.value}
              </div>
            ))}
          </div>

          {/* Disclaimer strip */}
          <div className="mt-3 flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2">
            <Shield className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
            <p className="text-[10px] text-emerald-100 leading-relaxed">
              {t('ayurvedaDisclaimer2')}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition btn-inline ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.emoji}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'profile' && (
          <ProfileTab profile={profile} onSave={handleSaveProfile} loading={saving} t={t} />
        )}
        {activeTab === 'dashavidha' && (
          <DashavidhaTab assessment={assessment} t={t} />
        )}
        {activeTab === 'lifestyle' && (
          <LifestyleTab profile={profile} onSave={handleSaveProfile} loading={saving} t={t} />
        )}
        {activeTab === 'medicines' && (
          <MedicinesTab medicines={medicines} onAdd={handleAddMedicine} onToggle={handleToggleMedicine} t={t} />
        )}
        {activeTab === 'treatments' && (
          <TreatmentsTab treatments={treatments} onAdd={handleAddTreatment} t={t} />
        )}
        {activeTab === 'response' && (
          <ResponseTab responses={responses} treatments={treatments} onAdd={handleAddResponse} t={t} />
        )}
      </div>
    </div>
  );
};
