"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "it" | "en"

interface Translations {
  [key: string]: {
    it: string
    en: string
  }
}

const translations: Translations = {
  // Navigation
  "nav.home": { it: "Home", en: "Home" },
  "nav.map": { it: "Mappa", en: "Map" },
  "nav.attractions": { it: "Attrazioni", en: "Attractions" },
  "nav.shows": { it: "Spettacoli", en: "Shows" },
  "nav.planner": { it: "Planner", en: "Planner" },
  "nav.tickets": { it: "Biglietti", en: "Tickets" },
  "nav.info": { it: "Info", en: "Info" },

  // Common
  "common.loading": { it: "Caricamento...", en: "Loading..." },
  "common.save": { it: "Salva", en: "Save" },
  "common.cancel": { it: "Annulla", en: "Cancel" },
  "common.close": { it: "Chiudi", en: "Close" },
  "common.search": { it: "Cerca", en: "Search" },
  "common.filter": { it: "Filtra", en: "Filter" },
  "common.back": { it: "Indietro", en: "Back" },
  "common.next": { it: "Avanti", en: "Next" },
  "common.previous": { it: "Precedente", en: "Previous" },

  // Home page
  "home.welcome": { it: "Benvenuto a EnjoyPark!", en: "Welcome to EnjoyPark!" },
  "home.subtitle": {
    it: "Vivi un'esperienza magica nel nostro parco divertimenti. Pianifica la tua giornata perfetta!",
    en: "Experience the magic of our theme park. Plan your perfect day!",
  },
  "home.park.open": { it: "Parco Aperto", en: "Park Open" },
  "home.park.closed": { it: "Parco Chiuso", en: "Park Closed" },

  // Stats
  "stats.attractions.open": { it: "Attrazioni Aperte", en: "Open Attractions" },
  "stats.wait.time": { it: "Tempo Attesa Medio", en: "Average Wait Time" },
  "stats.visitors.today": { it: "Visitatori Oggi", en: "Visitors Today" },
  "stats.shows.today": { it: "Spettacoli Oggi", en: "Shows Today" },

  // Account
  "account.login": { it: "Accedi", en: "Login" },
  "account.logout": { it: "Esci", en: "Logout" },
  "account.register": { it: "Registrati", en: "Register" },
  "account.profile": { it: "Profilo", en: "Profile" },
  "account.settings": { it: "Impostazioni", en: "Settings" },
  "account.favorites": { it: "Preferiti", en: "Favorites" },
  "account.history": { it: "Cronologia", en: "History" },
  "account.membership": { it: "Abbonamento", en: "Membership" },

  // Theme
  "theme.light": { it: "Tema Chiaro", en: "Light Theme" },
  "theme.dark": { it: "Tema Scuro", en: "Dark Theme" },
  "theme.toggle": { it: "Cambia Tema", en: "Toggle Theme" },

  // Language
  "language.italian": { it: "Italiano", en: "Italian" },
  "language.english": { it: "Inglese", en: "English" },
  "language.change": { it: "Cambia Lingua", en: "Change Language" },
}

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("it")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("enjoypark-language") as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    } else {
      const browserLanguage = navigator.language.startsWith("en") ? "en" : "it"
      setLanguage(browserLanguage)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("enjoypark-language", language)
  }, [language])

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
