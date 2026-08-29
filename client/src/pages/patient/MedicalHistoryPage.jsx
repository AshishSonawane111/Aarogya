import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recordAPI, patientAPI, clinicalHistoryAPI } from '../../services/api';
import { formatDate, getCategoryLabel } from '../../utils/helpers';
import { ClinicalIntakeWizard } from '../../components/patient/ClinicalIntakeWizard';
import { useLanguage } from '../../context/LanguageContext';
import {
  Stethoscope, FileHeart, Pill, Activity, FileCheck, FileText,
  Upload, ChevronRight, ArrowRight, Sparkles, AlertCircle, Plus,
  ClipboardList, CheckCircle, Clock, Shield
} from 'lucide-react';

const CATEGORY_STYLES = {
  medical_history:  { bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  dot: 'bg-violet-500' },
  lab_reports:      { bg: 'bg-sky-50',     border: 'border-sky-200',     text: 'text-sky-700',     dot: 'bg-sky-500' },
  prescriptions:    { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  diagnoses:        { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     dot: 'bg-red-500' },
  hospital_records: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  consultations:    { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  dot: 'bg-indigo-500' },
  scans:            { bg: 'bg-pink-50',    border: 'border-pink-200',    text: 'text-pink-700',    dot: 'bg-pink-500' },
};
const getCategoryStyle = (cat) => CATEGORY_STYLES[cat] || CATEGORY_STYLES.medical_history;
const getIcon = (cat) => {
  const props = { className: 'w-4 h-4' };
  switch (cat) {
    case 'lab_reports':      return <Activity {...props} />;
    case 'prescriptions':    return <Pill {...props} />;
    case 'scans':            return <FileCheck {...props} />;
    case 'consultations':    return <Stethoscope {...props} />;
    case 'hospital_records': return <FileHeart {...props} />;
    default:                 return <FileText {...props} />;
  }
};

export const MedicalHistoryPage = () => {
  const { t } = useLanguage();
  const [records, setRecords] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [latestHistory, setLatestHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    Promise.all([
      recordAPI.getRecords({ category: 'all' }),
      patientAPI.getDashboard(),
    ]).then(([recsRes, dashRes]) => {
      setRecords(recsRes.data?.records || []);
      setConditions(dashRes.data?.emergency_profile?.major_conditions || []);
    }).catch(console.error)
      .finally(() => setLoading(false));

    // Load existing clinical history (non-blocking)
    clinicalHistoryAPI.getPatientHistory('me').catch(() => null).then(res => {
      if (res?.data?.latest) setLatestHistory(res.data.latest);
    });
  }, []);

  const handleIntakeComplete = (summary) => {
    setShowWizard(false);
    setLatestHistory(prev => ({
      ...prev,
      status: 'completed',
      ai_summary: summary,
      chief_complaint: summary?.chief_complaint,
    }));
  };

  const categories = ['all', ...new Set(records.map(r => r.category))];
  const filtered = activeFilter === 'all' ? records : records.filter(r => r.category === activeFilter);

  // ── Wizard mode ──────────────────────────────────────────────────────────
  if (showWizard) {
    return (
      <div className="space-y-4 pb-12">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWizard(false)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition btn-inline"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">🩺 AI Clinical History</h1>
            <p className="text-xs text-slate-500">Answer questions about your health — one at a time</p>
          </div>
        </div>
        <ClinicalIntakeWizard onComplete={handleIntakeComplete} />
      </div>
    );
  }

  // ── Normal page ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🩺 Medical History</h1>
          <p className="text-sm text-slate-500 mt-0.5">Clinical records, diagnoses and health documents</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/patient/records"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-md shadow-sky-600/20 transition"
          >
            <Upload className="w-4 h-4" /> Upload
          </Link>
        </div>
      </div>

      {/* AI Clinical History Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                <span className="font-bold text-sm">AI Clinical History</span>
                {latestHistory?.status === 'completed' && (
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Done
                  </span>
                )}
                {latestHistory?.status === 'in_progress' && (
                  <span className="text-[10px] font-bold bg-amber-300/80 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> In Progress
                  </span>
                )}
              </div>
              <p className="text-white/80 text-xs leading-relaxed">
                {latestHistory?.status === 'completed'
                  ? `Chief complaint: ${latestHistory.chief_complaint || 'Recorded'}`
                  : latestHistory?.status === 'in_progress'
                  ? `${latestHistory.answers_count} of ${latestHistory.total_questions} questions answered`
                  : 'Answer questions step by step with voice or typing. AI organises your history for your doctor.'}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          {latestHistory?.ai_summary && (
            <div className="mt-3 bg-white/10 rounded-xl px-3 py-2 text-xs text-white/90">
              <strong>Summary available</strong> — your doctor can view and verify it.
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowWizard(true)}
              className="px-4 py-2.5 bg-white text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-50 transition btn-inline flex items-center gap-1.5"
            >
              <ClipboardList className="w-4 h-4" />
              {latestHistory?.status === 'in_progress' ? t('resumeIntake') : t('startIntake')}
            </button>
            {latestHistory?.status === 'completed' && (
              <button
                onClick={() => setShowWizard(true)}
                className="px-4 py-2.5 bg-white/15 text-white font-semibold text-sm rounded-xl hover:bg-white/25 transition btn-inline"
              >
                Update History
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-3">
            <Shield className="w-3.5 h-3.5 text-white/60" />
            <p className="text-[10px] text-white/60">History-taking assistant only — not a diagnostic tool. Doctor verifies.</p>
          </div>
        </div>
      </div>

      {/* Active Conditions */}
      {conditions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <h2 className="font-bold text-sm text-slate-800">Active Conditions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {conditions.map((c, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition btn-inline ${
              activeFilter === cat
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat === 'all' ? `All Records (${records.length})` : getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Records Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <FileHeart className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-700">No records in this category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Upload medical reports, lab results or consultation notes to build your history.</p>
          <Link to="/patient/records" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold border border-sky-200 transition">
            <Plus className="w-3.5 h-3.5" /> Upload Now
          </Link>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 ml-3 sm:ml-5 space-y-5">
          {filtered.map(rec => {
            const style = getCategoryStyle(rec.category);
            return (
              <div key={rec.id} className="relative pl-6 sm:pl-8">
                <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                </div>
                <div className={`bg-white rounded-2xl border ${style.border} shadow-sm p-4 hover:shadow-md transition`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl ${style.bg} ${style.text} flex items-center justify-center shrink-0 mt-0.5`}>
                        {getIcon(rec.category)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{rec.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${style.bg} ${style.text} border ${style.border}`}>
                            {getCategoryLabel(rec.category)}
                          </span>
                          <span className="text-[10px] text-slate-400">{formatDate(rec.record_date)}</span>
                        </div>
                      </div>
                    </div>
                    <Link to="/patient/records" className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 shrink-0 link-inline">
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  {rec.description && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">{rec.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/patient/records" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition group">
          <div>
            <div className="font-bold text-sm text-slate-800">All Documents</div>
            <div className="text-xs text-slate-500">Upload &amp; manage</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
        </Link>
        <Link to="/patient/report-explainer" className="flex items-center justify-between p-4 rounded-2xl border border-indigo-200 bg-indigo-50 hover:shadow-md transition group">
          <div>
            <div className="font-bold text-sm text-indigo-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Explainer
            </div>
            <div className="text-xs text-indigo-600">Understand reports</div>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
};
