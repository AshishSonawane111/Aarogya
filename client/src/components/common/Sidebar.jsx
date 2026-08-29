import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  User,
  Stethoscope,
  Leaf,
  Pill,
  FileText,
  Calendar,
  Bot,
  Share2,
  // Utility icons
  CalendarDays,
  KeyRound,
  Settings,
  // Doctor icons
  Search,
  UserCheck,
  Clock,
  Receipt,
  FolderOpen,
  History,
  ShieldCheck,
  ActivitySquare,
} from 'lucide-react';

// ─── Patient Navigation ──────────────────────────────────────
const PATIENT_SECTIONS = [
  { to: '/patient/dashboard',       Icon: LayoutDashboard, label: 'Dashboard', exact: true },
];

const PATIENT_MAIN = [
  { to: '/patient/my-health',       Icon: User,        label: '👤 My Health' },
  { to: '/patient/medical-history', Icon: Stethoscope, label: '🩺 Medical History' },
  { to: '/patient/ayurveda',        Icon: Leaf,        label: '🌿 Ayurveda' },
  { to: '/patient/medicines',       Icon: Pill,        label: '💊 Medicines' },
  { to: '/patient/records',         Icon: FileText,    label: '📄 Reports & Documents' },
  { to: '/patient/timeline',        Icon: Calendar,    label: '📅 Health Timeline' },
  { to: '/patient/ai-assistant',    Icon: Bot,         label: '🤖 AI Assistant', badge: 'AI' },
  { to: '/patient/share',           Icon: Share2,      label: '🔗 Share Passport' },
];

const PATIENT_UTILITY = [
  { to: '/patient/appointments', Icon: CalendarDays, label: 'Appointments' },
  { to: '/patient/consent',      Icon: KeyRound,     label: 'Consent Center', highlight: true },
  { to: '/patient/settings',     Icon: Settings,     label: 'Settings' },
];

// ─── Doctor Navigation ───────────────────────────────────────
const DOCTOR_ITEMS = [
  { to: '/doctor/dashboard',           Icon: LayoutDashboard, label: 'Doctor Dashboard' },
  { to: '/doctor/patients',            Icon: Search,          label: 'Search Patient (Health ID)', highlight: true },
  { to: '/doctor/consents',            Icon: KeyRound,        label: 'Consent Requests' },
  { to: '/doctor/authorized-patients', Icon: UserCheck,       label: 'Authorized Patients', badge: 'Active' },
  { to: '/doctor/appointments',        Icon: CalendarDays,    label: 'Schedule & Appointments' },
  { to: '/doctor/availability',        Icon: Clock,           label: 'Doctor Availability' },
  { to: '/doctor/consultations',       Icon: Stethoscope,     label: 'Consultations' },
  { to: '/doctor/prescriptions',       Icon: Pill,            label: 'Digital Prescriptions' },
  { to: '/doctor/documents',           Icon: FolderOpen,      label: 'Clinical Documents' },
  { to: '/doctor/billing',             Icon: Receipt,         label: 'Hospital Billing' },
  { to: '/doctor/audit',               Icon: History,         label: 'Access Audit History', badge: 'Logs' },
  { to: '/doctor/settings',            Icon: Settings,        label: 'Doctor Settings' },
];

// ─── Reusable NavItem ─────────────────────────────────────────
const NavItem = ({ to, Icon, label, badge, highlight, alert, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
        isActive
          ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
          : highlight
          ? 'text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`
    }
    aria-label={label}
  >
    <div className="flex items-center gap-3 min-w-0">
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </div>

    {badge && (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase shrink-0 group-[.active]:bg-white/20 group-[.active]:text-white">
        {badge}
      </span>
    )}
    {alert && (
      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" aria-label="Attention required" />
    )}
  </NavLink>
);

// ─── Sidebar ─────────────────────────────────────────────────
export const Sidebar = ({ isOpen, onClose }) => {
  const { isPatient, isDoctor } = useAuth();
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-40 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 tracking-tight">HEALTH PASSPORT</div>
            <div className="text-[10px] text-sky-600 font-semibold uppercase tracking-wider">
              {isPatient ? 'Patient Portal' : 'Doctor Portal'}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5" role="navigation">
          {isPatient ? (
            <>
              {/* Dashboard */}
              {PATIENT_SECTIONS.map(item => (
                <NavItem key={item.to} {...item} onClick={onClose} />
              ))}

              {/* 8 Main Health Sections */}
              <div className="px-3 pt-4 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Health Sections
              </div>
              {PATIENT_MAIN.map(item => (
                <NavItem key={item.to} {...item} onClick={onClose} />
              ))}

              {/* Utility */}
              <div className="px-3 pt-4 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                More
              </div>
              {PATIENT_UTILITY.map(item => (
                <NavItem key={item.to} {...item} onClick={onClose} />
              ))}
            </>
          ) : (
            <>
              <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Doctor Portal
              </div>
              {DOCTOR_ITEMS.map(item => (
                <NavItem key={item.to} {...item} onClick={onClose} />
              ))}
            </>
          )}
        </nav>

        {/* Security Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sky-800">
              <ShieldCheck className="w-4 h-4 text-sky-600" aria-hidden="true" />
              <span>Zero-Trust Security</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[10px]">
              {isPatient
                ? 'You control your data. No doctor can see records without your active consent.'
                : 'All records are encrypted. Patient consent is strictly enforced server-side.'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
