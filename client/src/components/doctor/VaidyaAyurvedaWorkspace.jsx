import React, { useState, useEffect } from 'react';
import { ayurvedaAPI } from '../../services/api';
import { 
  Leaf, 
  User, 
  Activity, 
  Pill, 
  FileText, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Wind, 
  Droplets,
  Clock,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

// Constant structures matching AyurvedaPage.jsx
const DOSHAS = [
  { id: 'vata', name: 'Vāta', emoji: '💨', color: 'from-sky-400 to-indigo-500', textClass: 'text-sky-700' },
  { id: 'pitta', name: 'Pitta', emoji: '🔥', color: 'from-orange-400 to-red-500', textClass: 'text-orange-700' },
  { id: 'kapha', name: 'Kapha', emoji: '🌊', color: 'from-emerald-400 to-teal-500', textClass: 'text-emerald-700' }
];

const DASHAVIDHA_FIELDS = [
  { key: 'prakriti', name: 'Prakriti', icon: '🌱', desc: 'Constitutional body type' },
  { key: 'vikriti', name: 'Vikriti', icon: '⚖️', desc: 'Current imbalanced state' },
  { key: 'sara', name: 'Sara', icon: '✨', desc: 'Tissue quality and excellence' },
  { key: 'samhanana', name: 'Samhanana', icon: '🦴', desc: 'Body compactness and structural integrity' },
  { key: 'pramana', name: 'Pramana', icon: '📏', desc: 'Body measurements and proportions' },
  { key: 'satmya', name: 'Satmya', icon: '🌿', desc: 'Adaptability and homologation' },
  { key: 'sattva', name: 'Sattva', icon: '🧠', desc: 'Mental strength and willpower' },
  { key: 'ahara_shakti', name: 'Ahara Shakti', icon: '🍚', desc: 'Digestive and dietary capacity' },
  { key: 'vyayama_shakti', name: 'Vyayama Shakti', icon: '💪', desc: 'Exercise and physical endurance' },
  { key: 'vaya', name: 'Vaya', icon: '🕐', desc: 'Age and developmental stage' }
];

const MEDICINE_FORMS = [
  'Churna (Powder)', 
  'Vati (Tablet)', 
  'Kwatha (Decoction)', 
  'Asava/Arishta', 
  'Ghrita (Ghee)', 
  'Taila (Oil)', 
  'Avaleha (Jam/Linctus)', 
  'Capsule', 
  'Other'
];

const TREATMENT_TYPES = [
  'Panchakarma', 
  'Vamana', 
  'Virechana', 
  'Basti', 
  'Nasya', 
  'Raktamokshana', 
  'Abhyanga', 
  'Shirodhara', 
  'Swedana', 
  'Rasayana', 
  'Other'
];

export const VaidyaAyurvedaWorkspace = ({ patientId, patientName }) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'dashavidha', 'medicines', 'treatments', 'responses'
  const [profile, setProfile] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [dashavidhaForm, setDashavidhaForm] = useState({
    prakriti: '', vikriti: '', sara: '', samhanana: '', pramana: '',
    satmya: '', sattva: '', ahara_shakti: '', vyayama_shakti: '', vaya: ''
  });
  const [prakritiConfirmed, setPrakritiConfirmed] = useState('');
  const [vikritiConfirmed, setVikritiConfirmed] = useState('');
  const [vaidyaNotes, setVaidyaNotes] = useState('');

  const [medicineForm, setMedicineForm] = useState({
    name: '', form: 'Vati (Tablet)', dose: '', frequency: '', duration: '', purpose: '', notes: ''
  });

  const [treatmentForm, setTreatmentForm] = useState({
    treatment_name: '', treatment_type: 'Panchakarma', date: new Date().toISOString().split('T')[0],
    duration: '', notes: '', response: '', follow_up_date: ''
  });

  const [responseForm, setResponseForm] = useState({
    treatment_id: '', period: 'current', symptom_score: 5, sleep_quality: 'good',
    energy_level: 'good', digestion: 'Sama (balanced)', notes: ''
  });

  const [savingAssessment, setSavingAssessment] = useState(false);
  const [savingMedicine, setSavingMedicine] = useState(false);
  const [savingTreatment, setSavingTreatment] = useState(false);
  const [savingResponse, setSavingResponse] = useState(false);

  const loadAyurvedaData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profRes, assessRes, medRes, treatRes, respRes] = await Promise.all([
        ayurvedaAPI.getProfile(patientId),
        ayurvedaAPI.getAssessment(patientId),
        ayurvedaAPI.getMedicines(patientId),
        ayurvedaAPI.getTreatments(patientId),
        ayurvedaAPI.getResponses(patientId)
      ]);

      setProfile(profRes.data?.profile || null);
      setAssessments(assessRes.data?.assessments || []);
      setMedicines(medRes.data?.medicines || []);
      setTreatments(treatRes.data?.treatments || []);
      setResponses(respRes.data?.responses || []);

      // Pre-fill confirmed values if profile exists
      if (profRes.data?.profile) {
        setPrakritiConfirmed(profRes.data.profile.vaidya_prakriti || '');
        setVikritiConfirmed(profRes.data.profile.vaidya_vikriti || '');
        setVaidyaNotes(profRes.data.profile.vaidya_notes || '');
      }

      // Pre-fill latest assessment in form if available
      if (assessRes.data?.latest) {
        const latestD = assessRes.data.latest.dashavidha || {};
        setDashavidhaForm({
          prakriti: latestD.prakriti || '',
          vikriti: latestD.vikriti || '',
          sara: latestD.sara || '',
          samhanana: latestD.samhanana || '',
          pramana: latestD.pramana || '',
          satmya: latestD.satmya || '',
          sattva: latestD.sattva || '',
          ahara_shakti: latestD.ahara_shakti || '',
          vyayama_shakti: latestD.vyayama_shakti || '',
          vaya: latestD.vaya || ''
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load Ayurveda Workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      loadAyurvedaData();
    }
  }, [patientId]);

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    setSavingAssessment(true);
    try {
      await ayurvedaAPI.addAssessment({
        patient_id: patientId,
        dashavidha: dashavidhaForm,
        prakriti_confirmed: prakritiConfirmed,
        vikriti_confirmed: vikritiConfirmed,
        vaidya_notes: vaidyaNotes
      });
      alert('Dashavidha Pariksha assessment saved and profile updated.');
      loadAyurvedaData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save assessment');
    } finally {
      setSavingAssessment(false);
    }
  };

  const handleMedicineSubmit = async (e) => {
    e.preventDefault();
    if (!medicineForm.name.trim()) return alert('Medicine Name is required.');
    setSavingMedicine(true);
    try {
      await ayurvedaAPI.addMedicine({
        patient_id: patientId,
        ...medicineForm
      });
      setMedicineForm({ name: '', form: 'Vati (Tablet)', dose: '', frequency: '', duration: '', purpose: '', notes: '' });
      alert('Ayurvedic Medicine prescribed.');
      loadAyurvedaData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add medicine');
    } finally {
      setSavingMedicine(false);
    }
  };

  const handleToggleMedicine = async (medId) => {
    try {
      await ayurvedaAPI.toggleMedicine(medId);
      loadAyurvedaData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to toggle medicine status');
    }
  };

  const handleTreatmentSubmit = async (e) => {
    e.preventDefault();
    if (!treatmentForm.treatment_name.trim()) return alert('Treatment Name is required.');
    setSavingTreatment(true);
    try {
      await ayurvedaAPI.addTreatment({
        patient_id: patientId,
        ...treatmentForm
      });
      setTreatmentForm({
        treatment_name: '', treatment_type: 'Panchakarma', date: new Date().toISOString().split('T')[0],
        duration: '', notes: '', response: '', follow_up_date: ''
      });
      alert('Ayurvedic Treatment recorded.');
      loadAyurvedaData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add treatment');
    } finally {
      setSavingTreatment(false);
    }
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    setSavingResponse(true);
    try {
      await ayurvedaAPI.addResponse({
        patient_id: patientId,
        ...responseForm
      });
      setResponseForm({
        treatment_id: '', period: 'current', symptom_score: 5, sleep_quality: 'good',
        energy_level: 'good', digestion: 'Sama (balanced)', notes: ''
      });
      alert('Treatment response recorded.');
      loadAyurvedaData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add response');
    } finally {
      setSavingResponse(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Retrieving Ayurvedic Health Profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 space-y-2">
        <div className="font-bold flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          <span>Ayurveda Access Restricted</span>
        </div>
        <p>{error}</p>
      </div>
    );
  }

  // Value fallback helper
  const val = (v) => {
    if (v === undefined || v === null || v === '' || v === 'Not recorded') return <span className="text-slate-400 italic">Not recorded</span>;
    return <span className="font-semibold text-slate-900">{String(v)}</span>;
  };

  const valDetail = (v) => {
    if (v === undefined || v === null || v === '' || v === 'Not recorded') return 'Not recorded';
    return String(v);
  };

  return (
    <div className="bg-white rounded-3xl border border-emerald-200 shadow-md overflow-hidden">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/35">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">🌿 Vaidya Ayurveda Workspace</h3>
            <p className="text-xs text-emerald-300 mt-0.5">Patient: <strong className="text-white">{patientName}</strong></p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
          Ayurveda Access Granted
        </span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-100 bg-slate-50/50">
        {[
          { id: 'profile', label: '🌱 Patient Profile' },
          { id: 'dashavidha', label: '🔟 Dashavidha Pariksha' },
          { id: 'medicines', label: '🌿 Prescriptions' },
          { id: 'treatments', label: '📋 Treatments' },
          { id: 'responses', label: '📈 Outcomes' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-3 text-xs font-bold transition border-b-2 btn-inline ${
              activeTab === t.id 
                ? 'border-emerald-600 text-emerald-700 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        
        {/* 1. Patient Profile View */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            
            {/* Header Alert */}
            <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 flex items-start gap-2.5">
              <User className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Patient Self-Reported Ayurveda Profile</p>
                <p className="text-[11px] text-sky-700 mt-0.5">This data is entered by the patient and is read-only. Use other tabs to add verified clinical assessments.</p>
              </div>
            </div>

            {/* Dosha Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">🌱 Reported Prakriti</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xl">🌱</span>
                  {val(profile?.reported_prakriti)}
                  <span className="text-[9px] font-bold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-200 ml-auto">👤 Patient Reported</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">⚖️ Reported Vikriti</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xl">⚖️</span>
                  {val(profile?.reported_vikriti)}
                  <span className="text-[9px] font-bold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-200 ml-auto">👤 Patient Reported</span>
                </div>
              </div>
            </div>

            {/* General Profile fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold block">🔥 Agni (Digestive Fire)</span>
                <p className="text-xs text-slate-800 mt-1 font-semibold">{valDetail(profile?.agni)}</p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold block">🌀 Koshtha (Digestive Tract)</span>
                <p className="text-xs text-slate-800 mt-1 font-semibold">{valDetail(profile?.koshtha)}</p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold block">🔍 Nidana (Reported Cause)</span>
                <p className="text-xs text-slate-800 mt-1 font-semibold">{valDetail(profile?.nidana)}</p>
              </div>
            </div>

            {/* Diet & Lifestyle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <h4 className="font-bold text-xs text-slate-900 border-b pb-1.5">🥗 Ahara (Diet Habits)</h4>
                <div className="space-y-1.5 text-xs">
                  <div><span className="text-slate-400">Diet Pattern:</span> {val(profile?.ahara?.diet_pattern)}</div>
                  <div><span className="text-slate-400">Appetite:</span> {val(profile?.ahara?.appetite)}</div>
                  <div><span className="text-slate-400">Meal Timings:</span> {val(profile?.ahara?.meal_timing)}</div>
                  <div><span className="text-slate-400">Preferences:</span> {val(profile?.ahara?.food_preferences)}</div>
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <h4 className="font-bold text-xs text-slate-900 border-b pb-1.5">🧘 Vihara (Lifestyle Routine)</h4>
                <div className="space-y-1.5 text-xs">
                  <div><span className="text-slate-400">Sleep:</span> {val(profile?.vihara?.sleep_hours)} hours ({profile?.vihara?.sleep_quality || 'unspecified'})</div>
                  <div><span className="text-slate-400">Exercise:</span> {val(profile?.vihara?.exercise)}</div>
                  <div><span className="text-slate-400">Stress Level:</span> {val(profile?.vihara?.stress_level)}</div>
                  <div><span className="text-slate-400">Work Pattern:</span> {val(profile?.vihara?.work_lifestyle)}</div>
                </div>
              </div>
            </div>

            {/* Practitioner verified state display */}
            <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-2">
              <span className="text-xs font-bold text-purple-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Vaidya Assessment Overview
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Confirmed Prakriti:</span>
                  <span className="font-bold text-slate-900">{profile?.vaidya_prakriti || 'Pending evaluation'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Confirmed Vikriti:</span>
                  <span className="font-bold text-slate-900">{profile?.vaidya_vikriti || 'Pending evaluation'}</span>
                </div>
              </div>
              {profile?.vaidya_notes && (
                <div className="mt-2 text-xs border-t border-purple-100 pt-2 text-purple-950">
                  <span className="font-bold block">Vaidya Remarks:</span>
                  <p className="mt-0.5 italic">"{profile.vaidya_notes}"</p>
                  <p className="text-[10px] text-purple-600/80 mt-1">Verified by {profile.verified_by} on {formatDate(profile.verified_at)}</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. Dashavidha Pariksha */}
        {activeTab === 'dashavidha' && (
          <form onSubmit={handleAssessmentSubmit} className="space-y-6">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>PRACTITIONER CLINICAL ASSESSMENT — Values recorded here will verify the patient Health Passport.</span>
            </div>

            {/* Prakriti & Vikriti Confirmation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Prakriti (Constitution):</label>
                <select
                  value={prakritiConfirmed}
                  onChange={e => setPrakritiConfirmed(e.target.value)}
                  className="w-full p-2 border rounded-xl text-xs bg-white"
                >
                  <option value="">-- Choose Prakriti --</option>
                  <option value="Vata">Vata</option>
                  <option value="Pitta">Pitta</option>
                  <option value="Kapha">Kapha</option>
                  <option value="Vata-Pitta">Vata-Pitta</option>
                  <option value="Pitta-Vata">Pitta-Vata</option>
                  <option value="Vata-Kapha">Vata-Kapha</option>
                  <option value="Kapha-Vata">Kapha-Vata</option>
                  <option value="Pitta-Kapha">Pitta-Kapha</option>
                  <option value="Kapha-Pitta">Kapha-Pitta</option>
                  <option value="Tridoshaja">Tridoshaja (Vata-Pitta-Kapha)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Vikriti (Imbalance):</label>
                <select
                  value={vikritiConfirmed}
                  onChange={e => setVikritiConfirmed(e.target.value)}
                  className="w-full p-2 border rounded-xl text-xs bg-white"
                >
                  <option value="">-- Choose Vikriti --</option>
                  <option value="Vata Dusti">Vata Dusti</option>
                  <option value="Pitta Dusti">Pitta Dusti</option>
                  <option value="Kapha Dusti">Kapha Dusti</option>
                  <option value="Vata-Pitta">Vata-Pitta</option>
                  <option value="Pitta-Kapha">Pitta-Kapha</option>
                  <option value="Vata-Kapha">Vata-Kapha</option>
                  <option value="Tridoshaja">Tridoshaja</option>
                  <option value="Sama">Sama (No active imbalance)</option>
                </select>
              </div>
            </div>

            {/* 10-fold examination items */}
            <div className="space-y-3.5">
              <h4 className="font-bold text-xs text-slate-900 border-b pb-1">10-Fold Examination (Dashavidha Pariksha)</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DASHAVIDHA_FIELDS.map(f => (
                  <div key={f.key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{f.icon}</span>
                      <span>{f.name}</span>
                    </span>
                    <input
                      type="text"
                      value={dashavidhaForm[f.key] || ''}
                      onChange={e => setDashavidhaForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={`Record findings for ${f.name}...`}
                      className="w-full p-2 border rounded-lg text-xs bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Vaidya Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Vaidya Clinical Remarks / Advice:</label>
              <textarea
                rows={3}
                value={vaidyaNotes}
                onChange={e => setVaidyaNotes(e.target.value)}
                placeholder="Enter holistic diagnostic notes, Ahara/Vihara lifestyle advice, or general remarks..."
                className="w-full p-3 border rounded-xl text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingAssessment}
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {savingAssessment ? 'Saving assessment...' : 'Submit Practitioner Assessment'}
            </button>

            {/* Previous Assessments History */}
            {assessments.length > 0 && (
              <div className="mt-8 pt-6 border-t space-y-4">
                <h4 className="font-bold text-xs text-slate-900">Historical Assessments ({assessments.length})</h4>
                <div className="space-y-3">
                  {assessments.map(a => (
                    <div key={a.id} className="p-4 bg-white border border-slate-200 rounded-2xl text-xs space-y-2">
                      <div className="flex justify-between items-center text-slate-500 font-mono text-[10px]">
                        <span>Assessed by: {a.assessed_by}</span>
                        <span>{formatDate(a.assessed_at)}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div><span className="text-slate-400">Confirmed Prakriti:</span> <span className="font-bold text-slate-800">{a.prakriti_confirmed || 'N/A'}</span></div>
                        <div><span className="text-slate-400">Confirmed Vikriti:</span> <span className="font-bold text-slate-800">{a.vikriti_confirmed || 'N/A'}</span></div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                        <span className="font-bold block text-[10px] text-slate-500 uppercase">Dashavidha Pariksha Findings:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mt-1 text-[11px]">
                          {Object.entries(a.dashavidha || {}).map(([k, val]) => (
                            <div key={k} className="truncate">
                              <span className="text-slate-400 capitalize">{k.replace('_', ' ')}:</span> <span className="font-medium text-slate-700">{val || 'Not assessed'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {a.vaidya_notes && (
                        <p className="text-slate-600 mt-1.5"><strong className="text-slate-700">Notes:</strong> {a.vaidya_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </form>
        )}

        {/* 3. Medicines */}
        {activeTab === 'medicines' && (
          <div className="space-y-6">
            
            {/* New Medicine Form */}
            <form onSubmit={handleMedicineSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                Prescribe New Ayurvedic Medicine
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={medicineForm.name}
                    onChange={e => setMedicineForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Ashwagandha Churna, Triphala Vati"
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Form / Preparation</label>
                  <select
                    value={medicineForm.form}
                    onChange={e => setMedicineForm(prev => ({ ...prev, form: e.target.value }))}
                    className="w-full p-2 border rounded-lg text-xs bg-white"
                  >
                    {MEDICINE_FORMS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Dosage</label>
                  <input
                    type="text"
                    value={medicineForm.dose}
                    onChange={e => setMedicineForm(prev => ({ ...prev, dose: e.target.value }))}
                    placeholder="e.g. 500mg, 1 tablet, 1 tsp"
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Frequency</label>
                  <input
                    type="text"
                    value={medicineForm.frequency}
                    onChange={e => setMedicineForm(prev => ({ ...prev, frequency: e.target.value }))}
                    placeholder="e.g. Twice daily after meals"
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Duration</label>
                  <input
                    type="text"
                    value={medicineForm.duration}
                    onChange={e => setMedicineForm(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g. 30 days, 2 weeks"
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Purpose / Anupana</label>
                  <input
                    type="text"
                    value={medicineForm.purpose}
                    onChange={e => setMedicineForm(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="e.g. Stress relief, with warm milk"
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Safety / Herb-Drug Interaction Notes</label>
                <input
                  type="text"
                  value={medicineForm.notes}
                  onChange={e => setMedicineForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Monitor BP if taken with antihypertensive meds..."
                  className="w-full p-2 border rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={savingMedicine}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition disabled:opacity-50"
              >
                {savingMedicine ? 'Adding...' : 'Prescribe Medicine'}
              </button>
            </form>

            {/* List of active/inactive medicines */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-900 border-b pb-1.5 flex items-center gap-1">
                <span>🌿 Prescribed Ayurvedic Regimen ({medicines.length})</span>
              </h4>

              {medicines.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                  No Ayurvedic medicines prescribed yet. Use form above to add.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {medicines.map(m => (
                    <div 
                      key={m.id} 
                      className={`p-4 rounded-2xl border ${m.is_active ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 bg-slate-50/50'} space-y-2 text-xs`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-emerald-950 text-sm">{m.name}</span>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                          m.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {m.is_active ? 'Active Regimen' : 'Completed'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mt-1.5">
                        <div><span className="font-semibold text-slate-700">Form:</span> {m.form}</div>
                        <div><span className="font-semibold text-slate-700">Dose:</span> {m.dose || 'Not specified'}</div>
                        <div><span className="font-semibold text-slate-700">Freq:</span> {m.frequency || 'Once daily'}</div>
                        <div><span className="font-semibold text-slate-700">Duration:</span> {m.duration || 'As directed'}</div>
                      </div>

                      {m.purpose && (
                        <p className="text-[11px] text-slate-500 mt-1"><strong className="text-slate-700">Purpose/Anupana:</strong> {m.purpose}</p>
                      )}
                      
                      {m.notes && (
                        <p className="text-[10px] bg-white p-2 rounded-lg border border-slate-200 text-slate-500 mt-1 italic">
                          💡 {m.notes}
                        </p>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t mt-2 text-[10px] text-slate-400 font-mono">
                        <span>By: {m.prescriber}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleMedicine(m.id)}
                          className="text-[10px] font-bold text-sky-600 hover:text-sky-800 transition btn-inline"
                        >
                          {m.is_active ? 'Mark Complete' : 'Reactivate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 4. Treatments */}
        {activeTab === 'treatments' && (
          <div className="space-y-6">
            
            {/* Record Treatment Form */}
            <form onSubmit={handleTreatmentSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                Record Ayurvedic Treatment / Procedure
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Treatment / Therapy Name</label>
                  <input
                    type="text"
                    required
                    value={treatmentForm.treatment_name}
                    onChange={e => setTreatmentForm(prev => ({ ...prev, treatment_name: e.target.value }))}
                    placeholder="e.g. Abhyanga & Shirodhara, Nasya"
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Therapy Type</label>
                  <select
                    value={treatmentForm.treatment_type}
                    onChange={e => setTreatmentForm(prev => ({ ...prev, treatment_type: e.target.value }))}
                    className="w-full p-2 border rounded-lg text-xs bg-white"
                  >
                    {TREATMENT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Session Date</label>
                  <input
                    type="date"
                    required
                    value={treatmentForm.date}
                    onChange={e => setTreatmentForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Duration</label>
                  <input
                    type="text"
                    value={treatmentForm.duration}
                    onChange={e => setTreatmentForm(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g. 7 daily sessions, 45 mins"
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Follow-up Evaluation Date</label>
                  <input
                    type="date"
                    value={treatmentForm.follow_up_date}
                    onChange={e => setTreatmentForm(prev => ({ ...prev, follow_up_date: e.target.value }))}
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Initial Patient Response</label>
                  <input
                    type="text"
                    value={treatmentForm.response}
                    onChange={e => setTreatmentForm(prev => ({ ...prev, response: e.target.value }))}
                    placeholder="e.g. Immediate stress reduction, feeling lighter"
                    className="w-full p-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Treatment Details / Oils / Herbs Used</label>
                <textarea
                  rows={2}
                  value={treatmentForm.notes}
                  onChange={e => setTreatmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Used Ksheerabala Taila. Directed patient to avoid cold wind post treatment..."
                  className="w-full p-2 border rounded-lg text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingTreatment}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition disabled:opacity-50"
              >
                {savingTreatment ? 'Recording...' : 'Record Session'}
              </button>
            </form>

            {/* List of treatments */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-900 border-b pb-1.5">Therapy & Panchakarma History</h4>

              {treatments.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                  No treatments recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {treatments.map(t => (
                    <div key={t.id} className="p-4 bg-white border border-slate-200 rounded-2xl text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-sm">{t.treatment_name}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px] font-semibold border border-emerald-200">
                          {t.treatment_type}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500">
                        <div><span className="font-semibold text-slate-700">Date:</span> {formatDate(t.date)}</div>
                        <div><span className="font-semibold text-slate-700">Duration:</span> {t.duration || 'N/A'}</div>
                        <div><span className="font-semibold text-slate-700">Vaidya:</span> {t.practitioner || 'N/A'}</div>
                        <div><span className="font-semibold text-slate-700">Follow-up:</span> {t.follow_up_date ? formatDate(t.follow_up_date) : 'None scheduled'}</div>
                      </div>

                      {t.notes && (
                        <p className="text-slate-600 mt-1"><strong className="text-slate-700">Clinical Notes:</strong> {t.notes}</p>
                      )}

                      {t.response && (
                        <div className="bg-emerald-50/20 p-2 rounded-xl border border-emerald-100 mt-1.5 flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <p className="text-[11px] text-emerald-950 font-medium"><strong className="text-emerald-800">Response:</strong> {t.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 5. Outcome Tracking (Treatment Responses) */}
        {activeTab === 'responses' && (
          <div className="space-y-6">
            
            {/* Record Outcome form */}
            <form onSubmit={handleResponseSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                Record Clinical Response / Patient Outcome
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Select Treatment (Optional)</label>
                  <select
                    value={responseForm.treatment_id}
                    onChange={e => setResponseForm(prev => ({ ...prev, treatment_id: e.target.value }))}
                    className="w-full p-2 border rounded-lg text-xs bg-white"
                  >
                    <option value="">-- General / Overall Health --</option>
                    {treatments.map(t => (
                      <option key={t.id} value={t.id}>{t.treatment_name} ({formatDate(t.date)})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tracking Period</label>
                  <select
                    value={responseForm.period}
                    onChange={e => setResponseForm(prev => ({ ...prev, period: e.target.value }))}
                    className="w-full p-2 border rounded-lg text-xs bg-white"
                  >
                    <option value="before">Before Treatment</option>
                    <option value="during">During Treatment</option>
                    <option value="after">After Treatment / Complete</option>
                    <option value="current">Ongoing Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Symptom Severity (0 = None, 10 = Max)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={responseForm.symptom_score}
                      onChange={e => setResponseForm(prev => ({ ...prev, symptom_score: e.target.value }))}
                      className="flex-1 accent-emerald-600 mt-1"
                    />
                    <span className="w-8 text-center font-bold text-emerald-950 font-mono text-sm bg-white border p-1 rounded">
                      {responseForm.symptom_score}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Sleep Quality</label>
                  <select
                    value={responseForm.sleep_quality}
                    onChange={e => setResponseForm(prev => ({ ...prev, sleep_quality: e.target.value }))}
                    className="w-full p-2 border rounded-lg text-xs bg-white"
                  >
                    <option value="poor">Poor</option>
                    <option value="fair">Fair</option>
                    <option value="good">Good</option>
                    <option value="excellent">Excellent</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Ojas / Energy Level</label>
                  <select
                    value={responseForm.energy_level}
                    onChange={e => setResponseForm(prev => ({ ...prev, energy_level: e.target.value }))}
                    className="w-full p-2 border rounded-lg text-xs bg-white"
                  >
                    <option value="low">Low (Alpa Ojas)</option>
                    <option value="moderate">Moderate (Madhyama)</option>
                    <option value="good">Good (Pravara)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Agni / Digestion State</label>
                  <select
                    value={responseForm.digestion}
                    onChange={e => setResponseForm(prev => ({ ...prev, digestion: e.target.value }))}
                    className="w-full p-2 border rounded-lg text-xs bg-white"
                  >
                    <option value="Sama (balanced)">Sama (balanced)</option>
                    <option value="Visham (irregular)">Visham (irregular Vata)</option>
                    <option value="Tikshna (sharp/acidic)">Tikshna (sharp/acidic Pitta)</option>
                    <option value="Manda (slow/heavy)">Manda (slow/heavy Kapha)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Practitioner Observations</label>
                <input
                  type="text"
                  value={responseForm.notes}
                  onChange={e => setResponseForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Record qualitative updates, improvements, changes in tongue coat, pulse..."
                  className="w-full p-2 border rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={savingResponse}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition disabled:opacity-50"
              >
                {savingResponse ? 'Adding...' : 'Record Outcome Update'}
              </button>
            </form>

            {/* List of responses */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-slate-900 border-b pb-1.5">Outcome Logs</h4>
              
              {responses.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                  No responses logged yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {responses.map(r => {
                    const matchedTreatment = treatments.find(t => t.id === r.treatment_id);
                    return (
                      <div key={r.id} className="p-4 bg-white border border-slate-200 rounded-2xl text-xs space-y-3">
                        <div className="flex justify-between items-center text-slate-500 font-mono text-[10px]">
                          <span>Recorded on: {formatDate(r.created_at)}</span>
                          <span className="capitalize font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            {r.period} Treatment
                          </span>
                        </div>

                        {matchedTreatment && (
                          <div className="text-[11px] font-bold text-slate-800 bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center gap-1">
                            <span>📋 Related Procedure:</span>
                            <span className="text-emerald-900">{matchedTreatment.treatment_name} ({formatDate(matchedTreatment.date)})</span>
                          </div>
                        )}

                        {/* Outcome parameters */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          
                          {/* Symptom score progress bar */}
                          <div className="p-2.5 bg-slate-50 border rounded-xl flex flex-col justify-between">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Symptom Severity</span>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-rose-500 rounded-full" 
                                  style={{ width: `${(r.symptom_score || 0) * 10}%` }}
                                ></div>
                              </div>
                              <span className="font-mono font-bold text-slate-800">{r.symptom_score ?? 0}/10</span>
                            </div>
                          </div>

                          <div className="p-2.5 bg-slate-50 border rounded-xl">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Sleep Quality</span>
                            <span className="font-bold text-slate-800 mt-1 block capitalize">{r.sleep_quality || 'N/A'}</span>
                          </div>

                          <div className="p-2.5 bg-slate-50 border rounded-xl">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Ojas / Energy</span>
                            <span className="font-bold text-slate-800 mt-1 block capitalize">{r.energy_level || 'N/A'}</span>
                          </div>

                          <div className="p-2.5 bg-slate-50 border rounded-xl">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Agni / Digestion</span>
                            <span className="font-bold text-slate-800 mt-1 block capitalize">{r.digestion || 'N/A'}</span>
                          </div>

                        </div>

                        {r.notes && (
                          <div className="p-2.5 bg-amber-50/20 border border-amber-100 rounded-xl">
                            <span className="text-[10px] text-amber-800 font-bold block">Practitioner Evaluation:</span>
                            <p className="text-slate-700 mt-0.5">{r.notes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
