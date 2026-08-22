import React, { useState } from 'react';
import { FolderOpen, Upload, Download, FileText, Calendar, Plus } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';

export const DoctorDocumentsPage = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('Discharge Summary');
  const { addToast } = useNotification();

  const [documents, setDocuments] = useState([
    {
      id: 'doc-1',
      title: 'Cardiac Surgery Clinical Protocol 2026',
      document_type: 'Department Protocol',
      created_at: '2026-01-15T10:00:00Z',
      file_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800'
    },
    {
      id: 'doc-2',
      title: 'Apollo Outpatient Discharge Template',
      document_type: 'Clinical Template',
      created_at: '2026-02-01T10:00:00Z',
      file_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800'
    }
  ]);

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!docTitle) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      title: docTitle,
      document_type: docType,
      created_at: new Date().toISOString(),
      file_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800'
    };

    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    setDocTitle('');

    addToast({
      title: 'Document Saved',
      message: 'Clinical document securely archived.',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-600" />
            Clinical Documents & Department Protocols
          </h2>
          <p className="text-xs text-slate-500">
            Secure storage for hospital clinical guidelines, discharge templates, and diagnostic files.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 line-clamp-2">{doc.title}</h4>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 inline-block">
                {doc.document_type}
              </span>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formatDate(doc.created_at)}
              </div>
            </div>

            <a
              href={doc.file_url}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-900 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> View File
            </a>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Clinical Document">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Document Title</label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Inpatient Discharge Protocol"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Discharge Summary">Discharge Summary</option>
              <option value="Department Protocol">Department Protocol</option>
              <option value="Lab Reference Chart">Lab Reference Chart</option>
              <option value="Surgical Guideline">Surgical Guideline</option>
            </select>
          </div>

          <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
            <Upload className="w-6 h-6 text-slate-400 mx-auto" />
            <div className="text-xs text-slate-600 font-medium">Attach PDF file (up to 25MB)</div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              Upload & Archive
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
