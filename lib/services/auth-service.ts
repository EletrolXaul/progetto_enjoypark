import axios from 'axios';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ProfileUpdateRequest
} from './auth-service.types';

// Flag per abilitare/disabilitare l'uso dei dati di prova
export const USE_MOCK_DATA = false;

// Configurazione di base per axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Modifica con l'URL corretto del backend
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Intercettore per aggiungere automaticamente il token di autenticazione se presente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('enjoypark-token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Servizio di autenticazione
 */
export const authService = {
  /**
   * Effettua il login dell'utente
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Registra un nuovo utente
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Effettua il logout dell'utente
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  /**
   * Ottiene il profilo dell'utente corrente
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Aggiorna il profilo dell'utente
   */
  updateProfile: async (data: ProfileUpdateRequest): Promise<User> => {
    const response = await api.post<User>('/auth/profile', data);
    return response.data;
  }
};

export default authService;