import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enRoom from './locales/en/room.json';
import enAdmin from './locales/en/admin.json';
import enAuth from './locales/en/auth.json';

import viCommon from './locales/vi/common.json';
import viRoom from './locales/vi/room.json';
import viAdmin from './locales/vi/admin.json';
import viAuth from './locales/vi/auth.json';

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
    en: {
      common: enCommon,
      room: enRoom,
      admin: enAdmin,
      auth: enAuth,
    },
    vi: {
      common: viCommon,
      room: viRoom,
      admin: viAdmin,
      auth: viAuth,
    },
  },
  ns: ['common', 'room', 'admin', 'auth'],
  defaultNS: 'common',
  fallbackNS: 'common',
  lng: initialLang,
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
