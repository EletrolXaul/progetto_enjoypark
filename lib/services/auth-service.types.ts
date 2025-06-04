/**
 * Interfacce per il servizio di autenticazione
 */

// Interfaccia per i dati di login
export interface LoginRequest {
  email: string;
  password: string;
}

// Interfaccia per i dati di registrazione
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Interfaccia per la risposta di autenticazione
export interface AuthResponse {
  user: User;
  token: string;
}

// Interfaccia per l'utente
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    language: string;
    theme: string;
    notifications: boolean;
    newsletter: boolean;
  };
  membership: "standard" | "premium" | "vip";
  visitHistory: Array<{
    date: string;
    attractions: string[];
    rating: number;
  }>;
  isAdmin?: boolean;
}

// Interfaccia per l'aggiornamento del profilo
export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  preferences?: {
    language?: string;
    theme?: string;
    notifications?: boolean;
    newsletter?: boolean;
  };
}