import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  QrCode,
  FileHeart,
  Sparkles,
  FileQuestion,
  Languages,
  Calendar,
  Pill,
  ShieldAlert,
  KeyRound,
  Receipt,
  FolderOpen,
  Settings,
  Users,
  Search,
  UserCheck,
  Clock,
  FileText,
  Stethoscope,
  ActivitySquare,
  History,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isPatient, isDoctor } = useAuth();
  const { t } = useLanguage();

  const patientNavItems = [
    { to: '/patient/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/patient/health-id', icon: QrCode, label: t('healthId'), badge: 'QR' },
    { to: '/patient/records', icon: FileHeart, label: t('medicalRecords') },
    { to: '/patient/ai-summary', icon: Sparkles, label: t('aiSummary'), badge: 'AI' },
    { to: '/patient/report-explainer', icon: FileQuestion, label: t('reportExplainer'), badge: 'AI' },
    { to: '/patient/translator', icon: Languages, label: t('translator'), badge: '7 Lang' },
    { to: '/patient/appointments', icon: Calendar, label: t('appointments') },
    { to: '/patient/medicines', icon: Pill, label: t('medicines') },
    { to: '/patient/emergency', icon: ShieldAlert, label: t('emergency'), alert: true },
    { to: '/patient/consent', icon: KeyRound, label: t('consentCenter'), highlight: true },
    { to: '/patient/bills', icon: Receipt, label: t('bills') },
    { to: '/patient/documents', icon: FolderOpen, label: t('documents') },
    { to: '/patient/settings', icon: Settings, label: t('settings') }
  ];

  const doctorNavItems = [
    { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Doctor Dashboard' },
    { to: '/doctor/patients', icon: Search, label: 'Search Patient (Health ID)', highlight: true },
    { to: '/doctor/consents', icon: KeyRound, label: 'Consent Requests' },
    { to: '/doctor/authorized-patients', icon: UserCheck, label: 'Authorized Patients', badge: 'Active' },
    { to: '/doctor/appointments', icon: Calendar, label: 'Schedule & Appointments' },
    { to: '/doctor/availability', icon: Clock, label: 'Doctor Availability' },
    { to: '/doctor/consultations', icon: Stethoscope, label: 'Consultations' },
    { to: '/doctor/prescriptions', icon: Pill, label: 'Digital Prescriptions' },
    { to: '/doctor/documents', icon: FolderOpen, label: 'Clinical Documents' },
    { to: '/doctor/billing', icon: Receipt, label: 'Hospital Billing' },
    { to: '/doctor/audit', icon: History, label: 'Access Audit History', badge: 'Logs' },
    { to: '/doctor/settings', icon: Settings, label: 'Doctor Settings' }
  ];

  const items = isPatient ? patientNavItems : doctorNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-40 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 tracking-tight">HEALTH PASSPORT</div>
            <div className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider">
              {isPatient ? 'Patient Portal' : 'Doctor Portal'}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Main Navigation
          </div>

          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase group-hover:bg-slate-200">
                    {item.badge}
                  </span>
                )}

                {item.alert && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Security Assurance Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-teal-800">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Zero-Trust Security</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[10px]">
              {isPatient
                ? 'You control your data. No doctor can see records without your active consent.'
                : 'All medical records are encrypted. Patient consent is strictly enforced server-side.'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
