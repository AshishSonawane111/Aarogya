/**
 * ClinicalIntakeWizard — Phase 3
 * Step-by-step AI-guided clinical history intake.
 * Supports: Voice (STT), Touch (options), Typing.
 * Fully multilingual (EN/HI/MR via LanguageContext).
 * Red-flag detection is deterministic (server-side rule) — NOT AI diagnosis.
 */

import React, { useState, useRef, useCallback } from 'react';
import { clinicalHistoryAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { speakText, stopSpeaking, createSpeechRecognizer } from '../../utils/speech';
import {
  Mic, MicOff, Volume2, VolumeX, CheckCircle, RefreshCw,
  ChevronRight, AlertTriangle, Sparkles, Loader2, Edit3,
  FileText, Shield, ClipboardList
} from 'lucide-react';

const TOTAL_QUESTIONS = 14;

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ answered, total }) => {
  const pct = Math.round((answered / total) * 100);
  const label =
    pct === 0 ? "Let's begin!" :
    pct < 30 ? 'Good start!' :
    pct < 60 ? 'Making progress...' :
    pct < 90 ? 'Almost there!' :
    'Nearly done!';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
        <span>{answered} of {total} answered</span>
        <span className="text-indigo-600">{label}</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Red-flag alert ───────────────────────────────────────────────────────────
const RedFlagAlert = ({ label, redFlagWarning, onDismiss }) => (
  <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 flex items-start gap-3 shadow" role="alert">
    <AlertTriangle className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
    <div className="flex-1">
      <div className="font-bold text-red-800 text-base">⚠️ Possible Urgent Symptom Detected</div>
      <p className="text-sm text-red-700 mt-1 leading-relaxed">
        {redFlagWarning || 'Your symptoms may require urgent medical attention. Please contact hospital or triage staff immediately.'}
      </p>
      <p className="text-xs text-red-600 mt-1 font-semibold italic">{label}</p>
      <div className="flex gap-2 mt-3 flex-wrap">
        <a href="tel:112" className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl link-inline">📞 Call 112</a>
        <a href="tel:102" className="px-4 py-2 bg-red-100 text-red-700 text-sm font-bold rounded-xl border border-red-300 link-inline">🚑 Ambulance 102</a>
        <button onClick={onDismiss} className="px-4 py-2 bg-white text-slate-600 text-sm font-semibold rounded-xl border border-slate-300 btn-inline">
          Acknowledge &amp; Continue
        </button>
      </div>
    </div>
  </div>
);

// ─── Summary card ─────────────────────────────────────────────────────────────
const SummaryView = ({ summary, t, onConfirm, onEdit, confirming }) => {
  const fields = [
    { key: 'chief_complaint', label: t('chiefComplaint'), icon: '🩺' },
    { key: 'history_of_present_illness', label: t('hpi'), icon: '📖' },
    { key: 'past_medical_history', label: t('pastMedical'), icon: '📋' },
    { key: 'past_surgical_history', label: t('pastSurgical'), icon: '🏥' },
    { key: 'current_medications', label: t('medications'), icon: '💊' },
    { key: 'allergies', label: t('allergies'), icon: '⚠️' },
    { key: 'family_history', label: t('familyHistory'), icon: '👨‍👩‍👧' },
    { key: 'personal_history', label: t('personalHistory'), icon: '🧬' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-800 font-semibold">{t('summaryDisclaimer')}</p>
      </div>

      <div className="space-y-3">
        {fields.map(f => (
          summary[f.key] && summary[f.key] !== 'Not recorded' ? (
            <div key={f.key} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                {f.icon} {f.label}
              </div>
              <p className="text-sm text-slate-800 leading-relaxed">{summary[f.key]}</p>
            </div>
          ) : null
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition btn-inline"
        >
          <Edit3 className="w-4 h-4" /> {t('editHistory')}
        </button>
        <button
          onClick={onConfirm}
          disabled={confirming}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50 btn-inline shadow-md shadow-indigo-200"
        >
          {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {t('confirmHistory')}
        </button>
      </div>
    </div>
  );
};

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export const ClinicalIntakeWizard = ({ onComplete }) => {
  const { currentLanguage, t } = useLanguage();
  const lang = currentLanguage;

  const [phase, setPhase] = useState('idle');
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [pendingAnswer, setPendingAnswer] = useState('');
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [redFlag, setRedFlag] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognizerRef = useRef(null);
  const inputRef = useRef(null);

  const speakQuestion = useCallback((qObj) => {
    if (!qObj) return;
    const text = qObj[lang] || qObj.en;
    setIsSpeaking(true);
    speakText(text, lang, () => setIsSpeaking(false));
  }, [lang]);

  const stopSpeech = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await clinicalHistoryAPI.startSession();
      const data = res.data;
      setSessionId(data.session_id);
      setCurrentQuestion(data.next_question);
      setAnsweredCount(data.answers_so_far);
      setPhase('active');
      setTimeout(() => speakQuestion(data.next_question), 400);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setPhase('completing');
    try {
      const res = await clinicalHistoryAPI.completeSession(sessionId);
      setSummary(res.data.ai_summary);
      setPhase('review');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not generate summary. Please try again.');
      setPhase('error');
    }
  };

  const handleSubmitAnswer = async (answer) => {
    if (!answer?.trim() || !sessionId || !currentQuestion) return;
    setLoading(true);
    stopSpeech();
    try {
      const res = await clinicalHistoryAPI.submitAnswer(sessionId, {
        question_id: currentQuestion.id,
        answer: answer.trim(),
      });
      const data = res.data;
      setAnsweredCount(prev => prev + 1);
      setCurrentAnswer('');
      setPendingAnswer('');
      setAwaitingConfirm(false);
      setError('');

      if (data.red_flag?.detected) {
        setRedFlag(data.red_flag.label);
        setPhase('redFlag');
      } else if (data.done) {
        await handleComplete();
      } else {
        setCurrentQuestion(data.next_question);
        setPhase('active');
        setTimeout(() => speakQuestion(data.next_question), 400);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const continueAfterRedFlag = () => {
    setRedFlag(null);
    // Move to next question
    const nextAnswer = pendingAnswer || currentAnswer || 'Noted';
    setCurrentAnswer('');
    setPendingAnswer('');
    handleSubmitAnswer(nextAnswer);
  };

  const handleConfirmSubmit = () => {
    setPhase('done');
    if (onComplete) onComplete(summary);
  };

  const startListening = () => {
    if (recognizerRef.current) recognizerRef.current.stop();
    const rec = createSpeechRecognizer(
      lang,
      (transcript) => setPendingAnswer(transcript),
      (err) => {
        if (typeof err === 'string' && err.includes('not supported')) setSpeechSupported(false);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
        setAwaitingConfirm(true);
      }
    );
    recognizerRef.current = rec;
    if (!rec.supported) { setSpeechSupported(false); return; }
    setIsListening(true);
    setPendingAnswer('');
    setAwaitingConfirm(false);
    rec.start();
  };

  const stopListening = () => {
    if (recognizerRef.current) recognizerRef.current.stop();
    setIsListening(false);
  };

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">AI Clinical History</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            I will ask you a few questions about your health — one at a time.
            You can <strong>speak</strong>, <strong>type</strong>, or <strong>choose</strong> from options.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: Volume2, label: 'I ask', sub: 'in your language', bg: 'bg-indigo-50', tc: 'text-indigo-600' },
            { icon: Mic, label: 'You answer', sub: 'speak or type', bg: 'bg-emerald-50', tc: 'text-emerald-600' },
            { icon: FileText, label: 'Summary', sub: 'for your doctor', bg: 'bg-purple-50', tc: 'text-purple-600' },
          ].map(({ icon: Icon, label, sub, bg, tc }) => (
            <div key={label} className={`rounded-xl p-3 space-y-1 ${bg}`}>
              <Icon className={`w-5 h-5 mx-auto ${tc}`} />
              <div className={`text-xs font-bold ${tc}`}>{label}</div>
              <div className="text-[10px] text-slate-500">{sub}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/80 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>This is a history-taking assistant</strong> — not a diagnostic tool.
            It collects information for your doctor's review. It does not diagnose, prescribe, or replace your doctor.
          </p>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base hover:opacity-90 transition shadow-lg shadow-indigo-300 disabled:opacity-50 flex items-center justify-center gap-2 btn-inline"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
          {t('startIntake')}
        </button>
      </div>
    );
  }

  if (phase === 'redFlag') {
    return (
      <RedFlagAlert
        label={redFlag}
        redFlagWarning={t('redFlagWarning')}
        onDismiss={continueAfterRedFlag}
      />
    );
  }

  if (phase === 'completing') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
        <p className="text-base font-semibold text-slate-700">{t('intakeComplete')}</p>
        <p className="text-xs text-slate-400">AI is organising your history for clinician review</p>
      </div>
    );
  }

  if (phase === 'review' && summary) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">{t('summaryTitle')}</h2>
        </div>
        <p className="text-sm text-slate-600">Please review what you told us. You can edit before confirming.</p>
        <SummaryView
          summary={summary}
          t={t}
          onConfirm={handleConfirmSubmit}
          onEdit={() => setPhase('active')}
          confirming={loading}
        />
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{t('historyConfirmed')}</h2>
        <p className="text-sm text-slate-600 max-w-sm mx-auto">
          Your clinical history has been saved and is ready for your doctor's review.
          The doctor will verify and sign off before it becomes a clinical record.
        </p>
        {summary?.chief_complaint && (
          <div className="bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-500 text-left">
            <strong>Chief Complaint:</strong> {summary.chief_complaint}
          </div>
        )}
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-sm font-semibold text-red-800">{error || 'Something went wrong.'}</p>
        <button onClick={() => { setPhase('idle'); setError(''); }} className="px-4 py-2 bg-white border border-red-300 rounded-xl text-sm text-red-700 font-semibold btn-inline">
          Start Over
        </button>
      </div>
    );
  }

  // ── ACTIVE QUESTION ───────────────────────────────────────────────────────
  const questionText = currentQuestion ? (currentQuestion[lang] || currentQuestion.en) : '';
  const questionIcon = currentQuestion?.icon || '🩺';

  return (
    <div className="space-y-5">
      <ProgressBar answered={answeredCount} total={TOTAL_QUESTIONS} />

      <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-sm overflow-hidden">
        {/* Question */}
        <div className="px-5 pt-6 pb-3 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-4xl leading-none">{questionIcon}</span>
            <p className="text-xl font-bold text-slate-900 leading-snug flex-1 pt-1">
              {questionText}
            </p>
          </div>
          <button
            onClick={isSpeaking ? stopSpeech : () => speakQuestion(currentQuestion)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition btn-inline ${
              isSpeaking ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isSpeaking ? 'Stop' : t('listen')}
          </button>
        </div>

        {/* Scale options */}
        {currentQuestion?.type === 'scale' && (
          <div className="px-5 pb-4">
            <p className="text-xs text-slate-500 mb-2 font-semibold">Tap a number:</p>
            <div className="flex flex-wrap gap-2">
              {(currentQuestion.options || []).map(opt => (
                <button
                  key={opt}
                  onClick={() => handleSubmitAnswer(opt)}
                  disabled={loading}
                  className={`w-11 h-11 rounded-xl font-bold text-sm transition border-2 btn-inline ${
                    parseInt(opt) <= 3 ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100' :
                    parseInt(opt) <= 6 ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100' :
                    'border-red-300 bg-red-50 text-red-800 hover:bg-red-100'
                  } disabled:opacity-40`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Voice confirmation */}
        {awaitingConfirm && pendingAnswer && (
          <div className="mx-5 mb-3 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3 space-y-2">
            <p className="text-xs font-bold text-indigo-700">Did I hear correctly?</p>
            <p className="text-sm text-slate-800 font-semibold">"{pendingAnswer}"</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmitAnswer(pendingAnswer)}
                disabled={loading}
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold btn-inline disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" /> {t('confirmAnswer')}
              </button>
              <button
                onClick={() => { setPendingAnswer(''); setAwaitingConfirm(false); }}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-600 text-sm font-bold btn-inline flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> {t('retryAnswer')}
              </button>
            </div>
          </div>
        )}

        {/* Text input + voice */}
        <div className="px-5 pb-5 space-y-3">
          {speechSupported && !awaitingConfirm && (
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition btn-inline border-2 ${
                isListening
                  ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200'
                  : 'bg-white border-indigo-300 text-indigo-700 hover:bg-indigo-50'
              } disabled:opacity-40`}
            >
              {isListening
                ? <><MicOff className="w-5 h-5" /> 🔴 Listening... (tap to stop)</>
                : <><Mic className="w-5 h-5" /> 🎤 {t('speak')}</>
              }
            </button>
          )}

          {speechSupported && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="flex-1 h-px bg-slate-100" />OR<div className="flex-1 h-px bg-slate-100" />
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && currentAnswer.trim() && handleSubmitAnswer(currentAnswer)}
              placeholder="Type your answer here..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
              disabled={loading || isListening}
            />
            <button
              onClick={() => handleSubmitAnswer(currentAnswer)}
              disabled={loading || !currentAnswer.trim() || isListening}
              className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm disabled:opacity-40 hover:bg-indigo-700 transition btn-inline flex items-center gap-1.5 shadow-md shadow-indigo-200"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
              Next
            </button>
          </div>

          {!currentQuestion?.required && (
            <button
              onClick={() => handleSubmitAnswer('Not applicable')}
              disabled={loading}
              className="w-full py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-50 transition btn-inline"
            >
              Skip this question
            </button>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};
