import React, { useState, useEffect } from 'react';
import { patientAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { Settings, User, Bell, Shield, Lock, Save, Globe, Smartphone, CheckCircle2 } from 'lucide-react';

export const PatientSettingsPage = () => {
  const { profile, user } = useAuth();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { addToast } = useNotification();

  const [smsNotifs, setSmsNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [waNotifs, setWaNotifs] = useState(true);
  const [aptReminders, setAptReminders] = useState(true);
  const [medReminders, setMedReminders] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [emergencyAccess, setEmergencyAccess] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    patientAPI.getSettings().then((res) => {
      const s = res.data?.settings;
      if (s) {
        setSmsNotifs(s.sms_notifications ?? true);
        setEmailNotifs(s.email_notifications ?? true);
        setWaNotifs(s.whatsapp_notifications ?? true);
        setAptReminders(s.appointment_reminders ?? true);
        setMedReminders(s.medicine_reminders ?? true);
        setTwoFactor(s.two_factor_auth ?? false);
        setEmergencyAccess(s.emergency_access_enabled ?? true);
      }
    }).catch((err) => console.error(err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await patientAPI.updateSettings({
        sms_notifications: smsNotifs,
        email_notifications: emailNotifs,
        whatsapp_notifications: waNotifs,
        appointment_reminders: aptReminders,
        medicine_reminders: medReminders,
        two_factor_auth: twoFactor,
        emergency_access_enabled: emergencyAccess
      });

      addToast({
        title: 'Settings Saved',
        message: 'Your personal preferences and privacy options have been updated.',
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
          <Settings className="w-5 h-5 text-teal-600" />
          Patient Account & Privacy Settings
        </h2>
        <p className="text-xs text-slate-500">
          Manage your communication channels, security credentials, and preferred healthcare language.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-teal-600" />
            Citizen Profile Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={`${profile?.first_name || ''} ${profile?.last_name || ''}`}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-teal-600" />
            Preferred Portal Language
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => changeLanguage(lang.code)}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition ${
                  currentLanguage === lang.code
                    ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="text-left">
                  <div className="font-bold">{lang.native}</div>
                  <div className="text-[10px] text-slate-400">{lang.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications & Reminders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-teal-600" />
            Notification & Reminder Channels
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { label: 'SMS Notifications', desc: 'Receive appointment confirmations and delay alerts via SMS', state: smsNotifs, setter: setSmsNotifs },
              { label: 'WhatsApp Health Alerts', desc: 'Medicine reminders and doctor consent requests on WhatsApp', state: waNotifs, setter: setWaNotifs },
              { label: 'Email Summaries', desc: 'Monthly health summaries and consultation notes copies', state: emailNotifs, setter: setEmailNotifs },
              { label: 'Daily Medicine Reminders', desc: 'Automated adherence reminders at scheduled dose times', state: medReminders, setter: setMedReminders }
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <div className="font-bold text-slate-800">{n.label}</div>
                  <div className="text-[11px] text-slate-500">{n.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={n.state}
                  onChange={(e) => n.setter(e.target.checked)}
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Security & Multi-Factor */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-4 h-4 text-teal-600" />
            Security & Cryptographic Privacy
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-800">Two-Factor Authentication (2FA)</div>
                <div className="text-[11px] text-slate-500">Require mobile OTP for every new login session.</div>
              </div>
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={(e) => setTwoFactor(e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-800">Emergency Override Access</div>
                <div className="text-[11px] text-slate-500">Permit accredited paramedics to access emergency profile with mandatory audit trail.</div>
              </div>
              <input
                type="checkbox"
                checked={emergencyAccess}
                onChange={(e) => setEmergencyAccess(e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </form>

    </div>
  );
};
