import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { recordAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Stethoscope, Activity, FileCheck, CheckCircle2 } from 'lucide-react';

export const ConsultationModal = ({ isOpen, onClose, patient, onSuccess }) => {
  if (!patient) return null;

  const { addToast } = useNotification();
  const [symptoms, setSymptoms] = useState('');
  const [clinicalAssessment, setClinicalAssessment] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUp, setFollowUp] = useState('');
  
  // Vitals
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('72');
  const [temperature, setTemperature] = useState('98.6');
  const [spo2, setSpo2] = useState('99');
  const [weight, setWeight] = useState('70');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms || !clinicalAssessment || !diagnosis || !treatmentPlan) {
      alert('Please fill in all clinical evaluation fields.');
      return;
    }

    setLoading(true);
    try {
      await recordAPI.createConsultation({
        patient_id: patient.patient_id || patient.id,
        symptoms,
        clinical_assessment: clinicalAssessment,
        diagnosis,
        treatment_plan: treatmentPlan,
        follow_up_recommendation: followUp,
        vitals: {
          bp: `${bp} mmHg`,
          pulse: `${pulse} bpm`,
          temperature: `${temperature} °F`,
          spo2: `${spo2}%`,
          weight_kg: Number(weight)
        }
      });

      addToast({
        title: 'Consultation Finalized',
        message: 'Clinical record encrypted and appended to patient medical timeline.',
        type: 'success'
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      addToast({
        title: 'Error Saving Consultation',
        message: err.response?.data?.error || 'Failed to save consultation',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Clinical Consultation & Vitals" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Patient header */}
        <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-sky-950 font-bold">
              Patient: {patient.first_name} {patient.last_name}
            </span>
            <span className="text-sky-700 font-mono text-[11px] block">
              {patient.health_id_number || patient.health_id}
            </span>
          </div>
          <span className="text-sky-800 font-semibold bg-white px-2 py-0.5 rounded-lg border border-sky-200">
            Encounter Note
          </span>
        </div>

        {/* Vitals Grid */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            Recorded Patient Vitals:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-500 block">BP (mmHg)</label>
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                placeholder="120/80"
                className="w-full p-1.5 rounded-lg border border-slate-300 bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block">Pulse (bpm)</label>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="72"
                className="w-full p-1.5 rounded-lg border border-slate-300 bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block">Temp (°F)</label>
              <input
                type="text"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="98.6"
                className="w-full p-1.5 rounded-lg border border-slate-300 bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block">SpO2 (%)</label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                placeholder="99"
                className="w-full p-1.5 rounded-lg border border-slate-300 bg-white font-mono"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] text-slate-500 block">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                className="w-full p-1.5 rounded-lg border border-slate-300 bg-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Symptoms & Assessment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Chief Symptoms & History of Present Illness:
            </label>
            <textarea
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Mild chest tightness on exertion, intermittent dizziness..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Clinical Assessment & Physical Exam:
            </label>
            <textarea
              rows={2}
              value={clinicalAssessment}
              onChange={(e) => setClinicalAssessment(e.target.value)}
              placeholder="e.g. S1 S2 heard normal. Chest clear. Stable hemodynamic status..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Diagnosis & Treatment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Clinician Diagnosis / ICD Category:
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Essential Hypertension (I10), Dyslipidemia"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Follow-up & Review Recommendation:
            </label>
            <input
              type="text"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder="e.g. Review in 4 weeks with lipid profile and daily BP chart"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Treatment Plan */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Detailed Treatment Plan & Interventions:
          </label>
          <textarea
            rows={2}
            value={treatmentPlan}
            onChange={(e) => setTreatmentPlan(e.target.value)}
            placeholder="e.g. Continue Telmisartan 40mg. Reduce salt intake to <2g/day. Recommended 30 mins brisk walking..."
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading ? 'Saving Consultation...' : 'Finalize & Sign Consultation'}
          </button>
        </div>

      </form>
    </Modal>
  );
};
