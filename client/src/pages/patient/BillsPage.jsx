import React, { useState, useEffect } from 'react';
import { billAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Receipt, 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Download, 
  DollarSign, 
  Plus, 
  Calendar,
  Building2,
  Check
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';

export const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingBill, setPayingBill] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const { addToast } = useNotification();

  // Upload external receipt form
  const [extTitle, setExtTitle] = useState('');
  const [extType, setExtType] = useState('hospital');
  const [extAmount, setExtAmount] = useState('');

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
  }, []);

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payingBill) return;

    setIsProcessingPay(true);
    try {
      await billAPI.payBill(payingBill.id, {
        payment_method: paymentMethod,
        transaction_id: `UPI-TXN-${Date.now()}`
      });

      addToast({
        title: 'Payment Successful',
        message: `₹${payingBill.total_amount} paid successfully via ${paymentMethod}.`,
        type: 'success'
      });

      setPayingBill(null);
      fetchBills();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingPay(false);
    }
  };

  const handleUploadExternalBill = async (e) => {
    e.preventDefault();
    if (!extTitle || !extAmount) return;

    try {
      await billAPI.uploadReceipt({
        title: extTitle,
        bill_type: extType,
        amount: Number(extAmount),
        document_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800'
      });

      addToast({
        title: 'Receipt Uploaded',
        message: 'External medical invoice added to your financial healthcare timeline.',
        type: 'success'
      });

      setShowUploadModal(false);
      setExtTitle('');
      setExtAmount('');
      fetchBills();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPaid = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const totalPending = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            Healthcare Bills & Financial Records
          </h2>
          <p className="text-xs text-slate-500">
            View consultation, lab, hospital, and pharmacy bills with itemized receipts and UPI payments.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 transition shrink-0"
        >
          <Upload className="w-4 h-4" />
          Upload External Bill / Insurance
        </button>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Invoices</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{bills.length} Invoices</div>
        </div>

        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">Paid & Settled</span>
          <div className="text-2xl font-black text-emerald-950 mt-1">{formatCurrency(totalPaid)}</div>
        </div>

        <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-800 block">Pending Clearance</span>
          <div className="text-2xl font-black text-amber-950 mt-1">{formatCurrency(totalPending)}</div>
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs animate-pulse">Loading billing records...</div>
        ) : bills.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            No bills on record.
          </div>
        ) : (
          bills.map((bill) => (
            <div
              key={bill.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{bill.title}</h4>
                    <span className="font-mono text-xs text-slate-400 font-bold">({bill.bill_number})</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="capitalize text-teal-700 font-semibold">{bill.bill_type} Bill</span>
                    <span>•</span>
                    <span>{bill.hospital_name || 'Health City'}</span>
                    <span>•</span>
                    <span>{formatDate(bill.bill_date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-base font-extrabold text-slate-900">
                      {formatCurrency(bill.total_amount)}
                    </div>
                    {bill.tax_amount > 0 && (
                      <span className="text-[10px] text-slate-400">Incl. ₹{bill.tax_amount} GST</span>
                    )}
                  </div>
                  <StatusBadge status={bill.status} />
                </div>
              </div>

              {/* Itemized breakdown */}
              {bill.breakdown?.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Itemized Cost Breakdown</span>
                  <div className="space-y-1 pt-1">
                    {bill.breakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-700">
                        <span>{item.item} {item.qty > 1 && `(x${item.qty})`}</span>
                        <span className="font-mono font-bold">{formatCurrency(item.total || item.rate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions & Transaction Proof */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 text-xs">
                {bill.status === 'paid' ? (
                  <div className="text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Settled via {bill.payment_method || 'UPI'} • Ref: {bill.transaction_id || 'UPI-9821'}</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-amber-800 flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Payment Due by {formatDate(bill.due_date)}</span>
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {bill.status === 'pending' && (
                    <button
                      onClick={() => setPayingBill(bill)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Pay Bill (UPI)
                    </button>
                  )}

                  {bill.receipt_url && (
                    <a
                      href={bill.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Receipt
                    </a>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Pay Modal */}
      {payingBill && (
        <Modal isOpen={!!payingBill} onClose={() => setPayingBill(null)} title="Instant Healthcare Bill Settlement">
          <form onSubmit={handlePaySubmit} className="space-y-4">
            <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 text-center space-y-1">
              <span className="text-xs text-teal-800 font-semibold">Total Amount Payable</span>
              <div className="text-3xl font-black text-teal-950 font-mono">
                {formatCurrency(payingBill.total_amount)}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">For {payingBill.title}</div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Select Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="UPI (GPay / PhonePe / Paytm)">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="Debit / Credit Card">Debit / Credit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Instant automated receipt issued directly to your records timeline.</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPayingBill(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessingPay}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20"
              >
                {isProcessingPay ? 'Processing Payment...' : 'Confirm & Pay Now'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Upload External Bill Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload External Hospital Bill / Receipt">
        <form onSubmit={handleUploadExternalBill} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Bill Description / Hospital Name</label>
            <input
              type="text"
              value={extTitle}
              onChange={(e) => setExtTitle(e.target.value)}
              placeholder="e.g. Lilavati MRI Brain Scan & Report Fee"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Bill Category</label>
              <select
                value={extType}
                onChange={(e) => setExtType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="hospital">Hospital Inpatient</option>
                <option value="consultation">Specialist Consultation</option>
                <option value="lab">Diagnostic Lab Test</option>
                <option value="medicine">Pharmacy & Medicines</option>
                <option value="procedure">Surgical Procedure</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Total Amount (₹)</label>
              <input
                type="number"
                value={extAmount}
                onChange={(e) => setExtAmount(e.target.value)}
                placeholder="2500"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
            <Upload className="w-6 h-6 text-slate-400 mx-auto" />
            <div className="text-xs text-slate-600 font-medium">Attach bill PDF or receipt photo</div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20"
            >
              Add to Financial Vault
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
