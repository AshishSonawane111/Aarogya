import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { RECORD_CATEGORIES } from '../../utils/helpers';
import { consentAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { KeyRound, ShieldAlert, Send, Clock } from 'lucide-react';

export const ConsentRequestModal = ({ isOpen, onClose, patient, onSuccess }) => {
  if (!patient) return null;

  const { addToast } = useNotification();
  const [selectedCategories, setSelectedCategories] = useState([
    'lab_reports',
    'prescriptions',
    'medical_history'
  ]);
  const [durationHours, setDurationHours] = useState(24);
  const [reason, setReason] = useState('Outpatient clinical consultation and evaluation');
  const [loading, setLoading] = useState(false);

  const toggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === RECORD_CATEGORIES.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(RECORD_CATEGORIES.map((c) => c.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      alert('Please select at least one record category to request.');
      return;
    }
    if (!reason.trim()) {
      alert('Please provide a clinical reason for this request.');
      return;
    }

    setLoading(true);
    try {
      await consentAPI.requestConsent({
        patient_id: patient.patient_id,
        requested_categories: selectedCategories,
        duration_hours: durationHours,
        reason
      });

      addToast({
        title: 'Consent Request Sent',
        message: `Request sent to ${patient.first_name} ${patient.last_name}. The patient must approve before records become visible.`,
        type: 'success'
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      addToast({
        title: 'Failed to Send Request',
        message: err.response?.data?.error || 'Error sending consent request',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Medical Records Access" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Patient Tag */}
        <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-sky-900 font-bold block">
              {patient.first_name} {patient.last_name}
            </span>
            <span className="text-sky-700 font-mono text-[11px]">{patient.health_id_number}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold uppercase">
            Patient Identity Confirmed
          </span>
        </div>

        {/* Categories Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800">
              Select Record Categories Required:
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] text-sky-700 hover:text-sky-900 font-semibold"
            >
              {selectedCategories.length === RECORD_CATEGORIES.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto p-1">
            {RECORD_CATEGORIES.map((cat) => {
              const isChecked = selectedCategories.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition text-xs ${
                    isChecked
                      ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-medium'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCategory(cat.id)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-900">{cat.label}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">{cat.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            Requested Access Duration:
          </label>
          <select
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value={1}>1 Hour (Single Consultation)</option>
            <option value={12}>12 Hours</option>
            <option value={24}>24 Hours (Standard)</option>
            <option value={72}>3 Days (72 Hours)</option>
            <option value={168}>7 Days (1 Week)</option>
            <option value={720}>30 Days (Extended Care)</option>
          </select>
        </div>

        {/* Clinical Reason */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            Clinical Purpose & Justification:
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why these records are clinically necessary..."
            className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        {/* Actions */}
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
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition"
          >
            <Send className="w-3.5 h-3.5" />
            {loading ? 'Sending Request...' : 'Send Access Request'}
          </button>
        </div>

      </form>
    </Modal>
  );
};
