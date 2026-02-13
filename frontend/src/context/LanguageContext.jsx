import { createContext, useContext, useState, useCallback } from "react";
import translations from "@/i18n/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("app_language") || "it";
  });

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const next = prev === "it" ? "en" : "it";
      localStorage.setItem("app_language", next);
      return next;
    });
  }, []);

  const setLang = useCallback((lang) => {
    localStorage.setItem("app_language", lang);
    setLanguage(lang);
  }, []);

  // Translation function - supports nested keys like "dashboard.welcome"
  const t = useCallback((key, params = {}) => {
    const keys = key.split(".");
    let value = translations[language];
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; // Fallback to key if not found
      }
    }
    if (typeof value === "string" && Object.keys(params).length > 0) {
      return Object.entries(params).reduce(
        (str, [k, v]) => str.replace(`{${k}}`, v), value
      );
    }
    return value;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
