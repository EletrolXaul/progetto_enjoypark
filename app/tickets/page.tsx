"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  QrCode,
  Calendar,
  Star,
  Check,
  Download,
  Ticket,
  User,
  Mail,
  Phone,
  Copy,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";

/**
 * GENERATORE QR CODE COME IMMAGINE
 *
 * Genera un QR code come data URL per la visualizzazione
 */
const generateQRImage = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
  } catch (error) {
    console.error("Errore generazione QR:", error);
    return "";
  }
};

/**
 * INTERFACCIA ORDINE BIGLIETTO
 *
 * Struttura dati per un ordine di biglietti
 */
interface TicketOrder {
  id: string; // ID univoco ordine
  userId?: string; // ID utente (opzionale per acquisti anonimi)
  tickets: { [key: string]: number }; // Mappa tipo_biglietto -> quantità
  totalPrice: number; // Prezzo totale
  purchaseDate: string; // Data acquisto
  visitDate: string; // Data visita pianificata
  status: "pending" | "confirmed" | "used" | "expired"; // Stato ordine
  qrCodes: string[]; // QR codes generati
  // Aggiungi questo campo per i biglietti individuali
  ticketItems?: {
    id: string;
    ticket_type: string;
    price: number;
    qr_code: string;
    status: string;
    order_number: string;
  }[];
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  paymentMethod?: {
    last4: string; // Ultime 4 cifre carta
    type: string; // Tipo carta
  };
}

/**
 * COMPONENTE PRINCIPALE BIGLIETTERIA
 *
 * Gestisce l'intero flusso di acquisto biglietti:
 * - Selezione biglietti e data
 * - Checkout con dati cliente
 * - Pagamento simulato
 * - Generazione QR codes
 * - Visualizzazione ordini esistenti
 */
export default function TicketsPage() {
  // ✅ TUTTI GLI HOOKS ALL'INIZIO - SEMPRE NELLO STESSO ORDINE
  const { user } = useAuth();
  const { toast } = useToast();

  // STATI PER PAGAMENTO
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const [selectedOrderForQR, setSelectedOrderForQR] =
    useState<TicketOrder | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<TicketOrder | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);

  // STATI PER SELEZIONE BIGLIETTI
  const [selectedTickets, setSelectedTickets] = useState<{
    [key: string]: number;
  }>({});
  const [selectedDate, setSelectedDate] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState("");

  // STATI PER CHECKOUT
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // STATI PER DATI
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  // ✅ TUTTI I useEffect HOOKS DEVONO ESSERE QUI - SEMPRE CHIAMATI
  /**
   * CARICAMENTO ORDINI DAL BACKEND
   * Carica gli ordini dell'utente dal backend
   */
  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        setOrders([]);
        return;
      }

      try {
        console.log("🔍 Caricamento ordini per utente:", user.id);

        const response = await axios.get(
          "http://127.0.0.1:8000/api/user/tickets", // ✅ CORRETTO: porta 8000 invece di 3000
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "enjoypark-token"
              )}`,
            },
            timeout: 10000,
          }
        );

        console.log("🎫 I miei biglietti dal TicketController:", response.data);

        // I dati sono già nel formato corretto, quindi puoi usarli direttamente
        setOrders(response.data);
      } catch (error) {
        console.error("❌ Errore dettagliato:", error);
        // Imposta array vuoto invece di usare dati di fallback
        setOrders([]);

        toast({
          title: "Errore",
          description:
            "Impossibile caricare i biglietti. Verifica che il backend sia attivo.",
          variant: "destructive",
        });
      }
    };

    loadOrders();
  }, [user?.id, toast]); // Usa user?.id invece di user per stabilità

  /**
   * AGGIORNAMENTO DATI CLIENTE
   * Aggiorna automaticamente i dati quando l'utente cambia
   */
  useEffect(() => {
    if (user) {
      setCustomerInfo({
        name: user.name || "",
        email: user.email || "",
        phone: "",
      });
    }
  }, [user?.name, user?.email]); // Usa proprietà specifiche invece dell'intero oggetto user

  // ✅ LOGICA CONDIZIONALE DOPO TUTTI GLI HOOKS
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Devi essere loggato per vedere i tuoi biglietti
            </p>
            <Button asChild className="mt-4">
              <Link href="/auth/login">Accedi</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * CONFIGURAZIONE TIPI DI BIGLIETTI
   *
   * Definisce i diversi tipi di biglietti disponibili
   * con prezzi e caratteristiche
   */
  const ticketTypes = [
    {
      id: "standard",
      name: "Biglietto Standard",
      price: 45, // Prezzo in euro
      description: "Accesso completo al parco per un giorno",
      features: [
        "Accesso a tutte le attrazioni",
        "Mappa del parco inclusa",
        "Valido per un giorno",
      ],
      popular: false,
    },
    {
      id: "family",
      name: "Pacchetto Famiglia",
      price: 160,
      description: "Per famiglie con 2 adulti + 2 bambini",
      features: [
        "4 biglietti standard",
        "Pranzo famiglia incluso",
        "Area picnic riservata",
        "Attività per bambini",
      ],
      popular: true, // Ora il pacchetto famiglia è quello popolare
    },
  ];

  /**
   * SERVIZI AGGIUNTIVI
   *
   * Add-on acquistabili insieme ai biglietti
   */
  const addOns = [
    {
      id: "fastpass",
      name: "Fast Pass",
      price: 15,
      description: "Salta le code nelle attrazioni principali",
    },
    {
      id: "meal",
      name: "Piano Pasti",
      price: 25,
      description: "Pranzo e cena inclusi",
    },
    {
      id: "photo",
      name: "Pacchetto Foto",
      price: 20,
      description: "Tutte le foto delle attrazioni",
    },
  ];

  /**
   * AGGIORNAMENTO QUANTITÀ BIGLIETTI
   *
   * Gestisce l'incremento/decremento dei biglietti selezionati
   */
  const updateTicketQuantity = (ticketId: string, quantity: number) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketId]: Math.max(0, quantity), // Non permette quantità negative
    }));
  };

  /**
   * CALCOLO PREZZO TOTALE
   *
   * Somma il prezzo di tutti i biglietti selezionati
   */
  const getTotalPrice = () => {
    let total = 0;
    Object.entries(selectedTickets).forEach(([ticketId, quantity]) => {
      const ticket = ticketTypes.find((t) => t.id === ticketId);
      if (ticket) {
        total += ticket.price * quantity;
      }
    });
    return total;
  };

  /**
   * CALCOLO PREZZO FINALE CON SCONTO
   *
   * Calcola il prezzo finale applicando eventuali sconti
   */
  const getFinalPrice = () => {
    return Math.max(0, getTotalPrice() - discountAmount);
  };

  /**
   * CALCOLO NUMERO TOTALE BIGLIETTI
   *
   * Conta il numero totale di biglietti selezionati
   */
  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce(
      (sum, quantity) => sum + quantity,
      0
    );
  };

  /**
   * GENERATORE QR CODE SEMPLICE
   *
   * Genera un QR code univoco per ogni biglietto
   */
  const generateQRCode = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `EP-${timestamp}-${random}`.toUpperCase();
  };

  /**
   * GENERAZIONE MULTIPLA QR CODES
   *
   * Genera il numero richiesto di QR codes univoci
   */
  const generateMultipleQRCodes = (count: number) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(generateQRCode());
    }
    return codes;
  };

  /**
   * PROCESSAMENTO PAGAMENTO
   *
   * Gestisce l'intero flusso di pagamento tramite backend
   */
  const processPayment = async () => {
    setIsProcessing(true);

    // VALIDAZIONE DATI CLIENTE
    if (
      !customerInfo.name.trim() ||
      !customerInfo.email.trim() ||
      !customerInfo.phone.trim()
    ) {
      toast({
        title: "Errore",
        description: "Tutti i campi del cliente sono obbligatori",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    // VALIDAZIONE DATI PAGAMENTO
    if (
      !paymentData.cardNumber ||
      !paymentData.expiryDate ||
      !paymentData.cardholderName ||
      !paymentData.cvv
    ) {
      toast({
        title: "Errore",
        description: "Tutti i campi della carta sono obbligatori",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    // VALIDAZIONE DATA VISITA
    if (!selectedDate) {
      toast({
        title: "Errore",
        description: "Seleziona una data di visita",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    // VALIDAZIONE BIGLIETTI SELEZIONATI
    const totalTickets = getTotalTickets();
    if (totalTickets === 0) {
      toast({
        title: "Errore",
        description: "Seleziona almeno un biglietto",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    try {
      // Ottieni l'utente corrente
      const userResponse = await axios.get(
        "http://127.0.0.1:8000/api/auth/me",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );

      // Trasforma selectedTickets nel formato richiesto dal backend
      const ticketsArray = Object.entries(selectedTickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([ticketId, quantity]) => ({
          ticket_type: ticketId,
          quantity: quantity,
        }));

      // Prepara i dati dell'ordine con la struttura corretta
        const orderData = {
          user_id: userResponse.data.id,
          tickets: ticketsArray, // Ora è un array di oggetti come richiesto dal backend
          total_price: getFinalPrice(),
          visit_date: selectedDate, // Assicurati che sia in formato YYYY-MM-DD
          status: "confirmed",
          customer_info: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone || "",
          },
          payment_method: {
            type: "credit_card",
            last4: paymentData.cardNumber.slice(-4),
            cardholder_name: paymentData.cardholderName,
          },
          promo_code: appliedPromoCode || null,
          discount_amount: discountAmount || 0,
        };

      console.log("Sending order data:", orderData); // Debug log

      const response = await axios.post(
        "http://127.0.0.1:8000/api/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Verifica che la risposta sia valida
      if (response.data && response.data.order) {
        const newOrder = response.data.order;

        // Normalizza i dati del nuovo ordine
        const normalizedOrder = {
          ...newOrder,
          totalPrice: Number(newOrder.total_price || newOrder.totalPrice || 0),
          qrCodes: newOrder.ticketItems
            ? newOrder.ticketItems.map((ticket: any) => ticket.qr_code)
            : [],
          customerInfo: {
            name: newOrder.customer_info?.name || user.name,
            email: newOrder.customer_info?.email || user.email,
            phone: newOrder.customer_info?.phone || "",
          },
          visitDate: newOrder.visit_date || selectedDate,
          purchaseDate: newOrder.purchase_date || newOrder.created_at,
          status: newOrder.status || "confirmed",
        };

        setOrders((prev) => [...prev, normalizedOrder]);

        // RESET FORM
        setSelectedTickets({});
        setSelectedDate("");
        setPromoCode("");
        setDiscountAmount(0);
        setAppliedPromoCode("");
        setPaymentData({
          cardNumber: "",
          expiryDate: "",
          cvv: "",
          cardholderName: "",
        });
        setShowCheckout(false);

        // NOTIFICA SUCCESSO
        toast({
          title: "Pagamento completato!",
          description: `Ordine ${
            newOrder.order_number || newOrder.id || "creato"
          } con successo.`,
        });
      } else if (response.data && response.status === 201) {
        // Gestisci il caso in cui l'ordine è stato creato ma la struttura è diversa
        const newOrder = response.data;

        // Normalizza la struttura dell'ordine
        const normalizedOrder = {
          ...newOrder,
          totalPrice: Number(newOrder.totalPrice || newOrder.total_price || 0),
          qrCodes: newOrder.qrCodes || newOrder.qr_codes || [],
          customerInfo: newOrder.customerInfo || newOrder.customer_info || {},
          paymentMethod:
            newOrder.paymentMethod || newOrder.payment_method || {},
        };

        setOrders((prev) => [...prev, normalizedOrder]);

        // RESET FORM
        setSelectedTickets({});
        setSelectedDate("");
        setPromoCode("");
        setDiscountAmount(0);
        setAppliedPromoCode("");
        setPaymentData({
          cardNumber: "",
          expiryDate: "",
          cvv: "",
          cardholderName: "",
        });
        setShowCheckout(false);

        toast({
          title: "Pagamento completato!",
          description: `Ordine ${
            newOrder.order_number || newOrder.id || "creato"
          } con successo.`,
        });
      } else {
        // Gestisci il caso in cui la risposta non ha la struttura attesa
        console.warn("Risposta API inaspettata:", response.data);

        // Ricarica gli ordini per assicurarsi che l'ordine sia visibile
        if (user) {
          try {
            const ordersResponse = await axios.get(
              "http://127.0.0.1:8000/api/orders",
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "enjoypark-token"
                  )}`,
                },
              }
            );
            const normalizedOrders = ordersResponse.data.map((order: any) => ({
              ...order,
              totalPrice: Number(order.totalPrice || order.total_price || 0),
            }));
            setOrders(normalizedOrders);
          } catch (reloadError) {
            console.error("Errore nel ricaricamento ordini:", reloadError);
          }
        }

        // RESET FORM comunque
        setSelectedTickets({});
        setSelectedDate("");
        setPromoCode("");
        setDiscountAmount(0);
        setAppliedPromoCode("");
        setPaymentData({
          cardNumber: "",
          expiryDate: "",
          cvv: "",
          cardholderName: "",
        });
        setShowCheckout(false);

        toast({
          title: "Ordine creato",
          description: "L'ordine è stato processato con successo.",
        });
      }
    } catch (error: any) {
      console.error("Errore nel processamento pagamento:", error);

      // Gestione errori più dettagliata
      let errorMessage =
        "Si è verificato un errore durante il pagamento. Riprova più tardi.";

      if (error.response?.status === 422) {
        // Errori di validazione
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          errorMessage = Object.values(validationErrors).flat().join(", ");
        }
      } else if (error.response?.status === 500) {
        errorMessage = "Errore interno del server. Controlla i dati inseriti.";
        // Log dell'errore completo per debug
        console.log("Response data:", error.response?.data);
      }

      toast({
        title: "Errore nel pagamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * APPLICAZIONE CODICE PROMOZIONALE
   *
   * Verifica e applica sconti con codici promo tramite backend
   */
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        variant: "destructive",
        description: "Inserisci un codice promozionale",
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/tickets/validate-promo",
        {
          code: promoCode.toUpperCase(),
          order_amount: getTotalPrice()
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const discountData = response.data.data;
        setDiscountAmount(discountData.discount_amount);
        setAppliedPromoCode(discountData.code);
        
        toast({
          description: `Codice applicato! Sconto: €${discountData.discount_amount.toFixed(2)}`,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Il codice promozionale inserito non è valido";
      toast({
        variant: "destructive",
        description: errorMessage,
      });
    }
  };

  /**
   * DOWNLOAD PDF BIGLIETTI
   *
   * Simula il download del PDF con i biglietti
   */
  const downloadTicketPDF = (order: TicketOrder) => {
    // In un'app reale genererebbe e scaricherebbe un PDF
    toast({
      title: "Download avviato",
      description: "Il PDF dei biglietti verrà scaricato a breve.",
    });
  };

  /**
   * BADGE STATO ORDINE
   *
   * Restituisce il badge colorato per lo stato dell'ordine
   */
  const getOrderStatus = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confermato</Badge>;
      case "used":
        return <Badge className="bg-blue-500">Utilizzato</Badge>;
      case "expired":
        return <Badge variant="destructive">Scaduto</Badge>;
      default:
        return <Badge variant="outline">In attesa</Badge>;
    }
  };

  /**
   * MOSTRA QR CODES IN DIALOG
   *
   * Apre un dialog con tutti i QR codes dell'ordine
   */
  const showQRCodes = (order: TicketOrder) => {
    setSelectedOrderForQR(order);
  };

  /**
   * DOWNLOAD SINGOLO QR CODE
   *
   * Simula il download di un singolo QR code
   */
  const downloadSingleQR = (qrCode: string, orderInfo: string) => {
    toast({
      title: "Download QR Code",
      description: `QR Code ${qrCode} scaricato per ${orderInfo}`,
    });
  };

  // RENDER COMPONENTE
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* HEADER PAGINA */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href="/">← Torna alla Home</Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Biglietti
              </h1>
            </div>
            <Badge
              variant="outline"
              className="text-green-600 border-green-600 dark:text-green-400 dark:border-green-400"
            >
              Acquisto Sicuro
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TABS PRINCIPALI */}
        <Tabs defaultValue="purchase" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="purchase">Acquista Biglietti</TabsTrigger>
            <TabsTrigger value="mytickets">
              I Miei Biglietti ({orders.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB ACQUISTO BIGLIETTI */}
          <TabsContent value="purchase">
            {!showCheckout ? (
              // FASE 1: SELEZIONE BIGLIETTI
              <div className="grid lg:grid-cols-3 gap-8">
                {/* SELEZIONE BIGLIETTI E DATA */}
                <div className="lg:col-span-2 space-y-6">
                  {/* SELEZIONE DATA */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>Seleziona Data di Visita</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]} // Non permette date passate
                        className="max-w-xs"
                      />
                      {selectedDate && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          Data selezionata:{" "}
                          {new Date(selectedDate).toLocaleDateString("it-IT", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* TIPI DI BIGLIETTI */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Scegli i Tuoi Biglietti
                    </h2>
                    {ticketTypes.map((ticket) => (
                      <Card
                        key={ticket.id}
                        className={`relative ${
                          ticket.popular ? "ring-2 ring-blue-500" : ""
                        } dark:bg-gray-800 dark:border-gray-700`}
                      >
                        {/* BADGE POPOLARE */}
                        {ticket.popular && (
                          <div className="absolute -top-3 left-4">
                            <Badge className="bg-blue-500">
                              <Star className="w-3 h-3 mr-1" />
                              Più Popolare
                            </Badge>
                          </div>
                        )}

                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {ticket.name}
                              </CardTitle>
                              <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {ticket.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                €{ticket.price}
                              </div>
                              <div className="text-sm text-gray-500">
                                per persona
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="space-y-4">
                            {/* CARATTERISTICHE BIGLIETTO */}
                            <div className="grid md:grid-cols-2 gap-2">
                              {ticket.features.map((feature, index) => (
                                <div
                                  key={`feature-${index}-${ticket.id}`}
                                  className="flex items-center space-x-2 text-sm"
                                >
                                  <Check className="w-4 h-4 text-green-500" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>

                            {/* SELETTORE QUANTITÀ */}
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateTicketQuantity(
                                      ticket.id,
                                      (selectedTickets[ticket.id] || 0) - 1
                                    )
                                  }
                                  disabled={!selectedTickets[ticket.id]}
                                >
                                  -
                                </Button>
                                <span className="w-8 text-center font-medium">
                                  {selectedTickets[ticket.id] || 0}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateTicketQuantity(
                                      ticket.id,
                                      (selectedTickets[ticket.id] || 0) + 1
                                    )
                                  }
                                >
                                  +
                                </Button>
                              </div>

                              {/* PREZZO TOTALE PER TIPO */}
                              {selectedTickets[ticket.id] > 0 && (
                                <div className="text-right">
                                  <div className="font-bold text-lg">
                                    €{ticket.price * selectedTickets[ticket.id]}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {selectedTickets[ticket.id]} bigliett
                                    {selectedTickets[ticket.id] > 1 ? "i" : "o"}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* RIEPILOGO ORDINE */}
                <div className="space-y-6">
                  <Card className="sticky top-4 dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle>Riepilogo Ordine</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getTotalTickets() === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          Seleziona i biglietti per vedere il riepilogo
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {/* DETTAGLIO BIGLIETTI SELEZIONATI */}
                          {Object.entries(selectedTickets).map(
                            ([ticketId, quantity]) => {
                              if (quantity === 0) return null;
                              const ticket = ticketTypes.find(
                                (t) => t.id === ticketId
                              );
                              if (!ticket) return null;

                              return (
                                <div
                                  key={ticketId}
                                  className="flex justify-between items-center"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {ticket.name}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      Quantità: {quantity}
                                    </div>
                                  </div>
                                  <div className="font-bold">
                                    €{ticket.price * quantity}
                                  </div>
                                </div>
                              );
                            }
                          )}

                          {/* TOTALE */}
                          <div className="border-t pt-4 space-y-2">
                            {appliedPromoCode && (
                              <>
                                <div className="flex justify-between items-center text-sm">
                                  <span>Subtotale</span>
                                  <span>€{getTotalPrice()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-green-600">
                                  <span>Sconto ({appliedPromoCode})</span>
                                  <span>-€{discountAmount.toFixed(2)}</span>
                                </div>
                              </>
                            )}
                            <div className="flex justify-between items-center text-lg font-bold">
                              <span>Totale</span>
                              <span className="text-blue-600">
                                €{getFinalPrice()}
                              </span>
                            </div>
                          </div>

                          {/* CODICE PROMOZIONALE */}
                          <div className="space-y-2">
                            {!appliedPromoCode ? (
                              <>
                                <Input
                                  placeholder="Codice promozionale"
                                  value={promoCode}
                                  onChange={(e) => setPromoCode(e.target.value)}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => applyPromoCode()}
                                >
                                  Applica Codice
                                </Button>
                              </>
                            ) : (
                              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                    Codice {appliedPromoCode} applicato
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setAppliedPromoCode("");
                                      setDiscountAmount(0);
                                      setPromoCode("");
                                    }}
                                  >
                                    Rimuovi
                                  </Button>
                                </div>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                  Sconto: €{discountAmount.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* PULSANTE CHECKOUT */}
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={() => setShowCheckout(true)}
                            disabled={!selectedDate}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Procedi al Pagamento (€{getFinalPrice()})
                          </Button>

                          {!selectedDate && (
                            <p className="text-sm text-red-600 text-center">
                              Seleziona una data per continuare
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              // FASE 2: CHECKOUT E PAGAMENTO
              <div className="max-w-2xl mx-auto">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Completa il Pagamento</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* RIEPILOGO ORDINE */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Riepilogo Ordine</h3>
                      <div className="space-y-2 text-sm">
                        {Object.entries(selectedTickets).map(
                          ([ticketId, quantity]) => {
                            if (quantity === 0) return null;
                            const ticket = ticketTypes.find(
                              (t) => t.id === ticketId
                            );
                            if (!ticket) return null;

                            return (
                              <div
                                key={ticketId}
                                className="flex justify-between"
                              >
                                <span>
                                  {ticket.name} x{quantity}
                                </span>
                                <span>€{ticket.price * quantity}</span>
                              </div>
                            );
                          }
                        )}
                        {appliedPromoCode && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>Subtotale</span>
                              <span>€{getTotalPrice()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Sconto ({appliedPromoCode})</span>
                              <span>-€{discountAmount.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        <div className="border-t pt-2 font-bold flex justify-between">
                          <span>Totale</span>
                          <span>€{getFinalPrice()}</span>
                        </div>
                      </div>
                    </div>

                    {/* INFORMAZIONI CLIENTE */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Informazioni Cliente</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Nome *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Mario Rossi"
                              value={customerInfo.name}
                              onChange={(e) =>
                                setCustomerInfo({
                                  ...customerInfo,
                                  name: e.target.value,
                                })
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Email *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="mario@esempio.com"
                              value={customerInfo.email}
                              onChange={(e) =>
                                setCustomerInfo({
                                  ...customerInfo,
                                  email: e.target.value,
                                })
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Telefono (opzionale)
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="+39 123 456 7890"
                            value={customerInfo.phone}
                            onChange={(e) =>
                              setCustomerInfo({
                                ...customerInfo,
                                phone: e.target.value,
                              })
                            }
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    {/* FORM PAGAMENTO */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Informazioni Pagamento</h3>

                      {/* CAMPI CARTA DI CREDITO */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Numero Carta *
                        </label>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              cardNumber: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Scadenza *
                          </label>
                          <Input
                            placeholder="MM/AA"
                            value={paymentData.expiryDate}
                            onChange={(e) =>
                              setPaymentData({
                                ...paymentData,
                                expiryDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            CVV *
                          </label>
                          <Input
                            placeholder="123"
                            value={paymentData.cvv}
                            onChange={(e) =>
                              setPaymentData({
                                ...paymentData,
                                cvv: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Nome sulla carta *
                        </label>
                        <Input
                          placeholder="Mario Rossi"
                          value={paymentData.cardholderName}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              cardholderName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* PULSANTI AZIONE */}
                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowCheckout(false)}
                        className="flex-1"
                      >
                        Indietro
                      </Button>
                      <Button
                        onClick={processPayment}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Elaborazione...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Paga €{getFinalPrice()}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* TAB I MIEI BIGLIETTI */}
          <TabsContent value="mytickets">
            <div className="space-y-6">
              {orders.length === 0 ? (
                // STATO VUOTO - NESSUN BIGLIETTO
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="text-center py-12">
                    <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Nessun biglietto trovato
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Acquista i tuoi primi biglietti per iniziare!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                // LISTA ORDINI ESISTENTI
                orders.map((order) => (
                  <Card
                    key={order.id}
                    className="dark:bg-gray-800 dark:border-gray-700"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Ordine #{order.id}
                          </CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Acquistato il{" "}
                            {new Date(order.purchaseDate).toLocaleDateString(
                              "it-IT"
                            )}
                          </p>
                        </div>
                        {getOrderStatus(order.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* DETTAGLI BIGLIETTI */}
                        <div>
                          <h4 className="font-semibold mb-2">
                            Dettagli Biglietti
                          </h4>
                          <div className="space-y-2">
                            {/* ✅ CORRETTO: Usa ticketItems invece di tickets */}
                            {order.ticketItems &&
                            order.ticketItems.length > 0 ? (
                              order.ticketItems.map((ticketItem) => {
                                const ticket = ticketTypes.find(
                                  (t) => t.id === ticketItem.ticket_type
                                );
                                if (!ticket) return null;
                                return (
                                  <div
                                    key={ticketItem.id}
                                    className="flex justify-between text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded"
                                  >
                                    <span className="font-medium">
                                      {ticket.name}
                                    </span>
                                    <span className="font-bold">
                                      €{Number(ticketItem.price).toFixed(2)}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-sm text-gray-500">
                                Nessun biglietto trovato
                              </p>
                            )}
                            <div className="border-t pt-2 font-bold flex justify-between">
                              <span>Totale</span>
                              <span className="text-green-600 dark:text-green-400">
                                €{Number(order.totalPrice || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Data visita:</strong>{" "}
                              {order.visitDate &&
                              !isNaN(new Date(order.visitDate).getTime())
                                ? new Date(order.visitDate).toLocaleDateString(
                                    "it-IT"
                                  )
                                : "Data non disponibile"}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Cliente:</strong>{" "}
                              {order.customerInfo?.name ||
                                "Nome non disponibile"}
                            </p>
                          </div>
                        </div>

                        {/* BIGLIETTI INDIVIDUALI */}
                        <div>
                          <h4 className="font-semibold mb-3">
                            Biglietti ({order.ticketItems?.length || 0})
                          </h4>

                          {/* Lista biglietti individuali */}
                          <div className="space-y-3">
                            {order.ticketItems &&
                            order.ticketItems.length > 0 ? (
                              order.ticketItems.map(
                                (ticketItem: any, index: number) => (
                                  <div
                                    key={ticketItem.id || index}
                                    className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Ticket className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium">
                                          {ticketItem.ticket_type ||
                                            "Biglietto Standard"}{" "}
                                          #{index + 1}
                                        </span>
                                      </div>
                                      <span className="text-sm font-semibold text-green-600">
                                        €
                                        {Number(ticketItem.price || 45).toFixed(
                                          2
                                        )}
                                      </span>
                                    </div>

                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                      QR: {ticketItem.qr_code?.substring(0, 20)}
                                      ...
                                    </div>

                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          navigator.clipboard.writeText(
                                            ticketItem.qr_code
                                          );
                                          toast({ title: "QR Code copiato!" });
                                        }}
                                      >
                                        <Copy className="h-3 w-3 mr-1" />
                                        Copia QR
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedOrder(order);
                                          setShowQRDialog(true);
                                        }}
                                      >
                                        <Eye className="h-3 w-3 mr-1" />
                                        Dettagli
                                      </Button>
                                    </div>
                                  </div>
                                )
                              )
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                <Ticket className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>
                                  Nessun biglietto trovato per questo ordine
                                </p>
                                <p className="text-xs mt-1">
                                  I biglietti potrebbero essere in elaborazione
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* DIALOG QR CODES */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>QR Codes - Ordine {selectedOrder?.id}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Informazioni Ordine */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Dettagli Ordine</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Cliente:</strong>{" "}
                    {selectedOrder.customerInfo?.name || "N/A"}
                  </div>
                  <div>
                    <strong>Data visita:</strong>{" "}
                    {selectedOrder.visitDate
                      ? new Date(selectedOrder.visitDate).toLocaleDateString(
                          "it-IT"
                        )
                      : "N/A"}
                  </div>
                  <div>
                    <strong>Totale:</strong> €
                    {Number(selectedOrder.totalPrice || 0).toFixed(2)}
                  </div>
                  <div>
                    <strong>Stato:</strong> {selectedOrder.status}
                  </div>
                </div>
              </div>

              {/* QR Codes */}
              <div>
                <h3 className="font-semibold mb-4">QR Codes Biglietti</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedOrder.ticketItems?.map((ticket, index) => {
                    const ticketType = ticketTypes.find(
                      (t) => t.id === ticket.ticket_type
                    );
                    return (
                      <div
                        key={ticket.id || index}
                        className="border rounded-lg p-4 text-center"
                      >
                        <h4 className="font-medium mb-2">
                          {ticketType?.name || "Biglietto"}
                        </h4>

                        {/* QR Code come immagine */}
                        <div className="mb-4">
                          <QRCodeImage qrText={ticket.qr_code} />
                        </div>

                        {/* QR Code come testo */}
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs font-mono break-all mb-3">
                          {ticket.qr_code}
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <strong>Prezzo:</strong> €
                            {Number(ticket.price).toFixed(2)}
                          </div>
                          <div>
                            <strong>Stato:</strong> {ticket.status}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() =>
                            downloadSingleQR(
                              ticket.qr_code,
                              ticketType?.name || "Biglietto"
                            )
                          }
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Scarica QR
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * COMPONENTE QR CODE IMMAGINE
 *
 * Renderizza un QR code come immagine
 */
function QRCodeImage({ qrText }: { qrText: string }) {
  const [qrImage, setQrImage] = useState<string>("");

  useEffect(() => {
    const generateImage = async () => {
      try {
        const imageUrl = await QRCode.toDataURL(qrText, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrImage(imageUrl);
      } catch (error) {
        console.error("Errore generazione QR:", error);
      }
    };

    if (qrText) {
      generateImage();
    }
  }, [qrText]);

  return qrImage ? (
    <img
      src={qrImage}
      alt={`QR Code: ${qrText}`}
      className="mx-auto border rounded"
    />
  ) : (
    <div className="w-[200px] h-[200px] bg-gray-200 dark:bg-gray-700 mx-auto flex items-center justify-center rounded">
      <QrCode className="w-16 h-16 text-gray-400" />
    </div>
  );
}
