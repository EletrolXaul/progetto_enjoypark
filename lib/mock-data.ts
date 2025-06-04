/**
 * DATI DI PROVA PER IL SISTEMA ENJOYPARK
 *
 * Questo file contiene tutti i dati simulati per testare il sistema:
 * - Carte di credito di prova con diversi risultati
 * - Ordini precaricati per testing
 * - Codici promozionali attivi
 * - Funzioni di utilità per validazione
 */

// Interfaccia per le carte di credito simulate
export interface MockCreditCard {
  number: string // Numero carta (senza spazi)
  name: string // Nome per identificazione
  expiry: string // Data scadenza MM/YY
  cvv: string // Codice sicurezza
  type: "visa" | "mastercard" | "amex" // Tipo carta
  result: "success" | "declined" | "insufficient_funds" | "expired" // Risultato simulato
  message: string // Messaggio di risposta
}

/**
 * CARTE DI CREDITO DI PROVA
 *
 * Ogni carta simula un diverso scenario di pagamento:
 * - success: Pagamento completato con successo
 * - declined: Carta rifiutata dalla banca
 * - insufficient_funds: Fondi insufficienti
 * - expired: Carta scaduta
 */
export const mockCreditCards: MockCreditCard[] = [
  {
    number: "4111111111111111", // Carta Visa standard per test successo
    name: "Test Success",
    expiry: "12/25",
    cvv: "123",
    type: "visa",
    result: "success",
    message: "Pagamento completato con successo",
  },
  {
    number: "4000000000000002", // Carta per simulare rifiuto
    name: "Test Declined",
    expiry: "12/25",
    cvv: "123",
    type: "visa",
    result: "declined",
    message: "Carta rifiutata dalla banca",
  },
  {
    number: "4000000000000119", // Carta per simulare fondi insufficienti
    name: "Test Insufficient",
    expiry: "12/25",
    cvv: "123",
    type: "visa",
    result: "insufficient_funds",
    message: "Fondi insufficienti",
  },
  {
    number: "4000000000000069", // Carta scaduta (data nel passato)
    name: "Test Expired",
    expiry: "12/20", // Data scaduta
    cvv: "123",
    type: "visa",
    result: "expired",
    message: "Carta scaduta",
  },
  {
    number: "5555555555554444", // Mastercard di successo
    name: "Test Mastercard",
    expiry: "12/25",
    cvv: "123",
    type: "mastercard",
    result: "success",
    message: "Pagamento completato con successo",
  },
  {
    number: "378282246310005", // American Express (CVV a 4 cifre)
    name: "Test Amex",
    expiry: "12/25",
    cvv: "1234", // Amex usa CVV a 4 cifre
    type: "amex",
    result: "success",
    message: "Pagamento completato con successo",
  },
]

// Interfaccia per gli ordini simulati
export interface MockOrder {
  id: string // ID univoco ordine
  userId: string // ID utente che ha fatto l'ordine
  tickets: { [key: string]: number } // Mappa tipo_biglietto -> quantità
  totalPrice: number // Prezzo totale in euro
  purchaseDate: string // Data acquisto ISO string
  visitDate: string // Data visita pianificata
  status: "pending" | "confirmed" | "used" | "expired" // Stato ordine
  qrCodes: string[] // Array di QR codes generati
  customerInfo: {
    name: string
    email: string
    phone?: string
  }
  paymentMethod: {
    last4: string // Ultime 4 cifre carta
    type: string // Tipo carta usata
  }
}

/**
 * ORDINI DI PROVA PRECARICATI
 *
 * Questi ordini simulano diverse situazioni:
 * - Ordini confermati per visite future
 * - Ordini già utilizzati
 * - Ordini scaduti
 * - Diversi tipi di biglietti e quantità
 */
export const mockOrders: MockOrder[] = [
  {
    id: "ORDER-1703123456789",
    userId: "1", // Collegato all'utente demo
    tickets: { standard: 2, premium: 1 }, // 2 standard + 1 premium
    totalPrice: 155, // 2*45 + 1*65 = 155€
    purchaseDate: "2024-01-15T10:30:00Z",
    visitDate: "2024-02-14", // San Valentino
    status: "confirmed",
    qrCodes: ["EP-1703123456789-ABC123", "EP-1703123456790-DEF456", "EP-1703123456791-GHI789"],
    customerInfo: {
      name: "Mario Rossi",
      email: "mario.rossi@email.com",
      phone: "+39 123 456 7890",
    },
    paymentMethod: {
      last4: "1111", // Visa di successo
      type: "visa",
    },
  },
  {
    id: "ORDER-1703123456790",
    userId: "2",
    tickets: { family: 1 }, // Pacchetto famiglia (4 persone)
    totalPrice: 160,
    purchaseDate: "2024-01-10T14:20:00Z",
    visitDate: "2024-01-20", // Visita già avvenuta
    status: "used", // Biglietti già utilizzati
    qrCodes: [
      "EP-1703123456792-JKL012",
      "EP-1703123456793-MNO345",
      "EP-1703123456794-PQR678",
      "EP-1703123456795-STU901",
    ],
    customerInfo: {
      name: "Giulia Bianchi",
      email: "giulia.bianchi@email.com",
      phone: "+39 987 654 3210",
    },
    paymentMethod: {
      last4: "4444", // Mastercard
      type: "mastercard",
    },
  },
  {
    id: "ORDER-1703123456791",
    userId: "3",
    tickets: { premium: 2 }, // 2 biglietti premium
    totalPrice: 130,
    purchaseDate: "2024-01-05T09:15:00Z",
    visitDate: "2024-01-15", // Data passata
    status: "expired", // Biglietti scaduti
    qrCodes: ["EP-1703123456796-VWX234", "EP-1703123456797-YZA567"],
    customerInfo: {
      name: "Luca Verdi",
      email: "luca.verdi@email.com",
    },
    paymentMethod: {
      last4: "0005", // American Express
      type: "amex",
    },
  },
  {
    id: "ORDER-1703123456792",
    userId: "1", // Secondo ordine dello stesso utente
    tickets: { season: 1 }, // Abbonamento stagionale
    totalPrice: 120,
    purchaseDate: "2024-01-20T16:45:00Z",
    visitDate: "2024-03-01", // Visita futura
    status: "confirmed",
    qrCodes: ["EP-1703123456798-BCD890"],
    customerInfo: {
      name: "Mario Rossi",
      email: "mario.rossi@email.com",
      phone: "+39 123 456 7890",
    },
    paymentMethod: {
      last4: "1111",
      type: "visa",
    },
  },
]

/**
 * CODICI PROMOZIONALI ATTIVI
 *
 * Diversi tipi di sconti:
 * - percentage: Sconto percentuale con limite massimo
 * - fixed: Sconto fisso in euro
 */
export const promoCodes = [
  {
    code: "WELCOME10", // Codice per nuovi clienti
    discount: 10,
    type: "percentage" as const,
    description: "Sconto 10% per nuovi clienti",
    minAmount: 50, // Importo minimo per applicare sconto
    maxDiscount: 20, // Sconto massimo in euro
    validUntil: "2024-12-31",
    usageLimit: 100, // Numero massimo utilizzi
    usedCount: 23, // Utilizzi attuali
  },
  {
    code: "FAMILY20", // Sconto per famiglie
    discount: 20,
    type: "fixed" as const, // Sconto fisso
    description: "Sconto €20 su pacchetti famiglia",
    minAmount: 150,
    validUntil: "2024-06-30",
    usageLimit: 50,
    usedCount: 12,
  },
  {
    code: "SUMMER15", // Promozione estiva
    discount: 15,
    type: "percentage" as const,
    description: "Sconto estivo 15%",
    minAmount: 80,
    maxDiscount: 30,
    validUntil: "2024-08-31",
    usageLimit: 200,
    usedCount: 87,
  },
]

/**
 * FUNZIONE DI VALIDAZIONE CARTA DI CREDITO
 *
 * Simula la validazione di una carta di credito confrontando
 * il numero inserito con le carte di prova disponibili
 *
 * @param cardNumber - Numero carta (con o senza spazi)
 * @returns MockCreditCard se trovata, null altrimenti
 */
// Default to using mock data in development
import { USE_MOCK_DATA } from "@/lib/services/auth-service";

export function validateCreditCard(cardNumber: string): MockCreditCard | null {
  if (!USE_MOCK_DATA) return null;
  
  // Rimuove spazi dal numero carta per confronto
  const cleanNumber = cardNumber.replace(/\s/g, "");

  // Cerca la carta nell'array delle carte di prova
  return mockCreditCards.find((card) => card.number === cleanNumber) || null;
}

export function generateMockQRCode(): string {
  if (!USE_MOCK_DATA) {
    // In caso di dati reali, restituisci una stringa vuota o gestisci diversamente
    return "";
  }
  
  const timestamp = Date.now(); // Timestamp corrente
  const random = Math.random().toString(36).substring(2, 8).toUpperCase(); // Stringa random
  return `EP-${timestamp}-${random}`;
}

/**
 * INIZIALIZZAZIONE DATI DI PROVA
 *
 * Carica i dati di prova nel localStorage se non esistono già.
 * Questo permette di avere dati consistenti tra le sessioni
 * senza sovrascrivere dati creati dall'utente.
 */
export function initializeMockData() {
  // Se USE_MOCK_DATA è false, non inizializzare i dati di prova
  if (!USE_MOCK_DATA) return;
  
  // Controlla se esistono già ordini salvati
  const existingOrders = localStorage.getItem("enjoypark-orders");
  if (!existingOrders) {
    // Se non esistono, carica gli ordini di prova
    localStorage.setItem("enjoypark-orders", JSON.stringify(mockOrders));
  }

  // Controlla se esistono già codici promo salvati
  const existingPromoCodes = localStorage.getItem("enjoypark-promocodes");
  if (!existingPromoCodes) {
    // Se non esistono, carica i codici promo di prova
    localStorage.setItem("enjoypark-promocodes", JSON.stringify(promoCodes));
  }
}
