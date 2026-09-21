import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "fr";

const LANGUAGE_STORAGE_KEY = "rgg-language";

type LanguageContextValue = {
  language: Language;
  hasChosenLanguage: boolean;
  setLanguage: (language: Language) => void;
  chooseLanguage: (language: Language) => void;
  text: (english: string, french: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getStoredLanguage(): Language | null {
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "en" || stored === "fr" ? stored : null;
}

function getPreferredLanguage(): Language {
  return window.navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const storedLanguage = getStoredLanguage();
  const [language, updateLanguage] = useState<Language>(
    storedLanguage ?? getPreferredLanguage(),
  );
  // The stored value sets the suggested language, but every fresh page load
  // must begin with the cinematic welcome and an explicit language choice.
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      hasChosenLanguage,
      setLanguage: (nextLanguage) => {
        updateLanguage(nextLanguage);
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
      },
      chooseLanguage: (nextLanguage) => {
        updateLanguage(nextLanguage);
        setHasChosenLanguage(true);
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
      },
      text: (english, french) => (language === "fr" ? french : english),
    }),
    [hasChosenLanguage, language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}