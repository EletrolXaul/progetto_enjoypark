"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, CheckCircle, XCircle, Scan, User, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QRCode from 'qrcode'
// Aggiungi in cima al file
import { API_BASE_URL } from '../lib/config';

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
 * COMPONENTE PER VISUALIZZARE QR CODE
 */
function QRCodeDisplay({ qrText }: { qrText: string }) {
  const [qrImage, setQrImage] = useState<string>('')
  
  useEffect(() => {
    const generateImage = async () => {
      try {
        const imageUrl = await QRCode.toDataURL(qrText, {
          width: window.innerWidth < 640 ? 120 : 150, // Dimensione adattiva
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrImage(imageUrl)
      } catch (error) {
        console.error('Errore generazione QR:', error)
      }
    }
    
    if (qrText) {
      generateImage()
    }
  }, [qrText])
  
  return (
    <div className="text-center mt-4 px-4">
      <h4 className="text-sm font-medium mb-3">QR Code per validazione:</h4>
      <div className="flex justify-center mb-3">
        {qrImage ? (
          <img 
            src={qrImage} 
            alt={`QR Code: ${qrText}`}
            className="border rounded shadow-sm w-28 h-28 sm:w-36 sm:h-36 md:w-[150px] md:h-[150px]"
          />
        ) : (
          <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-[150px] md:h-[150px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
            <QrCode className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 font-mono break-all px-2 leading-relaxed">{qrText}</p>
    </div>
  )
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

  /**
   * FUNZIONE VALIDAZIONE QR CODE
   *
   * Valida un QR code interrogando il backend invece del localStorage
   */
  const validateQRCode = async (code: string) => {
    setIsScanning(true);

    // Debug: stampa l'URL che stai chiamando
    console.log('Chiamando API:', 'https://backend-progetto-enjoypark.onrender.com/api/tickets/validate');
    console.log('API_BASE_URL:', API_BASE_URL);

    try {
      const response = await axios.post(
        `https://backend-progetto-enjoypark.onrender.com/api/tickets/validate`,  // URL funzionante
        { qr_code: code },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const ticketData = response.data;

      if (ticketData.success) {
        setValidation({
          isValid: ticketData.ticket.status === "valid",
          ticketInfo: {
            orderId: ticketData.ticket.order_number,
            customerName: ticketData.order?.customerInfo?.name || ticketData.order?.customer_info?.name || "N/A",
            visitDate: ticketData.ticket.visit_date,
            ticketType: ticketData.ticket.ticket_type,
            status: ticketData.ticket.status as "valid" | "used" | "expired" | "invalid",
          },
          message: ticketData.message,
        });

        // MOSTRA NOTIFICA TOAST
        if (ticketData.ticket.status === "valid") {
          toast({
            title: "Accesso consentito",
            description: `Benvenuto ${ticketData.order?.customerInfo?.name || ticketData.order?.customer_info?.name || "Cliente"}!`,
          });
        } else {
          toast({
            title: "Accesso negato",
            description: ticketData.message,
            variant: "destructive",
          });
        }
      } else {
        setValidation({
          isValid: false,
          message: ticketData.message || "QR Code non valido",
        });
      }
    } catch (error: any) {
      console.error("Errore validazione QR:", error);
      
      // Gestione migliorata degli errori
      let errorMessage = "QR Code non valido o non trovato";
      
      if (error.response) {
        // Il server ha risposto con un codice di errore
        switch (error.response.status) {
          case 405:
            errorMessage = "Metodo non supportato dal server";
            break;
          case 401:
            errorMessage = "Non autorizzato - effettua il login";
            break;
          case 404:
            errorMessage = "Endpoint API non trovato";
            break;
          case 500:
            errorMessage = "Errore interno del server";
            break;
          default:
            errorMessage = error.response?.data?.message || "Errore di comunicazione con il server";
        }
      } else if (error.request) {
        // La richiesta è stata fatta ma non c'è stata risposta
        errorMessage = "Impossibile contattare il server";
      }
      
      setValidation({
        isValid: false,
        message: errorMessage,
      });
      
      toast({
        title: "Errore di validazione",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Aggiorna anche la funzione updateTicketStatus per usare il backend
  const updateTicketStatus = async (qrCode: string, newStatus: string) => {
    setIsScanning(true);
    
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/tickets/update-status`,
        { 
          qr_code: qrCode, 
          status: newStatus 
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Stato aggiornato",
          description: `Ticket aggiornato a: ${newStatus}`,
        });

        // Aggiorna lo stato locale
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
      }
    } catch (error: any) {
      console.error("Errore aggiornamento stato:", error);
      toast({
        title: "Errore",
        description: error.response?.data?.message || "Impossibile aggiornare lo stato",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-6">
      <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg md:text-xl">
            <QrCode className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <span className="text-sm sm:text-base leading-tight">Validatore QR Code - Ingresso Parco</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {!validation ? (
            // FASE 1: INPUT QR CODE
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Scansiona o inserisci QR Code</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="EP-1234567890-ABCDEF"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                      className="font-mono text-sm flex-1"
                    />
                    <Button 
                      onClick={handleScan} 
                      disabled={isScanning} 
                      className="w-full sm:w-auto sm:px-6"
                    >
                      {isScanning ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Scan className="w-4 h-4 sm:mr-2" />
                          <span className="sm:inline hidden">Scansiona</span>
                          <span className="sm:hidden">Scansiona</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* AREA SCANSIONE VISUALE */}
                <div className="text-center py-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 dark:bg-gray-700 mx-auto rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="w-10 h-10 sm:w-16 sm:h-16 text-gray-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-4 leading-relaxed">
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
                <div className="flex items-start space-x-2">
                  {validation.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <AlertDescription
                    className={
                      validation.isValid ? "text-green-800 dark:text-green-200 text-sm" : "text-red-800 dark:text-red-200 text-sm"
                    }
                  >
                    {validation.message}
                  </AlertDescription>
                </div>
              </Alert>

              {/* VISUALIZZAZIONE QR CODE */}
              <QRCodeDisplay qrText={qrCode} />

              {/* DETTAGLI BIGLIETTO */}
              {validation.ticketInfo && (
                <Card className="bg-gray-50 dark:bg-gray-700">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {/* STATO BIGLIETTO */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
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

                      {/* INFORMAZIONI CLIENTE - VERSIONE MIGLIORATA */}
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                          <span className="text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-200 break-words">
                            {validation.ticketInfo.customerName}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300">Titolare del biglietto</p>
                      </div>

                      {/* DATA VISITA */}
                      <div className="flex items-start space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm break-words">
                          <strong>Data visita:</strong>{" "}
                          {validation.ticketInfo.visitDate && !isNaN(new Date(validation.ticketInfo.visitDate).getTime()) 
                            ? new Date(validation.ticketInfo.visitDate).toLocaleDateString("it-IT")
                            : "Data non disponibile"
                          }
                        </span>
                      </div>

                      {/* TIPO BIGLIETTO */}
                      <div className="flex items-start space-x-2">
                        <QrCode className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm break-words">
                          <strong>Tipo:</strong> {validation.ticketInfo.ticketType}
                        </span>
                      </div>

                      {/* ID ORDINE */}
                      <div className="flex items-start space-x-2">
                        <span className="text-sm break-words">
                          <strong>Ordine:</strong> {validation.ticketInfo.orderId}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AZIONI */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
              
              {/* CONTROLLI AMMINISTRATORE */}
              {validation && validation.ticketInfo && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Azioni amministratore:</h3>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button 
                      size="sm" 
                      variant={validation.ticketInfo.status === "valid" ? "default" : "outline"}
                      onClick={() => updateTicketStatus(qrCode, "valid")}
                      disabled={isScanning}
                      className="w-full sm:w-auto"
                    >
                      Valida
                    </Button>
                    <Button 
                      size="sm" 
                      variant={validation.ticketInfo.status === "used" ? "default" : "outline"}
                      onClick={() => updateTicketStatus(qrCode, "used")}
                      disabled={isScanning}
                      className="w-full sm:w-auto"
                    >
                      Segna come usato
                    </Button>
                    <Button 
                      size="sm" 
                      variant={validation.ticketInfo.status === "expired" ? "default" : "outline"}
                      onClick={() => updateTicketStatus(qrCode, "expired")}
                      disabled={isScanning}
                      className="w-full sm:w-auto"
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