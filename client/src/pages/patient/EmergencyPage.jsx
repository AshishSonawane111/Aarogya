import React, { useState, useEffect } from 'react';
import { patientAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  ShieldAlert, 
  Droplet, 
  Phone, 
  AlertTriangle, 
  Pill, 
  HeartPulse, 
  Save, 
  CheckCircle2, 
  Lock,
  UserCheck
} from 'lucide-react';

export const EmergencyPage = () => {
  const { profile } = useAuth();
  const { addToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bloodGroup, setBloodGroup] = useState('B+');
  const [allergies, setAllergies] = useState('Penicillin, Peanuts');
  const [majorConditions, setMajorConditions] = useState('Hypertension Stage 2, Type 2 Diabetes');
  const [criticalMeds, setCriticalMeds] = useState('Telmisartan 40mg, Metformin 500mg');
  const [contactName, setContactName] = useState('Sunita Kumar');
  const [contactPhone, setContactPhone] = useState('+91 98201 99001');
  const [contactRelation, setContactRelation] = useState('Spouse');
  const [organDonor, setOrganDonor] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      patientAPI.getEmergency(profile.id).then((res) => {
        const ep = res.data?.emergency_profile;
        if (ep) {
          setBloodGroup(ep.verified_blood_group || 'B+');
          setAllergies(ep.allergies?.join(', ') || '');
          setMajorConditions(ep.major_conditions?.join(', ') || '');
          setCriticalMeds(ep.critical_medicines?.join(', ') || '');
          setContactName(ep.emergency_contact_name || '');
          setContactPhone(ep.emergency_contact_phone || '');
          setContactRelation(ep.emergency_contact_relation || '');
          setOrganDonor(ep.organ_donor || false);
        }
        setLoading(false);
      }).catch((err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await patientAPI.updateEmergency({
        allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
        major_conditions: majorConditions.split(',').map((s) => s.trim()).filter(Boolean),
        critical_medicines: criticalMeds.split(',').map((s) => s.trim()).filter(Boolean),
        emergency_contact_name: contactName,
        emergency_contact_phone: contactPhone,
        emergency_contact_relation: contactRelation,
        organ_donor: organDonor
      });

      addToast({
        title: 'Emergency Profile Updated',
        message: 'Emergency responders and verified critical care teams will see this updated dataset.',
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Update Error',
        message: err.response?.data?.error || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          Protected Emergency Medical Profile
        </h2>
        <p className="text-xs text-slate-500">
          Critical life-saving medical data accessible during emergencies. Every single access is permanently audited.
        </p>
      </div>

      {/* Emergency Header Card */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white p-6 rounded-3xl border border-rose-700/50 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider border border-rose-500/30">
              <Lock className="w-3.5 h-3.5" />
              Audited Emergency Gateway
            </div>
            <h3 className="text-lg font-bold">Fast-Response Paramedic Profile</h3>
            <p className="text-xs text-rose-200/80 max-w-xl">
              In case of trauma or acute hospital admission, emergency responders can view these verified vital indicators immediately.
            </p>
          </div>

          <div className="bg-slate-900/80 px-4 py-3 rounded-2xl border border-rose-600/40 text-center shrink-0">
            <span className="text-[10px] text-rose-400 uppercase font-bold block">Verified Blood Type</span>
            <div className="text-xl font-black text-white flex items-center justify-center gap-1 mt-0.5">
              <Droplet className="w-5 h-5 text-rose-500" />
              {bloodGroup}
            </div>
          </div>
        </div>
      </div>

      {/* Editable Emergency Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Emergency Health Parameters & Contacts
        </h3>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Primary Emergency Contact</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Sunita Kumar"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. +91 98201 99001"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Relationship</label>
            <input
              type="text"
              value={contactRelation}
              onChange={(e) => setContactRelation(e.target.value)}
              placeholder="e.g. Spouse / Parent"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
              required
            />
          </div>
        </div>

        {/* Clinical Parameters */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Known Drug / Environmental Allergies (comma separated):
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa Drugs, Peanuts"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-sky-600" />
              Major Medical Conditions (comma separated):
            </label>
            <input
              type="text"
              value={majorConditions}
              onChange={(e) => setMajorConditions(e.target.value)}
              placeholder="e.g. Hypertension Stage 2, Type 2 Diabetes Mellitus"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-emerald-600" />
              Critical Daily Medications (comma separated):
            </label>
            <input
              type="text"
              value={criticalMeds}
              onChange={(e) => setCriticalMeds(e.target.value)}
              placeholder="e.g. Telmisartan 40mg, Metformin 500mg"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Organ Donor Toggle */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <div className="font-bold text-xs text-slate-800">Organ Donor Pledge</div>
            <div className="text-[11px] text-slate-500">I voluntarily pledge my organs for life-saving transplants.</div>
          </div>
          <input
            type="checkbox"
            checked={organDonor}
            onChange={(e) => setOrganDonor(e.target.checked)}
            className="w-5 h-5 text-sky-600 rounded focus:ring-sky-500"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Encrypting & Updating...' : 'Save Emergency Health Profile'}
          </button>
        </div>

      </form>

    </div>
  );
};
