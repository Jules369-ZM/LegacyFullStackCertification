const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Translation dictionaries
const americanToBritish = {
  // Spelling differences
  'color': 'colour',
  'colors': 'colours',
  'center': 'centre',
  'centers': 'centres',
  'theater': 'theatre',
  'theaters': 'theatres',
  'labor': 'labour',
  'labors': 'labours',
  'honor': 'honour',
  'honors': 'honours',
  'favor': 'favour',
  'favors': 'favours',
  'flavor': 'flavour',
  'flavors': 'flavours',
  'humor': 'humour',
  'behavior': 'behaviour',
  'behaviors': 'behaviours',
  'neighbor': 'neighbour',
  'neighbors': 'neighbours',
  'recognize': 'recognise',
  'recognizes': 'recognises',
  'recognized': 'recognised',
  'recognizing': 'recognising',
  'organize': 'organise',
  'organizes': 'organises',
  'organized': 'organised',
  'organizing': 'organising',
  'realize': 'realise',
  'realizes': 'realises',
  'realized': 'realised',
  'realizing': 'realising',

  // Common terms
  'apartment': 'flat',
  'apartments': 'flats',
  'elevator': 'lift',
  'elevators': 'lifts',
  'truck': 'lorry',
  'trucks': 'lorries',
  'vacation': 'holiday',
  'vacations': 'holidays',
  'cookie': 'biscuit',
  'cookies': 'biscuits',
  'chips': 'crisps',
  'french fries': 'chips',
  'soccer': 'football',
  'movie': 'film',
  'movies': 'films'
};

const britishToAmerican = {
  // Spelling differences
  'colour': 'color',
  'colours': 'colors',
  'centre': 'center',
  'centres': 'centers',
  'theatre': 'theater',
  'theatres': 'theaters',
  'labour': 'labor',
  'labours': 'labors',
  'honour': 'honor',
  'honours': 'honors',
  'favour': 'favor',
  'favours': 'favors',
  'flavour': 'flavor',
  'flavours': 'flavors',
  'humour': 'humor',
  'behaviour': 'behavior',
  'behaviours': 'behaviors',
  'neighbour': 'neighbor',
  'neighbours': 'neighbors',
  'recognise': 'recognize',
  'recognises': 'recognizes',
  'recognised': 'recognized',
  'recognising': 'recognizing',
  'organise': 'organize',
  'organises': 'organizes',
  'organised': 'organized',
  'organising': 'organizing',
  'realise': 'realize',
  'realises': 'realizes',
  'realised': 'realized',
  'realising': 'realizing',

  // Common terms
  'flat': 'apartment',
  'flats': 'apartments',
  'lift': 'elevator',
  'lifts': 'elevators',
  'lorry': 'truck',
  'lorries': 'trucks',
  'holiday': 'vacation',
  'holidays': 'vacations',
  'biscuit': 'cookie',
  'biscuits': 'cookies',
  'crisps': 'chips',
  'football': 'soccer',
  'film': 'movie',
  'films': 'movies'
};

// Translation function
function translate(text, direction) {
  if (!text) return '';

  let translated = text;
  let highlights = [];
  const dict = direction === 'american-to-british' ? americanToBritish : britishToAmerican;

  // Sort keys by length (longest first) to handle multi-word phrases
  const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    const matches = text.match(regex);

    if (matches) {
      translated = translated.replace(regex, dict[key]);
      highlights.push({
        original: key,
        translation: dict[key],
        position: text.toLowerCase().indexOf(key.toLowerCase())
      });
    }
  }

  return { translated, highlights };
}

// Routes
app.get('/', (req, res) => {
  res.send('American British Translator API');
});

// POST /api/translate
app.post('/api/translate', (req, res) => {
  const { text, locale } = req.body;

  if (text === undefined) {
    return res.json({ error: 'Required field missing' });
  }

  if (!text) {
    return res.json({ error: 'No text to translate' });
  }

  if (!locale || (locale !== 'american-to-british' && locale !== 'british-to-american')) {
    return res.json({ error: 'Invalid locale field' });
  }

  const { translated, highlights } = translate(text, locale);

  // Check if translation occurred
  const translation = translated !== text ? translated : 'Everything looks good to me!';

  res.json({
    text: text,
    translation: translation
  });
});

// Start server
app.listen(port, () => {
  console.log(`American British Translator API listening on port ${port}`);
});

module.exports = app;
