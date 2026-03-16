"use client";

import { useState, useCallback, ReactNode, useEffect, createContext, useContext } from "react";
import { translations, Locale, Translations, supportedLocales, LocaleInfo } from "../lib/i18n";

// Create context for i18n
interface I18nContextType {
  t: Translations;
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

// Hook to use i18n context
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

interface I18nProviderProps {
  children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps): React.JSX.Element {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isLoading, setIsLoading] = useState(true);
  const t = translations[locale];

  // Auto-detect locale from IP on mount
  useEffect(() => {
    const detectLocale = async (): Promise<void> => {
      try {
        // Check if user has a saved preference
        const savedLocale = localStorage.getItem("preferred-locale") as Locale | null;
        if (savedLocale && translations[savedLocale]) {
          setLocaleState(savedLocale);
          setIsLoading(false);
          return;
        }

        // Fetch geo location from API
        const response = await fetch("/api/geo");
        if (response.ok) {
          const data = await response.json() as { country: string; locale: Locale };
          if (data.locale && translations[data.locale]) {
            setLocaleState(data.locale);
          }
        }
      } catch (error) {
        console.error("Failed to detect locale:", error);
        // Keep default English on error
      } finally {
        setIsLoading(false);
      }
    };

    void detectLocale();
  }, []);

  const setLocale = useCallback((newLocale: Locale): void => {
    setLocaleState(newLocale);
    // Save user preference
    localStorage.setItem("preferred-locale", newLocale);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <I18nContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

// Language Switcher Component
interface LanguageSwitcherProps {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export function LanguageSwitcher({ locale, setLocale }: LanguageSwitcherProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const currentLocale = supportedLocales.find((l) => l.code === locale) || supportedLocales[0];

  const handleSelect = (code: Locale): void => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-lg">{currentLocale.flag}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLocale.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50"
            role="listbox"
          >
            <div className="py-1">
              {supportedLocales.map((lang: LocaleInfo) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                    ${locale === lang.code
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }
                  `}
                  role="option"
                  aria-selected={locale === lang.code}
                >
                  <span className="text-lg flex-shrink-0">{lang.flag}</span>
                  <span className="text-sm font-medium flex-1">{lang.name}</span>
                  {locale === lang.code && (
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
