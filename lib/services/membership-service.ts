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

export interface MembershipTier {
  id: string;
  name: string;
  description: string;
  price: number;
  benefits: string[];
  color: string;
  icon?: React.ReactNode;
}

export interface UserMembership {
  tier: string;
  startDate: string;
  endDate: string;
  visitsThisMonth: number;
  totalVisits: number;
  pointsEarned: number;
  pointsToNextTier: number;
  discountsUsed: number;
}

/**
 * Servizio per la membership dell'utente
 * 
 * Nota: Poiché il backend non ha ancora endpoint specifici per la membership,
 * questo servizio simula il comportamento utilizzando i dati dell'utente.
 */
export const membershipService = {
  /**
   * Ottiene i dati della membership dell'utente
   */
  getUserMembership: async (): Promise<UserMembership | null> => {
    try {
      // Ottieni il profilo utente
      const userResponse = await api.get('/auth/me');
      const user = userResponse.data;
      
      if (!user) return null;
      
      // Ottieni la cronologia delle visite
      const visitHistories = user.visitHistories || [];
      
      // Calcola il numero di visite questo mese
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const visitsThisMonth = visitHistories.filter((visit: any) => {
        const visitDate = new Date(visit.visit_date);
        return visitDate.getMonth() === thisMonth && visitDate.getFullYear() === thisYear;
      }).length;
      
      // Simula i dati della membership basandosi sul tier dell'utente
      const membership: UserMembership = {
        tier: user.membership || 'standard',
        startDate: '2024-01-01', // Data di inizio predefinita
        endDate: '2024-12-31',   // Data di fine predefinita
        visitsThisMonth,
        totalVisits: visitHistories.length,
        pointsEarned: visitHistories.length * 100, // 100 punti per visita
        pointsToNextTier: user.membership === 'standard' ? 1000 : 
                         user.membership === 'premium' ? 2000 : 0,
        discountsUsed: Math.floor(Math.random() * 10) // Valore casuale per ora
      };
      
      return membership;
    } catch (error) {
      console.error('Errore nel recupero della membership:', error);
      return null;
    }
  },
  
  /**
   * Ottiene tutti i tier di membership disponibili
   */
  getMembershipTiers: async (): Promise<MembershipTier[]> => {
    // Questi dati potrebbero venire dal backend in futuro
    return [
      {
        id: "standard",
        name: "Standard",
        description: "Perfetto per visitatori occasionali",
        price: 0,
        benefits: [
          "Accesso al parco",
          "Mappa digitale",
          "Notifiche eventi"
        ],
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      },
      {
        id: "premium",
        name: "Premium",
        description: "Per chi ama visitare il parco regolarmente",
        price: 29.99,
        benefits: [
          "Tutti i benefici Standard",
          "10% sconto su cibo e bevande",
          "Accesso prioritario alle attrazioni",
          "1 ospite gratuito al mese",
          "Parcheggio gratuito"
        ],
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      },
      {
        id: "vip",
        name: "VIP",
        description: "L'esperienza definitiva per i veri appassionati",
        price: 59.99,
        benefits: [
          "Tutti i benefici Premium",
          "20% sconto su tutto",
          "Accesso VIP alle nuove attrazioni",
          "3 ospiti gratuiti al mese",
          "Concierge personale",
          "Eventi esclusivi",
          "Gift annuale"
        ],
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      }
    ];
  },
  
  /**
   * Aggiorna il tier di membership dell'utente
   */
  upgradeMembership: async (tierId: string): Promise<boolean> => {
    try {
      // Qui dovrebbe esserci una chiamata API per aggiornare la membership
      // Per ora, aggiorniamo solo il profilo utente
      await api.post('/auth/profile', { membership: tierId });
      return true;
    } catch (error) {
      console.error('Errore nell\'aggiornamento della membership:', error);
      return false;
    }
  }
};

export default membershipService;