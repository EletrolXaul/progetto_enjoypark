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

export interface HistoryItem {
  id: string;
  type: 'visit' | 'purchase' | 'booking';
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  amount?: number;
  status: 'completed' | 'cancelled' | 'pending';
  ticketNumber?: string;
}

/**
 * Servizio per la cronologia dell'utente
 * 
 * Nota: Poiché il backend non ha ancora endpoint specifici per tutti i tipi di cronologia,
 * questo servizio combina dati da diverse API e simula alcuni comportamenti.
 */
export const historyService = {
  /**
   * Ottiene tutta la cronologia dell'utente
   */
  getHistory: async (): Promise<HistoryItem[]> => {
    try {
      // Ottieni i biglietti (visite)
      const ticketsResponse = await api.get('/tickets');
      const tickets = ticketsResponse.data;
      
      // Ottieni gli ordini (acquisti)
      const ordersResponse = await api.get('/orders');
      const orders = ordersResponse.data;
      
      // Combina i dati in un unico array di cronologia
      const history: HistoryItem[] = [
        // Converti i biglietti in elementi di cronologia
        ...tickets.map((ticket: any) => ({
          id: ticket.id,
          type: 'visit',
          title: 'Visita al Parco',
          description: `Biglietto ${ticket.ticket_type}`,
          date: ticket.visit_date,
          time: '09:00', // Orario predefinito se non disponibile
          location: 'Ingresso Principale',
          status: ticket.status === 'valid' ? 'pending' : 
                 ticket.status === 'used' ? 'completed' : 'cancelled',
          ticketNumber: ticket.qr_code
        })),
        
        // Converti gli ordini in elementi di cronologia
        ...orders.map((order: any) => ({
          id: order.id,
          type: 'purchase',
          title: 'Acquisto Biglietti',
          description: `Ordine ${order.order_number}`,
          date: order.purchase_date.split('T')[0],
          time: order.purchase_date.split('T')[1].substring(0, 5),
          amount: order.total_price,
          status: order.status === 'confirmed' ? 'completed' : 
                 order.status === 'pending' ? 'pending' : 'cancelled'
        }))
      ];
      
      // Ordina per data (più recenti prima)
      return history.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Errore nel recupero della cronologia:', error);
      return [];
    }
  }
};

export default historyService;