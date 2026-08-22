import React, { useState } from 'react';
import { aiAPI } from '../../services/api';
import { 
  FileQuestion, 
  Upload, 
  Sparkles, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export const ReportExplainerPage = () => {
  const [reportTitle, setReportTitle] = useState('Lipid Profile & Glycated Hemoglobin Report');
  const [reportContent, setReportContent] = useState(
    'Fasting Blood Glucose: 142 mg/dL (Reference: 70 - 99 mg/dL).\nHbA1c: 7.4% (Reference: 4.0 - 5.6%).\nTotal Cholesterol: 220 mg/dL (Reference: < 200 mg/dL).\nLDL Cholesterol: 148 mg/dL (Reference: < 100 mg/dL).\nTriglycerides: 165 mg/dL (Reference: < 150 mg/dL).\nHDL Cholesterol: 42 mg/dL (Reference: > 40 mg/dL).'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleExplain = async (e) => {
    if (e) e.preventDefault();
    if (!reportContent.trim() && !reportTitle.trim()) return;

    setLoading(true);
    try {
      const res = await aiAPI.explainReport({
        report_title: reportTitle,
        report_content: reportContent,
        report_type: 'lab_report'
      });
      setResult(res.data?.explanation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleSelect = (sampleType) => {
    if (sampleType === 'lipid') {
      setReportTitle('Lipid Profile & HbA1c Panel');
      setReportContent(
        'Fasting Blood Glucose: 142 mg/dL (High)\nHbA1c: 7.4% (High)\nTotal Cholesterol: 220 mg/dL (High)\nLDL: 148 mg/dL (High)\nTriglycerides: 165 mg/dL (Borderline)'
      );
    } else if (sampleType === 'cbc') {
      setReportTitle('Complete Blood Count (CBC) with Allergy Screen');
      setReportContent(
        'Hemoglobin: 13.8 g/dL (Normal)\nTotal WBC Count: 7,400 /uL (Normal)\nEosinophils: 8.2% (Elevated)\nTotal Serum IgE: 340 IU/mL (High)\nPlatelets: 2.4 Lakh /uL (Normal)'
      );
    } else if (sampleType === 'echo') {
      setReportTitle('2D Echocardiography & Doppler Study');
      setReportContent(
        'LVEF (Ejection Fraction): 62%\nInterventricular Septum: 11.8 mm (Mild concentric hypertrophy)\nValvular Function: Normal aortic and mitral flow\nConclusion: Good left ventricular systolic function with mild hypertensive changes.'
      );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileQuestion className="w-5 h-5 text-teal-600" />
          AI Medical Report Explainer
        </h2>
        <p className="text-xs text-slate-500">
          Upload any medical or lab report to decode medical jargon, identify key flags, and prepare questions for your doctor.
        </p>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="bg-amber-500/15 border-2 border-amber-500/50 rounded-2xl p-4 flex items-start gap-3 text-amber-950">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="font-extrabold uppercase text-amber-900">
            This explanation is informational and is not a medical diagnosis.
          </div>
          <p className="text-amber-900/80 mt-0.5">
            Always share your original diagnostic document with your doctor for clinical diagnosis and treatment plans.
          </p>
        </div>
      </div>

      {/* Input / Upload Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Sample Templates */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-700">Choose a Sample Diagnostic Report or Paste Your Own:</span>
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => handleSampleSelect('lipid')}
              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold border border-teal-200 transition"
            >
              Blood Sugar & Lipid Panel
            </button>
            <button
              onClick={() => handleSampleSelect('cbc')}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold border border-indigo-200 transition"
            >
              CBC & Allergy Screen
            </button>
            <button
              onClick={() => handleSampleSelect('echo')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-200 transition"
            >
              Cardiac 2D Echo
            </button>
          </div>
        </div>

        <form onSubmit={handleExplain} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Report Title / Test Name</label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="e.g. Lipid Profile, Complete Blood Count, Liver Function"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Diagnostic Content / Extracted Laboratory Text
            </label>
            <textarea
              rows={5}
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
              placeholder="Paste test values, lab numbers, or scan impression here..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              AI transforms numerical laboratory metrics into simple explanations
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Analyzing Diagnostic Data...' : 'Explain Medical Report'}
            </button>
          </div>
        </form>
      </div>

      {/* AI Explanation Breakdown Results */}
      {result && (
        <div className="bg-white rounded-3xl border border-teal-200 shadow-xl overflow-hidden animate-in fade-in-50 space-y-6 p-6 sm:p-8">
          
          {/* Result Header */}
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider border border-teal-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              AI Diagnostic Breakdown
            </div>
            <h3 className="text-xl font-bold text-slate-900">{result.report_title}</h3>
          </div>

          {/* 1. Simplified Plain-English Explanation */}
          <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-200 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-700" />
              Plain-English Explanation:
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {result.simplified_explanation}
            </p>
          </div>

          {/* 2. Key Findings & Abnormal Flags Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Key Findings */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Key Findings:
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {result.key_findings?.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Abnormal Values / Flagged Items */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="font-bold text-xs text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Important Diagnostic Observations:
              </div>
              <div className="space-y-2 text-xs">
                {result.abnormal_values?.map((v, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white border border-rose-200">
                    <div className="font-bold text-rose-900 flex items-center justify-between">
                      <span>{v.item}</span>
                      <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {v.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{v.note}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 3. Questions for Discussion with Your Doctor */}
          <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-200 space-y-3">
            <div className="font-bold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Recommended Questions to Ask Your Doctor:
            </div>
            <div className="space-y-2">
              {result.questions_for_doctor?.map((q, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-indigo-100 text-xs font-semibold text-slate-800 flex items-start gap-2 shadow-xs">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{q}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
