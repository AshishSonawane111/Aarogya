import React, { useState, useEffect } from 'react';
import { billAPI, doctorAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Receipt, Plus, CheckCircle2, Clock, Calendar, Download } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';

export const DoctorBillingPage = () => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { addToast } = useNotification();

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [billType, setBillType] = useState('consultation');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [taxAmount, setTaxAmount] = useState('0');
  const [saving, setSaving] = useState(false);

  const fetchBills = async () => {
    try {
      const res = await billAPI.listBills();
      setBills(res.data?.bills || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    doctorAPI.getDashboard().then((res) => {
      setPatients(res.data?.active_authorized_patients || []);
      if (res.data?.active_authorized_patients?.length > 0) {
        setSelectedPatientId(res.data.active_authorized_patients[0].patient_id);
      }
    }).catch((err) => console.error(err));
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !title || !amount) {
      alert('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      await billAPI.createBill({
        patient_id: selectedPatientId,
        bill_type: billType,
        title,
        amount: Number(amount),
        tax_amount: Number(taxAmount)
      });

      addToast({
        title: 'Invoice Issued',
        message: 'Healthcare invoice dispatched to patient portal for clearance.',
        type: 'success'
      });

      setShowCreateModal(false);
      setTitle('');
      setAmount('');
      fetchBills();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            Hospital & Clinic Billing Studio
          </h2>
          <p className="text-xs text-slate-500">
            Generate clinical bills for consultations, diagnostics, and procedures. Syncs automatically to patient portal.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Generate New Bill
        </button>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Invoice #</th>
              <th className="p-4">Patient Name</th>
              <th className="p-4">Description</th>
              <th className="p-4">Amount (₹)</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">Loading invoices...</td>
              </tr>
            ) : bills.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">No bills generated yet.</td>
              </tr>
            ) : (
              bills.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono font-bold text-indigo-700">{b.bill_number}</td>
                  <td className="p-4 font-bold text-slate-900">{b.patient_name || 'Patient'}</td>
                  <td className="p-4 max-w-xs truncate text-slate-700">{b.title}</td>
                  <td className="p-4 font-extrabold text-slate-900 font-mono">
                    {formatCurrency(b.total_amount)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-400">
                    {formatDate(b.bill_date)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Generate Bill Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Generate Healthcare Invoice">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Select Patient</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            >
              {patients.length === 0 && <option value="10000000-0000-0000-0000-000000000001">Rajesh Kumar (HP-2026-1001)</option>}
              {patients.map((p) => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.patient_name} ({p.health_id_number})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Bill Type</label>
              <select
                value={billType}
                onChange={(e) => setBillType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="consultation">Specialist Consultation</option>
                <option value="lab">Diagnostic Lab Test</option>
                <option value="procedure">Clinical Procedure</option>
                <option value="hospital">Hospitalization / Room</option>
                <option value="medicine">Pharmacy & Consumables</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Base Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1200"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Description / Line Item</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Cardiology Outpatient Consultation & ECG"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
            >
              {saving ? 'Generating...' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
