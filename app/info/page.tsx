"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Phone, Mail, Car, Utensils, ShoppingBag, Heart, Wifi, Camera, Baby } from "lucide-react"
import Link from "next/link"

export default function InfoPage() {
  const openingHours = [
    { day: "Lunedì", hours: "10:00 - 18:00", status: "open" },
    { day: "Martedì", hours: "10:00 - 18:00", status: "open" },
    { day: "Mercoledì", hours: "10:00 - 18:00", status: "open" },
    { day: "Giovedì", hours: "10:00 - 20:00", status: "open" },
    { day: "Venerdì", hours: "10:00 - 22:00", status: "open" },
    { day: "Sabato", hours: "09:00 - 22:00", status: "open" },
    { day: "Domenica", hours: "09:00 - 20:00", status: "today" },
  ]

  const services = [
    {
      icon: Car,
      title: "Parcheggio",
      description: "Parcheggio gratuito per 2000 auto",
      details: ["Parcheggio coperto disponibile", "Stazioni di ricarica elettrica", "Area camper dedicata"],
    },
    {
      icon: Utensils,
      title: "Ristoranti",
      description: "15 punti ristoro nel parco",
      details: ["Cucina italiana e internazionale", "Opzioni vegetariane e vegane", "Menu bambini disponibili"],
    },
    {
      icon: ShoppingBag,
      title: "Negozi",
      description: "8 negozi di souvenir e gadget",
      details: ["Merchandising ufficiale", "Giocattoli e peluche", "Abbigliamento tematico"],
    },
    {
      icon: Heart,
      title: "Primo Soccorso",
      description: "Assistenza medica 24/7",
      details: ["Infermeria centrale", "Personale qualificato", "Defibrillatori automatici"],
    },
    {
      icon: Wifi,
      title: "WiFi Gratuito",
      description: "Connessione internet in tutto il parco",
      details: ['Rete "EnjoyPark-Free"', "Velocità fino a 100 Mbps", "Accesso illimitato"],
    },
    {
      icon: Baby,
      title: "Servizi Famiglia",
      description: "Tutto per le famiglie con bambini",
      details: ["Fasciatoi in tutti i bagni", "Area allattamento", "Noleggio passeggini"],
    },
  ]

  const emergencyContacts = [
    { type: "Emergenze", number: "112", description: "Numero unico emergenze" },
    { type: "Primo Soccorso Parco", number: "+39 02 1234 5678", description: "Assistenza medica interna" },
    { type: "Sicurezza Parco", number: "+39 02 1234 5679", description: "Sicurezza e oggetti smarriti" },
    { type: "Informazioni", number: "+39 02 1234 5680", description: "Informazioni generali" },
  ]

  const rules = [
    "È vietato introdurre cibo e bevande dall'esterno",
    "Gli animali domestici non sono ammessi (eccetto cani guida)",
    "È obbligatorio rispettare le indicazioni di altezza minima per le attrazioni",
    "È vietato fumare all'interno del parco",
    "Le riprese video commerciali richiedono autorizzazione",
    "È vietato introdurre oggetti pericolosi o armi",
    "I bambini sotto i 12 anni devono essere sempre accompagnati",
    "È obbligatorio indossare la mascherina sui mezzi di trasporto interni",
  ]

  const getCurrentStatus = () => {
    const now = new Date()
    const currentHour = now.getHours()

    if (currentHour >= 9 && currentHour < 22) {
      return { status: "open", message: "Parco Aperto" }
    } else {
      return { status: "closed", message: "Parco Chiuso" }
    }
  }

  const parkStatus = getCurrentStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href="/">← Torna alla Home</Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Informazioni & Orari</h1>
            </div>
            <Badge
              variant="outline"
              className={
                parkStatus.status === "open" ? "text-green-600 border-green-600" : "text-red-600 border-red-600"
              }
            >
              {parkStatus.message}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Opening Hours */}
            <Card>
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
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        schedule.status === "today" ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${schedule.status === "today" ? "text-blue-900" : ""}`}>
                          {schedule.day}
                        </span>
                        {schedule.status === "today" && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Oggi
                          </Badge>
                        )}
                      </div>
                      <span
                        className={`font-mono ${schedule.status === "today" ? "text-blue-900 font-semibold" : "text-gray-600"}`}
                      >
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Note Importanti:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Gli orari possono variare durante le festività</li>
                    <li>• Ultima entrata 1 ora prima della chiusura</li>
                    <li>• Orari estesi durante i weekend estivi</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Servizi del Parco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {services.map((service, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <service.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{service.title}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1 ml-13">
                        {service.details.map((detail, detailIndex) => (
                          <li key={detailIndex}>• {detail}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rules and Regulations */}
            <Card>
              <CardHeader>
                <CardTitle>Regolamento del Parco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rules.map((rule, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700">{rule}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contatti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">Indirizzo</div>
                    <div className="text-sm text-gray-600">
                      Via del Divertimento 123
                      <br />
                      20100 Milano, Italia
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">Telefono</div>
                    <div className="text-sm text-gray-600">+39 02 1234 5680</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-gray-600">info@enjoypark.it</div>
                  </div>
                </div>

                <Button asChild className="w-full mt-4">
                  <Link href="/map">
                    <MapPin className="w-4 h-4 mr-2" />
                    Visualizza sulla Mappa
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Contatti di Emergenza</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-semibold text-red-800">{contact.type}</div>
                      <div className="font-mono text-lg text-red-900">{contact.number}</div>
                      <div className="text-sm text-red-600">{contact.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weather Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Meteo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl mb-2">☀️</div>
                  <div className="text-2xl font-bold">22°C</div>
                  <div className="text-sm text-gray-600">Soleggiato</div>
                  <div className="mt-4 text-sm">
                    <div className="flex justify-between">
                      <span>Min: 18°C</span>
                      <span>Max: 25°C</span>
                    </div>
                    <div className="mt-2 text-gray-600">Giornata perfetta per visitare il parco!</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Azioni Rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/tickets">
                    <Camera className="w-4 h-4 mr-2" />
                    Acquista Biglietti
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/planner">
                    <Clock className="w-4 h-4 mr-2" />
                    Pianifica Visita
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/attractions">
                    <Heart className="w-4 h-4 mr-2" />
                    Vedi Attrazioni
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
