const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

class Translator {

  // Build a reversed dictionary (swap keys and values)
  _reverseDict(dict) {
    const reversed = {};
    for (const [key, value] of Object.entries(dict)) {
      reversed[value.toLowerCase()] = key;
    }
    return reversed;
  }

  // Get the appropriate dictionaries for the given locale
  _getDictionaries(locale) {
    if (locale === 'american-to-british') {
      return [
        americanOnly,
        americanToBritishSpelling,
        americanToBritishTitles,
      ];
    } else if (locale === 'british-to-american') {
      return [
        britishOnly,
        this._reverseDict(americanOnly),
        this._reverseDict(americanToBritishSpelling),
        this._reverseDict(americanToBritishTitles),
      ];
    }
    return null;
  }

  // Translate time formats:
  // American: 12:15  -> British: 12.15
  // British:  12.15  -> American: 12:15
  _translateTime(text, locale) {
    if (locale === 'american-to-british') {
      // Match time like 12:15
      return text.replace(/\b(\d{1,2}):(\d{2})\b/g, (match, h, m) => {
        return `<span class="highlight">${h}.${m}</span>`;
      });
    } else if (locale === 'british-to-american') {
      // Match time like 12.15 (but not decimals like 4.30 unless context suggests time)
      // We match digits.digits where both parts look like time (hour:minute pattern)
      return text.replace(/\b(\d{1,2})\.(\d{2})\b/g, (match, h, m) => {
        const hour = parseInt(h, 10);
        const minute = parseInt(m, 10);
        // Only convert if it looks like a valid time (0-23 hours, 0-59 minutes)
        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
          return `<span class="highlight">${h}:${m}</span>`;
        }
        return match;
      });
    }
    return text;
  }

  // Wrap a word/phrase in a highlight span
  _highlight(word) {
    return `<span class="highlight">${word}</span>`;
  }

  translate(text, locale) {
    if (!text && text !== '') return { error: 'Required field(s) missing' };
    if (text === '') return { error: 'No text to translate' };
    if (!locale) return { error: 'Required field(s) missing' };
    if (locale !== 'american-to-british' && locale !== 'british-to-american') {
      return { error: 'Invalid value for locale field' };
    }

    const dicts = this._getDictionaries(locale);
    // Merge all dictionaries into one, longer (multi-word) keys should take priority
    const merged = Object.assign({}, ...dicts.slice().reverse(), ...dicts.map ? [] : []);

    // Actually, merge in order: later dicts override earlier ones for same key
    // But we want ALL entries available, not override. Let's keep them separate for lookup
    // We'll use a combined lookup object
    const combined = {};
    for (const dict of dicts) {
      for (const [key, value] of Object.entries(dict)) {
        combined[key.toLowerCase()] = value;
      }
    }

    // Sort keys by length descending so multi-word phrases match first
    const sortedKeys = Object.keys(combined).sort((a, b) => b.length - a.length);

    let result = text;
    // We'll build a replaced version. We need to avoid re-replacing already-replaced text.
    // Strategy: work on the text character by character, using a regex-based scan.

    // Build a map of positions to replace: [start, end, replacement]
    const replacements = [];
    const lowerText = text.toLowerCase();

    for (const key of sortedKeys) {
      const value = combined[key];
      // Build a regex for the key that matches whole words/phrases
      // Escape special regex characters in the key
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match whole word boundaries, but titles (ending with .) need special handling
      let pattern;
      if (key.endsWith('.')) {
        // Titles like "mr." - match at word boundary before, period is the end
        pattern = new RegExp(`(?<![\\w])${escapedKey}`, 'gi');
      } else {
        pattern = new RegExp(`(?<![\\w])${escapedKey}(?![\\w])`, 'gi');
      }

      let match;
      while ((match = pattern.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        // Check if this range overlaps with any already recorded replacement
        const overlaps = replacements.some(([s, e]) => start < e && end > s);
        if (!overlaps) {
          // Preserve original casing: if the original match starts with uppercase, capitalize value
          let translatedValue = value;
          if (match[0][0] === match[0][0].toUpperCase() && match[0][0] !== match[0][0].toLowerCase()) {
            translatedValue = value.charAt(0).toUpperCase() + value.slice(1);
          }
          replacements.push([start, end, this._highlight(translatedValue)]);
        }
      }
    }

    // Sort replacements by start position
    replacements.sort((a, b) => a[0] - b[0]);

    // Build the result string
    let translated = '';
    let cursor = 0;
    for (const [start, end, replacement] of replacements) {
      translated += text.slice(cursor, start);
      translated += replacement;
      cursor = end;
    }
    translated += text.slice(cursor);

    // Handle time translations on the already-built string
    // But we need to do it on the original text positions. Let's handle time separately.
    // Re-do: apply time translation to the translated string (it won't double-replace since
    // time patterns don't appear inside <span> tags normally)
    translated = this._translateTime(translated, locale);

    if (translated === text) {
      return { text, translation: 'Everything looks good to me!' };
    }

    return { text, translation: translated };
  }
}

module.exports = Translator;
