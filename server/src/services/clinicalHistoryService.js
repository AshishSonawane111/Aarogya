/**
 * Clinical History Service — Phase 3
 * Provides:
 *  - Controlled question engine (not free-form LLM)
 *  - Red-flag deterministic detection
 *  - AI-assisted summary generation (rule-based + optional OpenAI)
 *
 * IMPORTANT: AI does NOT diagnose or prescribe. It collects and organises.
 */

// ─── RED-FLAG DETERMINISTIC RULES ─────────────────────────────────────────────
const RED_FLAG_PATTERNS = [
  { keywords: ['chest pain', 'chest tightness', 'chest pressure'], label: 'Possible cardiac event' },
  { keywords: ['difficulty breathing', "can't breathe", 'shortness of breath', 'breathlessness'], label: 'Possible respiratory emergency' },
  { keywords: ['sudden weakness', 'sudden paralysis', 'face drooping', 'arm weakness', 'slurred speech', 'sudden vision loss'], label: 'Possible stroke symptoms' },
  { keywords: ['loss of consciousness', 'unconscious', 'fainted', 'blacked out'], label: 'Loss of consciousness' },
  { keywords: ['severe bleeding', 'heavy bleeding', 'vomiting blood', 'blood in stool', 'coughing blood'], label: 'Possible severe bleeding' },
  { keywords: ['severe headache', 'worst headache', 'thunderclap headache'], label: 'Possible intracranial emergency' },
  { keywords: ['high fever', 'seizure', 'convulsion', 'fits'], label: 'Possible neurological emergency' },
];

export function detectRedFlags(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const rule of RED_FLAG_PATTERNS) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return rule.label;
    }
  }
  return null;
}

// ─── QUESTION BANK ────────────────────────────────────────────────────────────
export const QUESTION_BANK = {
  chief_complaint: {
    id: 'chief_complaint',
    field: 'chiefComplaint',
    en: 'What health problem would you like to tell me about today?',
    hi: 'आज आप किस स्वास्थ्य समस्या के बारे में बताना चाहते हैं?',
    mr: 'आज तुम्हाला कोणत्या आरोग्य समस्येबद्दल सांगायचे आहे?',
    icon: '🩺',
    next: 'onset',
    type: 'freetext',
  },
  onset: {
    id: 'onset',
    field: 'onset',
    en: 'When did this problem start?',
    hi: 'यह समस्या कब शुरू हुई?',
    mr: 'ही समस्या कधी सुरू झाली?',
    icon: '📅',
    next: 'location',
    type: 'freetext',
  },
  location: {
    id: 'location',
    field: 'location',
    en: 'Where exactly do you feel the problem? (e.g., head, chest, abdomen, back)',
    hi: 'समस्या कहाँ महसूस होती है? (जैसे सिर, सीना, पेट, पीठ)',
    mr: 'समस्या नेमकी कुठे जाणवते? (उदा. डोके, छाती, पोट, पाठ)',
    icon: '📍',
    next: 'severity',
    type: 'freetext',
  },
  severity: {
    id: 'severity',
    field: 'severity',
    en: 'On a scale of 1 to 10, how severe is it? (1 = mild, 10 = worst)',
    hi: 'समस्या 1 से 10 में कितनी गंभीर है? (1 = हल्की, 10 = बहुत गंभीर)',
    mr: '1 ते 10 मध्ये ही समस्या किती तीव्र आहे? (1 = सौम्य, 10 = अत्यंत तीव्र)',
    icon: '📊',
    next: 'character',
    type: 'scale',
    options: ['1','2','3','4','5','6','7','8','9','10'],
  },
  character: {
    id: 'character',
    field: 'character',
    en: 'How would you describe the feeling? (e.g., sharp, dull, burning, aching)',
    hi: 'दर्द या परेशानी कैसा महसूस होता है? (जैसे तेज, हल्का, जलन)',
    mr: 'हा त्रास कसा वाटतो? (उदा. तीव्र, कंटाळवाणा, जळजळ)',
    icon: '💬',
    next: 'aggravating',
    type: 'freetext',
  },
  aggravating: {
    id: 'aggravating',
    field: 'aggravatingFactors',
    en: 'What makes it worse? (e.g., movement, eating, stress)',
    hi: 'क्या चीज़ इसे और बुरा बनाती है? (जैसे हिलने पर, खाने पर, तनाव में)',
    mr: 'काय केल्याने ते जास्त वाढते? (उदा. हालचाल, जेवण, ताण)',
    icon: '⬆️',
    next: 'relieving',
    type: 'freetext',
  },
  relieving: {
    id: 'relieving',
    field: 'relievingFactors',
    en: 'What makes it better? (e.g., rest, medicines, cold/hot compress)',
    hi: 'क्या चीज़ इसे बेहतर बनाती है? (जैसे आराम, दवाइयां, सेंक)',
    mr: 'काय केल्याने ते कमी होते? (उदा. विश्रांती, औषधे, शेका)',
    icon: '⬇️',
    next: 'associated',
    type: 'freetext',
  },
  associated: {
    id: 'associated',
    field: 'associatedSymptoms',
    en: 'Do you have any other symptoms? (e.g., fever, nausea, vomiting, dizziness)',
    hi: 'क्या कोई अन्य लक्षण भी हैं? (जैसे बुखार, मतली, उल्टी, चक्कर)',
    mr: 'इतर काही लक्षणे आहेत का? (उदा. ताप, मळमळ, उलटी, चक्कर)',
    icon: '➕',
    next: 'past_medical',
    type: 'freetext',
  },
  past_medical: {
    id: 'past_medical',
    field: 'pastMedicalHistory',
    en: 'Do you have any existing medical conditions? (e.g., diabetes, hypertension, asthma)',
    hi: 'क्या आपको पहले से कोई बीमारी है? (जैसे मधुमेह, रक्तचाप, अस्थमा)',
    mr: 'तुम्हाला आधीपासून काही आजार आहेत का? (उदा. मधुमेह, रक्तदाब, दमा)',
    icon: '📋',
    next: 'past_surgical',
    type: 'freetext',
  },
  past_surgical: {
    id: 'past_surgical',
    field: 'pastSurgicalHistory',
    en: 'Have you had any surgeries or operations in the past?',
    hi: 'क्या आपकी पहले कोई सर्जरी हुई है?',
    mr: 'तुम्हाला आधी कधी शस्त्रक्रिया झाली आहे का?',
    icon: '🏥',
    next: 'medications',
    type: 'freetext',
  },
  medications: {
    id: 'medications',
    field: 'medications',
    en: 'Are you currently taking any medicines? Please name them if you can.',
    hi: 'क्या आप अभी कोई दवाइयां ले रहे हैं? नाम बताएं।',
    mr: 'तुम्ही सध्या कोणती औषधे घेत आहात? नावे सांगा.',
    icon: '💊',
    next: 'allergies',
    type: 'freetext',
  },
  allergies: {
    id: 'allergies',
    field: 'allergies',
    en: 'Do you have any known allergies to medicines, foods, or anything else?',
    hi: 'क्या आपको किसी दवाई या खाने से एलर्जी है?',
    mr: 'तुम्हाला एखाद्या औषधाची किंवा अन्नाची ऍलर्जी आहे का?',
    icon: '⚠️',
    next: 'family_history',
    type: 'freetext',
  },
  family_history: {
    id: 'family_history',
    field: 'familyHistory',
    en: 'Does anyone in your family have serious illnesses? (e.g., heart disease, diabetes, cancer)',
    hi: 'क्या आपके परिवार में किसी को गंभीर बीमारी है?',
    mr: 'तुमच्या कुटुंबातील कुणाला गंभीर आजार आहे का?',
    icon: '👨‍👩‍👧',
    next: 'personal_history',
    type: 'freetext',
  },
  personal_history: {
    id: 'personal_history',
    field: 'personalHistory',
    en: 'Do you smoke, drink alcohol, or use tobacco? Any dietary restrictions?',
    hi: 'क्या आप धूम्रपान, शराब या तंबाकू का सेवन करते हैं?',
    mr: 'तुम्ही धूम्रपान, मद्यपान किंवा तंबाखू वापरता का?',
    icon: '🧬',
    next: null,
    type: 'freetext',
  },
};

export const QUESTION_ORDER = [
  'chief_complaint','onset','location','severity','character',
  'aggravating','relieving','associated','past_medical','past_surgical',
  'medications','allergies','family_history','personal_history',
];

export function getNextQuestion(currentQuestionId) {
  const currentIdx = QUESTION_ORDER.indexOf(currentQuestionId);
  if (currentIdx === -1 || currentIdx >= QUESTION_ORDER.length - 1) return null;
  return QUESTION_BANK[QUESTION_ORDER[currentIdx + 1]] || null;
}

export function getFirstQuestion() {
  return QUESTION_BANK[QUESTION_ORDER[0]];
}

// ─── SUMMARY GENERATOR ────────────────────────────────────────────────────────
export async function generateClinicalSummary(history, patient) {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await generateSummaryWithOpenAI(history, patient);
    } catch (err) {
      console.warn('[AI] OpenAI unavailable, using rule-based fallback:', err.message);
    }
  }
  return generateRuleBasedSummary(history, patient);
}

function generateRuleBasedSummary(h, patient) {
  const name = patient ? `${patient.first_name} ${patient.last_name}` : 'Patient';
  const hpi = [
    h.onset && `Onset: ${h.onset}`,
    h.location && `Location: ${h.location}`,
    h.severity && `Severity: ${h.severity}/10`,
    h.character && `Character: ${h.character}`,
    h.aggravatingFactors && `Aggravated by: ${h.aggravatingFactors}`,
    h.relievingFactors && `Relieved by: ${h.relievingFactors}`,
    h.associatedSymptoms && `Associated symptoms: ${h.associatedSymptoms}`,
  ].filter(Boolean).join('. ');

  return {
    patient_name: name,
    disclaimer: 'AI-GENERATED DRAFT — Clinician verification required before use as clinical record.',
    generated_at: new Date().toISOString(),
    chief_complaint: h.chiefComplaint || 'Not recorded',
    history_of_present_illness: hpi || 'Details not provided.',
    past_medical_history: h.pastMedicalHistory || 'Not recorded',
    past_surgical_history: h.pastSurgicalHistory || 'Not recorded',
    current_medications: h.medications || 'None recorded',
    allergies: h.allergies || 'No known allergies',
    family_history: h.familyHistory || 'Not recorded',
    personal_history: h.personalHistory || 'Not recorded',
    review_of_systems: 'Collected via AI-guided intake; see structured answers.',
    source: 'rule-based',
  };
}

async function generateSummaryWithOpenAI(h, patient) {
  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `You are a clinical documentation assistant.
A patient has provided the following structured history through an AI-guided intake form.
Convert it into a concise, structured clinical history note suitable for physician review.
DO NOT diagnose, prescribe, or make clinical decisions. Use neutral clinical language.
Output ONLY valid JSON with these fields:
chief_complaint, history_of_present_illness, past_medical_history, past_surgical_history,
current_medications, allergies, family_history, personal_history, review_of_systems.

Patient data:
${JSON.stringify(h, null, 2)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 800,
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  const name = patient ? `${patient.first_name} ${patient.last_name}` : 'Patient';
  return {
    ...parsed,
    patient_name: name,
    disclaimer: 'AI-GENERATED DRAFT — Clinician verification required before use as clinical record.',
    generated_at: new Date().toISOString(),
    source: 'openai',
  };
}
