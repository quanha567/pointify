import type common from './locales/en/common.json';
import type room from './locales/en/room.json';
import type admin from './locales/en/admin.json';
import type auth from './locales/en/auth.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      room: typeof room;
      admin: typeof admin;
      auth: typeof auth;
    };
  }
}
