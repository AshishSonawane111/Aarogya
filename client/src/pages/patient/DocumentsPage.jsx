import React, { useState, useEffect } from 'react';
import { patientAPI } from '../../services/api';
import { FolderOpen, FileText, Download, Upload, ExternalLink, Calendar, HardDrive } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([
    {
      id: 'doc-1',
      title: 'Apollo Discharge Summary 2025',
      document_type: 'Discharge Summary',
      file_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
      created_at: '2025-11-10T10:00:00Z',
      file_size_bytes: 420000
    },
    {
      id: 'doc-2',
      title: 'COVID-19 Vaccination Certificate (Precautionary Dose)',
      document_type: 'Immunization Record',
      file_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
      created_at: '2024-05-18T10:00:00Z',
      file_size_bytes: 180000
    },
    {
      id: 'doc-3',
      title: 'Comprehensive Lipid & HbA1c Lab Report',
      document_type: 'Lab Report (PDF)',
      file_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
      created_at: '2026-02-15T08:30:00Z',
      file_size_bytes: 245000
    }
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-sky-600" />
          Encrypted Clinical Document Repository
        </h2>
        <p className="text-xs text-slate-500">
          Supabase Storage integrated digital vault for discharge summaries, certificates, scans, and original PDF files.
        </p>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
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
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-sky-50 text-sky-700 hover:text-sky-900 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> View / Download File
            </a>
          </div>
        ))}
      </div>

    </div>
  );
};
