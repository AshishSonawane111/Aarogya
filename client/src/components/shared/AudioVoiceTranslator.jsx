import React, { useState, useEffect } from 'react';
import { translateAPI } from '../../services/api';
import { LANGUAGES } from '../../context/LanguageContext';
import { speakText, stopSpeaking, createSpeechRecognizer } from '../../utils/speech';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ArrowRightLeft, 
  Languages, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  Copy
} from 'lucide-react';

export const AudioVoiceTranslator = ({ defaultSource = 'en', defaultTarget = 'hi' }) => {
  const [sourceLang, setSourceLang] = useState(defaultSource);
  const [targetLang, setTargetLang] = useState(defaultTarget);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [quickPhrases, setQuickPhrases] = useState([]);
  const [copied, setCopied] = useState(false);

  // Load quick clinical phrases
  useEffect(() => {
    translateAPI.getLanguages().then((res) => {
      if (res.data?.quick_phrases) {
        setQuickPhrases(res.data.quick_phrases);
      }
    }).catch((err) => console.warn('Phrases load error', err));
  }, []);

  const handleTranslate = async (textToTranslate = inputText) => {
    if (!textToTranslate || !textToTranslate.trim()) return;

    setIsTranslating(true);
    try {
      const res = await translateAPI.translateText({
        text: textToTranslate,
        source_lang: sourceLang,
        target_lang: targetLang
      });
      setTranslatedText(res.data.translated_text);
    } catch (err) {
      console.error('Translation error', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Speech Recognition (Microphone)
  const toggleSpeechRecognition = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      sourceLang,
      (transcript) => {
        setInputText(transcript);
        handleTranslate(transcript);
      },
      (error) => {
        console.warn('Speech error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer.supported) {
      setIsListening(true);
      recognizer.start();
    } else {
      alert('Speech Recognition is not supported in this browser. Please use Chrome/Edge or type your text.');
    }
  };

  // Text to Speech
  const handlePlayTTS = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    if (!translatedText) return;

    setIsPlayingAudio(true);
    speakText(translatedText, targetLang, () => {
      setIsPlayingAudio(false);
    });
  };

  // Swap Languages
  const handleSwapLanguages = () => {
    const prevSource = sourceLang;
    const prevTarget = targetLang;
    setSourceLang(prevTarget);
    setTargetLang(prevSource);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
      
      {/* Header Bar */}
      <div className="p-4 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300">
            <Languages className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Multilingual Healthcare Voice & Text Translator</h3>
            <p className="text-[10px] text-teal-200">7 Indian Languages with Clinical Speech Synthesis</p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-400" />
          AI Speech Engine
        </span>
      </div>

      {/* Language Switcher Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        
        {/* Source Language */}
        <div className="flex items-center gap-2 flex-1 min-w-[140px]">
          <span className="text-xs font-semibold text-slate-500">From:</span>
          <select
            value={sourceLang}
            onChange={(e) => {
              setSourceLang(e.target.value);
              if (inputText) handleTranslate();
            }}
            className="w-full p-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.native} ({lang.name})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwapLanguages}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs transition"
          title="Swap Languages"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* Target Language */}
        <div className="flex items-center gap-2 flex-1 min-w-[140px]">
          <span className="text-xs font-semibold text-slate-500">To:</span>
          <select
            value={targetLang}
            onChange={(e) => {
              setTargetLang(e.target.value);
              if (inputText) handleTranslate();
            }}
            className="w-full p-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.native} ({lang.name})
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Two-Column Side-by-Side Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        
        {/* Source Text Input */}
        <div className="p-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Original Message</span>
              {inputText && (
                <button
                  onClick={() => {
                    setInputText('');
                    setTranslatedText('');
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                handleTranslate(e.target.value);
              }}
              placeholder="Type medical instructions, symptoms, or click microphone to speak..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Voice Input and Action Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={toggleSpeechRecognition}
              className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
                  : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Listening... (Speak now)</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-teal-600" />
                  <span>Speak via Microphone</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleTranslate()}
              disabled={isTranslating || !inputText.trim()}
              className="py-2 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition"
            >
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>
          </div>
        </div>

        {/* Translated Output */}
        <div className="p-5 bg-slate-50/60 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Translated Clinical Message</span>
              {translatedText && (
                <button
                  onClick={handleCopy}
                  className="text-[11px] text-teal-700 hover:text-teal-900 flex items-center gap-1 font-semibold"
                >
                  {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
              )}
            </div>

            <div className="w-full min-h-[125px] p-3 rounded-xl border border-teal-200/80 bg-white text-slate-900 text-sm leading-relaxed shadow-inner font-medium flex items-center">
              {translatedText ? (
                <span className="text-slate-900">{translatedText}</span>
              ) : (
                <span className="text-slate-400 text-xs italic">
                  Translation will appear here in selected Indian language...
                </span>
              )}
            </div>
          </div>

          {/* Text-to-Speech Playback Action */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePlayTTS}
              disabled={!translatedText}
              className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                isPlayingAudio
                  ? 'bg-indigo-600 text-white animate-pulse'
                  : translatedText
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Speaking Translation...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span>Listen Audio (TTS)</span>
                </>
              )}
            </button>

            <span className="text-[10px] text-slate-400 font-mono">
              Side-by-Side Verified
            </span>
          </div>
        </div>

      </div>

      {/* Quick Clinical Prompts Bar */}
      {quickPhrases.length > 0 && (
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Quick Clinical Phrases (Click to Translate):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPhrases.slice(0, 6).map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(phrase);
                  handleTranslate(phrase);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs transition border border-slate-200"
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
