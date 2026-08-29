import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { AccessibilityProvider } from './context/AccessibilityContext';

import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { DemoPersonaBar } from './components/common/DemoPersonaBar';
import { AccessibilityBar } from './components/common/AccessibilityBar';

import { PublicEmergencyProfilePage } from './pages/PublicEmergencyProfilePage';

// Landing and Auth Pages
import { LandingPage } from './pages/LandingPage';
import { PatientAuth } from './pages/auth/PatientAuth';
import { DoctorAuth } from './pages/auth/DoctorAuth';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Patient Portal Pages (original)
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { HealthIdPage } from './pages/patient/HealthIdPage';
import { MedicalRecordsPage } from './pages/patient/MedicalRecordsPage';
import { AISummaryPage } from './pages/patient/AISummaryPage';
import { ReportExplainerPage } from './pages/patient/ReportExplainerPage';
import { MultilingualTranslatorPage } from './pages/patient/MultilingualTranslatorPage';
import { AppointmentsPage } from './pages/patient/AppointmentsPage';
import { MedicinesPage } from './pages/patient/MedicinesPage';
import { EmergencyPage } from './pages/patient/EmergencyPage';
import { ConsentCenterPage } from './pages/patient/ConsentCenterPage';
import { DocumentsPage } from './pages/patient/DocumentsPage';
import { PatientSettingsPage } from './pages/patient/PatientSettingsPage';

// Patient Portal Pages (NEW — Phase 2 stubs, upgraded in later phases)
import { MyHealthPage } from './pages/patient/MyHealthPage';
import { MedicalHistoryPage } from './pages/patient/MedicalHistoryPage';
import { AyurvedaPage } from './pages/patient/AyurvedaPage';
import { HealthTimelinePage } from './pages/patient/HealthTimelinePage';
import { AIAssistantPage } from './pages/patient/AIAssistantPage';
import { SharePassportPage } from './pages/patient/SharePassportPage';

// Doctor Portal Pages (12 — unchanged)
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientSearchPage } from './pages/doctor/PatientSearchPage';
import { ConsentsPage } from './pages/doctor/ConsentsPage';
import { AuthorizedPatientsPage } from './pages/doctor/AuthorizedPatientsPage';
import { DoctorAppointmentsPage } from './pages/doctor/DoctorAppointmentsPage';
import { DoctorAvailabilityPage } from './pages/doctor/DoctorAvailabilityPage';
import { DoctorConsultationsPage } from './pages/doctor/DoctorConsultationsPage';
import { DoctorPrescriptionsPage } from './pages/doctor/DoctorPrescriptionsPage';
import { DoctorDocumentsPage } from './pages/doctor/DoctorDocumentsPage';
import { DoctorBillingPage } from './pages/doctor/DoctorBillingPage';
import { DoctorAuditPage } from './pages/doctor/DoctorAuditPage';
import { DoctorSettingsPage } from './pages/doctor/DoctorSettingsPage';

// Authenticated App Shell — Navbar + Sidebar + Accessibility Bar
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Demo Quick Switcher Banner */}
      <DemoPersonaBar />

      {/* Main Top Navigation */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Responsive Sidebar Drawer */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 transition-all overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Floating Accessibility Widget */}
      <AccessibilityBar />
    </div>
  );
};

// Protected Role Guard
const ProtectedRoute = ({ allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
        Initializing secure session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to={allowedRole === 'doctor' ? '/auth/doctor' : '/auth/patient'} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />;
  }

  return <AppLayout />;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <AccessibilityProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Marketing, Auth & Public Emergency Profile */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/emergency/:token" element={<PublicEmergencyProfilePage />} />
                <Route path="/auth/patient" element={<PatientAuth />} />
                <Route path="/auth/doctor" element={<DoctorAuth />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />

                {/* Patient Portal Protected Routes */}
                <Route element={<ProtectedRoute allowedRole="patient" />}>
                  {/* Core dashboard */}
                  <Route path="/patient/dashboard" element={<PatientDashboard />} />

                  {/* === NEW 8 Dashboard Section Routes (Phase 2+) === */}
                  <Route path="/patient/my-health"        element={<MyHealthPage />} />
                  <Route path="/patient/medical-history"  element={<MedicalHistoryPage />} />
                  <Route path="/patient/ayurveda"         element={<AyurvedaPage />} />
                  <Route path="/patient/timeline"         element={<HealthTimelinePage />} />
                  <Route path="/patient/ai-assistant"     element={<AIAssistantPage />} />
                  <Route path="/patient/share"            element={<SharePassportPage />} />

                  {/* === Preserved Original Routes (fully functional) === */}
                  <Route path="/patient/health-id"        element={<HealthIdPage />} />
                  <Route path="/patient/records"          element={<MedicalRecordsPage />} />
                  <Route path="/patient/ai-summary"       element={<AISummaryPage />} />
                  <Route path="/patient/report-explainer" element={<ReportExplainerPage />} />
                  <Route path="/patient/translator"       element={<MultilingualTranslatorPage />} />
                  <Route path="/patient/appointments"     element={<AppointmentsPage />} />
                  <Route path="/patient/medicines"        element={<MedicinesPage />} />
                  <Route path="/patient/emergency"        element={<EmergencyPage />} />
                  <Route path="/patient/consent"          element={<ConsentCenterPage />} />
                  <Route path="/patient/documents"        element={<DocumentsPage />} />
                  <Route path="/patient/settings"         element={<PatientSettingsPage />} />
                </Route>

                {/* Doctor Portal Protected Routes (unchanged) */}
                <Route element={<ProtectedRoute allowedRole="doctor" />}>
                  <Route path="/doctor/dashboard"           element={<DoctorDashboard />} />
                  <Route path="/doctor/patients"            element={<PatientSearchPage />} />
                  <Route path="/doctor/consents"            element={<ConsentsPage />} />
                  <Route path="/doctor/authorized-patients" element={<AuthorizedPatientsPage />} />
                  <Route path="/doctor/appointments"        element={<DoctorAppointmentsPage />} />
                  <Route path="/doctor/availability"        element={<DoctorAvailabilityPage />} />
                  <Route path="/doctor/consultations"       element={<DoctorConsultationsPage />} />
                  <Route path="/doctor/prescriptions"       element={<DoctorPrescriptionsPage />} />
                  <Route path="/doctor/documents"           element={<DoctorDocumentsPage />} />
                  <Route path="/doctor/billing"             element={<DoctorBillingPage />} />
                  <Route path="/doctor/audit"               element={<DoctorAuditPage />} />
                  <Route path="/doctor/settings"            element={<DoctorSettingsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AccessibilityProvider>
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
