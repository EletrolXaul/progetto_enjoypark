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
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
  // Aggiungi queste proprietà mancanti:
  isAdmin?: boolean;
  is_admin?: boolean;
  visitHistory?: VisitHistoryEntry[];
  avatar?: string;
  // Aggiungi la proprietà preferences mancante:
  preferences?: {
    language?: string;
    theme?: string;
    notifications?: boolean;
    newsletter?: boolean;
  };
}

// Aggiungi anche l'interfaccia per la cronologia visite
export interface VisitHistoryEntry {
  id: number;
  user_id: number;
  visit_date: string;
  duration?: number;
  rating?: number;
  attractions?: string[];
  attractions_visited?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
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