-- ==========================================================
-- HEALTH PASSPORT - DEMO SEED DATA (5 Patients, 5 Doctors, 2 Hospitals)
-- Tagline: Your Health. Your Records. Your Control.
-- ==========================================================

-- 1. HOSPITALS
INSERT INTO hospitals (id, name, registration_id, address_line, city, state, pincode, phone, email, is_accredited) VALUES
('11000000-0000-0000-0000-000000000001', 'Apollo Multi-Specialty Super Hospital', 'HOSP-MAH-2024-001', 'Plot 14, Health City, Bandra Kurla Complex', 'Mumbai', 'Maharashtra', '400051', '+91 22 2650 9000', 'contact@apollomumbai.org', true),
('11000000-0000-0000-0000-000000000002', 'Lilavati Healthcare & Research Center', 'HOSP-MAH-2024-002', 'A-791, Bandra Reclamation, Bandra West', 'Mumbai', 'Maharashtra', '400050', '+91 22 2675 1000', 'care@lilavatihospital.com', true)
ON CONFLICT (id) DO NOTHING;

-- 2. USER ACCOUNTS (Passwords are demo hash for 'Password123!')
-- Patient Users
INSERT INTO users (id, email, phone, password_hash, role, is_verified) VALUES
('1a000000-0000-0000-0000-000000000001', 'rajesh.kumar@healthpassport.in', '+91 98201 11001', '$2a$10$wE9l1iT6N8B0KzG6.8.0.OH9Z/7G3i7v4u6s8Jq.8wP2O3N4M5K6O', 'patient', true),
('1a000000-0000-0000-0000-000000000002', 'priya.sharma@healthpassport.in', '+91 98201 11002', '$2a$10$wE9l1iT6N8B0KzG6.8.0.OH9Z/7G3i7v4u6s8Jq.8wP2O3N4M5K6O', 'patient', true),
('1a000000-0000-0000-0000-000000000003', 'anita.desai@healthpassport.in', '+91 98201 11003', '$2a$10$wE9l1iT6N8B0KzG6.8.0.OH9Z/7G3i7v4u6s8Jq.8wP2O3N4M5K6O', 'patient', true),
('1a000000-0000-0000-0000-000000000004', 'amit.patel@healthpassport.in', '+91 98201 11004', '$2a$10$wE9l1iT6N8B0KzG6.8.0.OH9Z/7G3i7v4u6s8Jq.8wP2O3N4M5K6O', 'patient', true),
('1a000000-0000-0000-0000-000000000005', 'vikram.singh@healthpassport.in', '+91 98201 11005', '$2a$10$wE9l1iT6N8B0KzG6.8.0.OH9Z/7G3i7v4u6s8Jq.8wP2O3N4M5K6O', 'patient', true),

-- Doctor Users
('2a000000-0000-0000-0000-000000000001', 'dr.anjali.mehta@healthpassport.in', '+91 98202 22001', '$2a$10$wE9l1iT6N8B0KzG6.8.0.OH9Z/7G3i7v4u6s8Jq.8wP2O3N4M5K6O', 'doctor', true),
('2a000000-0000-0000-0000-000000000002', 'dr.suresh.rao@healthpassport.in', '+91 98202 22002', '$2a$10$wE9l1iT6N8B0KzG6.8.0.OH9Z/7G3i7v4u6s8Jq.8wP2O3N4M5K6O', 'doctor', true),
('2a000000-0000-0000-0000-000000000003', 'dr.kavita.nair@healthpassport.in', '+91 98202 22003', '$2a$10$wE9l1iT6N8B0KzG6.8.0.OH9Z/7G3i7v4u6s8Jq.8wP2O3N4M5K6O', 'doctor', true),
('2a000000-0000-0000-0000-000000000004', 'dr.rahul.verma@healthpassport.in', '+91 98202 22004', '$2a$10$wE9l1iT6N8B0KzG6.8.0.OH9Z/7G3i7v4u6s8Jq.8wP2O3N4M5K6O', 'doctor', true),
('2a000000-0000-0000-0000-000000000005', 'dr.sunita.kulkarni@healthpassport.in', '+91 98202 22005', '$2a$10$wE9l1iT6N8B0KzG6.8.0.OH9Z/7G3i7v4u6s8Jq.8wP2O3N4M5K6O', 'doctor', true)
ON CONFLICT (id) DO NOTHING;

-- 3. PATIENTS DETAILS
INSERT INTO patients (id, user_id, first_name, last_name, dob, gender, blood_group, is_blood_group_verified, avatar_url, city, state, pincode, primary_language) VALUES
('10000000-0000-0000-0000-000000000001', '1a000000-0000-0000-0000-000000000001', 'Rajesh', 'Kumar', '1982-05-14', 'male', 'B+', true, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face', 'Mumbai', 'Maharashtra', '400053', 'hi'),
('10000000-0000-0000-0000-000000000002', '1a000000-0000-0000-0000-000000000002', 'Priya', 'Sharma', '1990-11-23', 'female', 'O+', true, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face', 'Pune', 'Maharashtra', '411001', 'mr'),
('10000000-0000-0000-0000-000000000003', '1a000000-0000-0000-0000-000000000003', 'Anita', 'Desai', '1975-03-08', 'female', 'A+', true, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face', 'Ahmedabad', 'Gujarat', '380009', 'gu'),
('10000000-0000-0000-0000-000000000004', '1a000000-0000-0000-0000-000000000004', 'Amit', 'Patel', '1988-08-19', 'male', 'AB+', true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', 'Bengaluru', 'Karnataka', '560001', 'ta'),
('10000000-0000-0000-0000-000000000005', '1a000000-0000-0000-0000-000000000005', 'Vikram', 'Singh', '1995-02-10', 'male', 'O-', true, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face', 'Kolkata', 'West Bengal', '700016', 'bn')
ON CONFLICT (id) DO NOTHING;

-- 4. DIGITAL HEALTH IDS
INSERT INTO health_ids (id, patient_id, health_id_number, qr_code_data, is_active) VALUES
('1d000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'HP-2026-1001', 'HP:RAJESHKUMAR:HP-2026-1001:B_POS:MUMBAI', true),
('1d000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'HP-2026-1002', 'HP:PRIYASHARMA:HP-2026-1002:O_POS:PUNE', true),
('1d000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'HP-2026-1003', 'HP:ANITADESAI:HP-2026-1003:A_POS:AHMEDABAD', true),
('1d000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'HP-2026-1004', 'HP:AMITPATEL:HP-2026-1004:AB_POS:BENGALURU', true),
('1d000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'HP-2026-1005', 'HP:VIKRAMSINGH:HP-2026-1005:O_NEG:KOLKATA', true)
ON CONFLICT (id) DO NOTHING;

-- 5. EMERGENCY PROFILES
INSERT INTO emergency_profiles (id, patient_id, verified_blood_group, allergies, major_conditions, critical_medicines, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, organ_donor) VALUES
('eb000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'B+', '["Penicillin", "Peanuts"]'::jsonb, '["Hypertension Stage 2", "Type 2 Diabetes"]'::jsonb, '["Telmisartan 40mg", "Metformin 500mg"]'::jsonb, 'Sunita Kumar', '+91 98201 99001', 'Spouse', true),
('eb000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'O+', '["Sulfa Drugs"]'::jsonb, '["Asthma (Moderate)"]'::jsonb, '["Budecort Inhaler 200mcg"]'::jsonb, 'Rohan Sharma', '+91 98201 99002', 'Brother', true),
('eb000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'A+', '["NSAIDs", "Aspirin"]'::jsonb, '["Hypothyroidism"]'::jsonb, '["Thyronorm 50mcg"]'::jsonb, 'Nilesh Desai', '+91 98201 99003', 'Spouse', false),
('eb000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'AB+', '["None known"]'::jsonb, '["Hyperlipidemia"]'::jsonb, '["Atorvastatin 10mg"]'::jsonb, 'Meera Patel', '+91 98201 99004', 'Sister', true),
('eb000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'O-', '["Latex", "Shellfish"]'::jsonb, '["Migraine"]'::jsonb, '["Sumatriptan 50mg"]'::jsonb, 'Ananya Singh', '+91 98201 99005', 'Mother', true)
ON CONFLICT (id) DO NOTHING;

-- 6. DOCTORS DETAILS
INSERT INTO doctors (id, user_id, doctor_id, first_name, last_name, specialization, qualification, experience_years, registration_number, registration_council, consultation_fee, avatar_url, bio) VALUES
('d1000000-0000-0000-0000-000000000001', '2a000000-0000-0000-0000-000000000001', 'DOC-CARD-001', 'Anjali', 'Mehta', 'Cardiologist', 'MBBS, MD (Medicine), DM (Cardiology), FACC', 14, 'MMC-2010-09823', 'Maharashtra Medical Council', 1200.00, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face', 'Senior Interventional Cardiologist specializing in preventive cardiology, coronary angioplasty, and hypertension management.'),
('d1000000-0000-0000-0000-000000000002', '2a000000-0000-0000-0000-000000000002', 'DOC-NEUR-002', 'Suresh', 'Rao', 'Neurologist', 'MBBS, MD, DM (Neurology), FINR', 18, 'MMC-2006-04512', 'Maharashtra Medical Council', 1500.00, 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face', 'Lead Neurologist with deep expertise in stroke rehabilitation, migraine protocols, and neurodegenerative disorders.'),
('d1000000-0000-0000-0000-000000000003', '2a000000-0000-0000-0000-000000000003', 'DOC-GENM-003', 'Kavita', 'Nair', 'General Physician', 'MBBS, MD (General Medicine), DNB', 10, 'MMC-2014-08129', 'Maharashtra Medical Council', 700.00, 'https://images.unsplash.com/photo-1594824813515-560e9097e88b?w=200&h=200&fit=crop&crop=face', 'Consultant Physician with extensive experience in diabetes management, infectious diseases, and holistic adult healthcare.'),
('d1000000-0000-0000-0000-000000000004', '2a000000-0000-0000-0000-000000000004', 'DOC-PED-004', 'Rahul', 'Verma', 'Pediatrician', 'MBBS, MD (Pediatrics), FIAP', 12, 'MMC-2012-07341', 'Maharashtra Medical Council', 900.00, 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face', 'Senior Pediatrician dedicated to neonatal care, child growth monitoring, vaccinations, and adolescent medicine.'),
('d1000000-0000-0000-0000-000000000005', '2a000000-0000-0000-0000-000000000005', 'DOC-ORTH-005', 'Sunita', 'Kulkarni', 'Orthopedic Surgeon', 'MBBS, MS (Orthopedics), MCh Orth (UK)', 16, 'MMC-2008-03918', 'Maharashtra Medical Council', 1400.00, 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=200&h=200&fit=crop&crop=face', 'Renowned Orthopedic Surgeon specializing in joint replacement, sports injury arthroscopy, and complex trauma.')
ON CONFLICT (id) DO NOTHING;

-- 7. DOCTOR-HOSPITAL AFFILIATIONS
INSERT INTO doctor_hospitals (id, doctor_id, hospital_id, department, is_primary) VALUES
('de000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'Cardiology & Vascular Sciences', true),
('de000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', 'Institute of Neurosciences', true),
('de000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000002', 'Internal Medicine', true),
('de000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000002', 'Pediatrics & Child Care', true),
('de000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000005', '11000000-0000-0000-0000-000000000001', 'Orthopedics & Joint Reconstruction', true)
ON CONFLICT (id) DO NOTHING;

-- 8. DOCTOR AVAILABILITY
INSERT INTO doctor_availability (id, doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, break_start_time, break_end_time, max_appointments_per_day) VALUES
('de000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 1, '09:00:00', '17:00:00', 30, '13:00:00', '14:00:00', 14),
('de000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 2, '09:00:00', '17:00:00', 30, '13:00:00', '14:00:00', 14),
('de000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 3, '09:00:00', '17:00:00', 30, '13:00:00', '14:00:00', 14),
('de000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 4, '09:00:00', '17:00:00', 30, '13:00:00', '14:00:00', 14),
('de000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 5, '09:00:00', '16:00:00', 30, '13:00:00', '14:00:00', 12)
ON CONFLICT (id) DO NOTHING;

-- 9. MEDICAL RECORDS & TIMELINE
INSERT INTO medical_records (id, patient_id, doctor_id, hospital_id, category, title, description, record_date, file_url, file_type, file_size_bytes) VALUES
('b3000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'lab_reports', 'Comprehensive Lipid Profile & HbA1c Report', 'Fasting Blood Sugar: 142 mg/dL, HbA1c: 7.4%, Total Cholesterol: 220 mg/dL, LDL: 148 mg/dL.', '2026-02-15', 'https://healthpassport.blob.core.windows.net/demo/lab_lipid_rajesh.pdf', 'pdf', 245000),
('b3000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'prescriptions', 'Hypertension & Glycemic Control Regimen', 'Prescribed Telmisartan 40mg once daily in morning and Metformin 500mg twice daily with meals.', '2026-02-16', 'https://healthpassport.blob.core.windows.net/demo/rx_rajesh_cardio.pdf', 'pdf', 180000),
('b3000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'scans', '2D Echocardiography & Doppler Study', 'Normal LV systolic function, EF 62%, mild concentric LVH consistent with chronic hypertension.', '2026-01-20', 'https://healthpassport.blob.core.windows.net/demo/echo_rajesh.pdf', 'pdf', 520000),
('b3000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000002', 'consultations', 'Quarterly Chronic Wellness Consultation', 'Patient reports occasional morning dizziness. BP reading 138/88 mmHg. Advised salt restriction and 30m brisk walking daily.', '2026-02-10', null, 'text', 12000),
('b3000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000002', 'lab_reports', 'Complete Blood Count & Allergy Screen', 'Eosinophils mildly elevated (8.2%), IgE levels 340 IU/mL indicating mild bronchial allergic reaction.', '2026-02-12', 'https://healthpassport.blob.core.windows.net/demo/cbc_priya.pdf', 'pdf', 310000)
ON CONFLICT (id) DO NOTHING;

-- 10. LAB REPORTS DETAILS
INSERT INTO lab_reports (id, record_id, patient_id, test_name, category, lab_name, specimen_collected_at, report_date, findings, summary, is_abnormal) VALUES
('1b000000-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Lipid Panel & Glycosylated Hemoglobin (HbA1c)', 'Biochemistry', 'Apollo Diagnostics Central Lab', '2026-02-15 08:30:00', '2026-02-15',
'[{"param": "Fasting Blood Sugar", "value": "142", "unit": "mg/dL", "ref_range": "70 - 99", "status": "high"}, {"param": "HbA1c", "value": "7.4", "unit": "%", "ref_range": "4.0 - 5.6", "status": "high"}, {"param": "Total Cholesterol", "value": "220", "unit": "mg/dL", "ref_range": "< 200", "status": "high"}, {"param": "LDL Cholesterol", "value": "148", "unit": "mg/dL", "ref_range": "< 100", "status": "high"}, {"param": "Triglycerides", "value": "165", "unit": "mg/dL", "ref_range": "< 150", "status": "high"}, {"param": "HDL Cholesterol", "value": "42", "unit": "mg/dL", "ref_range": "> 40", "status": "normal"}]'::jsonb,
'Elevated fasting glycemic indices and mild dyslipidemia observed. Dietary modifications and therapeutic review indicated.', true)
ON CONFLICT (id) DO NOTHING;

-- 11. PRESCRIPTIONS & PRESCRIPTION ITEMS
INSERT INTO prescriptions (id, record_id, patient_id, doctor_id, prescription_date, diagnosis_summary, follow_up_date, special_instructions) VALUES
('cc000000-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '2026-02-16', 'Hypertension Stage 2 & Type 2 Diabetes Mellitus', '2026-03-16', 'Avoid high sodium foods. Maintain a daily blood pressure and blood sugar log.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO prescription_items (id, prescription_id, medicine_name, dosage, frequency, duration_days, instructions, timing_preference) VALUES
('ca000000-0000-0000-0000-000000000001', 'cc000000-0000-0000-0000-000000000001', 'Telmisartan Tablets IP', '40 mg', 'Once daily (Morning)', 30, 'Take with water after breakfast', 'after_food'),
('ca000000-0000-0000-0000-000000000002', 'cc000000-0000-0000-0000-000000000001', 'Metformin Extended Release', '500 mg', 'Twice daily (1-0-1)', 30, 'Take immediately after lunch and dinner', 'after_food'),
('ca000000-0000-0000-0000-000000000003', 'cc000000-0000-0000-0000-000000000001', 'Atorvastatin Calcium', '10 mg', 'Once daily (Night)', 30, 'Take at bedtime', 'after_food')
ON CONFLICT (id) DO NOTHING;

-- 12. ACTIVE MEDICINES & REMINDERS
INSERT INTO medicines (id, patient_id, prescription_item_id, name, dosage, frequency, start_date, end_date, reminder_times, is_active, prescription_source, safety_notes) VALUES
('1e000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'ca000000-0000-0000-0000-000000000001', 'Telmisartan 40mg', '40mg', '1-0-0', '2026-02-16', '2026-03-18', '{08:30:00}', true, 'Dr. Anjali Mehta (Cardiologist)', 'Inform doctor if experiencing dry cough or sudden dizziness.'),
('1e000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'ca000000-0000-0000-0000-000000000002', 'Metformin ER 500mg', '500mg', '1-0-1', '2026-02-16', '2026-03-18', '{13:30:00, 20:30:00}', true, 'Dr. Anjali Mehta (Cardiologist)', 'Do not skip meals while on this medication.'),
('1e000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'ca000000-0000-0000-0000-000000000003', 'Atorvastatin 10mg', '10mg', '0-0-1', '2026-02-16', '2026-03-18', '{21:30:00}', true, 'Dr. Anjali Mehta (Cardiologist)', 'Take consistently before sleep.')
ON CONFLICT (id) DO NOTHING;

-- 13. APPOINTMENTS
INSERT INTO appointments (id, patient_id, doctor_id, hospital_id, appointment_date, start_time, end_time, status, chief_complaint, consultation_type, delay_minutes) VALUES
('ab000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', '2026-03-16', '10:30:00', '11:00:00', 'scheduled', 'Cardiac follow-up and blood pressure monitoring review', 'in_person', 0),
('ab000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000002', '2026-03-18', '11:00:00', '11:30:00', 'scheduled', 'Seasonal allergy follow-up and spirometry review', 'in_person', 10),
('ab000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', '2026-03-20', '15:00:00', '15:30:00', 'scheduled', 'Chronic migraine treatment evaluation', 'video_consult', 0)
ON CONFLICT (id) DO NOTHING;

-- 14. CONSENT REQUESTS & PERMISSIONS
INSERT INTO consent_requests (id, patient_id, doctor_id, hospital_id, requested_categories, approved_categories, duration_hours, reason, status, valid_from, valid_until) VALUES
('c7000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', ARRAY['medical_history', 'lab_reports', 'prescriptions', 'diagnoses', 'scans']::record_category_type[], ARRAY['medical_history', 'lab_reports', 'prescriptions', 'diagnoses', 'scans']::record_category_type[], 72, 'Cardiac consultation and medication titration', 'approved', NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days'),
('c7000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', ARRAY['scans', 'consultations']::record_category_type[], '{}'::record_category_type[], 24, 'Evaluation of dizziness and neurological review', 'pending', null, null)
ON CONFLICT (id) DO NOTHING;

INSERT INTO consent_permissions (id, request_id, patient_id, doctor_id, category, valid_until, is_active) VALUES
('cf000000-0000-0000-0000-000000000001', 'c7000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'lab_reports', NOW() + INTERVAL '2 days', true),
('cf000000-0000-0000-0000-000000000002', 'c7000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'prescriptions', NOW() + INTERVAL '2 days', true),
('cf000000-0000-0000-0000-000000000003', 'c7000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'scans', NOW() + INTERVAL '2 days', true)
ON CONFLICT (id) DO NOTHING;

-- 15. BILLS & PAYMENTS
INSERT INTO bills (id, bill_number, patient_id, doctor_id, hospital_id, bill_type, title, amount, tax_amount, total_amount, status, bill_date, due_date, breakdown) VALUES
('b1000000-0000-0000-0000-000000000001', 'INV-2026-0812', '10000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'consultation', 'Senior Cardiology Outpatient Consultation & ECG', 1200.00, 216.00, 1416.00, 'paid', '2026-02-16', '2026-02-16',
'[{"item": "Cardiology Specialist Consultation", "rate": 1200.00, "qty": 1, "total": 1200.00}, {"item": "12-Lead ECG Recording & Analysis", "rate": 0.00, "qty": 1, "total": 0.00}]'::jsonb),
('b1000000-0000-0000-0000-000000000002', 'INV-2026-0819', '10000000-0000-0000-0000-000000000001', null, '11000000-0000-0000-0000-000000000001', 'lab', 'Comprehensive Diagnostic Blood & Lipid Workup', 2400.00, 120.00, 2520.00, 'pending', '2026-02-15', '2026-03-01',
'[{"item": "Lipid Profile Panel", "rate": 1100.00, "qty": 1, "total": 1100.00}, {"item": "HbA1c Glycated Hemoglobin", "rate": 800.00, "qty": 1, "total": 800.00}, {"item": "Kidney Function Test (KFT)", "rate": 500.00, "qty": 1, "total": 500.00}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, bill_id, patient_id, amount, payment_method, transaction_id, payment_date, status, receipt_number) VALUES
('fa000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1416.00, 'UPI', 'UPI-TXN-882199201', '2026-02-16 11:15:00', 'success', 'REC-APOLLO-9812')
ON CONFLICT (id) DO NOTHING;

-- 16. NOTIFICATIONS
INSERT INTO notifications (id, user_id, type, title, message, link_url, is_read) VALUES
('ae000000-0000-0000-0000-000000000001', '1a000000-0000-0000-0000-000000000001', 'consent', 'New Consent Request from Dr. Suresh Rao', 'Dr. Suresh Rao requested access to Scans and Consultations for 24 hours.', '/patient/consent', false),
('ae000000-0000-0000-0000-000000000002', '1a000000-0000-0000-0000-000000000001', 'medicine', 'Morning Dose Reminder', 'Time to take Telmisartan 40mg with breakfast.', '/patient/medicines', false),
('ae000000-0000-0000-0000-000000000003', '1a000000-0000-0000-0000-000000000001', 'appointment', 'Upcoming Appointment Confirmation', 'Your appointment with Dr. Anjali Mehta is confirmed for March 16, 2026 at 10:30 AM.', '/patient/appointments', true)
ON CONFLICT (id) DO NOTHING;

-- 17. ACCESS LOGS (Immutable Audit Trail)
INSERT INTO access_logs (id, patient_id, actor_id, actor_role, actor_name, doctor_id, hospital_id, action, consent_status, ip_address, user_agent, details) VALUES
('a1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2a000000-0000-0000-0000-000000000001', 'doctor', 'Dr. Anjali Mehta', 'd1000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'view_lab_report', 'approved', '192.168.1.45', 'Chrome/124.0 (Windows NT 10.0)', '{"record_id": "b3000000-0000-0000-0000-000000000001", "category": "lab_reports"}'::jsonb),
('a1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '2a000000-0000-0000-0000-000000000001', 'doctor', 'Dr. Anjali Mehta', 'd1000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'create_prescription', 'approved', '192.168.1.45', 'Chrome/124.0 (Windows NT 10.0)', '{"prescription_id": "cc000000-0000-0000-0000-000000000001"}'::jsonb),
('a1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '2a000000-0000-0000-0000-000000000002', 'doctor', 'Dr. Suresh Rao', 'd1000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', 'search_patient', 'unauthorized', '192.168.1.80', 'Firefox/125.0 (Windows NT 10.0)', '{"health_id": "HP-2026-1001", "records_exposed": 0}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 18. SETTINGS
INSERT INTO patient_settings (id, patient_id, preferred_language, sms_notifications, email_notifications, whatsapp_notifications, appointment_reminders, medicine_reminders) VALUES
('b5000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'hi', true, true, true, true, true),
('b5000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'mr', true, true, true, true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO doctor_settings (id, doctor_id, preferred_language, auto_accept_appointments, sms_alerts, email_alerts) VALUES
('d5000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'en', true, true, true),
('d5000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'en', false, true, true)
ON CONFLICT (id) DO NOTHING;
