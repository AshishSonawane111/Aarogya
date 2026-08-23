import React, { useState, useEffect } from 'react';
import { patientAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, QrCode, Printer, Droplet, Phone, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';
import { QRModal } from '../../components/common/QRModal';

export const HealthIdPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    patientAPI.getHealthId().then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleCopyId = () => {
    if (!data?.health_id) return;
    navigator.clipboard.writeText(data.health_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Digital Health ID...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-sky-600" />
            Digital Health ID & Identification Card
          </h2>
          <p className="text-xs text-slate-500">
            Official government-aligned encrypted healthcare credential for zero-trust identification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-600/20 transition"
          >
            <Printer className="w-4 h-4" />
            Print Health ID Card
          </button>
        </div>
      </div>

      {/* Main Printable Digital Card */}
      <div className="printable-health-card bg-gradient-to-br from-sky-950 via-sky-900 to-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-sky-600/40 relative overflow-hidden">
        
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-sky-700/50 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 border border-sky-400/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-sky-300">
                HEALTH PASSPORT — DIGITAL ID
              </div>
              <div className="text-[10px] text-slate-300">Ayushman Bharat Digital Mission (ABDM) Compatible</div>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Citizen Profile
          </span>
        </div>

        {/* Card Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Avatar and Identity */}
          <div className="flex flex-col items-center text-center space-y-3">
            <img
              src={data?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face'}
              alt="Citizen Photo"
              className="w-28 h-28 rounded-2xl object-cover border-2 border-sky-400/50 shadow-lg"
            />
            <div>
              <div className="text-lg font-extrabold text-white">{data?.first_name} {data?.last_name}</div>
              <div className="text-xs text-sky-300 capitalize">{data?.gender} • DOB: {data?.dob}</div>
            </div>
          </div>

          {/* Core Credentials */}
          <div className="space-y-3">
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-sky-700/40">
              <span className="text-[10px] uppercase font-bold text-sky-400 block">Health ID Number</span>
              <div className="font-mono text-base font-extrabold text-white flex items-center justify-between mt-0.5">
                <span>{data?.health_id}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 text-sky-400 hover:text-white transition"
                  title="Copy Health ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && <span className="text-[10px] text-emerald-400 font-semibold">Copied to clipboard!</span>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-sky-700/40">
                <span className="text-[10px] uppercase font-bold text-sky-400 block">Blood Group</span>
                <span className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
                  <Droplet className="w-3.5 h-3.5 text-rose-400" />
                  {data?.blood_group} (Verified)
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-sky-700/40">
                <span className="text-[10px] uppercase font-bold text-sky-400 block">City / Region</span>
                <span className="text-xs font-bold text-white block mt-0.5">{data?.city}, {data?.state}</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-sky-700/40">
              <span className="text-[10px] uppercase font-bold text-sky-400 block">Emergency Contact</span>
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                {data?.emergency_contact?.name} ({data?.emergency_contact?.relation}): {data?.emergency_contact?.phone}
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div
            onClick={() => setShowQRModal(true)}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xl text-slate-900 cursor-pointer hover:scale-105 transition"
            title="Click to view full Emergency QR"
          >
            <QRCodeSVG value={`${window.location.origin}/emergency/${data?.qr_token || 'emg_7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c'}`} size={140} level="H" />
            <span className="text-[10px] font-extrabold text-sky-800 mt-2 uppercase tracking-wider">
              Scan for Emergency Profile
            </span>
          </div>

        </div>

        {/* Security Disclaimers */}
        <div className="mt-6 pt-4 border-t border-sky-700/40 text-[11px] text-sky-200/80 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Scanning this QR code opens the patient's public Emergency Profile on any smartphone camera. Private medical history remains encrypted.</span>
          <button
            onClick={() => setShowQRModal(true)}
            className="font-mono text-[11px] text-white hover:text-sky-300 font-bold underline"
          >
            View Full QR Card
          </button>
        </div>

      </div>

      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        patient={data ? { first_name: data.first_name, last_name: data.last_name, blood_group: data.blood_group, gender: data.gender, city: data.city, avatar_url: data.avatar_url } : null}
        healthId={data?.health_id}
        qrToken={data?.qr_token}
      />

    </div>
  );
};
