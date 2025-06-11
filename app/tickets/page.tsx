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
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";

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
// Aggiungere controllo autenticazione all'inizio del componente
export default function TicketsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // STATI PER PAGAMENTO
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  // Stato per QR code
  const [selectedOrderForQR, setSelectedOrderForQR] =
    useState<TicketOrder | null>(null);
    
  // Redirect se non autenticato
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

  // STATI PER SELEZIONE BIGLIETTI
  const [selectedTickets, setSelectedTickets] = useState<{
    [key: string]: number;
  }>({});
  const [selectedDate, setSelectedDate] = useState("");
  const [promoCode, setPromoCode] = useState("");

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



  /**
   * CARICAMENTO ORDINI DAL BACKEND
   *
   * Carica gli ordini dell'utente dal backend
   */
  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;

      try {
        // Verifica se il backend è raggiungibile prima di fare la richiesta
        const response = await axios.get("http://127.0.0.1:8000/api/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
          // Aggiungi un timeout per evitare attese troppo lunghe
          timeout: 5000,
        });

        // Correzione TypeScript: specifica il tipo per order
        const normalizedOrders = response.data.map((order: any) => ({
          ...order,
          totalPrice: Number(order.totalPrice || (order as any).total_price || 0),
        }));
        setOrders(normalizedOrders);
      } catch (error) {
        console.error("Errore nel caricamento ordini:", error);
        // Usa dati di fallback per lo sviluppo
        if (process.env.NODE_ENV === "development") {
          setOrders([
            // Dati di esempio per lo sviluppo
            {
              id: "ORD-123456",
              userId: user.id,
              tickets: { standard: 2, premium: 1 },
              totalPrice: 155,
              purchaseDate: new Date().toISOString(),
              visitDate: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ).toISOString(),
              status: "confirmed",
              qrCodes: ["EP-123456-ABC", "EP-123457-DEF", "EP-123458-GHI"],
              customerInfo: {
                name: user.name,
                email: user.email,
                phone: "",
              },
              paymentMethod: {
                last4: "1234",
                type: "Visa",
              },
            },
          ]);
        }

        toast({
          title: "Errore",
          description:
            "Impossibile caricare gli ordini. Il backend potrebbe non essere disponibile.",
          variant: "destructive",
        });
      }
    };

    loadOrders();
  }, [user, toast]);

  /**
   * AGGIORNAMENTO DATI CLIENTE
   *
   * Aggiorna automaticamente i dati quando l'utente cambia
   */
  useEffect(() => {
    if (user) {
      setCustomerInfo({
        name: user.name,
        email: user.email,
        phone: "",
      });
    }
  }, [user]);

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
      id: "premium",
      name: "Biglietto Premium",
      price: 65,
      description: "Accesso prioritario e vantaggi esclusivi",
      features: [
        "Accesso prioritario alle attrazioni",
        "Parcheggio gratuito",
        "Sconto 10% nei ristoranti",
        "Foto ricordo gratuita",
      ],
      popular: true, // Evidenziato come più popolare
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
      popular: false,
    },
    {
      id: "season",
      name: "Abbonamento Stagionale",
      price: 120,
      description: "Accesso illimitato per tutta la stagione",
      features: [
        "Accesso illimitato",
        "Parcheggio sempre gratuito",
        "Sconti esclusivi",
        "Eventi speciali",
      ],
      popular: false,
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
    {
      id: "parking",
      name: "Parcheggio Premium",
      price: 10,
      description: "Parcheggio vicino all'ingresso",
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
    if (!customerInfo.name || !customerInfo.email) {
      toast({
        title: "Errore",
        description: "Nome e email sono obbligatori",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    // VALIDAZIONE DATI PAGAMENTO
    if (
      !paymentData.cardNumber ||
      !paymentData.expiryDate ||
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

    try {
      const orderData = {
        tickets: selectedTickets,
        totalPrice: getTotalPrice(),
        visitDate: selectedDate,
        customerInfo,
        paymentData,
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/tickets/purchase",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newOrder = response.data;
      setOrders((prev) => [...prev, newOrder]);

      // RESET FORM
      setSelectedTickets({});
      setSelectedDate("");
      setPromoCode("");
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
        description: `Ordine ${newOrder.id} creato con successo.`,
      });
    } catch (error) {
      console.error("Errore nel processamento pagamento:", error);
      toast({
        title: "Errore nel pagamento",
        description:
          "Si è verificato un errore durante il pagamento. Riprova più tardi.",
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
        title: "Errore",
        description: "Inserisci un codice promozionale",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/tickets/validate-promo",
        {
          code: promoCode.toUpperCase(),
          totalAmount: getTotalPrice(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "Codice applicato!",
        description: response.data.message,
      });
    } catch (error: any) {
      toast({
        title: "Codice non valido",
        description:
          error.response?.data?.message ||
          "Il codice promozionale inserito non è valido",
        variant: "destructive",
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
                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center text-lg font-bold">
                              <span>Totale</span>
                              <span className="text-blue-600">
                                €{getTotalPrice()}
                              </span>
                            </div>
                          </div>

                          {/* CODICE PROMOZIONALE */}
                          <div className="space-y-2">
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
                          </div>

                          {/* PULSANTE CHECKOUT */}
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={() => setShowCheckout(true)}
                            disabled={!selectedDate}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Procedi al Pagamento
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
                        <div className="border-t pt-2 font-bold flex justify-between">
                          <span>Totale</span>
                          <span>€{getTotalPrice()}</span>
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
                            Paga €{getTotalPrice()}
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
                            {Object.entries(order.tickets).map(
                              ([ticketId, quantity]) => {
                                const ticket = ticketTypes.find(
                                  (t) => t.id === ticketId
                                );
                                if (!ticket || quantity <= 0) return null;
                                return (
                                  <div
                                    key={ticketId}
                                    className="flex justify-between text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded"
                                  >
                                    <span className="font-medium">
                                      {ticket.name} x{quantity}
                                    </span>
                                    <span>
                                      €{(ticket.price * quantity).toFixed(2)}
                                    </span>
                                  </div>
                                );
                              }
                            )}
                            <div className="border-t pt-2 font-bold flex justify-between">
                              <span>Totale</span>
                              <span className="text-green-600 dark:text-green-400">
                                €{(Number(order.totalPrice || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Data visita:</strong>{" "}
                              {new Date(order.visitDate).toLocaleDateString(
                                "it-IT"
                              )}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Cliente:</strong>{" "}
                              {order.customerInfo?.name || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* QR CODES E AZIONI */}
                        <div>
                          <h4 className="font-semibold mb-2">
                            QR Codes ({order.qrCodes?.length || 0})
                          </h4>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {order.qrCodes?.slice(0, 4).map((qrCode, index) => (
                              <div
                                key={`qr-${qrCode.substring(0, 8)}`}
                                className="bg-white p-2 rounded border text-center"
                              >
                                <QrCode className="w-8 h-8 mx-auto mb-1 text-gray-600" />
                                <div className="text-xs font-mono">
                                  {qrCode}
                                </div>
                              </div>
                            ))}
                            {order.qrCodes?.length > 4 && (
                              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded border text-center flex items-center justify-center">
                                <span className="text-sm">
                                  +{order.qrCodes.length - 4} altri
                                </span>
                              </div>
                            )}
                          </div>

                          {/* AZIONI ORDINE */}
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => downloadTicketPDF(order)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Scarica PDF
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => showQRCodes(order)}
                                >
                                  <QrCode className="w-4 h-4 mr-2" />
                                  Mostra QR Codes
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center space-x-2">
                                    <QrCode className="w-5 h-5" />
                                    <span>QR Codes - Ordine #{order.id}</span>
                                  </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4">
                                  {/* Informazioni ordine */}
                                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <strong>Cliente:</strong>{" "}
                                        {order.customerInfo?.name || "N/A"}
                                      </div>
                                      <div>
                                        <strong>Data visita:</strong>{" "}
                                        {order.visitDate
                                          ? new Date(
                                              order.visitDate
                                            ).toLocaleDateString("it-IT")
                                          : "N/A"}
                                      </div>
                                      <div>
                                        <strong>Totale biglietti:</strong>{" "}
                                        {order.qrCodes?.length || 0}
                                      </div>
                                      <div>
                                        <strong>Stato:</strong>{" "}
                                        {getOrderStatus(
                                          order.status || "pending"
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Griglia QR Codes */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {order.qrCodes?.length > 0 ? (
                                      order.qrCodes?.map((qrCode, index) => (
                                        <Card
                                          key={`qr-full-${qrCode.substring(
                                            0,
                                            8
                                          )}`}
                                          className="p-4 text-center"
                                        >
                                          <div className="bg-white p-4 rounded-lg mb-3 border">
                                            {/* Simulazione QR Code visuale */}
                                            <div className="w-32 h-32 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                                              <div className="text-center">
                                                <QrCode className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                                                <div className="text-xs font-mono break-all">
                                                  {qrCode}
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="space-y-2">
                                            <div className="text-sm font-medium">
                                              Biglietto #{index + 1}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono">
                                              {qrCode}
                                            </div>

                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="w-full"
                                              onClick={() =>
                                                downloadSingleQR(
                                                  qrCode,
                                                  `${
                                                    order.customerInfo.name
                                                  } - Biglietto ${index + 1}`
                                                )
                                              }
                                            >
                                              <Download className="w-3 h-3 mr-1" />
                                              Scarica
                                            </Button>
                                          </div>
                                        </Card>
                                      ))
                                    ) : (
                                      <div className="col-span-3 text-center p-4">
                                        <p>Nessun QR code disponibile</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Azioni generali */}
                                  <div className="flex space-x-4 pt-4 border-t">
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => downloadTicketPDF(order)}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Scarica Tutti i QR (PDF)
                                    </Button>

                                    <Button
                                      className="flex-1"
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          order.qrCodes.join("\n")
                                        );
                                        toast({
                                          title: "Copiato!",
                                          description:
                                            "Tutti i QR codes sono stati copiati negli appunti",
                                        });
                                      }}
                                    >
                                      📋 Copia Tutti i Codici
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
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
    </div>
  );
}
