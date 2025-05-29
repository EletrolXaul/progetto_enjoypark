"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

/**
 * INTERFACCIA UTENTE
 *
 * Definisce la struttura dati di un utente nel sistema
 */
interface User {
  id: string // Identificativo univoco
  name: string // Nome completo
  email: string // Email per login
  avatar?: string // URL avatar (opzionale)
  preferences: {
    language: string // Lingua preferita (it/en)
    theme: string // Tema preferito (light/dark)
    notifications: boolean // Notifiche attive
    newsletter: boolean // Iscrizione newsletter
  }
  membership: "standard" | "premium" | "vip" // Tipo abbonamento
  visitHistory: Array<{
    date: string // Data visita
    attractions: string[] // Attrazioni visitate
    rating: number // Valutazione esperienza
  }>
  isAdmin?: boolean // Flag per accesso admin
}

/**
 * INTERFACCIA CONTEXT AUTENTICAZIONE
 *
 * Definisce le funzioni disponibili per gestire l'autenticazione
 */
interface AuthContextType {
  user: User | null // Utente corrente (null se non loggato)
  login: (email: string, password: string) => Promise<boolean> // Funzione login
  logout: () => void // Funzione logout
  register: (name: string, email: string, password: string) => Promise<boolean> // Registrazione
  updateProfile: (updates: Partial<User>) => void // Aggiornamento profilo
  isLoading: boolean // Stato caricamento
}

// Creazione del Context React
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * PROVIDER AUTENTICAZIONE
 *
 * Componente che fornisce le funzionalità di autenticazione
 * a tutta l'applicazione tramite React Context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * CARICAMENTO UTENTE ALL'AVVIO
   *
   * Controlla se esiste un utente salvato nel localStorage
   * e lo ripristina automaticamente
   */
  useEffect(() => {
    // Simula il caricamento dell'utente dal localStorage
    const savedUser = localStorage.getItem("enjoypark-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Errore nel caricamento utente salvato:", error)
        // Rimuove dati corrotti
        localStorage.removeItem("enjoypark-user")
      }
    }
    setIsLoading(false)
  }, [])

  /**
   * FUNZIONE LOGIN
   *
   * Gestisce l'autenticazione con credenziali di prova:
   * - demo@enjoypark.it / demo123 (utente normale)
   * - admin / admin (amministratore)
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simula chiamata API con delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // ACCOUNT DEMO UTENTE NORMALE
    if (email === "demo@enjoypark.it" && password === "demo123") {
      const demoUser: User = {
        id: "1",
        name: "Mario Rossi",
        email: "demo@enjoypark.it",
        avatar: "/placeholder.svg?height=40&width=40",
        preferences: {
          language: "it",
          theme: "light",
          notifications: true,
          newsletter: true,
        },
        membership: "premium", // Utente premium per testare funzionalità
        visitHistory: [
          {
            date: "2024-01-15",
            attractions: ["Dragon Coaster", "Magic Castle"],
            rating: 5,
          },
        ],
      }

      // Salva utente in stato e localStorage
      setUser(demoUser)
      localStorage.setItem("enjoypark-user", JSON.stringify(demoUser))
      setIsLoading(false)
      return true
    }

    // ACCOUNT AMMINISTRATORE
    if (email === "admin" && password === "admin") {
      const adminUser: User = {
        id: "admin",
        name: "Amministratore",
        email: "admin@enjoypark.it",
        avatar: "/placeholder.svg?height=40&width=40",
        preferences: {
          language: "it",
          theme: "light",
          notifications: true,
          newsletter: true,
        },
        membership: "vip", // Admin ha sempre membership VIP
        visitHistory: [],
        isAdmin: true, // Flag per accesso funzionalità admin
      }

      setUser(adminUser)
      localStorage.setItem("enjoypark-user", JSON.stringify(adminUser))
      setIsLoading(false)
      return true
    }

    // Credenziali non valide
    setIsLoading(false)
    return false
  }

  /**
   * FUNZIONE REGISTRAZIONE
   *
   * Crea un nuovo utente con dati forniti
   * (in un'app reale farebbe chiamata API)
   */
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simula chiamata API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Crea nuovo utente con impostazioni predefinite
    const newUser: User = {
      id: Date.now().toString(), // ID basato su timestamp
      name,
      email,
      preferences: {
        language: "it", // Italiano di default
        theme: "light", // Tema chiaro di default
        notifications: true,
        newsletter: false, // Newsletter disattivata di default
      },
      membership: "standard", // Nuovi utenti hanno membership standard
      visitHistory: [], // Nessuna visita inizialmente
    }

    setUser(newUser)
    localStorage.setItem("enjoypark-user", JSON.stringify(newUser))
    setIsLoading(false)
    return true
  }

  /**
   * FUNZIONE LOGOUT
   *
   * Rimuove l'utente dallo stato e dal localStorage
   */
  const logout = () => {
    setUser(null)
    localStorage.removeItem("enjoypark-user")
  }

  /**
   * FUNZIONE AGGIORNAMENTO PROFILO
   *
   * Aggiorna parzialmente i dati utente
   */
  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      // Merge dei dati esistenti con gli aggiornamenti
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("enjoypark-user", JSON.stringify(updatedUser))
    }
  }

  // Fornisce tutte le funzioni tramite Context
  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * HOOK PER USARE IL CONTEXT
 *
 * Hook personalizzato per accedere alle funzionalità di autenticazione
 * da qualsiasi componente dell'app
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
