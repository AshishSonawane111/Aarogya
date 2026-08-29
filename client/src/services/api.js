import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization Token or Active Persona Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hp_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const demoUserId = localStorage.getItem('hp_demo_user_id');
    if (demoUserId) {
      config.headers['x-demo-user-id'] = demoUserId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  getPersonas: () => api.get('/auth/personas'),
  demoLogin: (userId) => api.post('/auth/demo-login', { userId }),
  login: (credentials) => api.post('/auth/login', credentials),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  getMe: () => api.get('/auth/me')
};

export const patientAPI = {
  getDashboard: () => api.get('/patients/dashboard'),
  getHealthId: (patientId) => api.get('/patients/health-id', { params: { patientId } }),
  getEmergency: (patientId) => api.get(`/patients/emergency/${patientId}`),
  getPublicEmergencyProfile: (token) => api.get(`/emergency-profile/${token}`),
  updateEmergency: (data) => api.put('/patients/emergency', data),
  getSettings: () => api.get('/patients/settings'),
  updateSettings: (data) => api.put('/patients/settings', data)
};

export const doctorAPI = {
  listDoctors: (params) => api.get('/doctors', { params }),
  getDashboard: () => api.get('/doctors/dashboard'),
  searchPatient: (query) => api.post('/doctors/search-patient', { query }),
  updateAvailability: (data) => api.put('/doctors/availability', data),
  getSettings: () => api.get('/doctors/settings'),
  updateSettings: (data) => api.put('/doctors/settings', data)
};

export const consentAPI = {
  listConsents: () => api.get('/consents'),
  requestConsent: (data) => api.post('/consents/request', data),
  approveConsent: (consentId, data) => api.post(`/consents/${consentId}/approve`, data),
  denyConsent: (consentId, reason) => api.post(`/consents/${consentId}/deny`, { reason }),
  revokeConsent: (consentId) => api.post(`/consents/${consentId}/revoke`)
};

export const recordAPI = {
  getRecords: (params) => api.get('/records', { params }),
  uploadRecord: (data) => api.post('/records/upload', data),
  createPrescription: (data) => api.post('/records/prescription', data),
  createConsultation: (data) => api.post('/records/consultation', data)
};

export const appointmentAPI = {
  getSlots: (doctorId, date) => api.get('/appointments/slots', { params: { doctorId, date } }),
  listAppointments: () => api.get('/appointments'),
  bookAppointment: (data) => api.post('/appointments/book', data),
  rescheduleAppointment: (appointmentId, data) => api.post(`/appointments/${appointmentId}/reschedule`, data),
  cancelAppointment: (appointmentId, reason) => api.post(`/appointments/${appointmentId}/cancel`, { reason }),
  updateStatus: (appointmentId, data) => api.patch(`/appointments/${appointmentId}/status`, data)
};

export const medicineAPI = {
  listMedicines: (patientId) => api.get('/medicines', { params: { patientId } }),
  addMedicine: (data) => api.post('/medicines', data),
  logDose: (medicineId) => api.post(`/medicines/${medicineId}/log-dose`),
  toggleActive: (medicineId) => api.patch(`/medicines/${medicineId}/toggle-active`)
};

export const billAPI = {
  listBills: () => api.get('/bills'),
  createBill: (data) => api.post('/bills', data),
  payBill: (billId, data) => api.post(`/bills/${billId}/pay`, data),
  uploadReceipt: (data) => api.post('/bills/upload-receipt', data)
};

export const aiAPI = {
  getHealthSummary: (patientId) => api.get('/ai/health-summary', { params: { patientId } }),
  getClinicalSummary: (patientId) => api.get(`/ai/clinical-summary/${patientId}`),
  explainReport: (data) => api.post('/ai/report-explainer', data),
  chat: (message, messages) => api.post('/ai/chat', { message, messages })
};

export const translateAPI = {
  getLanguages: () => api.get('/translate/languages'),
  translateText: (data) => api.post('/translate', data)
};

export const notificationAPI = {
  listNotifications: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/mark-all-read')
};

export const auditAPI = {
  listAuditLogs: () => api.get('/audit')
};

export const clinicalHistoryAPI = {
  startSession: () => api.post('/clinical-history/start'),
  submitAnswer: (sessionId, data) => api.post(`/clinical-history/${sessionId}/answer`, data),
  getPatientHistory: (patientId) => api.get(`/clinical-history/patient/${patientId}`),
  completeSession: (sessionId) => api.post(`/clinical-history/${sessionId}/complete`),
  getSession: (sessionId) => api.get(`/clinical-history/${sessionId}`),
  verifySession: (sessionId, data) => api.put(`/clinical-history/${sessionId}/verify`, data),
};

export const ayurvedaAPI = {
  getProfile: (patientId) => api.get('/ayurveda/profile', { params: { patientId } }),
  updateProfile: (data) => api.put('/ayurveda/profile', data),
  getAssessment: (patientId) => api.get(`/ayurveda/assessment/${patientId}`),
  addAssessment: (data) => api.post('/ayurveda/assessment', data),
  getMedicines: (patientId) => api.get('/ayurveda/medicines', { params: { patientId } }),
  addMedicine: (data) => api.post('/ayurveda/medicines', data),
  toggleMedicine: (id) => api.patch(`/ayurveda/medicines/${id}/toggle`),
  getTreatments: (patientId) => api.get('/ayurveda/treatments', { params: { patientId } }),
  addTreatment: (data) => api.post('/ayurveda/treatments', data),
  getResponses: (patientId) => api.get('/ayurveda/responses', { params: { patientId } }),
  addResponse: (data) => api.post('/ayurveda/responses', data),
};

export const digitizeAPI = {
  uploadAndDigitize: (formData) => api.post('/records/digitize', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getSessions: (patientId) => api.get('/records/digitize/sessions', { params: { patientId } }),
  getSession: (sessionId) => api.get(`/records/digitize/session/${sessionId}`),
  updateSession: (sessionId, data) => api.put(`/records/digitize/session/${sessionId}`, data),
  confirmSession: (sessionId) => api.post(`/records/digitize/session/${sessionId}/confirm`),
  verifySession: (sessionId, data) => api.put(`/records/digitize/session/${sessionId}/verify`, data)
};

export const timelineAPI = {
  getTimeline: (patientId) => api.get('/timeline', { params: { patientId } })
};

export default api;
