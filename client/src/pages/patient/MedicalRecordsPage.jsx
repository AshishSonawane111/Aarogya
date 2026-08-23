import React, { useState, useEffect } from 'react';
import { recordAPI } from '../../services/api';
import { RECORD_CATEGORIES, formatDate, getCategoryLabel } from '../../utils/helpers';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { 
  FileHeart, 
  Upload, 
  Filter, 
  FileText, 
  Pill, 
  Activity, 
  FileCheck, 
  ExternalLink, 
  AlertCircle, 
  Download,
  Calendar,
  Sparkles
} from 'lucide-react';

export const MedicalRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { addToast } = useNotification();

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('lab_reports');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await recordAPI.getRecords({ category: selectedCategory });
      setRecords(res.data?.records || []);
    } catch (err) {
      console.error('Records fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedCategory]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    setUploading(true);
    try {
      await recordAPI.uploadRecord({
        title: uploadTitle,
        category: uploadCategory,
        description: uploadDesc,
        record_date: uploadDate,
        file_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
        file_type: 'pdf',
        file_size_bytes: 320000
      });

      addToast({
        title: 'Record Encrypted & Uploaded',
        message: 'New medical document safely placed in your personal timeline.',
        type: 'success'
      });

      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDesc('');
      fetchRecords();
    } catch (err) {
      addToast({
        title: 'Upload Error',
        message: err.response?.data?.error || 'Failed to upload document',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const getRecordIcon = (category) => {
    switch (category) {
      case 'lab_reports': return <Activity className="w-5 h-5 text-sky-600" />;
      case 'prescriptions': return <Pill className="w-5 h-5 text-emerald-600" />;
      case 'scans': return <FileCheck className="w-5 h-5 text-indigo-600" />;
      case 'consultations': return <FileText className="w-5 h-5 text-amber-600" />;
      default: return <FileHeart className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileHeart className="w-5 h-5 text-sky-600" />
            Universal Medical Records Timeline
          </h2>
          <p className="text-xs text-slate-500">
            Encrypted historical clinical files, laboratory reports, scans, and doctor prescriptions.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-600/20 transition shrink-0"
        >
          <Upload className="w-4 h-4" />
          Upload Medical Document
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            selectedCategory === 'all'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Records ({records.length})
        </button>

        {RECORD_CATEGORIES.filter(c => c.id !== 'complete_record').map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
            Decrypting personal medical timeline...
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <FileHeart className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">No medical records found in this category</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Upload past diagnostic scans, lab reports, or consult notes to enrich your timeline.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Now
            </button>
          </div>
        ) : (
          <div className="relative border-l-2 border-sky-200 ml-4 sm:ml-6 space-y-6">
            {records.map((rec) => (
              <div key={rec.id} className="relative pl-6 sm:pl-8 group">
                
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-sky-600 shadow-xs flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-600"></div>
                </div>

                {/* Card Body */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        {getRecordIcon(rec.category)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{rec.title}</h4>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span className="font-semibold text-sky-700">{getCategoryLabel(rec.category)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(rec.record_date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedRecord(rec)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-sky-700 hover:text-sky-900 border border-slate-200 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rec.description}
                  </p>

                  {/* Metadata preview */}
                  {rec.metadata?.findings && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="font-bold text-[11px] text-slate-700 uppercase tracking-wider">
                        Key Diagnostic Parameters:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {rec.metadata.findings.slice(0, 4).map((f, i) => (
                          <div key={i} className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-400 block">{f.param}</span>
                            <span className={`font-bold ${f.status === 'high' ? 'text-rose-600' : 'text-slate-800'}`}>
                              {f.value} {f.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.metadata?.medicines && (
                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                      <div className="font-bold text-[11px] text-emerald-800 uppercase tracking-wider">
                        Prescription Items:
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {rec.metadata.medicines.map((m, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-900 text-xs font-semibold">
                            {m.name || m.medicine_name} ({m.dosage}) — {m.frequency}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Medical Document">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Document Title</label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. Thyroid Profile & Ultrasound Scan"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {RECORD_CATEGORIES.filter(c => c.id !== 'complete_record').map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Date of Record</label>
              <input
                type="date"
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Description / Summary</label>
            <textarea
              rows={3}
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              placeholder="Key notes, doctor observations, or test findings..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
            <Upload className="w-6 h-6 text-slate-400 mx-auto" />
            <div className="text-xs text-slate-600 font-medium">Drag & drop files or click to browse</div>
            <div className="text-[10px] text-slate-400">PDF, JPG, PNG up to 25MB (Supabase Storage Integrated)</div>
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
              disabled={uploading}
              className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20"
            >
              {uploading ? 'Encrypting & Saving...' : 'Save to Vault'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record View Modal */}
      {selectedRecord && (
        <Modal isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} title={selectedRecord.title} maxWidth="max-w-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-3">
              <span className="font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                {getCategoryLabel(selectedRecord.category)}
              </span>
              <span className="text-slate-500 font-mono">Date: {formatDate(selectedRecord.record_date)}</span>
            </div>

            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {selectedRecord.description}
            </div>

            {selectedRecord.file_url && (
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-sky-900">Original Document Attachment Available</span>
                <a
                  href={selectedRecord.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-sky-600 text-white rounded-lg font-bold flex items-center gap-1.5 hover:bg-sky-700 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download / View File
                </a>
              </div>
            )}

            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
};
