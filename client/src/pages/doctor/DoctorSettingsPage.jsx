import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Settings, Stethoscope, Bell, Save, Shield, Clock } from 'lucide-react';

export const DoctorSettingsPage = () => {
  const { profile, user } = useAuth();
  const { addToast } = useNotification();

  const [autoAccept, setAutoAccept] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [bufferMins, setBufferMins] = useState(5);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    doctorAPI.getSettings().then((res) => {
      const s = res.data?.settings;
      if (s) {
        setAutoAccept(s.auto_accept_appointments ?? false);
        setSmsAlerts(s.sms_alerts ?? true);
        setEmailAlerts(s.email_alerts ?? true);
        setBufferMins(s.consultation_buffer_minutes ?? 5);
      }
    }).catch((err) => console.error(err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await doctorAPI.updateSettings({
        auto_accept_appointments: autoAccept,
        sms_alerts: smsAlerts,
        email_alerts: emailAlerts,
        consultation_buffer_minutes: Number(bufferMins)
      });

      addToast({
        title: 'Doctor Settings Saved',
        message: 'Your clinical workspace preferences have been updated.',
        type: 'success'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          Doctor Workspace & Practice Settings
        </h2>
        <p className="text-xs text-slate-500">
          Manage your consultation scheduling preferences, notifications, and hospital credentials.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Stethoscope className="w-4 h-4 text-indigo-600" />
            Medical Practitioner Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Doctor Name</label>
              <input
                type="text"
                disabled
                value={`Dr. ${profile?.first_name || ''} ${profile?.last_name || ''}`}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Specialization</label>
              <input
                type="text"
                disabled
                value={profile?.specialization || 'Cardiologist'}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Registration Number</label>
              <input
                type="text"
                disabled
                value={profile?.registration_number || 'MMC-2010-09823'}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Hospital Affiliation</label>
              <input
                type="text"
                disabled
                value={profile?.hospital_name || 'Apollo Multi-Specialty Super Hospital'}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Practice Preferences */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-indigo-600" />
            Scheduling & Consultation Preferences
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-800">Automatic Appointment Acceptance</div>
                <div className="text-[11px] text-slate-500">Automatically confirm incoming patient slots without manual review.</div>
              </div>
              <input
                type="checkbox"
                checked={autoAccept}
                onChange={(e) => setAutoAccept(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-800">Consultation Buffer Interval</div>
                <div className="text-[11px] text-slate-500">Rest / sanitization buffer minutes between consecutive patient visits.</div>
              </div>
              <select
                value={bufferMins}
                onChange={(e) => setBufferMins(Number(e.target.value))}
                className="p-1.5 rounded-lg border border-slate-300 text-xs bg-white"
              >
                <option value={0}>No Buffer (0 mins)</option>
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-indigo-600" />
            Clinical Alerts & Communications
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-800">SMS Appointment Notifications</div>
                <div className="text-[11px] text-slate-500">Receive SMS notifications whenever a patient books or reschedules.</div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-800">Email Consent & Diagnostic Alerts</div>
                <div className="text-[11px] text-slate-500">Receive immediate email alerts when a patient approves your access request.</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Doctor Settings'}
          </button>
        </div>

      </form>

    </div>
  );
};
