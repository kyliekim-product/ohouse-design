import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// ODS 내부 컴포넌트 일부가 react-i18next 컨텍스트를 요구하므로 최소 초기화만 수행.
void i18n.use(initReactI18next).init({
  lng: 'ko',
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
  resources: {
    ko: { translation: {} },
  },
});

export default i18n;
