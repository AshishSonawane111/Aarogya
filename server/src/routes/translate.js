import express from 'express';
import { SUPPORTED_LANGUAGES, translateText } from '../services/translationService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Supported languages metadata
router.get('/languages', (req, res) => {
  res.json({
    languages: SUPPORTED_LANGUAGES,
    quick_phrases: [
      'How are you feeling today',
      'Where is the pain',
      'Take this medicine after food',
      'Take this medicine twice daily',
      'Do you have any allergies',
      'Your blood pressure is normal',
      'Please get your blood test done tomorrow morning',
      'Drink plenty of water and take proper rest',
      'I have a severe headache and fever',
      'My chest feels tight when I climb stairs'
    ]
  });
});

// Translate text endpoint
router.post('/', authenticate, async (req, res) => {
  const { text, source_lang = 'en', target_lang = 'hi' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }

  const result = await translateText({
    text,
    sourceLang: source_lang,
    targetLang: target_lang
  });

  res.json(result);
});

export default router;
