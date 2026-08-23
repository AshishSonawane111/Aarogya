import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { recordAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Pill, Plus, Trash2, CheckCircle2, Calendar, FileText } from 'lucide-react';

export const PrescriptionWriterModal = ({ isOpen, onClose, patient, onSuccess }) => {
  if (!patient) return null;

  const { addToast } = useNotification();
  const [diagnosisSummary, setDiagnosisSummary] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([
    {
      medicine_name: 'Telmisartan Tablets IP',
      dosage: '40 mg',
      frequency: 'Once daily (Morning)',
      duration_days: 30,
      instructions: 'Take with water after breakfast',
      timing_preference: 'after_food'
    }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        medicine_name: '',
        dosage: '',
        frequency: 'Twice daily (1-0-1)',
        duration_days: 15,
        instructions: 'Take after meals',
        timing_preference: 'after_food'
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosisSummary.trim()) {
      alert('Please enter a clinical diagnosis summary.');
      return;
    }
    const hasEmptyMed = items.some((i) => !i.medicine_name.trim() || !i.dosage.trim());
    if (hasEmptyMed) {
      alert('Please complete all medicine names and dosages.');
      return;
    }

    setLoading(true);
    try {
      await recordAPI.createPrescription({
        patient_id: patient.patient_id || patient.id,
        diagnosis_summary: diagnosisSummary,
        follow_up_date: followUpDate || null,
        special_instructions: specialInstructions,
        items
      });

      addToast({
        title: 'Prescription Issued',
        message: 'Prescription recorded in medical timeline and synced to patient medicines table.',
        type: 'success'
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      addToast({
        title: 'Error Creating Prescription',
        message: err.response?.data?.error || 'Failed to save prescription',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue Digital Medical Prescription" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Patient Tag */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-900 font-bold">
              Patient: {patient.first_name} {patient.last_name}
            </span>
            <span className="text-slate-500 font-mono text-[11px] block">
              {patient.health_id_number || patient.health_id}
            </span>
          </div>
          <span className="text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
            Outpatient Rx
          </span>
        </div>

        {/* Diagnosis & Follow-up Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Diagnosis / Clinical Summary:
            </label>
            <input
              type="text"
              value={diagnosisSummary}
              onChange={(e) => setDiagnosisSummary(e.target.value)}
              placeholder="e.g. Hypertension Stage 2, Type 2 Diabetes"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              Follow-up Review Date:
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Medicines List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-sky-600" />
              Prescribed Medications:
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Medicine
            </button>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto p-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2.5 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">
                    Medicine #{idx + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Remove medicine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Medicine Name (e.g. Metformin)"
                    value={item.medicine_name}
                    onChange={(e) => handleItemChange(idx, 'medicine_name', e.target.value)}
                    className="p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none sm:col-span-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 500mg)"
                    value={item.dosage}
                    onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                    className="p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={item.frequency}
                    onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                    className="p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Once daily (Morning)">Once daily (Morning)</option>
                    <option value="Twice daily (1-0-1)">Twice daily (1-0-1)</option>
                    <option value="Thrice daily (1-1-1)">Thrice daily (1-1-1)</option>
                    <option value="Once daily (Night)">Once daily (Night)</option>
                    <option value="As needed (SOS)">As needed (SOS)</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Days (e.g. 30)"
                    value={item.duration_days}
                    onChange={(e) => handleItemChange(idx, 'duration_days', Number(e.target.value))}
                    className="p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Instructions (e.g. after food)"
                    value={item.instructions}
                    onChange={(e) => handleItemChange(idx, 'instructions', e.target.value)}
                    className="p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Lifestyle Advice & Dietary Precautions:
          </label>
          <textarea
            rows={2}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="e.g. Maintain low sodium diet, avoid sugar, 30m daily morning walk..."
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
            {loading ? 'Issuing Prescription...' : 'Finalize & Sync to Patient'}
          </button>
        </div>

      </form>
    </Modal>
  );
};
