import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import doctorRoutes from './routes/doctors.js';
import consentRoutes from './routes/consents.js';
import recordRoutes from './routes/records.js';
import appointmentRoutes from './routes/appointments.js';
import medicineRoutes from './routes/medicines.js';
import billRoutes from './routes/bills.js';
import aiRoutes from './routes/ai.js';
import translateRoutes from './routes/translate.js';
import notificationRoutes from './routes/notifications.js';
import auditRoutes from './routes/audit.js';

import { errorHandler } from './middleware/error.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup to allow client requests
app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    application: 'HEALTH PASSPORT',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Public Emergency Profile concept endpoint alias
app.get('/api/emergency-profile/:token', (req, res, next) => {
  req.url = `/public-emergency/${req.params.token}`;
  patientRoutes(req, res, next);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/consents', consentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit', auditRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` 🛡️  HEALTH PASSPORT API SERVER RUNNING ON PORT ${PORT}`);
  console.log(` 🌐  Tagline: Your Health. Your Records. Your Control.`);
  console.log(` 🚀  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
