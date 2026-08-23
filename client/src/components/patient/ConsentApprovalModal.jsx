import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { RECORD_CATEGORIES } from '../../utils/helpers';
import { ShieldCheck, Clock, Check, X, AlertTriangle } from 'lucide-react';

export const ConsentApprovalModal = ({ isOpen, onClose, consent, onApprove, onDeny }) => {
  if (!consent) return null;

  const [selectedCategories, setSelectedCategories] = useState(
    consent.requested_categories || []
  );
  const [durationHours, setDurationHours] = useState(consent.duration_hours || 24);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleApprove = async () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one record category to approve.');
      return;
    }
    setLoading(true);
    await onApprove(consent.id, {
      approved_categories: selectedCategories,
      duration_hours: durationHours
    });
    setLoading(false);
    onClose();
  };

  const handleDeny = async () => {
    setLoading(true);
    await onDeny(consent.id);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Medical Access Request" maxWidth="max-w-lg">
      <div className="space-y-4">
        
        {/* Doctor Header */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
          <img
            src={consent.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face'}
            alt="Doctor"
            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
          />
          <div>
            <h4 className="font-bold text-sm text-slate-900">{consent.doctor_name}</h4>
            <div className="text-xs text-sky-700 font-medium">{consent.specialization}</div>
            <div className="text-[11px] text-slate-500">{consent.hospital_name}</div>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Clinical Reason for Request:
          </label>
          <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-200 text-xs text-slate-800 italic">
            "{consent.reason}"
          </div>
        </div>

        {/* Category Permissions Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700">
              Select Record Categories to Grant:
            </label>
            <span className="text-[11px] text-sky-700 font-semibold">
              {selectedCategories.length} selected
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto p-1">
            {RECORD_CATEGORIES.map((cat) => {
              const isRequested = consent.requested_categories?.includes(cat.id);
              const isChecked = selectedCategories.includes(cat.id);

              return (
                <label
                  key={cat.id}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition text-xs ${
                    isChecked
                      ? 'bg-sky-50 border-sky-300 text-sky-950 font-medium'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCategory(cat.id)}
                    className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{cat.label}</span>
                      {isRequested && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-bold uppercase">
                          Requested
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{cat.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Duration Selector */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            Access Duration (Auto-Expires):
          </label>
          <select
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value={1}>1 Hour (Single Consultation)</option>
            <option value={12}>12 Hours</option>
            <option value={24}>24 Hours (Standard)</option>
            <option value={72}>3 Days (72 Hours)</option>
            <option value={168}>7 Days (1 Week)</option>
            <option value={720}>30 Days (Extended Care)</option>
          </select>
        </div>

        {/* Security Warning */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>You can revoke this authorization at any time immediately from the Consent Center.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleDeny}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <X className="w-4 h-4" />
            Deny Access
          </button>

          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            Approve Selected Records
          </button>
        </div>

      </div>
    </Modal>
  );
};
