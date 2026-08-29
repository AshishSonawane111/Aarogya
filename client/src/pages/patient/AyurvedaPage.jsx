import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Sparkles, ArrowRight, Info, CheckCircle, Circle } from 'lucide-react';

// Ayurveda section definitions
const PRAKRITI_DOSHAS = [
  { id: 'vata', name: 'Vāta', emoji: '💨', desc: 'Air & Space — movement, creativity, nervous system', color: 'from-blue-400 to-indigo-500' },
  { id: 'pitta', name: 'Pitta', emoji: '🔥', desc: 'Fire & Water — metabolism, digestion, intelligence', color: 'from-orange-400 to-red-500' },
  { id: 'kapha', name: 'Kapha', emoji: '🌊', desc: 'Earth & Water — structure, stability, immunity', color: 'from-emerald-400 to-teal-500' },
];

const DASHAVIDHA_SECTIONS = [
  { name: 'Prakriti',       desc: 'Constitutional body type', status: 'pending' },
  { name: 'Vikriti',        desc: 'Current imbalanced state', status: 'pending' },
  { name: 'Sara',           desc: 'Tissue quality assessment', status: 'pending' },
  { name: 'Samhanana',      desc: 'Body compactness', status: 'pending' },
  { name: 'Pramana',        desc: 'Measurement & proportions', status: 'pending' },
  { name: 'Satmya',         desc: 'Adaptability / homologation', status: 'pending' },
  { name: 'Sattva',         desc: 'Mental strength & stability', status: 'pending' },
  { name: 'Ahara Shakti',   desc: 'Digestive/dietary capacity', status: 'pending' },
  { name: 'Vyayama Shakti', desc: 'Exercise capacity', status: 'pending' },
  { name: 'Vaya',           desc: 'Age-related constitution', status: 'pending' },
];

const AYURVEDA_MODULES = [
  { title: 'Ahara (Diet)',    desc: 'Your dietary habits and food preferences', emoji: '🥗', phase: 4 },
  { title: 'Vihara (Lifestyle)', desc: 'Sleep, exercise and daily routine', emoji: '🧘', phase: 4 },
  { title: 'Nidana',         desc: 'Causative factors of your condition', emoji: '🔍', phase: 4 },
  { title: 'Ayurvedic Medicines', desc: 'Current and past Ayurvedic treatments', emoji: '🌿', phase: 4 },
  { title: 'Treatment Response', desc: 'Track your progress before and after treatment', emoji: '📈', phase: 4 },
];

export const AyurvedaPage = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🌿 Ayurveda</h1>
          <p className="text-sm text-slate-500 mt-0.5">Traditional medicine profile — Prakriti, Vikriti & clinical assessments</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Full module in Phase 4
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-sm text-emerald-800">Important Notice</div>
          <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
            Ayurvedic assessments (Prakriti, Vikriti, Dashavidha Pariksha) require evaluation by a qualified Vaidya. 
            Information entered here is <strong>patient-reported</strong> and must be verified by your practitioner. 
            AI assistance is available for data organization only — it does not independently diagnose or prescribe.
          </p>
        </div>
      </div>

      {/* Prakriti — Three Doshas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-600" />
          <h2 className="font-bold text-sm text-slate-800">Prakriti — Your Constitutional Type</h2>
        </div>
        <div className="p-5">
          <p className="text-xs text-slate-500 mb-4">
            Prakriti is your inherent constitution determined at birth. Most individuals are a combination of two or all three Doshas.
            Your Vaidya will assess and confirm your Prakriti.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PRAKRITI_DOSHAS.map(dosha => (
              <div key={dosha.id} className={`bg-gradient-to-br ${dosha.color} rounded-2xl p-4 text-white`}>
                <div className="text-3xl mb-2">{dosha.emoji}</div>
                <div className="font-bold text-base">{dosha.name}</div>
                <p className="text-xs text-white/75 mt-1 leading-relaxed">{dosha.desc}</p>
                <div className="mt-3 h-1.5 bg-white/20 rounded-full">
                  <div className="h-full bg-white/60 rounded-full w-0 transition-all" style={{ width: '0%' }} />
                </div>
                <div className="text-[10px] text-white/60 mt-1">Assessment pending — Vaidya required</div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-3 text-center">
            ⚕️ Prakriti assessment must be performed by a qualified Ayurvedic practitioner (Vaidya)
          </p>
        </div>
      </div>

      {/* Dashavidha Pariksha */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-sm text-slate-800">Dashavidha Pariksha</h2>
          <p className="text-xs text-slate-500 mt-0.5">The 10-fold Ayurvedic clinical examination — to be assessed by your Vaidya</p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DASHAVIDHA_SECTIONS.map((section, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-slate-800">{section.name}</div>
                  <div className="text-[10px] text-slate-400">{section.desc}</div>
                </div>
                <Circle className="w-4 h-4 text-slate-300 shrink-0" />
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
            🔒 Dashavidha Pariksha entries can only be added by a verified Vaidya in the practitioner portal.
          </div>
        </div>
      </div>

      {/* Coming Features */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="font-bold text-sm text-slate-800 mb-4">Ayurveda Modules — Coming in Phase 4</h2>
        <div className="space-y-3">
          {AYURVEDA_MODULES.map((mod, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 opacity-70">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0">
                {mod.emoji}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-xs text-slate-800">{mod.title}</div>
                <div className="text-[10px] text-slate-500">{mod.desc}</div>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-200 shrink-0">
                Phase {mod.phase}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/patient/medicines" className="flex items-center justify-between p-4 rounded-2xl border border-amber-200 bg-amber-50 hover:shadow-md transition group">
          <div>
            <div className="font-bold text-sm text-amber-800">Ayurvedic Medicines</div>
            <div className="text-xs text-amber-600">View medicines list</div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition" />
        </Link>
        <Link to="/patient/timeline" className="flex items-center justify-between p-4 rounded-2xl border border-emerald-200 bg-emerald-50 hover:shadow-md transition group">
          <div>
            <div className="font-bold text-sm text-emerald-800">Treatment Timeline</div>
            <div className="text-xs text-emerald-600">Health journey</div>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
};
