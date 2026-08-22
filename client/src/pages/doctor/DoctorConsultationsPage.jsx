import React, { useState, useEffect } from 'react';
import { recordAPI, doctorAPI } from '../../services/api';
import { ConsultationModal } from '../../components/doctor/ConsultationModal';
import { Stethoscope, Plus, FileText, Calendar, User, Activity, ExternalLink } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const DoctorConsultationsPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchConsultations = async () => {
    try {
      const res = await recordAPI.getRecords({ category: 'consultations' });
      setConsultations(res.data?.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
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
            <Stethoscope className="w-5 h-5 text-indigo-600" />
            Clinical Consultations & Electronic Encounter Notes
          </h2>
          <p className="text-xs text-slate-500">
            Create permanent, signed clinical records with ICD diagnostics, symptoms, and vital sign logs.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Record New Consultation Note
        </button>
      </div>

      {/* Consultation Records List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs animate-pulse">Loading consultations...</div>
        ) : consultations.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
            No consultations recorded yet.
          </div>
        ) : (
          consultations.map((c) => (
            <div
              key={c.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{c.title}</h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(c.record_date)}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  Signed Clinical Note
                </span>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {c.description}
              </div>

              {c.metadata?.vitals && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {Object.entries(c.metadata.vitals).map(([key, val]) => (
                    <div key={key} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">{key}</span>
                      <span className="font-mono font-bold text-slate-800">{String(val)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Consultation Modal */}
      {selectedPatient && (
        <ConsultationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          patient={selectedPatient}
          onSuccess={fetchConsultations}
        />
      )}

    </div>
  );
};
