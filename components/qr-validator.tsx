"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, CheckCircle, XCircle, Scan, User, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

/**
 * INTERFACCIA RISULTATO VALIDAZIONE
 *
 * Definisce la struttura del risultato della validazione QR
 */
interface TicketValidation {
  isValid: boolean // Se il biglietto è valido
  ticketInfo?: {
    orderId: string // ID dell'ordine
    customerName: string // Nome cliente
    visitDate: string // Data visita
    ticketType: string // Tipo biglietto
    status: "valid" | "used" | "expired" | "invalid" // Stato biglietto
  }
  message: string // Messaggio di risposta
}

/**
 * COMPONENTE VALIDATORE QR CODE
 *
 * Permette di validare i QR codes dei biglietti per controllare
 * l'accesso al parco. Simula la scansione e verifica lo stato
 * del biglietto (valido, utilizzato, scaduto, ecc.)
 */
export function QRValidator() {
  const { toast } = useToast()

  // STATI COMPONENTE
  const [qrCode, setQrCode] = useState("") // QR code inserito
  const [validation, setValidation] = useState<TicketValidation | null>(null) // Risultato validazione
  const [isScanning, setIsScanning] = useState(false) // Stato scansione in corso

  /**
   * FUNZIONE VALIDAZIONE QR CODE
   *
   * Simula la validazione di un QR code:
   * 1. Cerca l'ordine corrispondente nel localStorage
   * 2. Verifica se il biglietto è scaduto
   * 3. Simula controllo se già utilizzato
   * 4. Restituisce il risultato della validazione
   */
  const validateQRCode = async (code: string) => {
    setIsScanning(true)

    // SIMULA TEMPO DI ELABORAZIONE
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // CARICA ORDINI DAL LOCALSTORAGE
    const savedOrders = localStorage.getItem("enjoypark-orders")
    const orders = savedOrders ? JSON.parse(savedOrders) : []

    // CERCA ORDINE CON QR CODE CORRISPONDENTE
    const matchingOrder = orders.find((order: any) => order.qrCodes.includes(code))

    if (!matchingOrder) {
      // QR CODE NON TROVATO
      setValidation({
        isValid: false,
        message: "QR Code non valido o non trovato",
      })
      setIsScanning(false)
      return
    }

    // CONTROLLI VALIDITÀ BIGLIETTO
    const visitDate = new Date(matchingOrder.visitDate)
    const today = new Date()
    const isExpired = visitDate < today // Verifica se scaduto

    // SIMULA CONTROLLO SE GIÀ UTILIZZATO (10% probabilità)
    const isUsed = Math.random() < 0.1

    // DETERMINA STATO E MESSAGGIO
    let status: "valid" | "used" | "expired" | "invalid" = "valid"
    let message = "Biglietto valido - Accesso consentito"

    if (isExpired) {
      status = "expired"
      message = "Biglietto scaduto"
    } else if (isUsed) {
      status = "used"
      message = "Biglietto già utilizzato"
    }

    // MAPPA TIPI BIGLIETTO
    const ticketTypes = [
      { id: "standard", name: "Standard" },
      { id: "premium", name: "Premium" },
      { id: "family", name: "Famiglia" },
      { id: "season", name: "Stagionale" },
    ]

    // TROVA TIPO BIGLIETTO
    const firstTicketType = Object.keys(matchingOrder.tickets)[0]
    const ticketType = ticketTypes.find((t) => t.id === firstTicketType)?.name || "Sconosciuto"

    // IMPOSTA RISULTATO VALIDAZIONE
    setValidation({
      isValid: status === "valid",
      ticketInfo: {
        orderId: matchingOrder.id,
        customerName: matchingOrder.customerInfo.name,
        visitDate: matchingOrder.visitDate,
        ticketType,
        status,
      },
      message,
    })

    setIsScanning(false)

    // MOSTRA NOTIFICA TOAST
    if (status === "valid") {
      toast({
        title: "Accesso consentito",
        description: `Benvenuto ${matchingOrder.customerInfo.name}!`,
      })
    } else {
      toast({
        title: "Accesso negato",
        description: message,
        variant: "destructive",
      })
    }
  }

  /**
   * GESTIONE SCANSIONE
   *
   * Valida l'input e avvia la scansione del QR code
   */
  const handleScan = () => {
    if (!qrCode.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un codice QR valido",
        variant: "destructive",
      })
      return
    }

    validateQRCode(qrCode.trim())
  }

  /**
   * RESET VALIDAZIONE
   *
   * Resetta lo stato per una nuova scansione
   */
  const resetValidation = () => {
    setValidation(null)
    setQrCode("")
  }

  // Aggiungiamo una funzione per aggiornare lo stato del ticket
  const updateTicketStatus = async (qrCode: string, newStatus: string) => {
    setIsScanning(true);
    
    // Simuliamo una chiamata API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Carica ordini dal localStorage
    const savedOrders = localStorage.getItem("enjoypark-orders");
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    
    // Cerca ordine con QR code corrispondente
    const matchingOrder = orders.find((order: any) => order.qrCodes.includes(qrCode));
    
    if (!matchingOrder) {
      toast({
        title: "Errore",
        description: "QR Code non trovato",
        variant: "destructive",
      });
      setIsScanning(false);
      return;
    }
    
    // In un'app reale, qui faremmo una chiamata API al backend
    toast({
      title: "Stato aggiornato",
      description: `Ticket aggiornato a: ${newStatus}`,
    });
    
    // Aggiorniamo lo stato locale
    if (validation && validation.ticketInfo) {
      setValidation({
        ...validation,
        ticketInfo: {
          ...validation.ticketInfo,
          status: newStatus as "valid" | "used" | "expired" | "invalid",
        },
        isValid: newStatus === "valid",
        message: newStatus === "valid" ? "Biglietto valido - Accesso consentito" : `Biglietto ${newStatus}`,
      });
    }
    
    setIsScanning(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-6 h-6" />
            <span>Validatore QR Code - Ingresso Parco</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!validation ? (
            // FASE 1: INPUT QR CODE
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Scansiona o inserisci QR Code</label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="EP-1234567890-ABCDEF"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                      className="font-mono" // Font monospace per codici
                    />
                    <Button onClick={handleScan} disabled={isScanning}>
                      {isScanning ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Scan className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* AREA SCANSIONE VISUALE */}
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 mx-auto rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Posiziona il QR code davanti alla fotocamera o inserisci il codice manualmente
                  </p>
                </div>
              </div>
            </>
          ) : (
            // FASE 2: RISULTATO VALIDAZIONE
            <div className="space-y-4">
              {/* ALERT RISULTATO */}
              <Alert
                className={
                  validation.isValid
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-red-500 bg-red-50 dark:bg-red-950"
                }
              >
                <div className="flex items-center space-x-2">
                  {validation.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <AlertDescription
                    className={
                      validation.isValid ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                    }
                  >
                    {validation.message}
                  </AlertDescription>
                </div>
              </Alert>

              {/* DETTAGLI BIGLIETTO */}
              {validation.ticketInfo && (
                <Card className="bg-gray-50 dark:bg-gray-700">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {/* STATO BIGLIETTO */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Stato:</span>
                        <Badge
                          className={
                            validation.ticketInfo.status === "valid"
                              ? "bg-green-500"
                              : validation.ticketInfo.status === "used"
                                ? "bg-blue-500"
                                : "bg-red-500"
                          }
                        >
                          {validation.ticketInfo.status === "valid" && "Valido"}
                          {validation.ticketInfo.status === "used" && "Utilizzato"}
                          {validation.ticketInfo.status === "expired" && "Scaduto"}
                          {validation.ticketInfo.status === "invalid" && "Non valido"}
                        </Badge>
                      </div>

                      {/* INFORMAZIONI CLIENTE */}
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <strong>Cliente:</strong> {validation.ticketInfo.customerName}
                        </span>
                      </div>

                      {/* DATA VISITA */}
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <strong>Data visita:</strong>{" "}
                          {new Date(validation.ticketInfo.visitDate).toLocaleDateString("it-IT")}
                        </span>
                      </div>

                      {/* TIPO BIGLIETTO */}
                      <div className="flex items-center space-x-2">
                        <QrCode className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <strong>Tipo:</strong> {validation.ticketInfo.ticketType}
                        </span>
                      </div>

                      {/* ID ORDINE */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          <strong>Ordine:</strong> {validation.ticketInfo.orderId}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AZIONI */}
              <div className="flex space-x-4">
                <Button onClick={resetValidation} variant="outline" className="flex-1">
                  Scansiona Altro
                </Button>
                {validation.isValid && (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Conferma Ingresso
                  </Button>
                )}
              </div>
              
              {/* Aggiungiamo controlli admin nella sezione risultato validazione */}
              {validation && validation.ticketInfo && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Azioni amministratore:</h3>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant={validation.ticketInfo.status === "valid" ? "default" : "outline"}
                      onClick={() => updateTicketStatus(qrCode, "valid")}
                      disabled={isScanning}
                    >
                      Valida
                    </Button>
                    <Button 
                      size="sm" 
                      variant={validation.ticketInfo.status === "used" ? "default" : "outline"}
                      onClick={() => updateTicketStatus(qrCode, "used")}
                      disabled={isScanning}
                    >
                      Segna come usato
                    </Button>
                    <Button 
                      size="sm" 
                      variant={validation.ticketInfo.status === "expired" ? "default" : "outline"}
                      onClick={() => updateTicketStatus(qrCode, "expired")}
                      disabled={isScanning}
                    >
                      Segna come scaduto
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}