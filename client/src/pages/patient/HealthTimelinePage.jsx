import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { timelineAPI } from '../../services/api';
import {
  Calendar, Pill, FileText, Stethoscope, Leaf,
  Activity, Filter, ChevronRight, Search, X,
  ShieldCheck, Clock, Sparkles, FileDown, Heart
} from 'lucide-react';

const localT = {
  en: {
    healthJourney: 'Your Health Journey',
    needsVerification: 'Needs Verification',
    verified: 'Verified',
    vaidyaAssessed: 'Vaidya Assessed',
    patientReported: 'Patient-Reported',
    totalEvents: 'Total Events',
    thisYear: 'This Year',
    upcoming: 'Upcoming / Scheduled',
    searchPlaceholder: 'Search findings, doctors, medicines...',
    viewOriginal: 'View Original Document',
    sourceTraceability: 'Source Traceability',
    documentId: 'Document ID',
    sourceType: 'Source Type',
    verificationStatus: 'Verification Status',
    close: 'Close',
    noEvents: 'No health events yet',
    allEvents: 'All Events',
    records: '📄 Records',
    appointments: '🩺 Appointments / Consultations',
    medicines: '💊 Medicines',
    ayurvedicCare: '🌿 Ayurvedic Care',
    aiIntakes: '🤖 AI Intakes',
    clinicalDetails: 'Clinical Event Details',
    abnormalLabel: 'Abnormal (Outside Range)'
  },
  hi: {
    healthJourney: 'आपका स्वास्थ्य इतिहास',
    needsVerification: 'सत्यापन आवश्यक',
    verified: 'सत्यापित',
    vaidyaAssessed: 'वैद्य सत्यापित',
    patientReported: 'मरीज द्वारा रिपोर्ट',
    totalEvents: 'कुल घटनाएं',
    thisYear: 'इस वर्ष',
    upcoming: 'आगामी / अनुसूचित',
    searchPlaceholder: 'जांच, डॉक्टर, दवाइयों को खोजें...',
    viewOriginal: 'मूल दस्तऐवज देखें',
    sourceTraceability: 'स्रोत ट्रैसेबिलिटी',
    documentId: 'दस्तावेज़ आईडी',
    sourceType: 'स्रोत प्रकार',
    verificationStatus: 'सत्यापन स्थिति',
    close: 'बंद करें',
    noEvents: 'कोई घटना उपलब्ध नहीं है',
    allEvents: 'सभी घटनाएं',
    records: '📄 रिकॉर्ड्स',
    appointments: '🩺 नियुक्तियां / परामर्श',
    medicines: '💊 दवाइयां',
    ayurvedicCare: '🌿 आयुर्वेदिक उपचार',
    aiIntakes: '🤖 एआई इतिहास',
    clinicalDetails: 'क्लीनिकल जानकारी',
    abnormalLabel: 'असामान्य (श्रेणी के बाहर)'
  },
  mr: {
    healthJourney: 'तुमचा आरोग्य प्रवास',
    needsVerification: 'पडताळणी आवश्यक',
    verified: 'सत्यापित',
    vaidyaAssessed: 'वैद्य-सत्यापित',
    patientReported: 'रुग्णाने कळवलेले',
    totalEvents: 'एकूण इव्हेंट्स',
    thisYear: 'या वर्षी',
    upcoming: 'आगामी / नियोजित',
    searchPlaceholder: 'शोध घ्या (डॉक्टर, औषधे, तपासण्या)...',
    viewOriginal: 'मूळ दस्तऐवज पहा',
    sourceTraceability: 'स्रोत शोधयोग्यता',
    documentId: 'दस्तऐवज आयडी',
    sourceType: 'स्रोत प्रकार',
    verificationStatus: 'पडताळणी स्थिती',
    close: 'बंद करा',
    noEvents: 'अद्याप कोणतेही आरोग्य इव्हेंट नाहीत',
    allEvents: 'सर्व इव्हेंट्स',
    records: '📄 रेकॉर्ड्स',
    appointments: '🩺 भेटी आणि सल्लामसलत',
    medicines: '💊 औषधे',
    ayurvedicCare: '🌿 आयुर्वेदिक उपचार',
    aiIntakes: '🤖 एआय नोंदी',
    clinicalDetails: 'तपशीलवार माहिती',
    abnormalLabel: 'असामान्य (श्रेणीबाहेर)'
  }
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'medical_record', label: '📄 Records' },
  { id: 'appointment', label: '🩺 Consultations' },
  { id: 'medicine', label: '💊 Medicines' },
  { id: 'ayurvedic', label: '🌿 Ayurvedic Care' },
  { id: 'ai_intake', label: '🤖 AI Intakes' }
];

export const HealthTimelinePage = () => {
  const { currentLanguage = 'en' } = useLanguage();
  const { addToast } = useNotification();
  const lang = localT[currentLanguage] || localT['en'];

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await timelineAPI.getTimeline();
      setEvents(res.data?.timeline || []);
    } catch (err) {
      console.error('Fetch timeline error', err);
      addToast({
        title: 'Error',
        message: 'Failed to load health timeline events.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const getStatusLabel = (status, type) => {
    if (type === 'ayurveda_assessment') return lang.vaidyaAssessed;
    if (status === 'verified') return lang.verified;
    if (status === 'needs_verification') return lang.needsVerification;
    if (status === 'patient_reported') return lang.patientReported;
    if (status === 'completed') return lang.verified;
    if (status === 'scheduled') return lang.upcoming;
    return '';
  };

  const getStatusClass = (status, type) => {
    if (type === 'ayurveda_assessment') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (status === 'verified') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'needs_verification') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (status === 'patient_reported') return 'bg-slate-50 text-slate-600 border-slate-200';
    if (status === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'scheduled') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'hidden';
  };

  // Filter and search logic
  const filteredEvents = events.filter(e => {
    // 1. Category Filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'ayurvedic') {
        if (e.type !== 'ayurveda_treatment' && e.type !== 'ayurveda_assessment') return false;
      } else {
        if (e.type !== activeFilter) return false;
      }
    }

    // 2. Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const textToSearch = [
        e.title,
        e.subtitle,
        e.description,
        e.metadata?.doctor_name,
        e.metadata?.hospital_name,
        e.metadata?.chief_complaint,
        e.metadata?.ai_summary
      ].filter(Boolean).join(' ').toLowerCase();

      return textToSearch.includes(q);
    }

    return true;
  });

  // Group by year
  const groupedByYear = {};
  filteredEvents.forEach(e => {
    const year = e.date ? e.date.split('-')[0] : 'Unknown';
    if (!groupedByYear[year]) {
      groupedByYear[year] = [];
    }
    groupedByYear[year].push(e);
  });

  const sortedYears = Object.keys(groupedByYear).sort((a, b) => b - a);

  // Statistics counters
  const totalCount = events.length;
  const verifiedCount = events.filter(e => e.status === 'verified' || e.type === 'ayurveda_assessment').length;
  const pendingCount = events.filter(e => e.status === 'needs_verification').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
          <Calendar className="w-6 h-6 text-sky-600" />
          {lang.healthJourney}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Chronological composite of your modern, Ayurvedic and AI-extracted clinical records.
        </p>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">{lang.totalEvents}</div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-emerald-600">{verifiedCount}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">{lang.verified}</div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">{lang.needsVerification}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={lang.searchPlaceholder}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white shadow-inner transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition whitespace-nowrap btn-inline ${
                activeFilter === f.id
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-600/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* TIMELINE COMPONENT */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800">{lang.noEvents}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or add new medical parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedYears.map(year => (
            <div key={year} className="space-y-4">
              
              {/* Year marker */}
              <div className="flex items-center gap-3 py-2">
                <span className="text-sm font-extrabold text-slate-800 bg-sky-50 px-4 py-1 rounded-full border border-sky-100 shadow-sm">
                  {year}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Dotted Vertical Timeline Layout */}
              <div className="relative border-l-2 border-dashed border-sky-200 ml-4 sm:ml-6 space-y-5">
                {groupedByYear[year].map(event => {
                  return (
                    <div key={event.id} className="relative pl-7 sm:pl-10 group">
                      
                      {/* Timeline Dot with Emoji Icon */}
                      <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-white border-2 border-sky-600 shadow-md flex items-center justify-center text-sm z-10 transition duration-300 group-hover:scale-110 group-hover:border-indigo-600">
                        {event.icon}
                      </div>

                      {/* Timeline Event Card */}
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="w-full text-left bg-white rounded-3xl border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md p-4 transition duration-300 flex items-start sm:items-center justify-between gap-3 group/card"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{event.date}</span>
                            {event.status && (
                              <span className={`text-[8px] uppercase font-extrabold px-2 py-0.5 rounded border leading-none ${getStatusClass(event.status, event.type)}`}>
                                {getStatusLabel(event.status, event.type)}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover/card:text-sky-600 transition truncate">
                            {event.title}
                          </h4>
                          
                          <p className="text-xs text-slate-500 line-clamp-1 truncate">
                            {event.description}
                          </p>
                        </div>

                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover/card:text-sky-600 shrink-0 self-center group-hover/card:translate-x-0.5 transition" />
                      </button>

                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* DETAIL DRAWER / SLIDE-OUT PANEL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
          
          {/* Backdrop click close */}
          <div className="flex-1" onClick={() => setSelectedEvent(null)} />
          
          {/* Drawer container */}
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedEvent.icon}</span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{lang.clinicalDetails}</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{selectedEvent.date}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Event Overview Card */}
              <div className="bg-sky-50/30 border border-sky-100/50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{selectedEvent.title}</h4>
                  {selectedEvent.status && (
                    <span className={`text-[8px] uppercase font-extrabold px-2 py-0.5 rounded border ${getStatusClass(selectedEvent.status, selectedEvent.type)}`}>
                      {getStatusLabel(selectedEvent.status, selectedEvent.type)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedEvent.description}</p>
              </div>

              {/* Dynamic Details Parser based on event.type */}
              
              {/* Case 1: Medical Record Details */}
              {selectedEvent.type === 'medical_record' && (
                <div className="space-y-4">
                  {/* Doctor & Hospital metadata */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-400 block text-[9px] uppercase">Clinician / Doctor</span>
                      <span className="font-bold text-slate-800">{selectedEvent.metadata?.doctor_name}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-400 block text-[9px] uppercase">Clinic / Hospital</span>
                      <span className="font-bold text-slate-800">{selectedEvent.metadata?.hospital_name}</span>
                    </div>
                  </div>

                  {/* Findings */}
                  {selectedEvent.metadata?.findings?.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-bold text-xs text-slate-700 block uppercase tracking-wider">🔬 Findings & Laboratory Results</span>
                      <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                        {selectedEvent.metadata.findings.map((f, i) => (
                          <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                            <div>
                              <span className="font-bold text-slate-800 block">{f.param}</span>
                              <span className="text-[10px] text-slate-400 block">Ref: {f.ref_range || 'N/A'} {f.unit}</span>
                            </div>
                            <div className="text-right">
                              <span className={`font-extrabold text-sm ${f.status === 'high' || f.status === 'low' ? 'text-rose-600' : 'text-slate-800'}`}>
                                {f.value} {f.unit}
                              </span>
                              {(f.status === 'high' || f.status === 'low') && (
                                <span className="block text-[8px] uppercase font-bold text-rose-500">{lang.abnormalLabel}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prescribed Medicines */}
                  {selectedEvent.metadata?.medicines?.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-bold text-xs text-slate-700 block uppercase tracking-wider">💊 Prescribed Medicines</span>
                      <div className="grid grid-cols-1 gap-2.5">
                        {selectedEvent.metadata.medicines.map((m, i) => (
                          <div key={i} className="p-3 border border-emerald-100 bg-emerald-50/10 rounded-2xl flex items-start gap-2.5">
                            <span className="text-base mt-0.5">💊</span>
                            <div>
                              <span className="font-bold text-slate-800 block text-xs">{m.name} ({m.dosage})</span>
                              <span className="text-[10px] text-slate-500 block">Freq: {m.frequency} | Dur: {m.duration_days ? `${m.duration_days} days` : 'Ongoing'}</span>
                              {m.instructions && <span className="text-[10px] text-sky-700 font-semibold block mt-0.5">Inst: {m.instructions}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Panchakarma / Ayurvedic Treatments */}
                  {selectedEvent.metadata?.treatments?.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-bold text-xs text-slate-700 block uppercase tracking-wider">🧘 Ayurvedic Treatments</span>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedEvent.metadata.treatments.map((t, i) => (
                          <div key={i} className="p-3 border border-purple-100 bg-purple-50/10 rounded-2xl">
                            <span className="font-bold text-slate-800 text-xs block">{t.treatment_name} ({t.treatment_type})</span>
                            <span className="text-[10px] text-slate-500 block">Duration: {t.duration}</span>
                            {t.notes && <p className="text-[11px] text-slate-600 mt-1 italic">"{t.notes}"</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View original attachment */}
                  {selectedEvent.metadata?.file_url && (
                    <a
                      href={selectedEvent.metadata.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <FileDown className="w-4 h-4" />
                      {lang.viewOriginal}
                    </a>
                  )}

                </div>
              )}

              {/* Case 2: Ayurvedic Assessment Details (Dashavidha Pariksha) */}
              {selectedEvent.type === 'ayurveda_assessment' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 border border-purple-200 rounded-2xl text-xs space-y-1.5 text-purple-950">
                    <span className="font-bold block text-[10px] text-purple-700 uppercase">🌿 Ayurvedic Diagnostic Outcomes</span>
                    <div className="grid grid-cols-2 gap-2 pt-1 font-semibold text-slate-700">
                      <div>Prakriti: <span className="font-bold text-purple-900">{selectedEvent.metadata?.prakriti || 'Vata-Pitta'}</span></div>
                      <div>Vikriti: <span className="font-bold text-purple-900">{selectedEvent.metadata?.vikriti || 'Pitta'}</span></div>
                      <div>Agni: <span className="font-bold text-purple-900">{selectedEvent.metadata?.agni || 'Manda'}</span></div>
                      <div>Koshtha: <span className="font-bold text-purple-900">{selectedEvent.metadata?.koshtha || 'Madhyama'}</span></div>
                    </div>
                  </div>

                  {/* Dashavidha Pariksha Elements */}
                  <div className="space-y-2">
                    <span className="font-bold text-xs text-slate-700 block uppercase tracking-wider">🔟 Dashavidha Pariksha (10-fold Assessment)</span>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                      {selectedEvent.metadata?.elements && Object.keys(selectedEvent.metadata.elements).map((elKey, idx) => (
                        <div key={idx} className="p-3 flex justify-between gap-4">
                          <span className="font-bold text-slate-700 capitalize">{elKey.replace('_', ' ')}</span>
                          <span className="text-slate-900 font-semibold">{selectedEvent.metadata.elements[elKey]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Case 3: Ayurvedic Treatment Details */}
              {selectedEvent.type === 'ayurveda_treatment' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex justify-between border-b pb-1.5 text-slate-500">
                      <span>Vaidya / Practitioner:</span>
                      <span className="font-bold text-slate-800">{selectedEvent.metadata?.practitioner || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 text-slate-500">
                      <span>Treatment Duration:</span>
                      <span className="font-bold text-slate-800">{selectedEvent.metadata?.duration || 'N/A'}</span>
                    </div>
                    {selectedEvent.metadata?.follow_up_date && (
                      <div className="flex justify-between text-slate-500">
                        <span>Follow Up Date:</span>
                        <span className="font-bold text-slate-800">{selectedEvent.metadata.follow_up_date}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Case 4: AI Clinical Intake Details */}
              {selectedEvent.type === 'ai_intake' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-2">
                    <span className="font-bold text-xs text-slate-700 block uppercase tracking-wider">🤖 AI Summary & Symptoms Draft</span>
                    <p className="bg-slate-50 p-3.5 border rounded-2xl text-slate-700 leading-relaxed italic">
                      "{selectedEvent.metadata?.ai_summary || 'Draft clinical synthesis.'}"
                    </p>
                  </div>

                  {/* Symptoms */}
                  {selectedEvent.metadata?.symptoms?.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-bold text-xs text-slate-700 block uppercase">Reported Symptoms</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEvent.metadata.symptoms.map((sym, i) => (
                          <span key={i} className="bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-800 font-medium">
                            {sym}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Case 5: Medicine Details */}
              {selectedEvent.type === 'medicine' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex justify-between border-b pb-1.5 text-slate-500">
                      <span>Dose Regimen:</span>
                      <span className="font-bold text-slate-800">{selectedEvent.metadata?.dosage}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 text-slate-500">
                      <span>Frequency:</span>
                      <span className="font-bold text-slate-800">{selectedEvent.metadata?.frequency}</span>
                    </div>
                    {selectedEvent.metadata?.route && (
                      <div className="flex justify-between border-b pb-1.5 text-slate-500">
                        <span>Route of Administration:</span>
                        <span className="font-bold text-slate-800">{selectedEvent.metadata.route}</span>
                      </div>
                    )}
                    {selectedEvent.metadata?.duration_days && (
                      <div className="flex justify-between border-b pb-1.5 text-slate-500">
                        <span>Duration:</span>
                        <span className="font-bold text-slate-800">{selectedEvent.metadata.duration_days} days</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Traceability & Security Verification */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="font-bold text-xs text-slate-700 block uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  {lang.sourceTraceability}
                </span>

                <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang.documentId}:</span>
                    <span className="font-mono font-bold text-slate-800 text-[10px] break-all max-w-[200px] text-right">
                      {selectedEvent.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang.sourceType}:</span>
                    <span className="font-semibold text-slate-800 uppercase text-[10px]">
                      {selectedEvent.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang.verificationStatus}:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedEvent.status === 'verified' ? 'Clinician Signed' : 'Patient Declared / OCR Parsed'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal pt-1 border-t border-slate-200/50">
                    🛡️ This clinical record is stored locally using AES hashes and audited for secure role-based access control.
                  </p>
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold shadow-sm transition btn-inline"
              >
                {lang.close}
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
