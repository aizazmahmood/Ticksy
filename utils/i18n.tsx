import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nManager, View, ActivityIndicator } from 'react-native';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { Storage } from './storage';

import enTranslations from '../locales/en/translation.json';
import arTranslations from '../locales/ar/translation.json';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  changeLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Configure i18next
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      en: { translation: enTranslations },
      ar: { translation: arTranslations },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initLanguage = async () => {
      try {
        // Try to load saved language preference
        const savedLanguage = await Storage.getLanguage();
        if (savedLanguage) {
          await changeLanguage(savedLanguage, false);
        } else {
          // Use device locale if available
          const deviceLocale = Localization.getLocales()[0]?.languageCode;
          if (deviceLocale === 'ar') {
            await changeLanguage('ar', false);
          } else {
            await changeLanguage('en', false);
          }
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        await changeLanguage('en', false);
      } finally {
        setIsInitialized(true);
      }
    };

    initLanguage();
  }, []);

  const changeLanguage = async (lang: Language, save: boolean = true) => {
    try {
      // Change i18n language
      await i18n.changeLanguage(lang);
      
      // Update RTL
      const isRTL = lang === 'ar';
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
        // Note: On Android, you may need to restart the app for RTL to take effect
        // On iOS, it should work immediately
        if (require('react-native').Platform.OS === 'android') {
          // For Android, you might want to show a message or handle restart
          console.warn('RTL change requires app restart on Android');
        }
      }

      setLanguage(lang);
      
      if (save) {
        await Storage.saveLanguage(lang);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Don't render children until language is initialized
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFDF6' }}>
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    );
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        isRTL: language === 'ar',
        changeLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Export i18n for direct use if needed
export { i18n };

