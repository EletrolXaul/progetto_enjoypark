import axios from 'axios';

// Configurazione di base per axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
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

export interface FavoriteItem {
  id: string;
  type: 'attraction' | 'show' | 'restaurant';
  name: string;
  description: string;
  location: string;
  rating: number;
  image: string;
  addedDate: string;
}

/**
 * Servizio per i preferiti dell'utente
 * 
 * Nota: Poiché il backend non ha ancora un endpoint specifico per i preferiti,
 * questo servizio simula il comportamento utilizzando localStorage.
 * In futuro, quando il backend avrà gli endpoint appropriati, questo servizio
 * dovrà essere aggiornato per utilizzare le API reali.
 */
export const favoritesService = {
  /**
   * Ottiene tutti i preferiti dell'utente
   */
  getFavorites: async (): Promise<FavoriteItem[]> => {
    // Per ora, utilizziamo localStorage
    const favorites = localStorage.getItem('enjoypark-favorites');
    return favorites ? JSON.parse(favorites) : [];
  },

  /**
   * Aggiunge un elemento ai preferiti
   */
  addFavorite: async (item: FavoriteItem): Promise<FavoriteItem[]> => {
    const favorites = await favoritesService.getFavorites();
    
    // Verifica se l'elemento è già nei preferiti
    if (!favorites.some(fav => fav.id === item.id)) {
      const newFavorites = [...favorites, {
        ...item,
        addedDate: new Date().toISOString().split('T')[0] // Data corrente in formato YYYY-MM-DD
      }];
      localStorage.setItem('enjoypark-favorites', JSON.stringify(newFavorites));
      return newFavorites;
    }
    
    return favorites;
  },

  /**
   * Rimuove un elemento dai preferiti
   */
  removeFavorite: async (id: string): Promise<FavoriteItem[]> => {
    const favorites = await favoritesService.getFavorites();
    const newFavorites = favorites.filter(item => item.id !== id);
    localStorage.setItem('enjoypark-favorites', JSON.stringify(newFavorites));
    return newFavorites;
  },

  /**
   * Verifica se un elemento è nei preferiti
   */
  isFavorite: async (id: string): Promise<boolean> => {
    const favorites = await favoritesService.getFavorites();
    return favorites.some(item => item.id === id);
  }
};

export default favoritesService;