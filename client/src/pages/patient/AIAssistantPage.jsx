import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { aiAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  Bot, Sparkles, Mic, Send, ArrowRight, FileQuestion,
  FileText, AlertTriangle, Volume2, MessageSquare, Loader2
} from 'lucide-react';

const QUICK_PROMPTS = [
  'Explain my current medicines',
  'Summarize my medical history',
  'Help me prepare for my next doctor visit',
  'What do my lab results mean?',
  'What questions should I ask my doctor?',
];

const RED_FLAG_KEYWORDS = [
  'chest pain', 'difficulty breathing', 'can\'t breathe', 'stroke', 'unconscious',
  'severe bleeding', 'sudden weakness', 'paralysis', 'loss of consciousness',
  'severe headache', 'vision loss', 'slurred speech', 'heart attack',
];

const hasRedFlag = (text) =>
  RED_FLAG_KEYWORDS.some(kw => text.toLowerCase().includes(kw));

export const AIAssistantPage = () => {
  const { addToast } = useNotification();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! 🙏 I am your AI Health Assistant. I can help you understand your health records, explain your medicines, summarize your medical history, and prepare you for doctor visits.\n\n⚠️ I am not a doctor. I can help organize and explain information, but all medical decisions should be made by a qualified healthcare professional.\n\nHow can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [redFlagDetected, setRedFlagDetected] = useState(false);

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    // Red-flag check
    if (hasRedFlag(msg)) {
      setRedFlagDetected(true);
    }

    const userMsg = {
      role: 'user',
      content: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Phase 7 will add real conversational AI. For now use the AI summary endpoint
      // as a stand-in to demonstrate the interface works end-to-end.
      const res = await aiAPI.getHealthSummary();
      const summary = res.data?.summary;

      let reply = '';
      if (msg.toLowerCase().includes('medicine') || msg.toLowerCase().includes('drug')) {
        reply = `Based on your Health Passport:\n\nCurrent medicines include:\n${(summary?.current_medicines || []).join(', ') || 'No active medicines recorded.'}\n\n⚠️ Always verify medicine information with your prescribing doctor or pharmacist.`;
      } else if (msg.toLowerCase().includes('summar') || msg.toLowerCase().includes('history') || msg.toLowerCase().includes('overview')) {
        reply = summary?.summary_text || 'Your health summary is being generated. Please ensure your medical records are up to date.';
      } else if (msg.toLowerCase().includes('allerg')) {
        const allergies = summary?.allergies || [];
        reply = allergies.length > 0
          ? `Your recorded allergies: ${allergies.join(', ')}.\n\nPlease verify this list with your doctor and ensure it is always up to date.`
          : 'No allergies are currently recorded in your Health Passport. If you have known allergies, please update your emergency profile.';
      } else if (msg.toLowerCase().includes('doctor') || msg.toLowerCase().includes('visit') || msg.toLowerCase().includes('prepare')) {
        reply = `Here are helpful things to bring to your next doctor visit:\n\n1. Your Health Passport QR code\n2. List of current medicines\n3. Recent lab reports\n4. List of questions you want to ask\n5. Any new or worsening symptoms\n\n📋 I can generate a full AI clinical summary for your doctor from your records.`;
      } else {
        reply = `I've noted your question: "${msg}"\n\nFull conversational AI is coming in Phase 7 — powered by OpenAI. It will be able to:\n• Ask adaptive follow-up questions\n• Collect structured clinical history\n• Detect red-flag symptoms\n• Generate doctor-ready summaries\n\nFor now, I can help with:\n• Your current medicines → ask "explain my medicines"\n• Your health summary → ask "summarize my history"\n• Doctor visit preparation → ask "prepare for doctor"\n\n⚠️ AI-assisted information — always verify with your healthcare professional.`;
      }

      const assistantMsg = {
        role: 'assistant',
        content: reply,
        disclaimer: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      addToast({ title: 'AI Error', message: 'Could not connect to AI service. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">🤖 AI Health Assistant</h1>
        <p className="text-sm text-slate-500 mt-0.5">Chat, summarise your records and prepare for doctor visits</p>
      </div>

      {/* Red Flag Alert */}
      {redFlagDetected && (
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 flex items-start gap-3 shadow-sm" role="alert">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-800 text-sm">⚠️ Possible Urgent Symptom Detected</div>
            <p className="text-xs text-red-700 mt-1">
              If you are experiencing severe chest pain, difficulty breathing, sudden weakness, stroke symptoms, or loss of consciousness — <strong>please contact emergency services or go to a hospital immediately.</strong>
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <a href="tel:112" className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg link-inline">📞 Call 112</a>
              <a href="tel:102" className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-300 link-inline">🚑 Ambulance 102</a>
              <button onClick={() => setRedFlagDetected(false)} className="px-3 py-1.5 bg-white text-slate-600 text-xs font-semibold rounded-lg border border-slate-300 btn-inline">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: '420px' }}>
        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ maxHeight: '420px' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700">AI Health Assistant</span>
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
                {msg.disclaimer && (
                  <p className="text-[10px] text-slate-400 mt-1 ml-1">
                    ⚠️ AI-assisted — verify with your healthcare professional
                  </p>
                )}
                <div className={`text-[10px] text-slate-400 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                <span className="text-xs text-slate-500">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompts */}
        <div className="px-4 py-2 border-t border-slate-100 overflow-x-auto">
          <div className="flex gap-2">
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                disabled={loading}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold whitespace-nowrap hover:bg-indigo-100 transition disabled:opacity-50 btn-inline"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
            placeholder="Ask about your health records, medicines, or upcoming appointments..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition disabled:opacity-40 btn-inline"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Phase 7 Notice */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-sm text-indigo-800">OpenAI Integration — Phase 7</div>
          <p className="text-xs text-indigo-600 mt-0.5">
            Full conversational AI with adaptive clinical history taking, red-flag detection, and structured summaries is being built in Phase 7. The API key stays securely on the server — never in the browser.
          </p>
        </div>
      </div>

      {/* Existing AI Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/patient/ai-summary" className="flex items-start gap-3 p-5 rounded-2xl bg-gradient-to-br from-sky-900 to-indigo-900 text-white hover:shadow-xl transition group">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">AI Health Summary</div>
            <p className="text-xs text-white/70 mt-0.5">Consolidated overview of your entire health record</p>
          </div>
          <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white ml-auto mt-1 group-hover:translate-x-0.5 transition" />
        </Link>
        <Link to="/patient/report-explainer" className="flex items-start gap-3 p-5 rounded-2xl bg-gradient-to-br from-violet-700 to-purple-900 text-white hover:shadow-xl transition group">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <FileQuestion className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">Report Explainer</div>
            <p className="text-xs text-white/70 mt-0.5">Understand lab reports in plain language</p>
          </div>
          <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white ml-auto mt-1 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
};
