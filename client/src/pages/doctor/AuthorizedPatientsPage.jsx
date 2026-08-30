import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { recordAPI, aiAPI, patientAPI, clinicalHistoryAPI, digitizeAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { PrescriptionWriterModal } from '../../components/doctor/PrescriptionWriterModal';
import { ConsultationModal } from '../../components/doctor/ConsultationModal';
import { AudioVoiceTranslator } from '../../components/shared/AudioVoiceTranslator';
import { VaidyaAyurvedaWorkspace } from '../../components/doctor/VaidyaAyurvedaWorkspace';
import { 
  UserCheck, 
  ShieldCheck, 
  Sparkles, 
  Pill, 
  Stethoscope, 
  FileText, 
  Languages, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Lock,
  Download,
  Calendar,
  ClipboardList,
  CheckCircle,
  Edit3,
  ChevronDown,
  ChevronUp,
  Leaf
} from 'lucide-react';
import { formatDate, formatDateTime, getCategoryLabel } from '../../utils/helpers';

export const AuthorizedPatientsPage = () => {
  const [searchParams] = useSearchParams();
  const targetPatientId = searchParams.get('patientId') || '10000000-0000-0000-0000-000000000001';

  const [recordsData, setRecordsData] = useState(null);
  const [clinicalSummary, setClinicalSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showTranslator, setShowTranslator] = useState(false);
  
  // Phase 3 state
  const [patientClinicalHistory, setPatientClinicalHistory] = useState(null);
  const [showClinicalHistory, setShowClinicalHistory] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [doctorNoteInput, setDoctorNoteInput] = useState('');

  // Phase 5 state
  const [digitizationSessions, setDigitizationSessions] = useState([]);
  const [showDigitizationCenter, setShowDigitizationCenter] = useState(false);
  const [showAyurvedaWorkspace, setShowAyurvedaWorkspace] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [docNotesInput, setDocNotesInput] = useState('');
  const [verifyingDocSession, setVerifyingDocSession] = useState(false);
  const [docEditForm, setDocEditForm] = useState({
    doctor_name: '',
    hospital_name: '',
    record_date: '',
    summary: '',
    medicines: [],
    findings: [],
    treatments: []
  });

  const fetchAuthorizedData = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Fetch authorized records (Server-side enforced)
      const res = await recordAPI.getRecords({ patientId: targetPatientId });
      setRecordsData(res.data);

      // 2. Fetch AI Clinical Summary (Server-side checks consent)
      try {
        const aiRes = await aiAPI.getClinicalSummary(targetPatientId);
        setClinicalSummary(aiRes.data?.summary);
      } catch (aiErr) {
        console.warn('AI Summary unavailable or restricted', aiErr);
      }

      // 3. Fetch AI Clinical History (Phase 3)
      try {
        const histRes = await clinicalHistoryAPI.getPatientHistory(targetPatientId);
        setPatientClinicalHistory(histRes.data?.latest);
        setDoctorNoteInput(histRes.data?.latest?.doctor_notes || '');
      } catch (histErr) {
        console.warn('Clinical history unavailable', histErr);
      }

      // 4. Fetch Digitization Sessions (Phase 5)
      try {
        const digRes = await digitizeAPI.getSessions(targetPatientId);
        setDigitizationSessions(digRes.data?.sessions || []);
      } catch (digErr) {
        console.warn('Digitization sessions unavailable', digErr);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Access Denied: You do not have active consent to view this patient.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetPatientId) {
      fetchAuthorizedData();
    }
  }, [targetPatientId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-3 animate-pulse">
        <ShieldCheck className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
        <div className="text-sm font-bold text-slate-700">Verifying Cryptographic Consent Grant...</div>
        <div className="text-xs text-slate-400">Decrypting authorized medical records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Protected Patient File</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
        <Link
          to="/doctor/patients"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md"
        >
          Return to Patient Search & Request Consent
        </Link>
      </div>
    );
  }

  const records = recordsData?.records || [];
  const activeConsent = recordsData?.active_consent;
  const patientName = recordsData?.patient_name || 'Patient';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Patient Header & Quick Clinical Actions */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-sky-600/40 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-700/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-300 border border-sky-400/40">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{patientName}</h2>
                <span className="text-xs font-mono bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/40 font-bold">
                  HP-2026-1001
                </span>
              </div>
              <div className="text-xs text-sky-200 flex items-center gap-2 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Authorized Categories: {activeConsent?.approved_categories?.map(getCategoryLabel).join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-[10px] text-sky-400 uppercase font-bold block">Consent Expiry</span>
            <span className="font-mono font-bold text-slate-200">
              {formatDateTime(activeConsent?.valid_until)}
            </span>
          </div>
        </div>

        {/* Clinical Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={() => setShowPrescriptionModal(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-500/20 transition"
          >
            <Pill className="w-4 h-4" />
            Write Digital Prescription
          </button>

          <button
            onClick={() => setShowConsultationModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition"
          >
            <Stethoscope className="w-4 h-4" />
            Record Consultation & Vitals
          </button>

          <button
            onClick={() => setShowTranslator(!showTranslator)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
          >
            <Languages className="w-4 h-4 text-sky-400" />
            {showTranslator ? 'Hide Translator' : 'Doctor-Patient Translator (7 Lang)'}
          </button>
        </div>

      </div>

      {/* Embedded Doctor-Patient Translator */}
      {showTranslator && (
        <div className="animate-in fade-in-50">
          <AudioVoiceTranslator defaultSource="en" defaultTarget="hi" />
        </div>
      )}

      {/* AI Clinical Summary Card */}
      {clinicalSummary && (
        <div className="bg-white rounded-3xl border border-indigo-200 shadow-md p-6 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                AI Clinical Synthesis (Derived Strictly From Authorized Records)
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Verified Source Data Only
            </span>
          </div>

          {/* Mandatory AI Disclaimer */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>AI-GENERATED CLINICAL SUMMARY — VERIFY ORIGINAL RECORDS</span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
            {clinicalSummary.summary_text}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-[10px] text-rose-700 font-bold uppercase block">Documented Allergies</span>
              <span className="font-bold text-rose-950 mt-1 block">
                {clinicalSummary.allergies?.join(', ') || 'None reported'}
              </span>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
              <span className="text-[10px] text-sky-700 font-bold uppercase block">Chronic Diagnoses</span>
              <span className="font-bold text-sky-950 mt-1 block">
                {clinicalSummary.chronic_conditions?.join(', ') || 'None'}
              </span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Current Active Medicines</span>
              <span className="font-bold text-emerald-950 mt-1 block">
                {clinicalSummary.current_medicines?.join(', ') || 'None'}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Phase 3: Patient AI Clinical History */}
      {patientClinicalHistory && (
        <div className="bg-white rounded-3xl border border-purple-200 shadow-md overflow-hidden">
          <button
            onClick={() => setShowClinicalHistory(!showClinicalHistory)}
            className="w-full flex items-center justify-between p-5 hover:bg-purple-50 transition btn-inline"
          >
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <div className="font-bold text-sm text-slate-900">Patient Clinical History (AI Intake)</div>
                <div className="text-xs text-slate-500">
                  Chief complaint: {patientClinicalHistory.ai_summary?.chief_complaint || patientClinicalHistory.structured?.chiefComplaint || 'Recorded'}
                  {patientClinicalHistory.verified_by && (
                    <span className="ml-2 text-emerald-700 font-semibold">✓ Verified by {patientClinicalHistory.verified_by}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {patientClinicalHistory.red_flags?.length > 0 && (
                <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  ⚠️ {patientClinicalHistory.red_flags.length} red flag(s)
                </span>
              )}
              {showClinicalHistory ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>

          {showClinicalHistory && (
            <div className="border-t border-purple-100 p-5 space-y-4">
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs font-bold text-amber-900">AI-GENERATED DRAFT — Clinician verification required before use as clinical record.</p>
              </div>

              {patientClinicalHistory.red_flags?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-red-800 mb-1">⚠️ Red Flags Detected During Intake:</p>
                  {patientClinicalHistory.red_flags.map((f, i) => (
                    <p key={i} className="text-xs text-red-700">• {f}</p>
                  ))}
                </div>
              )}

              {patientClinicalHistory.ai_summary && (
                <div className="space-y-3">
                  {[
                    { key: 'chief_complaint', label: 'Chief Complaint', icon: '🩺' },
                    { key: 'history_of_present_illness', label: 'History of Present Illness', icon: '📖' },
                    { key: 'past_medical_history', label: 'Past Medical History', icon: '📋' },
                    { key: 'past_surgical_history', label: 'Past Surgical History', icon: '🏥' },
                    { key: 'current_medications', label: 'Current Medications', icon: '💊' },
                    { key: 'allergies', label: 'Allergies', icon: '⚠️' },
                    { key: 'family_history', label: 'Family History', icon: '👨‍👩‍👧' },
                    { key: 'personal_history', label: 'Personal & Social History', icon: '🧬' },
                  ].map(f => (
                    patientClinicalHistory.ai_summary[f.key] &&
                    patientClinicalHistory.ai_summary[f.key] !== 'Not recorded' && (
                      <div key={f.key} className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">{f.icon} {f.label}</p>
                        <p className="text-sm text-slate-800 leading-relaxed">{patientClinicalHistory.ai_summary[f.key]}</p>
                      </div>
                    )
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Doctor Notes / Addendum</label>
                <textarea
                  value={doctorNoteInput}
                  onChange={e => setDoctorNoteInput(e.target.value)}
                  rows={3}
                  placeholder="Add clinical notes, corrections, or observations..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    setVerifying(true);
                    try {
                      await clinicalHistoryAPI.verifySession(patientClinicalHistory.id, {
                        doctor_notes: doctorNoteInput,
                      });
                      setPatientClinicalHistory(prev => ({
                        ...prev,
                        status: 'verified',
                        doctor_notes: doctorNoteInput,
                        verified_by: 'Doctor',
                      }));
                    } catch (e) { console.error(e); }
                    setVerifying(false);
                  }}
                  disabled={verifying || patientClinicalHistory.status === 'verified'}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition disabled:opacity-50 btn-inline"
                >
                  <CheckCircle className="w-4 h-4" />
                  {patientClinicalHistory.status === 'verified' ? '✓ Verified' : 'Verify & Sign Off'}
                </button>
                <span className="text-xs text-slate-400 self-center">Doctor remains responsible for clinical verification</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phase 5: Digitized Documents Verification Center */}
      {digitizationSessions.length > 0 && (
        <div className="bg-white rounded-3xl border border-indigo-200 shadow-md overflow-hidden">
          <button
            onClick={() => setShowDigitizationCenter(!showDigitizationCenter)}
            className="w-full flex items-center justify-between p-5 hover:bg-indigo-50/50 transition btn-inline"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div className="text-left">
                <div className="font-bold text-sm text-slate-900 font-display">Digitized Documents Verification Center</div>
                <div className="text-xs text-slate-500">
                  {digitizationSessions.filter(s => s.status !== 'verified').length} pending clinician review &amp; sign-off
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showDigitizationCenter ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>

          {showDigitizationCenter && (
            <div className="border-t border-indigo-100 p-5 space-y-5">
              <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-amber-900">
                  CLINICAL VERIFICATION REQUIRED — Review extracted parameters, edit inaccuracies, and sign off below.
                </p>
              </div>

              <div className="space-y-4">
                {digitizationSessions.map((session) => {
                  const isEditing = editingSessionId === session.id;
                  const docVerified = session.doctor_verified || session.status === 'verified';
                  return (
                    <div key={session.id} className={`p-4 rounded-2xl border ${docVerified ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 bg-slate-50/50'} space-y-3`}>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📄</span>
                          <span className="font-bold text-xs text-slate-800">{session.original_name}</span>
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                            docVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {docVerified ? 'Verified' : 'Needs Verification'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <a href={session.file_url} target="_blank" rel="noreferrer" className="text-sky-600 font-semibold hover:underline">
                            View Original File
                          </a>
                          {!docVerified && !isEditing && (
                            <button
                              onClick={() => {
                                setEditingSessionId(session.id);
                                setDocEditForm(session.extracted_data);
                                setDocNotesInput(session.doctor_notes || '');
                              }}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] transition"
                            >
                              Review &amp; Edit
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Display Mode */}
                      {!isEditing && (
                        <div className="space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                            <div><span className="font-semibold text-slate-700">Practitioner:</span> {session.extracted_data.doctor_name}</div>
                            <div><span className="font-semibold text-slate-700">Clinic:</span> {session.extracted_data.hospital_name}</div>
                            <div><span className="font-semibold text-slate-700">Date:</span> {session.extracted_data.record_date}</div>
                            <div><span className="font-semibold text-slate-700">Summary:</span> {session.extracted_data.summary}</div>
                          </div>

                          {/* Medicines */}
                          {session.extracted_data.medicines?.length > 0 && (
                            <div className="bg-emerald-50/20 p-2.5 rounded-xl border border-emerald-100">
                              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Detected Medicines:</span>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {session.extracted_data.medicines.map((m, idx) => (
                                  <span key={idx} className="bg-white border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-950">
                                    {m.name || m.medicine_name} ({m.dosage}) — {m.frequency}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Findings */}
                          {session.extracted_data.findings?.length > 0 && (
                            <div className="bg-sky-50/20 p-2.5 rounded-xl border border-sky-100">
                              <span className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">Detected Lab Parameters:</span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-1">
                                {session.extracted_data.findings.map((f, idx) => (
                                  <div key={idx} className="bg-white p-1 rounded border border-slate-200">
                                    <span className="text-[9px] text-slate-400 block truncate">{f.param}</span>
                                    <span className={`font-bold ${f.status === 'high' || f.status === 'low' ? 'text-rose-600' : 'text-slate-800'}`}>
                                      {f.value} {f.unit}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Doctor verification feedback */}
                          {session.doctor_verified && (
                            <div className="bg-purple-50 p-2 rounded-xl border border-purple-100 text-purple-950">
                              <span className="font-bold block text-[10px] text-purple-700">⚕️ Clinician Notes:</span>
                              <p className="mt-0.5">{session.doctor_notes || 'No feedback notes entered.'}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Editing Mode */}
                      {isEditing && (
                        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                          <div className="font-bold text-xs text-indigo-900 flex items-center gap-1">
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Verification Editor</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Practitioner Name</label>
                              <input type="text" value={docEditForm.doctor_name} onChange={e => setDocEditForm(prev => ({ ...prev, doctor_name: e.target.value }))} className="w-full p-2 border rounded-lg text-xs" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Clinic / Hospital</label>
                              <input type="text" value={docEditForm.hospital_name} onChange={e => setDocEditForm(prev => ({ ...prev, hospital_name: e.target.value }))} className="w-full p-2 border rounded-lg text-xs" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Record Date</label>
                              <input type="date" value={docEditForm.record_date} onChange={e => setDocEditForm(prev => ({ ...prev, record_date: e.target.value }))} className="w-full p-2 border rounded-lg text-xs" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Summary / Findings Title</label>
                              <input type="text" value={docEditForm.summary} onChange={e => setDocEditForm(prev => ({ ...prev, summary: e.target.value }))} className="w-full p-2 border rounded-lg text-xs" />
                            </div>
                          </div>

                          {/* Editable Findings */}
                          {docEditForm.findings?.length > 0 && (
                            <div className="space-y-1.5 pt-2">
                              <span className="font-bold text-[10px] text-slate-600 block">Edit Extracted Values:</span>
                              {docEditForm.findings.map((f, fIdx) => (
                                <div key={fIdx} className="grid grid-cols-3 gap-1.5 items-center">
                                  <span className="font-semibold text-slate-700">{f.param}:</span>
                                  <input type="text" value={f.value} onChange={e => {
                                    const updated = [...docEditForm.findings];
                                    updated[fIdx].value = e.target.value;
                                    setDocEditForm(prev => ({ ...prev, findings: updated }));
                                  }} className="p-1 border rounded text-xs text-center font-bold" />
                                  <span className="text-slate-400">{f.unit}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Editable Medicines */}
                          {docEditForm.medicines?.length > 0 && (
                            <div className="space-y-1.5 pt-2">
                              <span className="font-bold text-[10px] text-slate-600 block">Edit Prescribed Meds:</span>
                              {docEditForm.medicines.map((m, mIdx) => (
                                <div key={mIdx} className="grid grid-cols-2 gap-1.5">
                                  <input type="text" value={m.name || m.medicine_name} onChange={e => {
                                    const updated = [...docEditForm.medicines];
                                    updated[mIdx].name = e.target.value;
                                    setDocEditForm(prev => ({ ...prev, medicines: updated }));
                                  }} className="p-1 border rounded text-xs" placeholder="Med Name" />
                                  <input type="text" value={m.dosage} onChange={e => {
                                    const updated = [...docEditForm.medicines];
                                    updated[mIdx].dosage = e.target.value;
                                    setDocEditForm(prev => ({ ...prev, medicines: updated }));
                                  }} className="p-1 border rounded text-xs" placeholder="Dosage" />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Doctor Feedback Notes */}
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Doctor Verification Notes</label>
                            <textarea
                              rows={2}
                              value={docNotesInput}
                              onChange={e => setDocNotesInput(e.target.value)}
                              placeholder="Clinical remarks, Titrations, or Verification logs..."
                              className="w-full p-2 border rounded-lg text-xs resize-none"
                            />
                          </div>

                          <div className="flex gap-2 pt-1 border-t border-slate-100">
                            <button
                              onClick={async () => {
                                setVerifyingDocSession(true);
                                try {
                                  await digitizeAPI.verifySession(session.id, {
                                    doctor_notes: docNotesInput,
                                    edited_data: docEditForm
                                  });
                                  addToast({
                                    title: 'Verification Complete',
                                    message: 'Extracted values approved and signed off.',
                                    type: 'success'
                                  });
                                  setEditingSessionId(null);
                                  fetchAuthorizedData();
                                } catch (e) {
                                  addToast({
                                    title: 'Verification Failed',
                                    message: 'Error verifying document extraction.',
                                    type: 'error'
                                  });
                                } finally {
                                  setVerifyingDocSession(false);
                                }
                              }}
                              disabled={verifyingDocSession}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1 btn-inline"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Sign Off &amp; Verify
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await digitizeAPI.updateSession(session.id, { status: 'failed' });
                                  addToast({
                                    title: 'Extraction Rejected',
                                    message: 'Document extraction rejected.',
                                    type: 'info'
                                  });
                                  setEditingSessionId(null);
                                  fetchAuthorizedData();
                                } catch (e) { console.error(e); }
                              }}
                              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition btn-inline"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => setEditingSessionId(null)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold btn-inline"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>
      )}

      {/* Phase 8: Vaidya Ayurveda Workspace */}
      {(() => {
        const hasAyurvedaConsent = activeConsent?.approved_categories?.includes('ayurveda') || activeConsent?.approved_categories?.includes('complete_record');
        if (!hasAyurvedaConsent) return null;
        return (
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-md overflow-hidden">
            <button
              onClick={() => setShowAyurvedaWorkspace(!showAyurvedaWorkspace)}
              className="w-full flex items-center justify-between p-5 hover:bg-emerald-50/30 transition btn-inline text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                  <Leaf className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-900 font-display">🌿 Vaidya Ayurveda Workspace</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span>Ayurveda Access Granted</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showAyurvedaWorkspace ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {showAyurvedaWorkspace && (
              <div className="border-t border-emerald-100 bg-slate-50/10">
                <VaidyaAyurvedaWorkspace patientId={targetPatientId} patientName={patientName} />
              </div>
            )}
          </div>
        );
      })()}

      {/* Permitted Medical Records Timeline */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            Permitted Medical History & Lab Reports ({records.length})
          </h3>
          <span className="text-xs text-slate-400">Restricted to approved categories</span>
        </div>

        {records.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No records available under the approved categories.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {records.map((rec) => (
              <div key={rec.id} className="py-4 space-y-2 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rec.title}</span>
                    <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 text-[10px] font-semibold border border-sky-200">
                      {getCategoryLabel(rec.category)}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono">{formatDate(rec.record_date)}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>

                {rec.file_url && (
                  <a
                    href={rec.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-800 pt-1"
                  >
                    <Download className="w-3.5 h-3.5" /> View Original Attached Report
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescription Writer Modal */}
      <PrescriptionWriterModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        patient={{ patient_id: targetPatientId, first_name: patientName, last_name: '' }}
        onSuccess={fetchAuthorizedData}
      />

      {/* Consultation Recorder Modal */}
      <ConsultationModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        patient={{ patient_id: targetPatientId, first_name: patientName, last_name: '' }}
        onSuccess={fetchAuthorizedData}
      />

    </div>
  );
};
