import React, { useState, useEffect } from 'react';
import { recordAPI, doctorAPI } from '../../services/api';
import { PrescriptionWriterModal } from '../../components/doctor/PrescriptionWriterModal';
import { Pill, Plus, Calendar, FileText, Download } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const DoctorPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchPrescriptions = async () => {
    try {
      const res = await recordAPI.getRecords({ category: 'prescriptions' });
      setPrescriptions(res.data?.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    doctorAPI.getDashboard().then((res) => {
      setPatients(res.data?.active_authorized_patients || []);
      if (res.data?.active_authorized_patients?.length > 0) {
        setSelectedPatient(res.data.active_authorized_patients[0]);
      }
    }).catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            Digital Prescription Studio
          </h2>
          <p className="text-xs text-slate-500">
            Generate cryptographically signed prescriptions that sync immediately to the patient's medicine adherence portal.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Write Digital Prescription
        </button>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs animate-pulse">Loading prescriptions...</div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
            No prescriptions created yet.
          </div>
        ) : (
          prescriptions.map((p) => (
            <div
              key={p.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{p.title}</h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(p.record_date)}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Synced to Patient Portal
                </span>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed">
                {p.description}
              </div>

              {p.metadata?.medicines && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Medications & Regimens</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {p.metadata.medicines.map((m, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                        <div className="font-bold text-slate-900">{m.name || m.medicine_name}</div>
                        <div className="text-[11px] text-teal-700 font-medium">{m.dosage} • {m.frequency}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{m.instructions}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Prescription Writer Modal */}
      {selectedPatient && (
        <PrescriptionWriterModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          patient={selectedPatient}
          onSuccess={fetchPrescriptions}
        />
      )}

    </div>
  );
};
