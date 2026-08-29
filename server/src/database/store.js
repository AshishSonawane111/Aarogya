import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

export const generateEmergencyToken = () => 'emg_' + crypto.randomBytes(16).toString('hex');

// Live Supabase Client Initialization (if credentials exist)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
export const supabase = (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project'))
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Realistic In-Memory Seed State for resilient local execution
const initialData = {
  hospitals: [
    {
      id: '11000000-0000-0000-0000-000000000001',
      name: 'Apollo Multi-Specialty Super Hospital',
      registration_id: 'HOSP-MAH-2024-001',
      address_line: 'Plot 14, Health City, Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
      phone: '+91 22 2650 9000',
      email: 'contact@apollomumbai.org',
      is_accredited: true,
      logo_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=100&h=100&fit=crop'
    },
    {
      id: '11000000-0000-0000-0000-000000000002',
      name: 'Lilavati Healthcare & Research Center',
      registration_id: 'HOSP-MAH-2024-002',
      address_line: 'A-791, Bandra Reclamation, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      phone: '+91 22 2675 1000',
      email: 'care@lilavatihospital.com',
      is_accredited: true,
      logo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&h=100&fit=crop'
    }
  ],
  users: [
    { id: '1a000000-0000-0000-0000-000000000001', email: 'rajesh.kumar@healthpassport.in', phone: '+91 98201 11001', password: 'Password123!', role: 'patient', is_verified: true },
    { id: '1a000000-0000-0000-0000-000000000002', email: 'priya.sharma@healthpassport.in', phone: '+91 98201 11002', password: 'Password123!', role: 'patient', is_verified: true },
    { id: '1a000000-0000-0000-0000-000000000003', email: 'anita.desai@healthpassport.in', phone: '+91 98201 11003', password: 'Password123!', role: 'patient', is_verified: true },
    { id: '1a000000-0000-0000-0000-000000000004', email: 'amit.patel@healthpassport.in', phone: '+91 98201 11004', password: 'Password123!', role: 'patient', is_verified: true },
    { id: '1a000000-0000-0000-0000-000000000005', email: 'vikram.singh@healthpassport.in', phone: '+91 98201 11005', password: 'Password123!', role: 'patient', is_verified: true },

    { id: '2a000000-0000-0000-0000-000000000001', email: 'dr.anjali.mehta@healthpassport.in', phone: '+91 98202 22001', password: 'Password123!', role: 'doctor', is_verified: true },
    { id: '2a000000-0000-0000-0000-000000000002', email: 'dr.suresh.rao@healthpassport.in', phone: '+91 98202 22002', password: 'Password123!', role: 'doctor', is_verified: true },
    { id: '2a000000-0000-0000-0000-000000000003', email: 'dr.kavita.nair@healthpassport.in', phone: '+91 98202 22003', password: 'Password123!', role: 'doctor', is_verified: true },
    { id: '2a000000-0000-0000-0000-000000000004', email: 'dr.rahul.verma@healthpassport.in', phone: '+91 98202 22004', password: 'Password123!', role: 'doctor', is_verified: true },
    { id: '2a000000-0000-0000-0000-000000000005', email: 'dr.sunita.kulkarni@healthpassport.in', phone: '+91 98202 22005', password: 'Password123!', role: 'doctor', is_verified: true }
  ],
  patients: [
    {
      id: '10000000-0000-0000-0000-000000000001',
      user_id: '1a000000-0000-0000-0000-000000000001',
      first_name: 'Rajesh',
      last_name: 'Kumar',
      dob: '1982-05-14',
      gender: 'male',
      blood_group: 'B+',
      is_blood_group_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      primary_language: 'hi'
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      user_id: '1a000000-0000-0000-0000-000000000002',
      first_name: 'Priya',
      last_name: 'Sharma',
      dob: '1990-11-23',
      gender: 'female',
      blood_group: 'O+',
      is_blood_group_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      primary_language: 'mr'
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      user_id: '1a000000-0000-0000-0000-000000000003',
      first_name: 'Anita',
      last_name: 'Desai',
      dob: '1975-03-08',
      gender: 'female',
      blood_group: 'A+',
      is_blood_group_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380009',
      primary_language: 'gu'
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      user_id: '1a000000-0000-0000-0000-000000000004',
      first_name: 'Amit',
      last_name: 'Patel',
      dob: '1988-08-19',
      gender: 'male',
      blood_group: 'AB+',
      is_blood_group_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      primary_language: 'ta'
    },
    {
      id: '10000000-0000-0000-0000-000000000005',
      user_id: '1a000000-0000-0000-0000-000000000005',
      first_name: 'Vikram',
      last_name: 'Singh',
      dob: '1995-02-10',
      gender: 'male',
      blood_group: 'O-',
      is_blood_group_verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016',
      primary_language: 'bn'
    }
  ],
  doctors: [
    {
      id: 'd1000000-0000-0000-0000-000000000001',
      user_id: '2a000000-0000-0000-0000-000000000001',
      doctor_id: 'DOC-CARD-001',
      first_name: 'Anjali',
      last_name: 'Mehta',
      specialization: 'Cardiologist',
      qualification: 'MBBS, MD (Medicine), DM (Cardiology), FACC',
      experience_years: 14,
      registration_number: 'MMC-2010-09823',
      registration_council: 'Maharashtra Medical Council',
      consultation_fee: 1200.00,
      avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
      bio: 'Senior Interventional Cardiologist specializing in preventive cardiology, coronary angioplasty, and hypertension management.',
      hospital_name: 'Apollo Multi-Specialty Super Hospital'
    },
    {
      id: 'd1000000-0000-0000-0000-000000000002',
      user_id: '2a000000-0000-0000-0000-000000000002',
      doctor_id: 'DOC-NEUR-002',
      first_name: 'Suresh',
      last_name: 'Rao',
      specialization: 'Neurologist',
      qualification: 'MBBS, MD, DM (Neurology), FINR',
      experience_years: 18,
      registration_number: 'MMC-2006-04512',
      registration_council: 'Maharashtra Medical Council',
      consultation_fee: 1500.00,
      avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
      bio: 'Lead Neurologist with deep expertise in stroke rehabilitation, migraine protocols, and neurodegenerative disorders.',
      hospital_name: 'Apollo Multi-Specialty Super Hospital'
    },
    {
      id: 'd1000000-0000-0000-0000-000000000003',
      user_id: '2a000000-0000-0000-0000-000000000003',
      doctor_id: 'DOC-GENM-003',
      first_name: 'Kavita',
      last_name: 'Nair',
      specialization: 'General Physician',
      qualification: 'MBBS, MD (General Medicine), DNB',
      experience_years: 10,
      registration_number: 'MMC-2014-08129',
      registration_council: 'Maharashtra Medical Council',
      consultation_fee: 700.00,
      avatar_url: 'https://images.unsplash.com/photo-1594824813515-560e9097e88b?w=200&h=200&fit=crop&crop=face',
      bio: 'Consultant Physician with extensive experience in diabetes management, infectious diseases, and holistic adult healthcare.',
      hospital_name: 'Lilavati Healthcare & Research Center'
    },
    {
      id: 'd1000000-0000-0000-0000-000000000004',
      user_id: '2a000000-0000-0000-0000-000000000004',
      doctor_id: 'DOC-PED-004',
      first_name: 'Rahul',
      last_name: 'Verma',
      specialization: 'Pediatrician',
      qualification: 'MBBS, MD (Pediatrics), FIAP',
      experience_years: 12,
      registration_number: 'MMC-2012-07341',
      registration_council: 'Maharashtra Medical Council',
      consultation_fee: 900.00,
      avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
      bio: 'Senior Pediatrician dedicated to neonatal care, child growth monitoring, vaccinations, and adolescent medicine.',
      hospital_name: 'Lilavati Healthcare & Research Center'
    },
    {
      id: 'd1000000-0000-0000-0000-000000000005',
      user_id: '2a000000-0000-0000-0000-000000000005',
      doctor_id: 'DOC-ORTH-005',
      first_name: 'Sunita',
      last_name: 'Kulkarni',
      specialization: 'Orthopedic Surgeon',
      qualification: 'MBBS, MS (Orthopedics), MCh Orth (UK)',
      experience_years: 16,
      registration_number: 'MMC-2008-03918',
      registration_council: 'Maharashtra Medical Council',
      consultation_fee: 1400.00,
      avatar_url: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=200&h=200&fit=crop&crop=face',
      bio: 'Renowned Orthopedic Surgeon specializing in joint replacement, sports injury arthroscopy, and complex trauma.',
      hospital_name: 'Apollo Multi-Specialty Super Hospital'
    }
  ],
  health_ids: [
    { id: '1d000000-0000-0000-0000-000000000001', patient_id: '10000000-0000-0000-0000-000000000001', health_id_number: 'HP-2026-1001', qr_code_data: 'HP:RAJESHKUMAR:HP-2026-1001:B_POS:MUMBAI', is_active: true },
    { id: '1d000000-0000-0000-0000-000000000002', patient_id: '10000000-0000-0000-0000-000000000002', health_id_number: 'HP-2026-1002', qr_code_data: 'HP:PRIYASHARMA:HP-2026-1002:O_POS:PUNE', is_active: true },
    { id: '1d000000-0000-0000-0000-000000000003', patient_id: '10000000-0000-0000-0000-000000000003', health_id_number: 'HP-2026-1003', qr_code_data: 'HP:ANITADESAI:HP-2026-1003:A_POS:AHMEDABAD', is_active: true },
    { id: '1d000000-0000-0000-0000-000000000004', patient_id: '10000000-0000-0000-0000-000000000004', health_id_number: 'HP-2026-1004', qr_code_data: 'HP:AMITPATEL:HP-2026-1004:AB_POS:BENGALURU', is_active: true },
    { id: '1d000000-0000-0000-0000-000000000005', patient_id: '10000000-0000-0000-0000-000000000005', health_id_number: 'HP-2026-1005', qr_code_data: 'HP:VIKRAMSINGH:HP-2026-1005:O_NEG:KOLKATA', is_active: true }
  ],
  emergency_profiles: [
    {
      id: 'eb000000-0000-0000-0000-000000000001',
      patient_id: '10000000-0000-0000-0000-000000000001',
      qr_token: generateEmergencyToken(),
      verified_blood_group: 'B+',
      allergies: ['Penicillin', 'Peanuts'],
      major_conditions: ['Hypertension Stage 2', 'Type 2 Diabetes'],
      critical_medicines: ['Telmisartan 40mg', 'Metformin 500mg'],
      emergency_instructions: 'In case of trauma or severe allergic reaction, administer Epinephrine and check for penicillin allergy.',
      special_precautions: 'Check blood sugar before administering high-dose IV dextrose solution.',
      emergency_contact_name: 'Sunita Kumar',
      emergency_contact_phone: '+91 98201 99001',
      emergency_contact_relation: 'Spouse',
      secondary_contact_name: 'Aakash Kumar',
      secondary_contact_phone: '+91 98201 99009',
      organ_donor: true,
      updated_at: '2026-08-20T10:30:00Z',
      is_active: true
    },
    {
      id: 'eb000000-0000-0000-0000-000000000002',
      patient_id: '10000000-0000-0000-0000-000000000002',
      qr_token: generateEmergencyToken(),
      verified_blood_group: 'O+',
      allergies: ['Sulfa Drugs'],
      major_conditions: ['Asthma (Moderate)'],
      critical_medicines: ['Budecort Inhaler 200mcg'],
      emergency_instructions: 'Asthma exacerbation protocol: Provide Nebulized Salbutamol if in respiratory distress.',
      special_precautions: 'Avoid non-selective beta-blockers due to bronchospasm risk.',
      emergency_contact_name: 'Rohan Sharma',
      emergency_contact_phone: '+91 98201 99002',
      emergency_contact_relation: 'Brother',
      organ_donor: true,
      updated_at: '2026-08-18T14:15:00Z',
      is_active: true
    },
    {
      id: 'eb000000-0000-0000-0000-000000000003',
      patient_id: '10000000-0000-0000-0000-000000000003',
      qr_token: generateEmergencyToken(),
      verified_blood_group: 'A+',
      allergies: ['NSAIDs', 'Aspirin'],
      major_conditions: ['Hypothyroidism'],
      critical_medicines: ['Thyronorm 50mcg'],
      emergency_instructions: 'Severe pain relief: Use Acetaminophen/Paracetamol instead of NSAIDs or Aspirin.',
      special_precautions: 'Patient is sensitive to Aspirin-induced asthma.',
      emergency_contact_name: 'Nilesh Desai',
      emergency_contact_phone: '+91 98201 99003',
      emergency_contact_relation: 'Spouse',
      organ_donor: false,
      updated_at: '2026-08-15T09:00:00Z',
      is_active: true
    },
    {
      id: 'eb000000-0000-0000-0000-000000000004',
      patient_id: '10000000-0000-0000-0000-000000000004',
      qr_token: generateEmergencyToken(),
      verified_blood_group: 'AB+',
      allergies: ['None known'],
      major_conditions: ['Hyperlipidemia'],
      critical_medicines: ['Atorvastatin 10mg'],
      emergency_instructions: 'Standard emergency protocols apply.',
      special_precautions: 'No specific drug interaction alerts.',
      emergency_contact_name: 'Meera Patel',
      emergency_contact_phone: '+91 98201 99004',
      emergency_contact_relation: 'Sister',
      organ_donor: true,
      updated_at: '2026-08-10T11:45:00Z',
      is_active: true
    },
    {
      id: 'eb000000-0000-0000-0000-000000000005',
      patient_id: '10000000-0000-0000-0000-000000000005',
      qr_token: generateEmergencyToken(),
      verified_blood_group: 'O-',
      allergies: ['Latex', 'Shellfish'],
      major_conditions: ['Migraine'],
      critical_medicines: ['Sumatriptan 50mg'],
      emergency_instructions: 'Use non-latex medical gloves during clinical examination and procedures.',
      special_precautions: 'Latex allergy alert.',
      emergency_contact_name: 'Ananya Singh',
      emergency_contact_phone: '+91 98201 99005',
      emergency_contact_relation: 'Mother',
      organ_donor: true,
      updated_at: '2026-08-12T16:20:00Z',
      is_active: true
    }
  ],
  medical_records: [
    {
      id: 'b3000000-0000-0000-0000-000000000001',
      patient_id: '10000000-0000-0000-0000-000000000001',
      doctor_id: 'd1000000-0000-0000-0000-000000000001',
      hospital_id: '11000000-0000-0000-0000-000000000001',
      category: 'lab_reports',
      title: 'Comprehensive Lipid Profile & HbA1c Report',
      description: 'Fasting Blood Sugar: 142 mg/dL, HbA1c: 7.4%, Total Cholesterol: 220 mg/dL, LDL: 148 mg/dL.',
      record_date: '2026-02-15',
      file_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
      file_type: 'pdf',
      file_size_bytes: 245000,
      metadata: {
        lab_name: 'Apollo Diagnostics Central Lab',
        test_name: 'Lipid Panel & HbA1c',
        is_abnormal: true,
        findings: [
          { param: 'Fasting Blood Sugar', value: '142', unit: 'mg/dL', ref_range: '70 - 99', status: 'high' },
          { param: 'HbA1c', value: '7.4', unit: '%', ref_range: '4.0 - 5.6', status: 'high' },
          { param: 'Total Cholesterol', value: '220', unit: 'mg/dL', ref_range: '< 200', status: 'high' },
          { param: 'LDL Cholesterol', value: '148', unit: 'mg/dL', ref_range: '< 100', status: 'high' }
        ]
      }
    },
    {
      id: 'b3000000-0000-0000-0000-000000000002',
      patient_id: '10000000-0000-0000-0000-000000000001',
      doctor_id: 'd1000000-0000-0000-0000-000000000001',
      hospital_id: '11000000-0000-0000-0000-000000000001',
      category: 'prescriptions',
      title: 'Hypertension & Glycemic Control Regimen',
      description: 'Prescribed Telmisartan 40mg once daily in morning and Metformin 500mg twice daily with meals.',
      record_date: '2026-02-16',
      file_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
      file_type: 'pdf',
      file_size_bytes: 180000,
      metadata: {
        doctor_name: 'Dr. Anjali Mehta',
        diagnosis: 'Hypertension Stage 2, Type 2 Diabetes',
        medicines: [
          { name: 'Telmisartan Tablets IP', dosage: '40 mg', frequency: 'Once daily (Morning)', duration: '30 Days' },
          { name: 'Metformin Extended Release', dosage: '500 mg', frequency: 'Twice daily (1-0-1)', duration: '30 Days' },
          { name: 'Atorvastatin Calcium', dosage: '10 mg', frequency: 'Once daily (Night)', duration: '30 Days' }
        ]
      }
    },
    {
      id: 'b3000000-0000-0000-0000-000000000003',
      patient_id: '10000000-0000-0000-0000-000000000001',
      doctor_id: 'd1000000-0000-0000-0000-000000000001',
      hospital_id: '11000000-0000-0000-0000-000000000001',
      category: 'scans',
      title: '2D Echocardiography & Color Doppler Study',
      description: 'Normal LV systolic function, LVEF 62%, mild concentric left ventricular hypertrophy consistent with chronic arterial hypertension.',
      record_date: '2026-01-20',
      file_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800',
      file_type: 'pdf',
      file_size_bytes: 520000
    },
    {
      id: 'b3000000-0000-0000-0000-000000000004',
      patient_id: '10000000-0000-0000-0000-000000000001',
      doctor_id: 'd1000000-0000-0000-0000-000000000003',
      hospital_id: '11000000-0000-0000-0000-000000000002',
      category: 'consultations',
      title: 'Quarterly Chronic Wellness Review & Vitals',
      description: 'Patient reports occasional morning lightheadedness. BP reading 138/88 mmHg. Advised dietary sodium restriction (<2g/day) and 30m brisk walking.',
      record_date: '2026-02-10',
      file_url: null,
      file_type: 'text',
      file_size_bytes: 12000,
      metadata: {
        vitals: { bp: '138/88 mmHg', pulse: '74 bpm', weight: '76 kg', bmi: '25.8' },
        assessment: 'Stable on current anti-hypertensive medication. Continue lifestyle interventions.'
      }
    },
    {
      id: 'b3000000-0000-0000-0000-000000000005',
      patient_id: '10000000-0000-0000-0000-000000000002',
      doctor_id: 'd1000000-0000-0000-0000-000000000003',
      hospital_id: '11000000-0000-0000-0000-000000000002',
      category: 'lab_reports',
      title: 'Complete Blood Count & Allergy Screen',
      description: 'Eosinophils mildly elevated (8.2%), Total IgE levels 340 IU/mL indicating mild allergic bronchial hyperactivity.',
      record_date: '2026-02-12',
      file_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
      file_type: 'pdf',
      file_size_bytes: 310000
    }
  ],
  medicines: [
    {
      id: '1e000000-0000-0000-0000-000000000001',
      patient_id: '10000000-0000-0000-0000-000000000001',
      name: 'Telmisartan 40mg',
      dosage: '40mg',
      frequency: 'Once daily (Morning)',
      start_date: '2026-02-16',
      end_date: '2026-03-18',
      reminder_times: ['08:30'],
      is_active: true,
      prescription_source: 'Dr. Anjali Mehta (Cardiologist)',
      safety_notes: 'Inform doctor if experiencing dry cough, swelling, or sudden dizziness.'
    },
    {
      id: '1e000000-0000-0000-0000-000000000002',
      patient_id: '10000000-0000-0000-0000-000000000001',
      name: 'Metformin ER 500mg',
      dosage: '500mg',
      frequency: 'Twice daily (1-0-1)',
      start_date: '2026-02-16',
      end_date: '2026-03-18',
      reminder_times: ['13:30', '20:30'],
      is_active: true,
      prescription_source: 'Dr. Anjali Mehta (Cardiologist)',
      safety_notes: 'Do not skip meals while taking this medication. Avoid alcohol.'
    },
    {
      id: '1e000000-0000-0000-0000-000000000003',
      patient_id: '10000000-0000-0000-0000-000000000001',
      name: 'Atorvastatin 10mg',
      dosage: '10mg',
      frequency: 'Once daily (Night)',
      start_date: '2026-02-16',
      end_date: '2026-03-18',
      reminder_times: ['21:30'],
      is_active: true,
      prescription_source: 'Dr. Anjali Mehta (Cardiologist)',
      safety_notes: 'Take consistently at bedtime.'
    }
  ],
  appointments: [
    {
      id: 'ab000000-0000-0000-0000-000000000001',
      patient_id: '10000000-0000-0000-0000-000000000001',
      doctor_id: 'd1000000-0000-0000-0000-000000000001',
      hospital_id: '11000000-0000-0000-0000-000000000001',
      appointment_date: '2026-03-16',
      start_time: '10:30',
      end_time: '11:00',
      status: 'scheduled',
      chief_complaint: 'Cardiac follow-up and blood pressure monitoring review',
      consultation_type: 'in_person',
      delay_minutes: 0
    },
    {
      id: 'ab000000-0000-0000-0000-000000000002',
      patient_id: '10000000-0000-0000-0000-000000000002',
      doctor_id: 'd1000000-0000-0000-0000-000000000003',
      hospital_id: '11000000-0000-0000-0000-000000000002',
      appointment_date: '2026-03-18',
      start_time: '11:00',
      end_time: '11:30',
      status: 'scheduled',
      chief_complaint: 'Seasonal allergy follow-up and spirometry review',
      consultation_type: 'in_person',
      delay_minutes: 10
    },
    {
      id: 'ab000000-0000-0000-0000-000000000003',
      patient_id: '10000000-0000-0000-0000-000000000003',
      doctor_id: 'd1000000-0000-0000-0000-000000000002',
      hospital_id: '11000000-0000-0000-0000-000000000001',
      appointment_date: '2026-03-20',
      start_time: '15:00',
      end_time: '15:30',
      status: 'scheduled',
      chief_complaint: 'Chronic migraine treatment evaluation',
      consultation_type: 'video_consult',
      delay_minutes: 0
    }
  ],
  consent_requests: [
    {
      id: 'c7000000-0000-0000-0000-000000000001',
      patient_id: '10000000-0000-0000-0000-000000000001',
      doctor_id: 'd1000000-0000-0000-0000-000000000001',
      hospital_id: '11000000-0000-0000-0000-000000000001',
      requested_categories: ['medical_history', 'lab_reports', 'prescriptions', 'diagnoses', 'scans'],
      approved_categories: ['medical_history', 'lab_reports', 'prescriptions', 'diagnoses', 'scans'],
      duration_hours: 72,
      reason: 'Cardiac consultation and medication titration',
      status: 'approved',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      valid_from: new Date(Date.now() - 86400000).toISOString(),
      valid_until: new Date(Date.now() + 172800000).toISOString()
    },
    {
      id: 'c7000000-0000-0000-0000-000000000002',
      patient_id: '10000000-0000-0000-0000-000000000001',
      doctor_id: 'd1000000-0000-0000-0000-000000000002',
      hospital_id: '11000000-0000-0000-0000-000000000001',
      requested_categories: ['scans', 'consultations'],
      approved_categories: [],
      duration_hours: 24,
      reason: 'Evaluation of dizziness and neurological review',
      status: 'pending',
      created_at: new Date().toISOString(),
      valid_from: null,
      valid_until: null
    }
  ],
  bills: [
    {
      id: 'b1000000-0000-0000-0000-000000000001',
      bill_number: 'INV-2026-0812',
      patient_id: '10000000-0000-0000-0000-000000000001',
      doctor_id: 'd1000000-0000-0000-0000-000000000001',
      hospital_id: '11000000-0000-0000-0000-000000000001',
      bill_type: 'consultation',
      title: 'Senior Cardiology Outpatient Consultation & ECG',
      amount: 1200.00,
      tax_amount: 216.00,
      total_amount: 1416.00,
      status: 'paid',
      bill_date: '2026-02-16',
      due_date: '2026-02-16',
      payment_method: 'UPI',
      transaction_id: 'UPI-TXN-882199201',
      receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
      breakdown: [
        { item: 'Cardiology Specialist Consultation', rate: 1200.00, qty: 1, total: 1200.00 },
        { item: '12-Lead ECG Recording & Analysis', rate: 0.00, qty: 1, total: 0.00 }
      ]
    },
    {
      id: 'b1000000-0000-0000-0000-000000000002',
      bill_number: 'INV-2026-0819',
      patient_id: '10000000-0000-0000-0000-000000000001',
      doctor_id: null,
      hospital_id: '11000000-0000-0000-0000-000000000001',
      bill_type: 'lab',
      title: 'Comprehensive Diagnostic Blood & Lipid Workup',
      amount: 2400.00,
      tax_amount: 120.00,
      total_amount: 2520.00,
      status: 'pending',
      bill_date: '2026-02-15',
      due_date: '2026-03-01',
      payment_method: null,
      transaction_id: null,
      receipt_url: null,
      breakdown: [
        { item: 'Lipid Profile Panel', rate: 1100.00, qty: 1, total: 1100.00 },
        { item: 'HbA1c Glycated Hemoglobin', rate: 800.00, qty: 1, total: 800.00 },
        { item: 'Kidney Function Test (KFT)', rate: 500.00, qty: 1, total: 500.00 }
      ]
    }
  ],
  notifications: [
    {
      id: 'ae000000-0000-0000-0000-000000000001',
      user_id: '1a000000-0000-0000-0000-000000000001',
      type: 'consent',
      title: 'New Consent Request from Dr. Suresh Rao',
      message: 'Dr. Suresh Rao (Neurologist) requested access to your Scans and Consultations records for 24 hours.',
      link_url: '/patient/consent',
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'ae000000-0000-0000-0000-000000000002',
      user_id: '1a000000-0000-0000-0000-000000000001',
      type: 'medicine',
      title: 'Daily Medication Reminder',
      message: 'Take Telmisartan 40mg with morning breakfast as prescribed.',
      link_url: '/patient/medicines',
      is_read: false,
      created_at: new Date(Date.now() - 14400000).toISOString()
    },
    {
      id: 'ae000000-0000-0000-0000-000000000003',
      user_id: '1a000000-0000-0000-0000-000000000001',
      type: 'appointment',
      title: 'Upcoming Appointment Confirmed',
      message: 'Your consultation with Dr. Anjali Mehta is confirmed for March 16, 2026 at 10:30 AM.',
      link_url: '/patient/appointments',
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  access_logs: [
    {
      id: 'a1000000-0000-0000-0000-000000000001',
      patient_id: '10000000-0000-0000-0000-000000000001',
      actor_id: '2a000000-0000-0000-0000-000000000001',
      actor_role: 'doctor',
      actor_name: 'Dr. Anjali Mehta',
      doctor_id: 'd1000000-0000-0000-0000-000000000001',
      hospital_id: '11000000-0000-0000-0000-000000000001',
      action: 'view_lab_report',
      category_accessed: 'lab_reports',
      consent_status: 'approved',
      ip_address: '192.168.1.45',
      user_agent: 'Chrome/124.0 (Windows NT 10.0)',
      details: { record_id: 'b3000000-0000-0000-0000-000000000001', title: 'Comprehensive Lipid Profile & HbA1c Report' },
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'a1000000-0000-0000-0000-000000000002',
      patient_id: '10000000-0000-0000-0000-000000000001',
      actor_id: '2a000000-0000-0000-0000-000000000001',
      actor_role: 'doctor',
      actor_name: 'Dr. Anjali Mehta',
      doctor_id: 'd1000000-0000-0000-0000-000000000001',
      hospital_id: '11000000-0000-0000-0000-000000000001',
      action: 'create_prescription',
      category_accessed: 'prescriptions',
      consent_status: 'approved',
      ip_address: '192.168.1.45',
      user_agent: 'Chrome/124.0 (Windows NT 10.0)',
      details: { record_id: 'b3000000-0000-0000-0000-000000000002', rx: 'Telmisartan + Metformin + Atorvastatin' },
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'a1000000-0000-0000-0000-000000000003',
      patient_id: '10000000-0000-0000-0000-000000000001',
      actor_id: '2a000000-0000-0000-0000-000000000002',
      actor_role: 'doctor',
      actor_name: 'Dr. Suresh Rao',
      doctor_id: 'd1000000-0000-0000-0000-000000000002',
      hospital_id: '11000000-0000-0000-0000-000000000001',
      action: 'search_patient',
      category_accessed: 'basic_identification',
      consent_status: 'unauthorized',
      ip_address: '192.168.1.80',
      user_agent: 'Firefox/125.0 (Windows NT 10.0)',
      details: { health_id: 'HP-2026-1001', records_exposed: 0, status: 'Consent requested' },
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  doctor_availability: [
    {
      doctor_id: 'd1000000-0000-0000-0000-000000000001',
      working_days: [1, 2, 3, 4, 5],
      start_time: '09:00',
      end_time: '17:00',
      slot_duration_minutes: 30,
      break_start: '13:00',
      break_end: '14:00',
      blocked_dates: []
    },
    {
      doctor_id: 'd1000000-0000-0000-0000-000000000002',
      working_days: [1, 2, 3, 4, 5, 6],
      start_time: '10:00',
      end_time: '18:00',
      slot_duration_minutes: 30,
      break_start: '13:30',
      break_end: '14:30',
      blocked_dates: []
    },
    {
      doctor_id: 'd1000000-0000-0000-0000-000000000003',
      working_days: [1, 2, 3, 4, 5],
      start_time: '08:30',
      end_time: '16:30',
      slot_duration_minutes: 20,
      break_start: '12:30',
      break_end: '13:30',
      blocked_dates: []
    },
    {
      doctor_id: 'd1000000-0000-0000-0000-000000000004',
      working_days: [1, 2, 3, 4, 5, 6],
      start_time: '09:00',
      end_time: '15:00',
      slot_duration_minutes: 30,
      break_start: '12:00',
      break_end: '13:00',
      blocked_dates: []
    },
    {
      doctor_id: 'd1000000-0000-0000-0000-000000000005',
      working_days: [1, 3, 5],
      start_time: '10:00',
      end_time: '17:00',
      slot_duration_minutes: 45,
      break_start: '13:00',
      break_end: '14:00',
      blocked_dates: []
    }
  ],
  documents: [
    {
      id: 'doc00000-0000-0000-0000-000000000001',
      patient_id: '10000000-0000-0000-0000-000000000001',
      title: 'Apollo Discharge Summary 2025',
      document_type: 'Discharge Summary',
      file_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
      created_at: '2025-11-10T10:00:00Z',
      file_size_bytes: 420000
    },
    {
      id: 'doc00000-0000-0000-0000-000000000002',
      patient_id: '10000000-0000-0000-0000-000000000001',
      title: 'COVID-19 Vaccination Certificate (Booster)',
      document_type: 'Immunization Record',
      file_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
      created_at: '2024-05-18T10:00:00Z',
      file_size_bytes: 180000
    }
  ],
  settings: {
    patient: {
      preferred_language: 'en',
      sms_notifications: true,
      email_notifications: true,
      whatsapp_notifications: true,
      appointment_reminders: true,
      medicine_reminders: true,
      two_factor_auth: false,
      emergency_access_enabled: true
    },
    doctor: {
      preferred_language: 'en',
      auto_accept_appointments: false,
      sms_alerts: true,
      email_alerts: true,
      consultation_buffer_minutes: 5
    }
  },
  // Phase 3: Clinical history sessions (AI-guided intake)
  clinical_histories: [],
  // Phase 4: Ayurveda module collections
  ayurveda_profiles: [],       // one per patient — profile, prakriti, lifestyle
  ayurveda_assessments: [],    // Dashavidha Pariksha — practitioner recorded
  ayurveda_medicines: [],      // Ayurvedic medicines — separate from modern
  ayurveda_treatments: [],     // treatment history entries
  treatment_responses: [],     // before/after outcome records
  document_digitizations: []   // Phase 5: Document digitization & OCR sessions
};

// In-memory runtime database
export const db = JSON.parse(JSON.stringify(initialData));

// Helper: Check active doctor consent
export function checkActiveConsent(patientId, doctorId, category) {
  const consent = db.consent_requests.find(cr => 
    cr.patient_id === patientId &&
    cr.doctor_id === doctorId &&
    cr.status === 'approved' &&
    new Date(cr.valid_until) > new Date()
  );

  if (!consent) return false;
  if (category === 'complete_record') return true;
  return consent.approved_categories.includes(category) || consent.approved_categories.includes('complete_record');
}

// Helper: Add an immutable audit log
export function recordAuditLog({
  patient_id,
  actor_id,
  actor_role,
  actor_name,
  doctor_id = null,
  hospital_id = null,
  action,
  category_accessed = null,
  consent_status = null,
  ip_address = '127.0.0.1',
  user_agent = 'Web Browser',
  details = {}
}) {
  const logEntry = {
    id: uuidv4(),
    patient_id,
    actor_id,
    actor_role,
    actor_name,
    doctor_id,
    hospital_id,
    action,
    category_accessed,
    consent_status,
    ip_address,
    user_agent,
    details,
    created_at: new Date().toISOString()
  };
  db.access_logs.unshift(logEntry);
  return logEntry;
}

// Helper: Create notification
export function createNotification({
  user_id,
  type,
  title,
  message,
  link_url = ''
}) {
  const notification = {
    id: uuidv4(),
    user_id,
    type,
    title,
    message,
    link_url,
    is_read: false,
    created_at: new Date().toISOString()
  };
  db.notifications.unshift(notification);
  return notification;
}
