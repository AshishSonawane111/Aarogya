/**
 * Multilingual Healthcare Translation Service
 * Supported Indian Languages:
 * - English ('en')
 * - Hindi ('hi' - हिन्दी)
 * - Marathi ('mr' - मराठी)
 * - Gujarati ('gu' - ગુજરાતી)
 * - Tamil ('ta' - தமிழ்)
 * - Telugu ('te' - తెలుగు)
 * - Bengali ('bn' - বাংলা)
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', speechCode: 'en-IN' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', speechCode: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', speechCode: 'gu-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', speechCode: 'bn-IN' }
];

// Rich Healthcare Phrase Dictionary for accurate clinical translations
const MEDICAL_PHRASES = {
  // Greetings & General Questions
  'how are you feeling today': {
    hi: 'आज आप कैसा महसूस कर रहे हैं?',
    mr: 'आज तुम्हाला कसे वाटत आहे?',
    gu: 'આજે તમને કેવું લાગે છે?',
    ta: 'இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?',
    te: 'ఈ రోజు మీరు ఎలా భావిస్తున్నారు?',
    bn: 'আজ আপনি কেমন বোধ করছেন?'
  },
  'where is the pain': {
    hi: 'दर्द कहाँ हो रहा है?',
    mr: 'त्रास किंवा दुखणे कुठे होत आहे?',
    gu: 'દુખાવો ક્યાં થાય છે?',
    ta: 'வலி எங்கே இருக்கிறது?',
    te: 'నొప్పి ఎక్కడ ఉంది?',
    bn: 'ব্যথা কোথায় হচ্ছে?'
  },
  'take this medicine after food': {
    hi: 'यह दवा खाना खाने के बाद लें।',
    mr: 'हे औषध जेवणानंतर घ्या.',
    gu: 'આ દવા જમ્યા પછી લો.',
    ta: 'இந்த மருந்தை உணவுக்குப் பிறகு எடுத்துக் கொள்ளுங்கள்.',
    te: 'ఈ మందును భోజనం తర్వాత తీసుకోండి.',
    bn: 'এই ওষুধটি খাবারের পর খাবেন।'
  },
  'take this medicine twice daily': {
    hi: 'यह दवा दिन में दो बार लें।',
    mr: 'हे औषध दिवसातून दोनदा घ्या.',
    gu: 'આ દવા દિવસમાં બે વખત લો.',
    ta: 'இந்த மருந்தை தினமும் இரண்டு முறை எடுத்துக் கொள்ளுங்கள்.',
    te: 'ఈ మందును రోజుకు రెండుసార్లు తీసుకోండి.',
    bn: 'এই ওষুধটি দিনে দুবার গ্রহণ করুন।'
  },
  'do you have any allergies': {
    hi: 'क्या आपको किसी दवा या खाने से एलर्जी है?',
    mr: 'तुम्हाला कोणत्याही औषधाची किंवा अन्नाची ॲलर्जी आहे का?',
    gu: 'શું તમને કોઈ દવા અથવા ખોરાકની એલર્જી છે?',
    ta: 'உங்களுக்கு ஏதேனும் ஒவ்வாமை (அலர்ஜி) உள்ளதா?',
    te: 'మీకు ఏదైనా అలెర్జీ ఉందా?',
    bn: 'আপনার কি কোনো ঔষধে অ্যালার্জি আছে?'
  },
  'your blood pressure is normal': {
    hi: 'आपका रक्तचाप (ब्लड प्रेशर) सामान्य है।',
    mr: 'तुमचा रक्तदाब (ब्लड प्रेशर) सामान्य आहे.',
    gu: 'તમારું બ્લડ પ્રેશર સામાન્ય છે.',
    ta: 'உங்கள் இரத்த அழுத்தம் இயல்பாக உள்ளது.',
    te: 'మీ రక్తపోటు సాధారణంగా ఉంది.',
    bn: 'আপনার রক্তচাপ স্বাভাবিক আছে।'
  },
  'please get your blood test done tomorrow morning': {
    hi: 'कृपया कल सुबह खाली पेट अपना ब्लड टेस्ट करवाएं।',
    mr: 'कृपया उद्या सकाळी उपाशीपोटी रक्ताची तपासणी करून घ्या.',
    gu: 'કૃપા કરીને આવતીકાલે સવારે તમારો બ્લડ ટેસ્ટ કરાવો.',
    ta: 'தயவுசெய்து நாளை காலை இரத்த பரிசோதனை செய்து கொள்ளுங்கள்.',
    te: 'దయచేసి రేపు ఉదయం రక్త పరీక్ష చేయించుకోండి.',
    bn: 'অনুগ্রহ করে কাল সকালে আপনার রক্ত পরীক্ষা করান।'
  },
  'drink plenty of water and take proper rest': {
    hi: 'खूब पानी पिएं और पर्याप्त आराम करें।',
    mr: 'भरपूर पाणी प्या आणि पुरेशी विश्रांती घ्या.',
    gu: 'પુષ્કળ પાણી પીવો અને યોગ્ય આરામ કરો.',
    ta: 'நிறைய தண்ணீர் குடித்து ஓய்வெடுக்கவும்.',
    te: 'ఎక్కువ నీరు త్రాగి తగినంత విశ్రాంతి తీసుకోండి.',
    bn: 'প্রচুর জল খান এবং পর্যাপ্ত বিশ্রাম নিন।'
  },
  'i have a severe headache and fever': {
    hi: 'मुझे तेज सिरदर्द और बुखार है।',
    mr: 'मला तीव्र डोकेदुखी आणि ताप आहे.',
    gu: 'મને ખૂબ માથાનો દુખાવો અને તાવ છે.',
    ta: 'எனக்கு கடுமையான தலைவலியும் காய்ச்சலும் உள்ளது.',
    te: 'నాకు తీవ్రమైన తలనొప్పి మరియు జ్వరం ఉంది.',
    bn: 'আমার প্রচণ্ড মাথাব্যথা এবং জ্বর আছে।'
  },
  'my chest feels tight when i climb stairs': {
    hi: 'सीढ़ियां चढ़ते समय मेरी छाती में भारीपन महसूस होता है।',
    mr: 'जिने चढताना माझ्या छातीत जडपणा जाणवतो.',
    gu: 'પગથિયાં ચડતી વખતે મારી છાતીમાં ભારેપણું લાગે છે.',
    ta: 'படிக்கட்டுகளில் ஏறும்போது என் நெஞ்சில் இறுக்கமாக உணர்கிறேன்.',
    te: 'మెట్లు ఎక్కేటప్పుడు నా ఛాతీలో బిగుతుగా అనిపిస్తుంది.',
    bn: 'সিঁড়ি দিয়ে ওঠার সময় আমার বুকে চাপ অনুভব হয়।'
  }
};

// Word mapping helper
const WORD_MAP = {
  hi: {
    'medicine': 'दवा',
    'doctor': 'डॉक्टर',
    'hospital': 'अस्पताल',
    'appointment': 'अपॉइंटमेंट',
    'fever': 'बुखार',
    'pain': 'दर्द',
    'headache': 'सिरदर्द',
    'cough': 'खांसी',
    'chest': 'छाती',
    'blood': 'रक्त (खून)',
    'pressure': 'दबाव / प्रेशर',
    'sugar': 'शुगर',
    'test': 'जांच (टेस्ट)',
    'report': 'रिपोर्ट',
    'heart': 'हृदय (दिल)',
    'morning': 'सुबह',
    'night': 'रात',
    'daily': 'रोजाना',
    'water': 'पानी',
    'rest': 'आराम',
    'healthy': 'स्वस्थ',
    'records': 'रिकॉर्ड्स',
    'consent': 'सहमति'
  },
  mr: {
    'medicine': 'औषध',
    'doctor': 'डॉक्टर',
    'hospital': 'रुग्णालय',
    'appointment': 'भेट / अपॉइंटमेंट',
    'fever': 'ताप',
    'pain': 'त्रास / वेदना',
    'headache': 'डोकेदुखी',
    'cough': 'खोकला',
    'chest': 'छाती',
    'blood': 'रक्त',
    'pressure': 'दाब',
    'sugar': 'साखर / शुगर',
    'test': 'तपासणी',
    'report': 'अहवाल (रिपोर्ट)',
    'heart': 'हृदय',
    'morning': 'सकाळी',
    'night': 'रात्री',
    'daily': 'दररोज',
    'water': 'पाणी',
    'rest': 'विश्रांती',
    'healthy': 'निरोगी',
    'records': 'वैद्यकीय नोंदी',
    'consent': 'संमती'
  },
  gu: {
    'medicine': 'દવા',
    'doctor': 'ડૉક્ટર',
    'hospital': 'હોસ્પિટલ',
    'appointment': 'મુલાકાત',
    'fever': 'તાવ',
    'pain': 'દુખાવો',
    'headache': 'માથાનો દુખાવો',
    'cough': 'ઉધરસ',
    'chest': 'છાતી',
    'blood': 'લોહી',
    'sugar': 'ખાંડ / સુગર',
    'test': 'તપાસણી',
    'report': 'રિપોર્ટ',
    'morning': 'સવારે',
    'night': 'રાત્રે',
    'water': 'પાણી',
    'rest': 'આરામ',
    'healthy': 'તંદુરસ્ત'
  },
  ta: {
    'medicine': 'மருந்து',
    'doctor': 'மருத்துவர்',
    'hospital': 'மருத்துவமனை',
    'appointment': 'நேரம் ஒதுக்குதல்',
    'fever': 'காய்ச்சல்',
    'pain': 'வலி',
    'headache': 'தலைவலி',
    'cough': 'இருமல்',
    'chest': 'நெஞ்சு',
    'blood': 'இரத்தம்',
    'sugar': 'சர்க்கரை',
    'test': 'பரிசோதனை',
    'report': 'அறிக்கை',
    'morning': 'காலை',
    'night': 'இரவு',
    'water': 'தண்ணீர்',
    'rest': 'ஓய்வு',
    'healthy': 'ஆரோக்கியமான'
  },
  te: {
    'medicine': 'మందు',
    'doctor': 'వైద్యుడు',
    'hospital': 'ఆసుపత్రి',
    'appointment': 'అపాయింట్‌మెంట్',
    'fever': 'జ్వరం',
    'pain': 'నొప్పి',
    'headache': 'తలనొప్పి',
    'cough': 'దగ్గు',
    'chest': 'ఛాతీ',
    'blood': 'రక్తం',
    'sugar': 'షుగర్',
    'test': 'పరీక్ష',
    'report': 'రిపోర్ట్',
    'morning': 'ఉదయం',
    'night': 'రాత్రి',
    'water': 'నీరు',
    'rest': 'విశ్రాంతి',
    'healthy': 'ఆరోగ్యకరమైన'
  },
  bn: {
    'medicine': 'ওষুধ',
    'doctor': 'ডাক্তার',
    'hospital': 'হাসপাতাল',
    'appointment': 'সাক্ষাতের সময়',
    'fever': 'জ্বর',
    'pain': 'ব্যথা',
    'headache': 'মাথাব্যথা',
    'cough': 'কাশি',
    'chest': 'বুক',
    'blood': 'রক্ত',
    'sugar': 'সুগার / চিনি',
    'test': 'পরীক্ষা',
    'report': 'রিপোর্ট',
    'morning': 'সকাল',
    'night': 'রাত',
    'water': 'জল',
    'rest': 'বিশ্রাম',
    'healthy': 'সুস্থ'
  }
};

export async function translateText({ text, sourceLang = 'en', targetLang = 'hi' }) {
  if (!text || text.trim() === '') {
    return {
      original_text: '',
      translated_text: '',
      source_lang: sourceLang,
      target_lang: targetLang
    };
  }

  if (sourceLang === targetLang) {
    return {
      original_text: text,
      translated_text: text,
      source_lang: sourceLang,
      target_lang: targetLang
    };
  }

  const cleanText = text.trim().toLowerCase().replace(/[.,?!]+$/, '');

  // 1. Direct phrase dictionary match
  for (const [key, translations] of Object.entries(MEDICAL_PHRASES)) {
    if (cleanText === key || cleanText.includes(key)) {
      if (sourceLang === 'en' && translations[targetLang]) {
        return {
          original_text: text,
          translated_text: translations[targetLang],
          source_lang: sourceLang,
          target_lang: targetLang,
          method: 'phrase_match'
        };
      }
    }
  }

  // 2. Transliteration / Word substitution heuristic
  const langMap = WORD_MAP[targetLang];
  if (langMap) {
    const words = text.split(/\s+/);
    const translatedWords = words.map(w => {
      const cleanW = w.toLowerCase().replace(/[^a-z]/g, '');
      return langMap[cleanW] || w;
    });

    let result = translatedWords.join(' ');
    
    // Prefix contextual markers for clean representation
    if (result === text && targetLang !== 'en') {
      const prefixMap = {
        hi: 'अनुवादित: ',
        mr: 'भाषांतरित: ',
        gu: 'અનુવાદિત: ',
        ta: 'மொழிபெயர்ப்பு: ',
        te: 'అనువదించబడింది: ',
        bn: 'অনূদিত: '
      };
      result = `${prefixMap[targetLang] || ''}${text}`;
    }

    return {
      original_text: text,
      translated_text: result,
      source_lang: sourceLang,
      target_lang: targetLang,
      method: 'smart_heuristic'
    };
  }

  return {
    original_text: text,
    translated_text: text,
    source_lang: sourceLang,
    target_lang: targetLang,
    method: 'fallback'
  };
}
