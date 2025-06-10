import axios from 'axios';

// Interfacce spostate da park-data.ts
export interface Attraction {
  id: string;
  name: string;
  type: 'attraction';
  category: string;
  description: string;
  location: {
    x: number;
    y: number;
    area: string;
  };
  image: string;
  status: 'open' | 'closed' | 'maintenance';
  waitTime: number;
  rating: number;
  capacity: number;
  minHeight?: number;
  maxHeight?: number;
  ageRestriction?: string;
  fastPassAvailable: boolean;
  openingTime: string;
  closingTime: string;
}

export interface Show {
  id: string;
  name: string;
  type: 'show'; // Aggiunto il campo type
  description: string;
  venue: string;
  duration: string;
  category: string;
  time: string;
  date: string;
  capacity: number;
  availableSeats: number;
  rating: number;
  price: number;
  ageRestriction: string;
  image: string;
}

export interface Restaurant {
  id: string;
  name: string;
  type: 'restaurant';
  description: string;
  location: {
    x: number;
    y: number;
    area: string;
  };
  image: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  openingHours: {
    open: string;
    close: string;
  };
  capacity: number;
  reservationRequired: boolean;
  menuHighlights: string[];
  dietaryOptions: string[];
}

export interface Shop {
  id: string;
  name: string;
  type: 'shop';
  description: string;
  location: {
    x: number;
    y: number;
    area: string;
  };
  image: string;
  category: string;
  openingHours: string;
  specialOffers: string[];
  paymentMethods: string[];
}

export interface Service {
  id: string;
  name: string;
  type: 'service';
  description: string;
  location: {
    x: number;
    y: number;
    area: string;
  };
  image: string;
  category: string;
  available24h: boolean;
  contactInfo?: string;
  additionalInfo?: string;
}

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

/**
 * Servizio per i dati del parco
 */
export const parkService = {
  /**
   * Ottiene tutte le attrazioni
   */
  getAttractions: async (): Promise<Attraction[]> => {
    const response = await api.get<Attraction[]>('/park/attractions');
    return response.data;
  },

  /**
   * Ottiene tutti gli spettacoli
   */
  async getShows(): Promise<Show[]> {
    try {
      const response = await api.get('/park/shows');
      console.log('Risposta spettacoli:', response.data); // Per debug
      
      // Assicuriamoci che ogni spettacolo abbia il campo type impostato
      const shows = response.data.map((show: Omit<Show, 'type'>) => ({
        ...show,
        type: 'show' // Aggiungiamo il campo type se non è presente
      }));
      
      return shows;
    } catch (error) {
      console.error('Errore nel recupero degli spettacoli:', error);
      throw error;
    }
  },

  /**
   * Ottiene tutti i ristoranti
   */
  getRestaurants: async (): Promise<Restaurant[]> => {
    const response = await api.get<Restaurant[]>('/park/restaurants');
    return response.data;
  },

  /**
   * Ottiene tutti i negozi
   */
  getShops: async (): Promise<Shop[]> => {
    const response = await api.get<Shop[]>('/park/shops');
    return response.data;
  },

  /**
   * Ottiene tutti i servizi
   */
  getServices: async (): Promise<Service[]> => {
    const response = await api.get<Service[]>('/park/services');
    return response.data;
  },

  /**
   * Ottiene tutti i dati del parco in un'unica chiamata
   */
  getAllData: async () => {
    const response = await api.get('/park/all');
    return response.data;
  },

  /**
   * Ottiene tutte le location (attrazioni, spettacoli, ristoranti, negozi, servizi)
   */
  getAllLocations: async () => {
    const data = await parkService.getAllData();
    
    // Assicuriamoci che ogni elemento abbia il campo type impostato
    const attractions = data.attractions.map((item: Omit<Attraction, 'type'>) => ({ ...item, type: 'attraction' }));
    const shows = data.shows.map((item: Omit<Show, 'type'>) => ({ ...item, type: 'show' }));
    const restaurants = data.restaurants.map((item: Omit<Restaurant, 'type'>) => ({ ...item, type: 'restaurant' }));
    const shops = data.shops.map((item: Omit<Shop, 'type'>) => ({ ...item, type: 'shop' }));
    const services = data.services.map((item: Omit<Service, 'type'>) => ({ ...item, type: 'service' }));
    
    return [
      ...attractions,
      ...shows,
      ...restaurants,
      ...shops,
      ...services
    ];
  },

  /**
   * Ottiene una location specifica per ID
   */
  getLocationById: async (id: string) => {
    const locations = await parkService.getAllLocations();
    return locations.find(location => location.id === id) || null;
  },

  /**
   * Ottiene le location per tipo
   */
  getLocationsByType: async (type: 'attraction' | 'show' | 'restaurant' | 'shop' | 'service') => {
    const data = await parkService.getAllData();
    switch (type) {
      case 'attraction': return data.attractions;
      case 'show': return data.shows;
      case 'restaurant': return data.restaurants;
      case 'shop': return data.shops;
      case 'service': return data.services;
      default: return [];
    }
  },

  /**
   * Cerca location per nome o descrizione
   */
  searchLocations: async (query: string) => {
    try {
      const locations = await parkService.getAllLocations();
      const lowerQuery = query.toLowerCase();
      const results = locations.filter(location => 
        location.name.toLowerCase().includes(lowerQuery) || 
        (location.description && location.description.toLowerCase().includes(lowerQuery))
      );
      console.log('Risultati ricerca:', query, results.length); // Per debug
      return results;
    } catch (error) {
      console.error('Errore nella ricerca:', error);
      return [];
    }
  }
};

export default parkService;