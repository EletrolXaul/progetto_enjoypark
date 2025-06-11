import axios from 'axios';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ProfileUpdateRequest
} from './auth-service.types';

// Configurazione di base per axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
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
    console.log('Risposta login dal backend:', JSON.stringify(response.data));
    
    // Assicurati che isAdmin sia impostato correttamente nell'utente
    if (response.data.user) {
      response.data.user.isAdmin = Boolean(response.data.user.is_admin || response.data.user.isAdmin);
    }
    
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
    const response = await api.get<any>('/auth/me');
    console.log('Risposta completa dal backend:', JSON.stringify(response.data));
    console.log('is_admin dal backend:', response.data.is_admin);
    console.log('isAdmin dal backend:', response.data.isAdmin);
    
    // Assicurati che isAdmin sia un booleano e considera entrambe le proprietà
    const userData = {
      ...response.data,
      isAdmin: Boolean(response.data.is_admin || response.data.isAdmin)
    };
    console.log('User data dopo mappatura:', userData);
    return userData;
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