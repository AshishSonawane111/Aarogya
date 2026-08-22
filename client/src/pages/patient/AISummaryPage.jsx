import React, { useState, useEffect } from 'react';
import { aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldAlert, 
  AlertTriangle, 
  Pill, 
  Activity, 
  HeartPulse, 
  History, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const AISummaryPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiAPI.getHealthSummary().then((res) => {
      setSummary(res.data?.summary);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-4 animate-pulse">
        <Sparkles className="w-8 h-8 text-teal-500 animate-spin mx-auto" />
        <div className="text-sm font-bold text-slate-700">Synthesizing Consolidated AI Health Summary...</div>
        <div className="text-xs text-slate-400">Scanning encrypted lab reports, prescriptions, and history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-600" />
          AI-Powered Consolidated Health Summary
        </h2>
        <p className="text-xs text-slate-500">
          Automated clinical synthesis compiled across your complete encrypted medical file.
        </p>
      </div>

      {/* MANDATORY PROMINENT DISCLAIMER BANNER */}
      <div className="bg-amber-500/15 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm text-amber-950">
        <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-extrabold text-sm uppercase tracking-wider text-amber-900 flex items-center gap-2">
            <span>AI-GENERATED SUMMARY — VERIFY WITH ORIGINAL MEDICAL RECORDS</span>
          </div>
          <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
            This structured summary is produced by an AI engine to provide an organized snapshot of your documented clinical history. It is informational only, never presents an automated diagnosis, and must be reviewed alongside original hospital documents and verified by your treating physician.
          </p>
        </div>
      </div>

      {/* Overview Clinical Narrative */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="font-bold text-xs uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Executive Clinical Narrative
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Analyzed {summary?.source_records_count || 5} Source Documents
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
          {summary?.summary_text}
        </p>
      </div>

      {/* 6 Structured Clinical Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. Allergies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm border-b border-rose-100 pb-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Documented Allergies</span>
          </div>
          <div className="space-y-1.5">
            {summary?.allergies?.length > 0 ? (
              summary.allergies.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-900 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                  {item}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-3 text-center">No known drug allergies reported.</div>
            )}
          </div>
        </div>

        {/* 2. Chronic Conditions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm border-b border-teal-100 pb-2">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span>Chronic Conditions</span>
          </div>
          <div className="space-y-1.5">
            {summary?.chronic_conditions?.length > 0 ? (
              summary.chronic_conditions.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-950 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  {item}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-3 text-center">No chronic conditions listed.</div>
            )}
          </div>
        </div>

        {/* 3. Current Medicines */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm border-b border-emerald-100 pb-2">
            <Pill className="w-4 h-4 text-emerald-600" />
            <span>Active Pharmacotherapy</span>
          </div>
          <div className="space-y-1.5">
            {summary?.current_medicines?.length > 0 ? (
              summary.current_medicines.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-950 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  {item}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-3 text-center">No active medications recorded.</div>
            )}
          </div>
        </div>

        {/* 4. Previous Hospitalizations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm border-b border-indigo-100 pb-2">
            <History className="w-4 h-4 text-indigo-600" />
            <span>Previous Hospitalizations</span>
          </div>
          <div className="space-y-2">
            {summary?.previous_hospitalizations?.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs space-y-0.5">
                <div className="font-bold text-indigo-950">{item.title}</div>
                <div className="text-[10px] text-indigo-700 font-mono">{formatDate(item.date)}</div>
                <div className="text-[11px] text-slate-600">{item.details}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Recent Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Recent Diagnostic Reports & Findings</span>
            </div>
            <Link to="/patient/records" className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1">
              <span>View Source Files</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {summary?.recent_reports?.map((rep, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate max-w-[200px]">{rep.title}</span>
                  {rep.abnormal && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                      Review Needed
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">{formatDate(rep.date)}</div>
                <div className="text-[11px] text-slate-600 line-clamp-2">{rep.summary}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
