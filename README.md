# 🛡️ HEALTH PASSPORT
### *Your Health. Your Records. Your Control.*

A production-grade, secure, AI-powered, and multilingual digital health platform with two completely separate portals:
1. **Patient Portal** (Citizen Health Vault, AI Health Summary, AI Report Explainer, 7-Language Voice/Text Translator, Emergency Profile, Granular Consent Management, Smart Appointments, Prescriptions & Reminders, Bills & Payments)
2. **Doctor / Hospital Portal** (Zero-Trust Patient Lookup by Health ID / QR, Category-Gated Authorized Patient Profile, AI Clinical Summary, Consultation & Encounter Notes, Digital Prescription Studio, Doctor Availability Engine, Clinical Billing, Immutable Access Audit Trail)

---

## 🔒 Core Security & Zero-Trust Principle

- **Patient Ownership**: The patient owns and controls access to their medical data.
- **Protected Lookup**: Searching for a patient by Health ID or scanning a QR code returns **only basic identification** (Name, Health ID, Blood Group). **Medical records are NEVER exposed automatically.**
- **Granular Consent Workflow**:
  ```
  Doctor searches patient -> Basic ID confirmed -> Doctor requests consent (Categories + Duration + Reason)
  -> Patient receives alert & selectively approves categories -> Doctor accesses ONLY approved records
  -> Access auto-expires or can be revoked anytime -> Every action is written to an immutable Audit Log.
  ```
- **Server-Side Enforcement & Supabase RLS**: Security and category filtering are strictly enforced on the server and database layer, not merely in UI state.

---

## 🚀 Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide Icons, QRCode.react, Web Speech API (STT & TTS)
- **Backend**: Node.js, Express, REST APIs, JSON Web Tokens (JWT), BCrypt
- **Database & Storage**: Supabase PostgreSQL, Supabase Row-Level Security (RLS), Supabase Storage
- **AI Engine**: Structured Clinical Summarization, Diagnostic Report Breakdown with Disclaimers
- **Multilingual Localization**: 7 Indian Languages (English, Hindi, Marathi, Gujarati, Tamil, Telugu, Bengali) with Native Voice Synthesis

---

## 🛠️ Quick Start & Local Execution

### 1. Install Dependencies
Run the installation command in root (or install in client and server directories):
```bash
npm run install:all
```
*Or individually:*
```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Start Full-Stack Application
Start both the Express backend (port 5000) and the Vite frontend (port 5173) concurrently:
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API Server**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 👥 Demo Personas (1-Click Switcher Available)

The application includes 5 pre-loaded Indian patient personas and 5 specialized doctor personas across 2 multi-specialty hospitals:

### Demo Patients
| Name | Digital Health ID | Blood Group | Location | History / Notes |
|---|---|---|---|---|
| **Rajesh Kumar** | `HP-2026-1001` | B+ (Verified) | Mumbai | Hypertension Stage 2, Type 2 Diabetes |
| **Priya Sharma** | `HP-2026-1002` | O+ (Verified) | Pune | Moderate Bronchial Asthma |
| **Anita Desai** | `HP-2026-1003` | A+ (Verified) | Ahmedabad | Hypothyroidism |
| **Amit Patel** | `HP-2026-1004` | AB+ (Verified) | Bengaluru | Hyperlipidemia |
| **Vikram Singh** | `HP-2026-1005` | O- (Verified) | Kolkata | Migraine |

*Default patient password for standard login*: `Password123!`

### Demo Doctors
| Doctor Name | Doctor ID / Specialization | Hospital Affiliation | Consultation Fee |
|---|---|---|---|
| **Dr. Anjali Mehta** | `DOC-CARD-001` / Cardiologist | Apollo Multi-Specialty Hospital | ₹1,200 |
| **Dr. Suresh Rao** | `DOC-NEUR-002` / Neurologist | Apollo Multi-Specialty Hospital | ₹1,500 |
| **Dr. Kavita Nair** | `DOC-GENM-003` / General Physician | Lilavati Healthcare Center | ₹700 |
| **Dr. Rahul Verma** | `DOC-PED-004` / Pediatrician | Lilavati Healthcare Center | ₹900 |
| **Dr. Sunita Kulkarni** | `DOC-ORTH-005` / Orthopedic Surgeon | Apollo Multi-Specialty Hospital | ₹1,400 |

*Default doctor password for standard login*: `Password123!`

---

## 🗄️ Database Schema & Supabase PostgreSQL Setup

The project includes complete, production-ready DDL schemas and seed scripts in `server/src/database/`:
- `server/src/database/schema.sql` (29 Tables, Foreign Keys, Triggers, Custom Types, RLS Policies, and Functions)
- `server/src/database/seed.sql` (Demo data for patients, doctors, hospitals, records, prescriptions, appointments, consents, bills, audit logs)

### To connect a live Supabase project:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and create a project.
2. Run the SQL in `server/src/database/schema.sql` and `server/src/database/seed.sql` in the **SQL Editor**.
3. Create a `.env` file in `server/` with:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your_jwt_secret_key
```

*(Note: When running without Supabase credentials, Health Passport's built-in resilient storage adapter automatically loads the complete seed dataset in memory, allowing 100% full offline feature testing out of the box!)*

---

## 🌐 Supported Indian Languages

1. **English** (`en`)
2. **हिन्दी - Hindi** (`hi`)
3. **मराठी - Marathi** (`mr`)
4. **ગુજરાતી - Gujarati** (`gu`)
5. **தமிழ் - Tamil** (`ta`)
6. **తెలుగు - Telugu** (`te`)
7. **বাংলা - Bengali** (`bn`)

Features Web Speech API **Microphone Speech-to-Text** and **Text-to-Speech (TTS) Voice Synthesis** in native dialects.

---

## 🛡️ License
Proprietary healthcare software prototype built for demonstration and ABDM compliance testing.
