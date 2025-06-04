"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService, USE_MOCK_DATA } from "@/lib/services/auth-service"
import type { User } from "@/lib/services/auth-service.types"

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
    const loadUser = async () => {
      // Se stiamo usando i dati di prova, carica dal localStorage
      if (USE_MOCK_DATA) {
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
        return
      }
      
      // Altrimenti, prova a caricare l'utente dal backend
      try {
        const token = localStorage.getItem('enjoypark-token')
        if (token) {
          const userData = await authService.getProfile()
          setUser(userData)
        }
      } catch (error) {
        console.error("Errore nel caricamento utente dal server:", error)
        localStorage.removeItem('enjoypark-token')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUser()
  }, [])

  /**
   * FUNZIONE LOGIN
   *
   * Gestisce l'autenticazione con credenziali
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Se stiamo usando i dati di prova, usa il login simulato
    if (USE_MOCK_DATA) {
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
      if (email === "admin@enjoypark.it" && password === "admin") {
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
    
    // Altrimenti, usa il login reale con il backend
    try {
      const response = await authService.login({ email, password })
      
      // Salva il token nel localStorage
      localStorage.setItem('enjoypark-token', response.token)
      
      // Salva l'utente nello stato
      setUser(response.user)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Errore durante il login:", error)
      setIsLoading(false)
      return false
    }
  }

  /**
   * FUNZIONE REGISTRAZIONE
   *
   * Crea un nuovo utente con dati forniti
   */
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Se stiamo usando i dati di prova, usa la registrazione simulata
    if (USE_MOCK_DATA) {
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
    
    // Altrimenti, usa la registrazione reale con il backend
    try {
      const response = await authService.register({ name, email, password })
      
      // Salva il token nel localStorage
      localStorage.setItem('enjoypark-token', response.token)
      
      // Salva l'utente nello stato
      setUser(response.user)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Errore durante la registrazione:", error)
      setIsLoading(false)
      return false
    }
  }

  /**
   * FUNZIONE LOGOUT
   *
   * Rimuove l'utente dallo stato e dal localStorage
   */
  const logout = async () => {
    // Se stiamo usando i dati di prova, usa il logout simulato
    if (USE_MOCK_DATA) {
      setUser(null)
      localStorage.removeItem("enjoypark-user")
      return
    }
    
    // Altrimenti, usa il logout reale con il backend
    try {
      await authService.logout()
      setUser(null)
      localStorage.removeItem('enjoypark-token')
    } catch (error) {
      console.error("Errore durante il logout:", error)
      // Rimuovi comunque il token e l'utente in caso di errore
      setUser(null)
      localStorage.removeItem('enjoypark-token')
    }
  }

  /**
   * FUNZIONE AGGIORNAMENTO PROFILO
   *
   * Aggiorna parzialmente i dati utente
   */
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return
    
    // Se stiamo usando i dati di prova, usa l'aggiornamento simulato
    if (USE_MOCK_DATA) {
      // Merge dei dati esistenti con gli aggiornamenti
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("enjoypark-user", JSON.stringify(updatedUser))
      return
    }
    
    // Altrimenti, usa l'aggiornamento reale con il backend
    try {
      const updatedUser = await authService.updateProfile(updates)
      setUser(updatedUser)
    } catch (error) {
      console.error("Errore durante l'aggiornamento del profilo:", error)
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
