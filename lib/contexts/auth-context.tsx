"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService } from "@/lib/services/auth-service"
import type { User } from "@/lib/services/auth-service.types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<boolean>
  updateProfile: (updates: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const response = await authService.login({ email, password })
      localStorage.setItem('enjoypark-token', response.token)
      setUser(response.user)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Errore durante il login:", error)
      setIsLoading(false)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const response = await authService.register({ name, email, password })
      localStorage.setItem('enjoypark-token', response.token)
      setUser(response.user)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Errore durante la registrazione:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      localStorage.removeItem('enjoypark-token')
    } catch (error) {
      console.error("Errore durante il logout:", error)
      setUser(null)
      localStorage.removeItem('enjoypark-token')
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return
    
    try {
      const updatedUser = await authService.updateProfile(updates)
      setUser(updatedUser)
    } catch (error) {
      console.error("Errore durante l'aggiornamento del profilo:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
