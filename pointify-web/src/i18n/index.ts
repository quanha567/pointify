import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import viTranslation from './locales/vi.json';
import enTranslation from './locales/en.json';

// Detect initial language from localStorage store if present
const getSavedLanguage = (): string => {
  try {
    const raw = localStorage.getItem('pointify_app_store');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.language) {
        return parsed.state.language;
      }
    }
  } catch {}
  return 'vi';
};

const initialLang = getSavedLanguage();

void i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: viTranslation },
    en: { translation: enTranslation },
  },
  lng: initialLang,
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
