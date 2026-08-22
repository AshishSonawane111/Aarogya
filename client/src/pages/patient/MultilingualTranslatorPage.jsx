import React from 'react';
import { AudioVoiceTranslator } from '../../components/shared/AudioVoiceTranslator';
import { Languages, Volume2, Mic, Globe, ShieldCheck } from 'lucide-react';

export const MultilingualTranslatorPage = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Languages className="w-5 h-5 text-teal-600" />
          Multilingual Medical Voice & Text Translator
        </h2>
        <p className="text-xs text-slate-500">
          Communicate seamlessly across Indian languages with real-time speech synthesis and medical terminology.
        </p>
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">7 Indian Languages</div>
            <div className="text-[10px] text-slate-500">Hindi, Marathi, Gujarati, Tamil, Telugu, Bengali & English</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Speech-to-Text Input</div>
            <div className="text-[10px] text-slate-500">Dictate symptoms directly into microphone</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Audio Voice Playback</div>
            <div className="text-[10px] text-slate-500">Listen to spoken translations natively</div>
          </div>
        </div>
      </div>

      {/* Audio Voice Translator Main Component */}
      <AudioVoiceTranslator defaultSource="en" defaultTarget="hi" />

    </div>
  );
};
