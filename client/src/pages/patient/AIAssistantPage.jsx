import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { aiAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  Bot, Sparkles, Send, ArrowRight, FileQuestion,
  FileText, AlertTriangle, Loader2, Mic, MicOff,
  ChevronRight, Heart, Pill, Calendar, Leaf,
  Activity, Shield, RefreshCw, Copy, Check,
  X, Info, Zap
} from 'lucide-react';

// ─── Quick Prompt Chips ──────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { icon: '💊', label: 'My medicines', prompt: 'What medicines am I currently taking?' },
  { icon: '🩺', label: 'My conditions', prompt: 'What chronic conditions do I have?' },
  { icon: '📋', label: 'Health summary', prompt: 'Give me a summary of my health records' },
  { icon: '📅', label: 'Appointments', prompt: 'When is my next appointment?' },
  { icon: '🌿', label: 'Ayurveda', prompt: 'What is my Prakriti and Dosha?' },
  { icon: '🩸', label: 'Blood group', prompt: 'What is my blood group?' },
  { icon: '🧪', label: 'Lab results', prompt: 'Explain my latest lab results' },
  { icon: '🏥', label: 'Doctor prep', prompt: 'Help me prepare for my next doctor visit' },
];

const RED_FLAG_KEYWORDS = [
  'chest pain', 'difficulty breathing', "can't breathe", 'cannot breathe',
  'stroke', 'unconscious', 'severe bleeding', 'sudden weakness', 'paralysis',
  'loss of consciousness', 'severe headache', 'sudden vision loss', 'slurred speech',
  'heart attack', 'seizure', 'convulsion', 'suicidal', 'overdose',
];

function detectRedFlag(text) {
  const lower = text.toLowerCase();
  return RED_FLAG_KEYWORDS.some(kw => lower.includes(kw));
}

// ─── Message Bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (msg.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] sm:max-w-[70%]">
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed whitespace-pre-line"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              color: '#fff',
              boxShadow: '0 2px 12px rgba(99,102,241,0.3)'
            }}
          >
            {msg.content}
          </div>
          <div className="text-right text-[10px] text-slate-400 mt-1 pr-1">{msg.time}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4 gap-2">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
      >
        <Bot className="w-4 h-4 text-white" />
      </div>

      <div className="max-w-[80%] sm:max-w-[72%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-indigo-700">AI Health Assistant</span>
          {msg.used_openai && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-600 flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" /> GPT-4o
            </span>
          )}
        </div>
        <div
          className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed whitespace-pre-line relative group"
          style={{
            background: '#f1f5f9',
            color: '#1e293b',
            border: '1px solid #e2e8f0'
          }}
        >
          {msg.content}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700"
            title="Copy"
          >
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        {msg.disclaimer && (
          <p className="text-[10px] text-slate-400 mt-1 ml-1 flex items-center gap-1">
            <Shield className="w-2.5 h-2.5" /> AI-assisted — verify with your healthcare professional
          </p>
        )}
        <div className="text-[10px] text-slate-400 mt-1 ml-1">{msg.time}</div>
      </div>
    </div>
  );
}

// ─── Typing Indicator ────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4 gap-2">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
      >
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-100 border border-slate-200 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        <span className="text-xs text-slate-400 ml-1">Thinking…</span>
      </div>
    </div>
  );
}

// ─── Red Flag Banner ─────────────────────────────────────────────────────────
function RedFlagBanner({ onDismiss }) {
  return (
    <div
      role="alert"
      className="rounded-2xl p-4 flex items-start gap-3 mb-4"
      style={{
        background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
        border: '2px solid #f87171',
        boxShadow: '0 4px 20px rgba(239,68,68,0.15)'
      }}
    >
      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-5 h-5 text-red-600" />
      </div>
      <div className="flex-1">
        <div className="font-bold text-red-800 text-sm mb-1">⚠️ Possible Urgent Symptom Detected</div>
        <p className="text-xs text-red-700 leading-relaxed">
          If you are experiencing severe chest pain, difficulty breathing, sudden weakness, stroke symptoms, or loss of consciousness —{' '}
          <strong>please contact emergency services or go to a hospital immediately.</strong>
        </p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <a
            href="tel:112"
            id="emergency-call-112"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}
          >
            📞 Call 112
          </a>
          <a
            href="tel:102"
            id="emergency-call-102"
            className="px-4 py-2 rounded-xl text-xs font-bold text-red-700 border border-red-200 bg-red-50 flex items-center gap-1.5"
          >
            🚑 Ambulance 102
          </a>
          <button
            onClick={onDismiss}
            id="dismiss-red-flag"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 border border-slate-200 bg-white flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Health Context Cards ─────────────────────────────────────────────────────
const CONTEXT_CARDS = [
  { icon: <Pill className="w-4 h-4" />, label: 'Medicines', color: '#6366f1', prompt: 'What medicines am I taking?' },
  { icon: <Heart className="w-4 h-4" />, label: 'Conditions', color: '#ef4444', prompt: 'What conditions do I have?' },
  { icon: <Calendar className="w-4 h-4" />, label: 'Appointments', color: '#0ea5e9', prompt: 'When is my next appointment?' },
  { icon: <Leaf className="w-4 h-4" />, label: 'Ayurveda', color: '#10b981', prompt: 'What is my Ayurvedic profile?' },
  { icon: <Activity className="w-4 h-4" />, label: 'Lab Results', color: '#f59e0b', prompt: 'What do my lab results mean?' },
  { icon: <Shield className="w-4 h-4" />, label: 'Emergency Info', color: '#8b5cf6', prompt: 'What is my blood group and emergency info?' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export const AIAssistantPage = () => {
  const { addToast } = useNotification();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! 🙏 I am your AI Health Assistant, connected to your Health Passport.\n\nI can help you understand your medicines, health records, lab results, appointments, and Ayurvedic profile — all pulled from your actual records.\n\n⚠️ I provide informational summaries only. All medical decisions should be made by a qualified healthcare professional.\n\nHow can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      disclaimer: false,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [redFlagDetected, setRedFlagDetected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Voice input
  const startVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      addToast({ title: 'Voice Not Supported', message: 'Voice input is not supported in your browser.', type: 'warning' });
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + transcript);
    };
    recognition.onerror = () => {
      addToast({ title: 'Voice Error', message: 'Could not capture voice. Please try again.', type: 'error' });
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [addToast]);

  const handleSend = async (overrideText) => {
    const msg = (overrideText ?? input).trim();
    if (!msg || loading) return;

    const isRedFlag = detectRedFlag(msg);
    if (isRedFlag) setRedFlagDetected(true);

    const userMsg = {
      role: 'user',
      content: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowQuickPrompts(false);
    setLoading(true);

    try {
      // Send to backend with conversation history for context
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-8)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await aiAPI.chat(msg, history);
      const data = res.data;

      if (data.red_flag) setRedFlagDetected(true);

      const assistantMsg = {
        role: 'assistant',
        content: data.reply || 'I was unable to generate a response. Please try again.',
        disclaimer: true,
        used_openai: data.used_openai,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      addToast({ title: 'AI Error', message: 'Could not connect to AI service. Please try again.', type: 'error' });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I encountered an error. Please check your connection and try again.\n\n⚠️ If this is urgent, call 112 for emergency services.',
        disclaimer: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared. Namaste! 🙏 How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      disclaimer: false,
    }]);
    setRedFlagDetected(false);
    setShowQuickPrompts(true);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🤖 AI Health Assistant</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your personal health companion — powered by your Health Passport</p>
        </div>
        <button
          onClick={handleClearChat}
          id="clear-chat-btn"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition"
          title="Clear conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Clear chat
        </button>
      </div>

      {/* ─── Red Flag Alert ──────────────────────────────────────── */}
      {redFlagDetected && <RedFlagBanner onDismiss={() => setRedFlagDetected(false)} />}

      {/* ─── Main Chat Window ────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden flex flex-col"
        style={{
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          background: '#fff',
          minHeight: '480px',
          maxHeight: '600px'
        }}
      >
        {/* Chat Header Bar */}
        <div
          className="px-5 py-3 flex items-center gap-3 border-b border-slate-100"
          style={{ background: 'linear-gradient(135deg, #f8faff, #f1f5ff)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Bot className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">AI Health Assistant</div>
            <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Connected to your Health Passport
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold flex items-center gap-1">
              <Info className="w-3 h-3" /> Not a medical diagnosis
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5" style={{ maxHeight: '420px' }}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompt Chips */}
        {showQuickPrompts && !loading && (
          <div className="px-5 py-3 border-t border-slate-100 overflow-x-auto">
            <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wide">Quick questions</div>
            <div className="flex gap-2 flex-wrap">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.prompt}
                  id={`quick-prompt-${p.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleSend(p.prompt)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition disabled:opacity-50"
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#475569'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#e0e7ff';
                    e.currentTarget.style.borderColor = '#a5b4fc';
                    e.currentTarget.style.color = '#4338ca';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.color = '#475569';
                  }}
                >
                  <span>{p.icon}</span> {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center gap-2 bg-white">
          <button
            id="voice-input-btn"
            onClick={startVoiceInput}
            disabled={loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition border disabled:opacity-40"
            style={{
              background: isListening ? '#fee2e2' : '#f1f5f9',
              borderColor: isListening ? '#fca5a5' : '#e2e8f0',
              color: isListening ? '#dc2626' : '#64748b'
            }}
            title={isListening ? 'Listening…' : 'Voice input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            ref={inputRef}
            id="ai-chat-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !loading && handleSend()}
            placeholder="Ask about your medicines, records, lab results, appointments…"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 transition"
            disabled={loading}
          />

          <button
            id="ai-chat-send"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ─── Health Context Quick-Access Cards ──────────────────── */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" /> Ask about your health
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CONTEXT_CARDS.map(card => (
            <button
              key={card.label}
              id={`context-card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => handleSend(card.prompt)}
              disabled={loading}
              className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white text-left hover:border-indigo-200 hover:shadow-md transition group disabled:opacity-50"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
                style={{ background: card.color, opacity: 0.9 }}
              >
                {card.icon}
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700 transition">{card.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 ml-auto transition" />
            </button>
          ))}
        </div>
      </div>

      {/* ─── Existing AI Tools ───────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3">More AI Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/patient/ai-summary"
            id="nav-ai-health-summary"
            className="flex items-start gap-3 p-5 rounded-2xl text-white hover:shadow-xl transition group"
            style={{ background: 'linear-gradient(135deg, #0c4a6e, #1e40af)' }}
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">AI Health Summary</div>
              <p className="text-xs text-white/70 mt-0.5">Consolidated overview of your entire health record</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white mt-1 group-hover:translate-x-0.5 transition" />
          </Link>

          <Link
            to="/patient/report-explainer"
            id="nav-report-explainer"
            className="flex items-start gap-3 p-5 rounded-2xl text-white hover:shadow-xl transition group"
            style={{ background: 'linear-gradient(135deg, #4c1d95, #6d28d9)' }}
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">Report Explainer</div>
              <p className="text-xs text-white/70 mt-0.5">Understand lab reports in plain language</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white mt-1 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>
      </div>

      {/* ─── Safety Disclaimer Footer ────────────────────────────── */}
      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: '#f8faff', border: '1px solid #e0e7ff' }}
      >
        <Shield className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold text-indigo-800 mb-0.5">Privacy & Safety Notice</div>
          <p className="text-[11px] text-indigo-600 leading-relaxed">
            All responses are generated from <strong>your own Health Passport data only</strong>. Your data is never shared externally. This AI assistant provides informational summaries — it is not a substitute for professional medical advice, diagnosis, or treatment. For emergencies, always call <strong>112</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
