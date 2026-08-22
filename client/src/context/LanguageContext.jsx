import React, { createContext, useContext, useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../services/translationServiceFallback';

const LanguageContext = createContext(null);

export const UI_TRANSLATIONS = {
  en: {
    appName: 'Health Passport',
    tagline: 'Your Health. Your Records. Your Control.',
    dashboard: 'Dashboard',
    healthId: 'Digital Health ID',
    medicalRecords: 'Medical Records',
    aiSummary: 'AI Health Summary',
    reportExplainer: 'Report Explainer',
    translator: 'Multilingual Translator',
    appointments: 'Appointments',
    medicines: 'Medicines & Reminders',
    emergency: 'Emergency Profile',
    consentCenter: 'Consent Management',
    bills: 'Bills & Payments',
    documents: 'Documents',
    settings: 'Settings',
    patientPortal: 'Patient Portal',
    doctorPortal: 'Doctor Portal',
    logout: 'Logout',
    switchPersona: 'Switch Persona',
    requestAccess: 'Request Access',
    approve: 'Approve',
    deny: 'Deny',
    revoke: 'Revoke',
    aiDisclaimer: 'AI-GENERATED SUMMARY — VERIFY WITH ORIGINAL MEDICAL RECORDS'
  },
  hi: {
    appName: 'हेल्थ पासपोर्ट',
    tagline: 'आपका स्वास्थ्य। आपके रिकॉर्ड्स। आपका नियंत्रण।',
    dashboard: 'डैशबोर्ड',
    healthId: 'डिजिटल हेल्थ आईडी',
    medicalRecords: 'चिकित्सा रिकॉर्ड्स',
    aiSummary: 'एआई स्वास्थ्य सारांश',
    reportExplainer: 'रिपोर्ट व्याख्याता',
    translator: 'बहुभाषी अनुवादक',
    appointments: 'अपॉइंटमेंट्स',
    medicines: 'दवाइयां और रिमाइंडर',
    emergency: 'आपातकालीन प्रोफ़ाइल',
    consentCenter: 'सहमति केंद्र',
    bills: 'बिल और भुगतान',
    documents: 'दस्तावेज',
    settings: 'सेटिंग्स',
    patientPortal: 'मरीज पोर्टल',
    doctorPortal: 'डॉक्टर पोर्टल',
    logout: 'लॉग आउट',
    switchPersona: 'प्रोफ़ाइल बदलें',
    requestAccess: 'अनुमति का अनुरोध करें',
    approve: 'स्वीकार करें',
    deny: 'अस्वीकार करें',
    revoke: 'वापस लें',
    aiDisclaimer: 'एआई जनरेटेड सारांश — मूल चिकित्सा रिकॉर्ड से सत्यापित करें'
  },
  mr: {
    appName: 'हेल्थ पासपोर्ट',
    tagline: 'तुमचे आरोग्य. तुमच्या नोंदी. तुमचे नियंत्रण.',
    dashboard: 'डॅशबोर्ड',
    healthId: 'डिजिटल हेल्थ आयडी',
    medicalRecords: 'वैद्यकीय नोंदी',
    aiSummary: 'एआय आरोग्य सारांश',
    reportExplainer: 'रिपोर्ट समजावणारा',
    translator: 'भाषांतरकार',
    appointments: 'अपॉइंटमेंट्स',
    medicines: 'औषधे आणि स्मरणपत्रे',
    emergency: 'आपत्कालीन प्रोफाईल',
    consentCenter: 'संमती व्यवस्थापन',
    bills: 'बिले आणि पेमेंट',
    documents: 'कागदपत्रे',
    settings: 'सेटिंग्ज',
    patientPortal: 'रुग्ण पोर्टल',
    doctorPortal: 'डॉक्टर पोर्टल',
    logout: 'लॉग आऊट',
    switchPersona: 'प्रोफाइल बदला',
    requestAccess: 'प्रवेश विनंती करा',
    approve: 'मंजूर करा',
    deny: 'नाकारा',
    revoke: 'रद्द करा',
    aiDisclaimer: 'एआय जनरेट केलेला सारांश — मूळ वैद्यकीय नोंदींसह सत्यापित करा'
  },
  gu: {
    appName: 'હેલ્થ પાસપોર્ટ',
    tagline: 'તમારું સ્વાસ્થ્ય. તમારા રેકોર્ડ્સ. તમારું નિયંત્રણ.',
    dashboard: 'ડેશબોર્ડ',
    healthId: 'ડિજિટલ હેલ્થ આઈડી',
    medicalRecords: 'તબીબી રેકોર્ડ્સ',
    aiSummary: 'એઆઈ આરોગ્ય સારાંશ',
    reportExplainer: 'રિપોર્ટ એક્સપ્લેનર',
    translator: 'બહુભાષી અનુવાદક',
    appointments: 'મુલાકાતો',
    medicines: 'દવાઓ અને રીમાઇન્ડર્સ',
    emergency: 'ઇમરજન્સી પ્રોફાઇલ',
    consentCenter: 'સંમતિ વ્યવસ્થાપન',
    bills: 'બિલ અને ચુકવણી',
    documents: 'દસ્તાવેજો',
    settings: 'સેટિંગ્સ',
    patientPortal: 'દર્દી પોર્ટલ',
    doctorPortal: 'ડૉક્ટર પોર્ટલ',
    logout: 'લૉગ આઉટ',
    switchPersona: 'પ્રોફાઇલ બદલો',
    requestAccess: 'પ્રવેશની વિનંતી કરો',
    approve: 'મંજૂર કરો',
    deny: 'અસ્વીકાર કરો',
    revoke: 'રદ કરો',
    aiDisclaimer: 'એઆઈ જનરેટેડ સારાંશ — મૂળ મેડિકલ રેકોર્ડ સાથે ચકાસો'
  },
  ta: {
    appName: 'ஹெல்த் பாஸ்போர்ட்',
    tagline: 'உங்கள் உடல்நலம். உங்கள் பதிவுகள். உங்கள் கட்டுப்பாடு.',
    dashboard: 'டாஷ்போர்டு',
    healthId: 'டிஜிட்டல் ஹெல்த் ஐடி',
    medicalRecords: 'மருத்துவப் பதிவுகள்',
    aiSummary: 'AI சுகாதார சுருக்கம்',
    reportExplainer: 'அறிக்கை விளக்கவுரை',
    translator: 'மொழிபெயர்ப்பாளர்',
    appointments: 'முன்பதிவுகள்',
    medicines: 'மருந்துகள் & நினைவூட்டல்கள்',
    emergency: 'அவசர சிகிச்சை சுயவிவரம்',
    consentCenter: 'ஒப்புதல் மையம்',
    bills: 'பில்கள் & பணம் செலுத்துதல்',
    documents: 'ஆவணங்கள்',
    settings: 'அமைப்புகள்',
    patientPortal: 'நோயாளி போர்டல்',
    doctorPortal: 'மருத்துவர் போர்டல்',
    logout: 'வெளியேறு',
    switchPersona: 'நபரை மாற்றவும்',
    requestAccess: 'அனுமதி கோருங்கள்',
    approve: 'ஏற்கவும்',
    deny: 'நிராகரிக்கவும்',
    revoke: 'ரத்து செய்யவும்',
    aiDisclaimer: 'AI உருவாக்கிய சுருக்கம் — அசல் மருத்துவப் பதிவுகளுடன் சரிபார்க்கவும்'
  },
  te: {
    appName: 'హెల్త్ పాస్‌పోర్ట్',
    tagline: 'మీ ఆరోగ్యం. మీ రికార్డులు. మీ నియంత్రణ.',
    dashboard: 'డాష్‌బోర్డ్',
    healthId: 'డిజిటల్ హెల్త్ ఐడీ',
    medicalRecords: 'వైద్య రికార్డులు',
    aiSummary: 'AI ఆరోగ్య సారాంశం',
    reportExplainer: 'రిపోర్ట్ వివరణ',
    translator: 'బహుభాషా అనువాదకుడు',
    appointments: 'అపాయింట్‌మెంట్‌లు',
    medicines: 'మందులు & రిమైండర్‌లు',
    emergency: 'అత్యవసర ప్రొఫైల్',
    consentCenter: 'సమ్మతి నిర్వహణ',
    bills: 'బిల్లులు & చెల్లింపులు',
    documents: 'పత్రాలు',
    settings: 'సెట్టింగ్‌లు',
    patientPortal: 'రోగి పోర్టల్',
    doctorPortal: 'వైద్యుల పోర్టల్',
    logout: 'లాగ్ అవుట్',
    switchPersona: 'ప్రొఫైల్ మార్చండి',
    requestAccess: 'యాక్సెస్ అభ్యర్థించండి',
    approve: 'ఆమోదించండి',
    deny: 'తిరస్కరించండి',
    revoke: 'రద్దు చేయండి',
    aiDisclaimer: 'AI రూపొందించిన సారాంశం — అసలు వైద్య రికార్డులతో ధృవీకరించండి'
  },
  bn: {
    appName: 'হেলথ পাসপোর্ট',
    tagline: 'আপনার স্বাস্থ্য। আপনার রেকর্ড। আপনার নিয়ন্ত্রণ।',
    dashboard: 'ড্যাশবোর্ড',
    healthId: 'ডিজিটাল হেলথ আইডি',
    medicalRecords: 'মেডিকেল রেকর্ড',
    aiSummary: 'এআই স্বাস্থ্য সারাংশ',
    reportExplainer: 'রিপোর্ট ব্যাখ্যাকারী',
    translator: 'বহুভাষিক অনুবাদক',
    appointments: 'অ্যাপয়েন্টমেন্ট',
    medicines: 'ওষুধ এবং অনুস্মারক',
    emergency: 'জরুরী প্রোফাইল',
    consentCenter: 'সম্মতি কেন্দ্র',
    bills: 'বিল ও পেমেন্ট',
    documents: 'নথিপত্র',
    settings: 'সেটিংস',
    patientPortal: 'রোগী পোর্টাল',
    doctorPortal: 'ডাক্তার পোর্টাল',
    logout: 'লগ আউট',
    switchPersona: 'প্রোফাইল পরিবর্তন করুন',
    requestAccess: 'অনুমতির অনুরোধ করুন',
    approve: 'অনুমোদন করুন',
    deny: 'প্রত্যাখ্যান করুন',
    revoke: 'বাতিল করুন',
    aiDisclaimer: 'এআই প্রস্তুত সারাংশ — মূল মেডিকেল রেকর্ডের সাথে যাচাই করুন'
  }
};

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' }
];

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const t = (key) => {
    const langSet = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;
    return langSet[key] || UI_TRANSLATIONS.en[key] || key;
  };

  const changeLanguage = (langCode) => {
    if (UI_TRANSLATIONS[langCode]) {
      setCurrentLanguage(langCode);
      localStorage.setItem('hp_lang', langCode);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        t,
        languages: LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
