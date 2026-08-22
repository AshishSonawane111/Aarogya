import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, createNotification } from '../database/store.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// List bills (patient or doctor view)
router.get('/', authenticate, (req, res) => {
  let bills = [];

  if (req.user.role === 'patient') {
    bills = db.bills
      .filter(b => b.patient_id === req.patient.id)
      .map(b => {
        const doc = db.doctors.find(d => d.id === b.doctor_id);
        const hosp = db.hospitals.find(h => h.id === b.hospital_id);
        return {
          ...b,
          doctor_name: doc ? `Dr. ${doc.first_name} ${doc.last_name}` : null,
          hospital_name: hosp ? hosp.name : 'Health City Hospital'
        };
      });
  } else if (req.user.role === 'doctor') {
    bills = db.bills
      .filter(b => b.doctor_id === req.doctor.id || b.hospital_id === 'h1000000-0000-0000-0000-000000000001')
      .map(b => {
        const patient = db.patients.find(p => p.id === b.patient_id);
        const healthId = db.health_ids.find(h => h.patient_id === b.patient_id);
        return {
          ...b,
          patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Patient',
          health_id_number: healthId?.health_id_number
        };
      });
  }

  bills.sort((a, b) => new Date(b.bill_date) - new Date(a.bill_date));

  res.json({ bills });
});

// Doctor / Hospital creates a bill
router.post('/', authenticate, (req, res) => {
  const {
    patient_id,
    bill_type = 'consultation',
    title,
    amount,
    tax_amount = 0,
    due_date,
    breakdown = []
  } = req.body;

  if (!patient_id || !title || !amount) {
    return res.status(400).json({ error: 'patient_id, title, and amount are required' });
  }

  const patient = db.patients.find(p => p.id === patient_id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const totalAmount = Number(amount) + Number(tax_amount);
  const billNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newBill = {
    id: uuidv4(),
    bill_number: billNumber,
    patient_id,
    doctor_id: req.doctor ? req.doctor.id : null,
    hospital_id: 'h1000000-0000-0000-0000-000000000001',
    bill_type,
    title,
    amount: Number(amount),
    tax_amount: Number(tax_amount),
    total_amount: totalAmount,
    status: 'pending',
    bill_date: new Date().toISOString().split('T')[0],
    due_date: due_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    payment_method: null,
    transaction_id: null,
    receipt_url: null,
    breakdown: breakdown.length > 0 ? breakdown : [{ item: title, rate: Number(amount), qty: 1, total: Number(amount) }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.bills.unshift(newBill);

  // Notify patient
  createNotification({
    user_id: patient.user_id,
    type: 'bill',
    title: `New Healthcare Invoice Generated (${billNumber})`,
    message: `An invoice for ₹${totalAmount.toFixed(2)} (${title}) has been issued. Due by ${newBill.due_date}.`,
    link_url: '/patient/bills'
  });

  res.status(201).json({
    success: true,
    message: 'Bill created successfully',
    bill: newBill
  });
});

// Patient pays bill / confirms payment
router.post('/:billId/pay', authenticate, (req, res) => {
  const { billId } = req.params;
  const { payment_method = 'UPI', transaction_id } = req.body;

  const bill = db.bills.find(b => b.id === billId);
  if (!bill) return res.status(404).json({ error: 'Bill not found' });

  const txnId = transaction_id || `UPI-TXN-${Date.now()}`;

  bill.status = 'paid';
  bill.payment_method = payment_method;
  bill.transaction_id = txnId;
  bill.receipt_url = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800';
  bill.updated_at = new Date().toISOString();

  // Create payment record
  const payment = {
    id: uuidv4(),
    bill_id: billId,
    patient_id: bill.patient_id,
    amount: bill.total_amount,
    payment_method,
    transaction_id: txnId,
    payment_date: new Date().toISOString(),
    status: 'success',
    receipt_number: `REC-${Date.now()}`
  };

  res.json({
    success: true,
    message: `Payment of ₹${bill.total_amount} processed successfully via ${payment_method}`,
    bill,
    payment
  });
});

// Upload external receipt or insurance document
router.post('/upload-receipt', authenticate, (req, res) => {
  const { title, bill_type = 'hospital', amount, document_url } = req.body;
  const patientId = req.user.role === 'patient' ? req.patient.id : req.body.patient_id;

  const billNumber = `EXT-${Math.floor(10000 + Math.random() * 90000)}`;

  const externalBill = {
    id: uuidv4(),
    bill_number: billNumber,
    patient_id: patientId,
    doctor_id: null,
    hospital_id: null,
    bill_type,
    title: title || 'External Medical Invoice',
    amount: Number(amount || 0),
    tax_amount: 0,
    total_amount: Number(amount || 0),
    status: 'paid',
    bill_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    payment_method: 'Direct Settlement',
    transaction_id: `EXT-DOC-${Date.now()}`,
    receipt_url: document_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    breakdown: [{ item: title || 'External Expense', rate: Number(amount || 0), qty: 1, total: Number(amount || 0) }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.bills.unshift(externalBill);

  res.status(201).json({
    success: true,
    message: 'External medical invoice uploaded to financial timeline',
    bill: externalBill
  });
});

export default router;
