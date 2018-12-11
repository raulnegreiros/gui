import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fileTranslPtBr from '../lang/pt-br/common.json';
import fileTranslEn from '../lang/en/common.json';

i18n.use(LanguageDetector).init({
    // we init with resources
    resources: {
        en: {
            translations: fileTranslEn,
        },
        'pt-BR': {
            translations: fileTranslPtBr,
        },
    },
    fallbackLng: 'en',
    debug: true,

    // have a common namespace used around the full app
    ns: ['translations'],
    defaultNS: 'translations',

    interpolation: {
        escapeValue: false, // not needed for react!!
        formatSeparator: ',',
    },
    react: {
        wait: true,
    },
});

export default i18n;
