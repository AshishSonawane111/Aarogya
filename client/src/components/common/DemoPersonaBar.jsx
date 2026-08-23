import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Stethoscope, ChevronDown, Sparkles, Shield } from 'lucide-react';

export const DemoPersonaBar = () => {
  const { user, profile, personas, switchPersona, isPatient, isDoctor } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const currentName = isPatient
    ? `${profile?.first_name || 'Patient'} ${profile?.last_name || ''}`
    : isDoctor
    ? `Dr. ${profile?.first_name || 'Doctor'} ${profile?.last_name || ''} (${profile?.specialization || 'Specialist'})`
    : 'Select Persona';

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-1.5 px-4 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-sky-400">
            <Shield className="w-3.5 h-3.5" />
            DEMO MODE
          </span>
          <span className="hidden sm:inline text-slate-400">| Active:</span>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700 font-medium text-white">
            {isPatient ? (
              <UserCheck className="w-3 h-3 text-sky-400" />
            ) : (
              <Stethoscope className="w-3 h-3 text-indigo-400" />
            )}
            <span>{currentName}</span>
          </div>
        </div>

        {/* Quick 1-click Switch Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-slate-400 hidden md:inline text-[11px]">Quick Switch:</span>

          {/* Quick Patient */}
          <button
            onClick={() => switchPersona('1a000000-0000-0000-0000-000000000001')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              user?.id === '1a000000-0000-0000-0000-000000000001'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Rajesh (Patient)
          </button>

          {/* Quick Doctor */}
          <button
            onClick={() => switchPersona('2a000000-0000-0000-0000-000000000001')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              user?.id === '2a000000-0000-0000-0000-000000000001'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Dr. Anjali (Cardio)
          </button>

          {/* Quick Doctor 2 */}
          <button
            onClick={() => switchPersona('2a000000-0000-0000-0000-000000000002')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              user?.id === '2a000000-0000-0000-0000-000000000002'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Dr. Suresh (Neuro)
          </button>

          {/* Dropdown for full list */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-sky-300 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-700 transition"
            >
              All Personas
              <ChevronDown className="w-3 h-3" />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in-50">
                <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-sky-400" /> Demo Patients (5)
                </div>
                <div className="space-y-1 mb-3">
                  {personas.patients?.map((p) => (
                    <button
                      key={p.userId}
                      onClick={() => {
                        switchPersona(p.userId);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                        user?.id === p.userId
                          ? 'bg-sky-900/60 text-sky-200 border border-sky-700'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{p.healthId}</span>
                    </button>
                  ))}
                </div>

                <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-indigo-400" /> Demo Doctors (5)
                </div>
                <div className="space-y-1">
                  {personas.doctors?.map((d) => (
                    <button
                      key={d.userId}
                      onClick={() => {
                        switchPersona(d.userId);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                        user?.id === d.userId
                          ? 'bg-indigo-900/60 text-indigo-200 border border-indigo-700'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="font-medium">{d.name}</span>
                      <span className="text-[10px] text-indigo-300">{d.specialization}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
