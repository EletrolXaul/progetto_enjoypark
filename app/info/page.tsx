"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin, Phone, Mail, AlertTriangle, Thermometer } from "lucide-react"

const services = [
  {
    title: "Primo Soccorso",
    description: "Assistenza medica di base disponibile 24/7.",
    details: ["Personale qualificato", "Attrezzature di emergenza", "Collegamento con 118"],
  },
  {
    title: "Oggetti Smarriti",
    description: "Centro raccolta per oggetti persi nel parco.",
    details: ["Aperto tutto il giorno", "Consegna gratuita", "Sistema di tracciamento"],
  },
  {
    title: "Informazioni",
    description: "Centro informazioni per visitatori.",
    details: ["Mappe gratuite", "Consigli personalizzati", "Assistenza multilingue"],
  },
  {
    title: "Accessibilità",
    description: "Servizi per persone con disabilità.",
    details: ["Sedie a rotelle", "Percorsi accessibili", "Assistenza dedicata"],
  },
]

const rules = [
  "È vietato introdurre cibo e bevande dall'esterno.",
  "Gli animali domestici non sono ammessi, eccetto cani guida.",
  "È obbligatorio seguire le indicazioni del personale di sicurezza.",
  "I bambini sotto i 12 anni devono essere sempre accompagnati da un adulto.",
  "È vietato fumare in tutto il parco, eccetto nelle aree designate.",
  "Non è consentito utilizzare droni o dispositivi volanti.",
]

const emergencyContacts = [
  {
    type: "Emergenza Generale",
    number: "112",
    description: "Numero unico di emergenza europeo",
  },
  {
    type: "Vigili del Fuoco",
    number: "115",
    description: "Interventi antincendio e soccorso",
  },
  {
    type: "Emergenza Sanitaria",
    number: "118",
    description: "Assistenza medica urgente",
  },
  {
    type: "Sicurezza Parco",
    number: "+39 06 1234567",
    description: "Sicurezza interna del parco",
  },
]

export default function InfoPage() {
  const [currentWeather] = useState({
    temperature: 22,
    condition: "Soleggiato",
    humidity: 65,
    wind: "10 km/h",
  })

  const [openingHours, setOpeningHours] = useState([
    { day: "Lunedì", hours: "Chiuso", status: "" },
    { day: "Martedì", hours: "10:00 - 18:00", status: "" },
    { day: "Mercoledì", hours: "10:00 - 18:00", status: "" },
    { day: "Giovedì", hours: "10:00 - 20:00", status: "" },
    { day: "Venerdì", hours: "10:00 - 22:00", status: "" },
    { day: "Sabato", hours: "10:00 - 22:00", status: "" },
    { day: "Domenica", hours: "10:00 - 18:00", status: "" },
  ])

  // Funzione per ottenere il giorno corrente e aggiornare gli orari
  useEffect(() => {
    const getCurrentDay = () => {
      const today = new Date()
      const dayIndex = today.getDay() // 0 = Domenica, 1 = Lunedì, etc.

      // Mappa l'indice del giorno JavaScript ai nomi italiani
      const dayNames = [
        "Domenica", // 0
        "Lunedì", // 1
        "Martedì", // 2
        "Mercoledì", // 3
        "Giovedì", // 4
        "Venerdì", // 5
        "Sabato", // 6
      ]

      return dayNames[dayIndex]
    }

    const currentDay = getCurrentDay()

    // Aggiorna gli orari con il giorno corrente evidenziato
    setOpeningHours((prev) =>
      prev.map((schedule) => ({
        ...schedule,
        status: schedule.day === currentDay ? "today" : "",
      })),
    )
  }, [])

  // Funzione per determinare se il parco è aperto ora
  const isParkOpen = () => {
    const now = new Date()
    const currentDay = now.getDay()
    const currentTime = now.getHours() * 100 + now.getMinutes() // Formato HHMM

    // Trova gli orari di oggi
    const todaySchedule = openingHours.find((schedule) => schedule.status === "today")

    if (!todaySchedule || todaySchedule.hours === "Chiuso") {
      return false
    }

    // Estrai gli orari di apertura e chiusura
    const hoursMatch = todaySchedule.hours.match(/(\d{2}):(\d{2}) - (\d{2}):(\d{2})/)
    if (!hoursMatch) return false

    const openTime = Number.parseInt(hoursMatch[1]) * 100 + Number.parseInt(hoursMatch[2])
    const closeTime = Number.parseInt(hoursMatch[3]) * 100 + Number.parseInt(hoursMatch[4])

    return currentTime >= openTime && currentTime <= closeTime
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex items-center space-x-4 mb-2 sm:mb-0">
              <Button asChild variant="ghost">
                <Link href="/">← Torna alla Home</Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Informazioni & Orari</h1>
            </div>
            <Badge
              variant="outline"
              className={
                isParkOpen()
                  ? "text-green-600 border-green-600 dark:text-green-400 dark:border-green-400"
                  : "text-red-600 border-red-600 dark:text-red-400 dark:border-red-400"
              }
            >
              {isParkOpen() ? "Parco Aperto" : "Parco Chiuso"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orari di Apertura */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Orari di Apertura</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {openingHours.map((schedule, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg transition-all ${
                      schedule.status === "today"
                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 shadow-sm"
                        : "bg-gray-50 dark:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-medium ${
                          schedule.status === "today"
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {schedule.day}
                      </span>
                      {schedule.status === "today" && (
                        <Badge
                          variant="outline"
                          className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                        >
                          Oggi
                        </Badge>
                      )}
                    </div>
                    <span
                      className={`font-mono ${
                        schedule.status === "today"
                          ? "text-blue-900 dark:text-blue-100 font-semibold"
                          : schedule.hours === "Chiuso"
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>

              {/* Informazioni aggiuntive sugli orari */}
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Nota:</strong> Gli orari possono variare durante le festività e eventi speciali. Controlla
                  sempre gli aggiornamenti prima della visita.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Servizi del Parco */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Servizi del Parco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{service.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{service.description}</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {service.details.map((detail, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Regole del Parco */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Regole del Parco</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 dark:text-red-400 text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{rule}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contatti e Informazioni */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Contatti e Informazioni</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Indirizzo</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 ml-6">
                  Via del Divertimento, 123
                  <br />
                  00100 Roma (RM), Italia
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Telefono</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 ml-6">+39 06 12345678</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Email</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 ml-6">info@enjoypark.it</p>
              </div>
            </CardContent>
          </Card>

          {/* Numeri di Emergenza */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Numeri di Emergenza</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {emergencyContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg"
                  >
                    <div className="font-semibold text-red-800 dark:text-red-200">{contact.type}</div>
                    <div className="font-mono text-lg text-red-900 dark:text-red-100">{contact.number}</div>
                    <div className="text-sm text-red-600 dark:text-red-300">{contact.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meteo */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Thermometer className="w-5 h-5" />
                <span>Condizioni Meteo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentWeather.temperature}°C
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-300 mb-4">{currentWeather.condition}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="text-gray-500">Umidità</div>
                    <div className="font-semibold">{currentWeather.humidity}%</div>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="text-gray-500">Vento</div>
                    <div className="font-semibold">{currentWeather.wind}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="h-12">
            <Link href="/map">
              <MapPin className="w-4 h-4 mr-2" />
              Mappa del Parco
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12">
            <Link href="/tickets">
              <Phone className="w-4 h-4 mr-2" />
              Acquista Biglietti
            </Link>
          </Button>
          <Button asChild className="h-12">
            <Link href="/planner">
              <Clock className="w-4 h-4 mr-2" />
              Pianifica Visita
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
