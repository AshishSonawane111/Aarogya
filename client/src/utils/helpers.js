export const RECORD_CATEGORIES = [
  { id: 'medical_history', label: 'Medical History', description: 'Past illnesses, allergies, and surgical procedures' },
  { id: 'lab_reports', label: 'Lab Reports', description: 'Blood tests, biochemistry, lipid panels, urine pathology' },
  { id: 'prescriptions', label: 'Prescriptions', description: 'Medication regimens, dosages, and instructions' },
  { id: 'diagnoses', label: 'Diagnoses', description: 'Clinical assessments and ICD-categorized conditions' },
  { id: 'hospital_records', label: 'Hospital Records', description: 'Admission notes, discharge summaries, and inpatient charts' },
  { id: 'consultations', label: 'Consultations', description: 'Doctor clinical evaluation notes and vitals' },
  { id: 'scans', label: 'Scans & Radiology', description: 'X-Rays, MRI, CT scans, and 2D Echocardiograms' },
  { id: 'complete_record', label: 'Complete Medical File', description: 'All historical categories and uploaded files' }
];

export function getCategoryLabel(categoryId) {
  const cat = RECORD_CATEGORIES.find(c => c.id === categoryId);
  return cat ? cat.label : categoryId;
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return 'N/A';
  try {
    const d = new Date(dateTimeString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateTimeString;
  }
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount || 0);
}

export function getStatusBadgeClass(status) {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'paid':
    case 'confirmed':
    case 'completed':
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'pending':
    case 'scheduled':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'denied':
    case 'cancelled':
    case 'revoked':
    case 'failed':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'expired':
    case 'rescheduled':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-sky-50 text-sky-700 border-sky-200';
  }
}
