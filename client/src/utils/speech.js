/**
 * Web Speech API Utility for STT (Speech to Text) and TTS (Text to Speech)
 * Supports: en, hi, mr, gu, ta, te, bn
 */

export const SPEECH_LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN'
};

// Text to Speech
export function speakText(text, lang = 'hi', onEnd = null) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel(); // Stop any ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = SPEECH_LANG_MAP[lang] || 'en-IN';
  utterance.rate = 0.95; // Slightly slower for crisp medical pronunciation
  utterance.pitch = 1.0;

  // Try to find native voice
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang === utterance.lang || v.lang.startsWith(lang));
  if (voice) {
    utterance.voice = voice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

// Stop Speaking
export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Speech to Text (Microphone Recognizer)
export function createSpeechRecognizer(lang = 'en', onResult, onError, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return {
      supported: false,
      start: () => {
        if (onError) onError('Speech recognition is not supported in this browser. Please use Chrome/Edge or type your text.');
      },
      stop: () => {}
    };
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = SPEECH_LANG_MAP[lang] || 'en-IN';

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return {
    supported: true,
    start: () => {
      try {
        recognition.start();
      } catch (e) {
        console.warn('Recognition already started', e);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (e) {}
    }
  };
}
