import React, { useState, useEffect } from 'react';
import { recordAPI, digitizeAPI, medicineAPI } from '../../services/api';
import { RECORD_CATEGORIES, formatDate, getCategoryLabel } from '../../utils/helpers';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  FileHeart, Upload, Filter, FileText, Pill, Activity, 
  FileCheck, ExternalLink, AlertCircle, Download, Calendar, 
  Sparkles, Camera, Languages, RefreshCw, CheckCircle2, 
  Edit3, Trash2, ShieldCheck, Play, ArrowRight, Loader2, Info, ChevronUp, ChevronDown
} from 'lucide-react';

const DOCUMENT_CATEGORIES = [
  { id: 'prescription', label: 'Prescription', icon: '📋' },
  { id: 'lab_report', label: 'Laboratory Report', icon: '🧪' },
  { id: 'discharge_summary', label: 'Discharge Summary', icon: '🏥' },
  { id: 'imaging_report', label: 'Imaging Report', icon: '🩻' },
  { id: 'hospital_record', label: 'Hospital Record', icon: '🏨' },
  { id: 'ayurvedic_prescription', label: 'Ayurvedic Prescription', icon: '🌿' },
  { id: 'ayurvedic_treatment', label: 'Ayurvedic Treatment Record', icon: '🧘' },
  { id: 'other', label: 'Other Medical Document', icon: '📄' }
];

export const MedicalRecordsPage = () => {
  const { t, currentLanguage } = useLanguage();
  const { addToast } = useNotification();

  const [records, setRecords] = useState([]);
  const [digitizationSessions, setDigitizationSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Digitization Workflow State
  const [activeSession, setActiveSession] = useState(null); // active digitization wizard
  const [uploadFile, setUploadFile] = useState(null);
  const [documentType, setDocumentType] = useState('lab_report');
  const [ocrLanguage, setOcrLanguage] = useState('en');
  const [processingStep, setProcessingStep] = useState(0); // 0: Idle, 1: Uploading, 2: Scanning, 3: Structuring, 4: Editing/Review
  const [statusMessage, setStatusMessage] = useState('');
  
  // Edited structured data state
  const [editMeta, setEditMeta] = useState({
    doctor_name: '',
    hospital_name: '',
    record_date: '',
    summary: '',
    medicines: [],
    findings: [],
    treatments: []
  });
  
  const [showRawText, setShowRawText] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchRecordsAndSessions = async () => {
    setLoading(true);
    try {
      const [recsRes, sessionsRes] = await Promise.all([
        recordAPI.getRecords({ category: selectedCategory }),
        digitizeAPI.getSessions()
      ]);
      setRecords(recsRes.data?.records || []);
      setDigitizationSessions(sessionsRes.data?.sessions || []);
    } catch (err) {
      console.error('Fetch records/sessions error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordsAndSessions();
  }, [selectedCategory]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  // Real Camera Capture States & Methods
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setCapturedImage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      setTimeout(() => {
        const video = document.getElementById('camera-video');
        if (video) {
          video.srcObject = stream;
        }
      }, 300);
    } catch (err) {
      console.error('Camera access error', err);
      addToast({
        title: 'Camera Access Error',
        message: 'Could not access browser camera. Falling back to file input.',
        type: 'warning'
      });
      setIsCameraActive(false);
      // Fallback: click file input
      const fileInput = document.getElementById('camera-file-input');
      if (fileInput) fileInput.click();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-video');
    const canvas = document.createElement('canvas');
    if (video) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
      
      // Stop the stream tracks to turn off camera LED
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }
  };

  const retakePhoto = async () => {
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      const video = document.getElementById('camera-video');
      if (video) {
        video.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const usePhoto = () => {
    if (capturedImage) {
      // Convert dataUrl to file
      const blobBin = atob(capturedImage.split(',')[1]);
      const array = [];
      for (let i = 0; i < blobBin.length; i++) {
        array.push(blobBin.charCodeAt(i));
      }
      const file = new File([new Uint8Array(array)], `camera-scan-${Date.now()}.png`, { type: 'image/png' });
      setUploadFile(file);
      setIsCameraActive(false);
      setCapturedImage(null);
    }
  };

  // Step 1: Start extraction
  const handleStartExtraction = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      addToast({
        title: 'Validation Error',
        message: 'Please select a document file or snap a picture.',
        type: 'error'
      });
      return;
    }

    setProcessingStep(1);
    setStatusMessage('Uploading document securely...');
    
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('document_type', documentType);
    formData.append('preferred_language', ocrLanguage);

    try {
      // Simulate upload latency
      await new Promise(r => setTimeout(r, 1200));
      setProcessingStep(2);
      setStatusMessage('OCR Processing & Reading text...');
      
      await new Promise(r => setTimeout(r, 1500));
      setProcessingStep(3);
      setStatusMessage('Extracting clinical entities...');

      const res = await digitizeAPI.uploadAndDigitize(formData);
      
      await new Promise(r => setTimeout(r, 800));
      
      const session = res.data.session;
      setActiveSession(session);
      setEditMeta({
        doctor_name: session.extracted_data.doctor_name || '',
        hospital_name: session.extracted_data.hospital_name || '',
        record_date: session.extracted_data.record_date || '',
        summary: session.extracted_data.summary || '',
        medicines: session.extracted_data.medicines || [],
        findings: session.extracted_data.findings || [],
        treatments: session.extracted_data.treatments || []
      });
      
      setProcessingStep(4);
      addToast({
        title: 'Clinical Extraction Completed',
        message: 'AI has parsed the document. Please verify the fields below.',
        type: 'success'
      });

    } catch (err) {
      console.error(err);
      setProcessingStep(0);
      addToast({
        title: 'Digitization Failed',
        message: err.response?.data?.error || 'OCR engine could not read the document clearly.',
        type: 'error'
      });
    }
  };

  // Step 2: Handle manual correction updates
  const handleMetaFieldChange = (field, val) => {
    setEditMeta(prev => ({ ...prev, [field]: val }));
  };

  const handleMedicineChange = (index, field, val) => {
    const updated = [...editMeta.medicines];
    updated[index] = { ...updated[index], [field]: val };
    setEditMeta(prev => ({ ...prev, medicines: updated }));
  };

  const handleFindingChange = (index, field, val) => {
    const updated = [...editMeta.findings];
    updated[index] = { ...updated[index], [field]: val };
    
    // Auto-update status flag based on ref range if numeric
    if (field === 'value' && updated[index].ref_range) {
      const valNum = parseFloat(val);
      const match = updated[index].ref_range.match(/([\d\.]+)\s*-\s*([\d\.]+)/);
      if (match && !isNaN(valNum)) {
        const low = parseFloat(match[1]);
        const high = parseFloat(match[2]);
        if (valNum < low) updated[index].status = 'low';
        else if (valNum > high) updated[index].status = 'high';
        else updated[index].status = 'normal';
      }
    }
    
    setEditMeta(prev => ({ ...prev, findings: updated }));
  };

  const handleAddMedicineRow = () => {
    setEditMeta(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: 'Once daily', duration_days: 30, instructions: '' }]
    }));
  };

  const handleAddFindingRow = () => {
    setEditMeta(prev => ({
      ...prev,
      findings: [...prev.findings, { param: '', value: '', unit: '', ref_range: '', status: 'normal' }]
    }));
  };

  const handleDeleteRow = (type, index) => {
    const list = [...editMeta[type]];
    list.splice(index, 1);
    setEditMeta(prev => ({ ...prev, [type]: list }));
  };

  // Step 3: Patient confirms digitized document
  const handleConfirmDigitization = async () => {
    if (!editMeta.summary.trim()) {
      addToast({
        title: 'Validation Error',
        message: 'Please provide a summary or title for this document.',
        type: 'error'
      });
      return;
    }

    try {
      // 1. Save local patient corrections
      await digitizeAPI.updateSession(activeSession.id, { extracted_data: editMeta });
      
      // 2. Confirm to medical records timeline
      await digitizeAPI.confirmSession(activeSession.id);
      
      addToast({
        title: 'Document Digitized & Saved',
        message: 'Record successfully verified and saved to timeline.',
        type: 'success'
      });

      // Clear wizard state
      setActiveSession(null);
      setUploadFile(null);
      setProcessingStep(0);
      fetchRecordsAndSessions();

    } catch (err) {
      addToast({
        title: 'Confirmation Failed',
        message: err.response?.data?.error || 'Could not finalize document timeline registration.',
        type: 'error'
      });
    }
  };

  // Add medicine to daily regimen helper
  const handleAddRegimen = async (med) => {
    try {
      await medicineAPI.addMedicine({
        name: med.name || med.medicine_name,
        dosage: med.dosage,
        frequency: med.frequency,
        safety_notes: `Extracted from digitized document: ${activeSession?.original_name || 'Medical File'}`
      });
      addToast({
        title: 'Regimen Synced',
        message: `${med.name || med.medicine_name} successfully added to active medicines timeline.`,
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Regimen Error',
        message: 'Could not sync medicine to regimen.',
        type: 'error'
      });
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
            Medical Document Intelligence
          </h2>
          <p className="text-xs text-slate-500">
            Digitize your medical history. Snap camera photos or upload PDFs. AI extracts parameters, registers medicines and maps health timelines.
          </p>
        </div>
        {processingStep === 0 && (
          <button
            onClick={() => setProcessingStep(1)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-600/20 transition shrink-0"
          >
            <Camera className="w-4 h-4" />
            {t('digitizeDocument')}
          </button>
        )}
      </div>

      {/* WIZARD PROCESS STEPS */}
      {processingStep > 0 && processingStep < 4 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto relative">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            <Sparkles className="w-4 h-4 text-indigo-600 absolute bottom-1 right-1 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-base text-slate-900">{statusMessage}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Our secure AI model is OCR scanning the document, cleaning typography, and isolating clinical entities. Please wait.
            </p>
          </div>
          <div className="w-full max-w-md bg-slate-100 h-2 rounded-full overflow-hidden mx-auto">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${processingStep * 33}%` }}
            />
          </div>
        </div>
      )}

      {/* WIZARD SETTINGS UPLOAD SCREEN */}
      {processingStep === 1 && !activeSession && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-6">
          {isCameraActive ? (
            <div className="space-y-5 text-center">
              <SectionHeader icon="📷" title="Capture Document Photo" subtitle="Center the document inside the dashed box for a clean scan" />
              
              {!capturedImage ? (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] max-w-md mx-auto flex items-center justify-center border border-slate-800 shadow-inner">
                  <video id="camera-video" autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-dashed border-sky-400/50 m-6 pointer-events-none rounded-lg animate-pulse" />
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden bg-black aspect-[4/3] max-w-md mx-auto flex items-center justify-center border border-slate-800 shadow-md">
                  <img src={capturedImage} alt="Captured scan" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex justify-center gap-3 max-w-md mx-auto pt-2">
                {!capturedImage ? (
                  <>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/25 transition btn-inline"
                    >
                      Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition btn-inline"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={usePhoto}
                      className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25 transition btn-inline"
                    >
                      Use Photo
                    </button>
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/25 transition btn-inline"
                    >
                      Retake
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition btn-inline"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              <SectionHeader icon="📷" title="Select Document Source & Category" />
              
              <form onSubmit={handleStartExtraction} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">1. Document Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DOCUMENT_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setDocumentType(cat.id)}
                        className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1.5 btn-inline ${
                          documentType === cat.id
                            ? 'border-sky-500 bg-sky-50 text-sky-700'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-[10px] font-bold leading-tight">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">2. OCR Language Scan</label>
                    <select
                      value={ocrLanguage}
                      onChange={e => setOcrLanguage(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      <option value="en">🇬🇧 English</option>
                      <option value="hi">🇮🇳 Hindi / हिन्दी</option>
                      <option value="mr">🇮🇳 Marathi / मराठी</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">3. Camera capture / Snap</label>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full p-3 rounded-2xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-2 transition btn-inline"
                    >
                      <Camera className="w-4 h-4" /> {t('scanDocument')}
                    </button>
                    <input 
                      id="camera-file-input" 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </div>
                </div>

                {/* Drag Drop or browse */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">4. Select File from Vault / Device</label>
                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-3 relative hover:bg-slate-100 transition">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                    <div className="text-xs text-slate-600 font-semibold">
                      {uploadFile ? uploadFile.name : t('uploadDocument')}
                    </div>
                    <div className="text-[10px] text-slate-400">PDF, JPG, PNG, WEBP up to 25MB supported</div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setProcessingStep(0)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition btn-inline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!uploadFile}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs font-bold shadow-md disabled:opacity-40 btn-inline"
                  >
                    Start AI OCR Digitization
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* VERIFICATION & SPLIT-SCREEN WORKFLOW */}
      {processingStep === 4 && activeSession && (
        <div className="space-y-6">
          
          {/* Header Info */}
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-sm text-indigo-900">Patient Verification Center</h3>
                <p className="text-xs text-indigo-700">Please review clinical data below and correct any extraction errors manually.</p>
              </div>
            </div>
            <div className="text-xs bg-indigo-200 text-indigo-900 px-3 py-1 rounded-full font-bold">
              OCR Confidence: {activeSession.confidence}%
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: ORIGINAL DOCUMENT PREVIEW */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
                <SectionHeader icon="📄" title={t('originalDocument')} subtitle="Uploaded file is immutable and stored securely" />
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-xs text-slate-800 truncate max-w-xs">{activeSession.original_name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {getCategoryLabel(mapDocTypeToCategory(activeSession.document_type))} · {(activeSession.file_size_bytes / 1024).toFixed(0)} KB
                    </div>
                  </div>
                  <a
                    href={activeSession.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 transition link-inline"
                  >
                    <Download className="w-3.5 h-3.5" /> Download File
                  </a>
                </div>

                {/* PDF/Image Preview placeholder */}
                <div className="aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative group">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800" 
                    alt="Document Scan Preview" 
                    className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition duration-500" 
                  />
                  <div className="absolute inset-0 bg-slate-950/20" />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Secure Document Scan Vault</span>
                  </div>
                </div>

                {/* RAW OCR TEXT DRAWER */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => setShowRawText(!showRawText)} 
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100 transition btn-inline"
                  >
                    <span>🔍 {t('extractedText')}</span>
                    {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showRawText && (
                    <pre className="p-4 text-[10px] text-slate-600 bg-slate-950 text-slate-200 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-60">
                      {activeSession.raw_text}
                    </pre>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: EDITABLE STRUCTURAL DATA */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
                <SectionHeader icon="🤖" title="Clinical Entity Structuring" subtitle="AI extraction results (Editable)" />
                
                {/* AI DISCLAIMER */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>{t('aiDisclaimerOcr')}</p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Doctor / Practitioner Name</label>
                      <input 
                        type="text" 
                        value={editMeta.doctor_name} 
                        onChange={e => handleMetaFieldChange('doctor_name', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Clinic / Hospital</label>
                      <input 
                        type="text" 
                        value={editMeta.hospital_name} 
                        onChange={e => handleMetaFieldChange('hospital_name', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Clinical Record Date</label>
                      <input 
                        type="date" 
                        value={editMeta.record_date} 
                        onChange={e => handleMetaFieldChange('record_date', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Record Title / Summary</label>
                      <input 
                        type="text" 
                        value={editMeta.summary} 
                        onChange={e => handleMetaFieldChange('summary', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none" 
                      />
                    </div>
                  </div>

                  {/* LAB VALUE HANDLING: DETECTED LABS */}
                  {(activeSession.document_type === 'lab_report' || editMeta.findings.length > 0) && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">🧪 Extracted Lab Findings</span>
                        <button type="button" onClick={handleAddFindingRow} className="text-[10px] font-bold text-sky-600 flex items-center gap-0.5 hover:underline">
                          + Add Finding
                        </button>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {editMeta.findings.map((f, i) => {
                          const isHigh = f.status === 'high' || f.status === 'low';
                          return (
                            <div key={i} className={`p-3 rounded-2xl border ${isHigh ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-slate-50'} space-y-2`}>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">Finding #{i + 1}</span>
                                <button type="button" onClick={() => handleDeleteRow('findings', i)} className="text-slate-400 hover:text-red-500 transition">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div>
                                  <span className="text-[9px] text-slate-400 block">Parameter</span>
                                  <input type="text" value={f.param} onChange={e => handleFindingChange(i, 'param', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded-lg text-xs" />
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 block">Value</span>
                                  <input type="text" value={f.value} onChange={e => handleFindingChange(i, 'value', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-bold" />
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 block">Unit</span>
                                  <input type="text" value={f.unit} onChange={e => handleFindingChange(i, 'unit', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded-lg text-xs" />
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 block">Ref Range</span>
                                  <input type="text" value={f.ref_range} onChange={e => handleFindingChange(i, 'ref_range', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded-lg text-xs" />
                                </div>
                              </div>
                              {isHigh && (
                                <div className="text-[10px] text-red-700 font-bold flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-red-600" />
                                  <span>{t('abnormalRange')} ({f.param} : {f.value} {f.unit} is outside {f.ref_range})</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* MEDICINE EXTRACTION: DETECTED MEDS */}
                  {(activeSession.document_type === 'prescription' || activeSession.document_type === 'ayurvedic_prescription' || editMeta.medicines.length > 0) && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">💊 Extracted Medicines</span>
                        <button type="button" onClick={handleAddMedicineRow} className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 hover:underline">
                          + Add Medicine
                        </button>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {editMeta.medicines.map((m, i) => (
                          <div key={i} className="p-3 rounded-2xl border border-emerald-100 bg-emerald-50/20 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-800">Medicine #{i + 1}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleAddRegimen(m)}
                                  className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg text-[9px] font-bold hover:bg-emerald-700 transition"
                                >
                                  + Add to Regimen
                                </button>
                                <button type="button" onClick={() => handleDeleteRow('medicines', i)} className="text-slate-400 hover:text-red-500 transition">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div className="col-span-2">
                                <span className="text-[9px] text-slate-400 block">Medicine Name</span>
                                <input type="text" value={m.name || m.medicine_name} onChange={e => handleMedicineChange(i, 'name', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded-lg text-xs" />
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 block">Dosage</span>
                                <input type="text" value={m.dosage} onChange={e => handleMedicineChange(i, 'dosage', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded-lg text-xs" />
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 block">Frequency</span>
                                <input type="text" value={m.frequency} onChange={e => handleMedicineChange(i, 'frequency', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded-lg text-xs" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AYURVEDIC TREATMENTS */}
                  {activeSession.document_type === 'ayurvedic_treatment' && (
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-bold text-slate-700">🌿 Ayurvedic Treatment Details</div>
                      {editMeta.treatments.map((tItem, i) => (
                        <div key={i} className="p-3 rounded-2xl border border-teal-200 bg-teal-50/20 space-y-2">
                          <div>
                            <span className="text-[9px] text-slate-400 block">Treatment / Procedure</span>
                            <input type="text" value={tItem.treatment_name} onChange={e => {
                              const list = [...editMeta.treatments];
                              list[i].treatment_name = e.target.value;
                              setEditMeta(prev => ({ ...prev, treatments: list }));
                            }} className="w-full p-2 border border-slate-200 rounded-lg text-xs" />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block">Notes / Observations</span>
                            <textarea rows={2} value={tItem.notes} onChange={e => {
                              const list = [...editMeta.treatments];
                              list[i].notes = e.target.value;
                              setEditMeta(prev => ({ ...prev, treatments: list }));
                            }} className="w-full p-2 border border-slate-200 rounded-lg text-xs resize-none" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setActiveSession(null);
                      setProcessingStep(0);
                    }}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition btn-inline"
                  >
                    Reset Wizard
                  </button>
                  <button
                    onClick={handleConfirmDigitization}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5 btn-inline"
                  >
                    <CheckCircle2 className="w-4 h-4" /> {t('confirmDigitization')}
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* NORMAL HISTORICAL LIST VIEW */}
      {processingStep === 0 && (
        <div className="space-y-6">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition btn-inline ${
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition btn-inline ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Decryption status / list container */}
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
                  Digitize diagnostic scans, prescriptions or treatment records to start tracking your health parameters.
                </p>
                <button
                  onClick={() => setProcessingStep(1)}
                  className="px-4 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold inline-flex items-center gap-1.5 btn-inline"
                >
                  <Camera className="w-3.5 h-3.5" /> Digitize Document
                </button>
              </div>
            ) : (
              <div className="relative border-l-2 border-sky-200 ml-4 sm:ml-6 space-y-6">
                {records.map((rec) => (
                  <div key={rec.id} className="relative pl-6 sm:pl-8 group animate-in fade-in-30">
                    
                    {/* Timeline Dot */}
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-sky-600 shadow-xs flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-600"></div>
                    </div>

                    {/* Card Body */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                            {getRecordIcon(rec.category)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-slate-900">{rec.title}</h4>
                              {rec.metadata?.digitization_session_id && (
                                <span className="text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full">
                                  Digitized
                                </span>
                              )}
                              {rec.metadata?.verified_by_doctor ? (
                                <span className="text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                                  Vaidya Verified
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  Patient Verified
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-semibold text-sky-700">{getCategoryLabel(rec.category)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-mono">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {formatDate(rec.record_date)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedRecord(rec)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-sky-700 hover:text-sky-900 border border-slate-200 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition btn-inline"
                        >
                          <span>View Details</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {rec.description}
                      </p>

                      {/* Lab findings list inside the card */}
                      {rec.metadata?.findings && rec.metadata.findings.length > 0 && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                          <div className="font-bold text-[10px] text-slate-700 uppercase tracking-wider">
                            Extracted Laboratory Metrics:
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            {rec.metadata.findings.map((f, idx) => {
                              const isHigh = f.status === 'high' || f.status === 'low';
                              return (
                                <div key={idx} className={`p-2 rounded-lg border ${isHigh ? 'border-rose-200 bg-rose-50/50' : 'border-slate-200 bg-white'}`}>
                                  <span className="text-[10px] text-slate-400 block truncate">{f.param}</span>
                                  <span className={`font-bold ${isHigh ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {f.value} {f.unit}
                                  </span>
                                  <span className="text-[8px] text-slate-400 block">Ref: {f.ref_range}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Medicines list inside the card */}
                      {rec.metadata?.medicines && rec.metadata.medicines.length > 0 && (
                        <div className="bg-emerald-50/30 p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                          <div className="font-bold text-[10px] text-emerald-800 uppercase tracking-wider">
                            Prescribed Medications:
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {rec.metadata.medicines.map((m, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-950 text-xs font-semibold">
                                💊 {m.name || m.medicine_name} ({m.dosage}) — {m.frequency}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Treatments list inside the card */}
                      {rec.metadata?.treatments && rec.metadata.treatments.length > 0 && (
                        <div className="bg-teal-50/30 p-3 rounded-xl border border-teal-100 text-xs space-y-1">
                          <div className="font-bold text-[10px] text-teal-800 uppercase tracking-wider">
                            Ayurvedic Panchakarma Treatments:
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {rec.metadata.treatments.map((tItem, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-teal-950 text-xs font-semibold">
                                🌿 {tItem.treatment_name} ({tItem.duration})
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
        </div>
      )}

      {/* Record View Detail Modal */}
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
              <div className="font-bold text-[10px] text-slate-500 uppercase tracking-wider mb-1">AI Report Summary</div>
              {selectedRecord.description}
            </div>

            {/* Doctor Note Addendum if verified */}
            {selectedRecord.metadata?.verified_by_doctor && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-purple-900">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>Clinical Verification Addendum</span>
                </div>
                <p className="text-purple-950 font-medium">{selectedRecord.metadata.doctor_notes || 'No doctor addendum notes entered.'}</p>
                <div className="text-[10px] text-purple-600">— Signed off by {selectedRecord.metadata.verified_by_doctor}</div>
              </div>
            )}

            {selectedRecord.file_url && (
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Original Scan Vault File Attachment</span>
                <a
                  href={selectedRecord.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-slate-900 transition link-inline text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" /> View Scan
                </a>
              </div>
            )}

            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
};

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-start gap-2.5 pb-2 border-b border-slate-100">
    <span className="text-2xl">{icon}</span>
    <div>
      <h3 className="font-bold text-sm text-slate-800 leading-tight">{title}</h3>
      {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);
