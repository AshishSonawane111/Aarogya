-- ==========================================================
-- HEALTH PASSPORT - COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Tagline: Your Health. Your Records. Your Control.
-- Features: 28+ tables, RLS Policies, Audit Security, Triggers
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Definitions
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'hospital_admin');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'undisclosed');
CREATE TYPE blood_group_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown');
CREATE TYPE record_category_type AS ENUM (
    'medical_history',
    'lab_reports',
    'prescriptions',
    'diagnoses',
    'hospital_records',
    'consultations',
    'scans',
    'complete_record'
);
CREATE TYPE consent_status_type AS ENUM ('pending', 'approved', 'denied', 'expired', 'revoked');
CREATE TYPE appointment_status_type AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'absent');
CREATE TYPE bill_status_type AS ENUM ('pending', 'paid', 'partially_paid', 'cancelled', 'refunded');
CREATE TYPE bill_type_enum AS ENUM ('consultation', 'lab', 'medicine', 'hospital', 'procedure');
CREATE TYPE notification_type AS ENUM ('appointment', 'medicine', 'consent', 'delay', 'bill', 'security', 'system');

-- 1. USERS TABLE (Auth integration)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    is_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE,
    gender gender_type DEFAULT 'undisclosed',
    blood_group blood_group_type DEFAULT 'unknown',
    is_blood_group_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    address_line TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    primary_language VARCHAR(50) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    qualification VARCHAR(200) NOT NULL,
    experience_years INT DEFAULT 0,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    registration_council VARCHAR(150),
    consultation_fee DECIMAL(10, 2) DEFAULT 500.00,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    registration_id VARCHAR(100) UNIQUE NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    logo_url TEXT,
    is_accredited BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DOCTOR_HOSPITALS TABLE (Many-to-Many affiliation)
CREATE TABLE IF NOT EXISTS doctor_hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    department VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HEALTH_IDS TABLE (Unique Digital Health ID)
CREATE TABLE IF NOT EXISTS health_ids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
    health_id_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. HP-2026-9812
    qr_code_data TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EMERGENCY_PROFILES TABLE (Protected Emergency Info)
CREATE TABLE IF NOT EXISTS emergency_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
    verified_blood_group blood_group_type NOT NULL DEFAULT 'unknown',
    allergies JSONB DEFAULT '[]'::jsonb,
    major_conditions JSONB DEFAULT '[]'::jsonb,
    critical_medicines JSONB DEFAULT '[]'::jsonb,
    emergency_contact_name VARCHAR(150) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    emergency_contact_relation VARCHAR(50) NOT NULL,
    secondary_contact_name VARCHAR(150),
    secondary_contact_phone VARCHAR(20),
    organ_donor BOOLEAN DEFAULT FALSE,
    access_pin_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MEDICAL_RECORDS TABLE (Universal Timeline Entry)
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    hospital_id UUID REFERENCES hospitals(id),
    category record_category_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    file_url TEXT,
    file_type VARCHAR(50),
    file_size_bytes BIGINT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_encrypted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DIAGNOSES TABLE
CREATE TABLE IF NOT EXISTS diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    condition_name VARCHAR(200) NOT NULL,
    icd_code VARCHAR(50),
    severity VARCHAR(50) DEFAULT 'moderate', -- mild, moderate, severe, chronic
    diagnosis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    is_chronic BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CONSULTATIONS TABLE
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    hospital_id UUID REFERENCES hospitals(id),
    consultation_date TIMESTAMPTZ DEFAULT NOW(),
    symptoms TEXT NOT NULL,
    clinical_assessment TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT NOT NULL,
    follow_up_recommendation TEXT,
    vital_signs JSONB DEFAULT '{"bp": "120/80", "pulse": 72, "temperature": 98.6, "weight_kg": 65, "spo2": 99}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis_summary VARCHAR(255),
    follow_up_date DATE,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PRESCRIPTION_ITEMS TABLE
CREATE TABLE IF NOT EXISTS prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL, -- e.g. 1-0-1, Once daily, After meals
    duration_days INT NOT NULL,
    instructions TEXT,
    timing_preference VARCHAR(100), -- before_food, after_food, empty_stomach
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. LAB_REPORTS TABLE
CREATE TABLE IF NOT EXISTS lab_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    test_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Blood, Biochemistry, Radiology, Urine
    lab_name VARCHAR(200) NOT NULL,
    specimen_collected_at TIMESTAMPTZ,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    findings JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    is_abnormal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. DOCUMENTS TABLE (Supabase Storage Metadata)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. DOCTOR_AVAILABILITY TABLE
CREATE TABLE IF NOT EXISTS doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    start_time TIME NOT NULL DEFAULT '09:00:00',
    end_time TIME NOT NULL DEFAULT '17:00:00',
    slot_duration_minutes INT NOT NULL DEFAULT 30,
    break_start_time TIME DEFAULT '13:00:00',
    break_end_time TIME DEFAULT '14:00:00',
    max_appointments_per_day INT DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id),
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status appointment_status_type DEFAULT 'scheduled',
    chief_complaint TEXT,
    consultation_type VARCHAR(50) DEFAULT 'in_person', -- in_person, video_consult
    cancellation_reason TEXT,
    delay_minutes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. CONSENT_REQUESTS TABLE (Zero-Trust Consent Center)
CREATE TABLE IF NOT EXISTS consent_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id),
    requested_categories record_category_type[] NOT NULL,
    approved_categories record_category_type[] DEFAULT '{}',
    duration_hours INT NOT NULL DEFAULT 24,
    reason TEXT NOT NULL,
    status consent_status_type DEFAULT 'pending',
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    denial_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. CONSENT_PERMISSIONS TABLE (Active Access Grants)
CREATE TABLE IF NOT EXISTS consent_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES consent_requests(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    category record_category_type NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. MEDICINES TABLE
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    prescription_item_id UUID REFERENCES prescription_items(id),
    name VARCHAR(150) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    reminder_times TIME[] DEFAULT '{08:00:00, 20:00:00}',
    is_active BOOLEAN DEFAULT TRUE,
    prescription_source VARCHAR(200) DEFAULT 'Dr. Consultation',
    safety_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. MEDICINE_REMINDERS TABLE (Log of daily doses)
CREATE TABLE IF NOT EXISTS medicine_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMPTZ NOT NULL,
    taken_at TIMESTAMPTZ,
    is_taken BOOLEAN DEFAULT FALSE,
    skipped_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. AI_SUMMARIES TABLE
CREATE TABLE IF NOT EXISTS ai_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id),
    summary_type VARCHAR(50) DEFAULT 'patient_overview', -- patient_overview, doctor_clinical
    allergies JSONB DEFAULT '[]'::jsonb,
    chronic_conditions JSONB DEFAULT '[]'::jsonb,
    current_medicines JSONB DEFAULT '[]'::jsonb,
    previous_hospitalizations JSONB DEFAULT '[]'::jsonb,
    recent_reports JSONB DEFAULT '[]'::jsonb,
    important_history JSONB DEFAULT '[]'::jsonb,
    raw_ai_text TEXT NOT NULL,
    authorized_categories_used record_category_type[] DEFAULT '{}',
    disclaimer_accepted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. AI_REPORT_EXPLANATIONS TABLE
CREATE TABLE IF NOT EXISTS ai_report_explanations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    report_title VARCHAR(200) NOT NULL,
    extracted_text TEXT,
    simplified_explanation TEXT NOT NULL,
    key_findings JSONB DEFAULT '[]'::jsonb,
    abnormal_values JSONB DEFAULT '[]'::jsonb,
    questions_for_doctor JSONB DEFAULT '[]'::jsonb,
    safety_disclaimer TEXT DEFAULT 'This explanation is informational and is not a medical diagnosis.',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. TRANSLATION_SESSIONS TABLE
CREATE TABLE IF NOT EXISTS translation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    source_language VARCHAR(20) NOT NULL,
    target_language VARCHAR(20) NOT NULL,
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    audio_url TEXT,
    context_type VARCHAR(50) DEFAULT 'consultation',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. BILLS TABLE
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    hospital_id UUID REFERENCES hospitals(id),
    bill_type bill_type_enum DEFAULT 'consultation',
    title VARCHAR(200) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status bill_status_type DEFAULT 'pending',
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    receipt_url TEXT,
    breakdown JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'UPI', -- UPI, Card, NetBanking, Cash
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'success',
    receipt_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. ACCESS_LOGS TABLE (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id),
    actor_role user_role NOT NULL,
    actor_name VARCHAR(150),
    doctor_id UUID REFERENCES doctors(id),
    hospital_id UUID REFERENCES hospitals(id),
    record_id UUID REFERENCES medical_records(id),
    category_accessed VARCHAR(100),
    action VARCHAR(100) NOT NULL, -- e.g. 'search_patient', 'view_emergency', 'request_consent', 'view_lab_report', 'create_prescription'
    consent_id UUID REFERENCES consent_requests(id),
    consent_status VARCHAR(50),
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. PATIENT_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS patient_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
    preferred_language VARCHAR(20) DEFAULT 'en',
    sms_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    whatsapp_notifications BOOLEAN DEFAULT TRUE,
    appointment_reminders BOOLEAN DEFAULT TRUE,
    medicine_reminders BOOLEAN DEFAULT TRUE,
    two_factor_auth BOOLEAN DEFAULT FALSE,
    biometric_login BOOLEAN DEFAULT FALSE,
    emergency_access_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 29. DOCTOR_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS doctor_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID UNIQUE REFERENCES doctors(id) ON DELETE CASCADE,
    preferred_language VARCHAR(20) DEFAULT 'en',
    auto_accept_appointments BOOLEAN DEFAULT FALSE,
    sms_alerts BOOLEAN DEFAULT TRUE,
    email_alerts BOOLEAN DEFAULT TRUE,
    digital_signature_url TEXT,
    consultation_buffer_minutes INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_report_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_settings ENABLE ROW LEVEL SECURITY;

-- Helper RLS Check: Has Active Doctor Consent for Patient & Category
CREATE OR REPLACE FUNCTION check_active_consent(
    p_patient_id UUID,
    p_doctor_id UUID,
    p_category record_category_type
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM consent_permissions cp
        JOIN consent_requests cr ON cp.request_id = cr.id
        WHERE cp.patient_id = p_patient_id
          AND cp.doctor_id = p_doctor_id
          AND (cp.category = p_category OR cp.category = 'complete_record')
          AND cp.valid_until > NOW()
          AND cp.is_active = TRUE
          AND cr.status = 'approved'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Patients RLS
CREATE POLICY "Patients view own profile" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients update own profile" ON patients
    FOR UPDATE USING (auth.uid() = user_id);

-- Doctors RLS
CREATE POLICY "Doctors view any doctor profile" ON doctors
    FOR SELECT USING (TRUE);

-- Medical Records RLS: Patient can read all; Doctor can read ONLY with active consent
CREATE POLICY "Patients read own medical records" ON medical_records
    FOR SELECT USING (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    );

CREATE POLICY "Patients create own medical records" ON medical_records
    FOR INSERT WITH CHECK (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    );

CREATE POLICY "Doctors read permitted records" ON medical_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM doctors d
            WHERE d.user_id = auth.uid()
              AND check_active_consent(medical_records.patient_id, d.id, medical_records.category)
        )
    );

-- Consent Requests RLS
CREATE POLICY "Patients view own consent requests" ON consent_requests
    FOR ALL USING (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    );

CREATE POLICY "Doctors view requested consents" ON consent_requests
    FOR ALL USING (
        doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
    );

-- Audit Access Logs RLS (Immutable, Append-Only)
CREATE POLICY "Patients view access logs on their data" ON access_logs
    FOR SELECT USING (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    );

CREATE POLICY "Doctors view access logs they created" ON access_logs
    FOR SELECT USING (
        actor_id = auth.uid()
    );

CREATE POLICY "Users insert access logs" ON access_logs
    FOR INSERT WITH CHECK (TRUE);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_health_ids_num ON health_ids(health_id_number);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id, category);
CREATE INDEX IF NOT EXISTS idx_appointments_doc_date ON appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_consent_requests_patient ON consent_requests(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_access_logs_patient ON access_logs(patient_id, created_at DESC);
