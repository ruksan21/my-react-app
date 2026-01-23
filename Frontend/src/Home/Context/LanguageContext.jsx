import { useState, useEffect } from "react";
import { translations } from "../../data/translations";
import { LanguageContext } from "./useLanguage";

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("app_lang") || "NP";
  });

  useEffect(() => {
    localStorage.setItem("app_lang", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "NP" ? "EN" : "NP"));
  };

  const t = (key) => {
    const keys = key.split(".");
    let value = translations[language];
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key;
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
