/**
 * DATI CENTRALIZZATI DEL PARCO ENJOYPARK
 *
 * Questo file contiene tutti i dati delle strutture del parco
 * per garantire coerenza tra tutte le pagine dell'applicazione
 */

// INTERFACCE TIPIZZATE
export interface Attraction {
  id: string
  name: string
  category: string
  waitTime: number
  status: "open" | "closed" | "maintenance"
  thrillLevel: number // 1-5
  minHeight: number // cm
  description: string
  duration: string
  capacity: number
  rating: number
  location: { x: number; y: number }
  image: string
  features: string[]
}

export interface Show {
  id: string
  name: string
  description: string
  venue: string
  duration: string
  category: string
  times: string[] // Orari multipli
  capacity: number
  availableSeats: number
  rating: number
  price: number
  ageRestriction: string
  location: { x: number; y: number }
  image: string
}

export interface Restaurant {
  id: string
  name: string
  category: string
  cuisine: string
  priceRange: "$" | "$$" | "$$$"
  rating: number
  description: string
  location: { x: number; y: number }
  image: string
  features: string[]
  openingHours: string
}

export interface Shop {
  id: string
  name: string
  category: string
  description: string
  location: { x: number; y: number }
  image: string
  specialties: string[]
  openingHours: string
}

export interface Service {
  id: string
  name: string
  category: string
  description: string
  location: { x: number; y: number }
  icon: string
  available24h: boolean
  features: string[]
}

// DATI ATTRAZIONI
export const attractions: Attraction[] = [
  {
    id: "dragon-coaster",
    name: "Dragon Coaster",
    category: "Montagne Russe",
    waitTime: 25,
    status: "open",
    thrillLevel: 5,
    minHeight: 140,
    description:
      "Un'emozionante montagna russa con loop e curve mozzafiato che ti porterà in un'avventura adrenalinica",
    duration: "3 min",
    capacity: 24,
    rating: 4.8,
    location: { x: 30, y: 20 },
    image: "/placeholder.svg?height=200&width=300",
    features: ["3 Loop", "Velocità 80 km/h", "Altezza 45m", "Foto ricordo"],
  },
  {
    id: "splash-adventure",
    name: "Splash Adventure",
    category: "Acquatiche",
    waitTime: 15,
    status: "open",
    thrillLevel: 3,
    minHeight: 120,
    description: "Avventura acquatica con cascate, rapide e un tuffo finale spettacolare",
    duration: "5 min",
    capacity: 16,
    rating: 4.6,
    location: { x: 60, y: 40 },
    image: "/placeholder.svg?height=200&width=300",
    features: ["Tuffo 15m", "Effetti acqua", "Poncho incluso", "Area splash"],
  },
  {
    id: "magic-castle",
    name: "Magic Castle",
    category: "Famiglia",
    waitTime: 30,
    status: "open",
    thrillLevel: 2,
    minHeight: 100,
    description: "Un viaggio magico attraverso il castello incantato con personaggi fantastici",
    duration: "8 min",
    capacity: 20,
    rating: 4.9,
    location: { x: 45, y: 60 },
    image: "/placeholder.svg?height=200&width=300",
    features: ["Animatronics", "Effetti speciali", "Storia interattiva", "Per tutta la famiglia"],
  },
  {
    id: "space-mission",
    name: "Space Mission",
    category: "Simulatori",
    waitTime: 0,
    status: "maintenance",
    thrillLevel: 4,
    minHeight: 130,
    description: "Simulatore spaziale con effetti 4D e realtà virtuale immersiva",
    duration: "6 min",
    capacity: 12,
    rating: 4.7,
    location: { x: 70, y: 25 },
    image: "/placeholder.svg?height=200&width=300",
    features: ["Realtà virtuale", "Effetti 4D", "Simulazione NASA", "Esperienza immersiva"],
  },
  {
    id: "fairy-tale-ride",
    name: "Fairy Tale Ride",
    category: "Famiglia",
    waitTime: 10,
    status: "open",
    thrillLevel: 1,
    minHeight: 80,
    description: "Giro tranquillo per tutta la famiglia attraverso il mondo delle fiabe",
    duration: "4 min",
    capacity: 32,
    rating: 4.3,
    location: { x: 25, y: 45 },
    image: "/placeholder.svg?height=200&width=300",
    features: ["Adatto ai bambini", "Musiche dolci", "Personaggi delle fiabe", "Giro panoramico"],
  },
  {
    id: "thunder-mountain",
    name: "Thunder Mountain",
    category: "Montagne Russe",
    waitTime: 45,
    status: "open",
    thrillLevel: 5,
    minHeight: 140,
    description: "La montagna russa più veloce del parco con accelerazioni estreme",
    duration: "2 min",
    capacity: 28,
    rating: 4.9,
    location: { x: 75, y: 65 },
    image: "/placeholder.svg?height=200&width=300",
    features: ["Velocità 100 km/h", "Accelerazione 0-80 in 3s", "Inversioni multiple", "Esperienza estrema"],
  },
  {
    id: "pirate-ship",
    name: "Pirate Ship",
    category: "Avventura",
    waitTime: 20,
    status: "open",
    thrillLevel: 3,
    minHeight: 110,
    description: "Nave pirata oscillante con vista panoramica sul parco",
    duration: "3 min",
    capacity: 40,
    rating: 4.4,
    location: { x: 35, y: 75 },
    image: "/placeholder.svg?height=200&width=300",
    features: ["Vista panoramica", "Oscillazione 180°", "Tema piratesco", "Effetti sonori"],
  },
  {
    id: "vr-experience",
    name: "VR Experience",
    category: "Simulatori",
    waitTime: 35,
    status: "open",
    thrillLevel: 4,
    minHeight: 125,
    description: "Esperienza di realtà virtuale immersiva con mondi fantastici",
    duration: "10 min",
    capacity: 8,
    rating: 4.8,
    location: { x: 65, y: 15 },
    image: "/placeholder.svg?height=200&width=300",
    features: ["VR di ultima generazione", "Mondi multipli", "Controlli gestuali", "Audio 3D"],
  },
]

// DATI SPETTACOLI
export const shows: Show[] = [
  {
    id: "pirate-show",
    name: "Spettacolo dei Pirati",
    description: "Un'avventura mozzafiato con acrobazie, combattimenti e effetti speciali",
    venue: "Teatro Centrale",
    duration: "45 min",
    category: "Avventura",
    times: ["14:30", "17:00", "19:30"],
    capacity: 200,
    availableSeats: 45,
    rating: 4.8,
    price: 15,
    ageRestriction: "Tutti",
    location: { x: 50, y: 50 },
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "magic-parade",
    name: "Parata Magica",
    description: "Una parata colorata con personaggi fantastici e musiche coinvolgenti",
    venue: "Via Principale",
    duration: "30 min",
    category: "Famiglia",
    times: ["16:00", "18:00"],
    capacity: 500,
    availableSeats: 120,
    rating: 4.9,
    price: 0,
    ageRestriction: "Tutti",
    location: { x: 40, y: 30 },
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "light-show",
    name: "Show delle Luci",
    description: "Spettacolo notturno con giochi di luce, laser e fontane danzanti",
    venue: "Piazza del Castello",
    duration: "25 min",
    category: "Notturno",
    times: ["20:00", "21:30"],
    capacity: 300,
    availableSeats: 78,
    rating: 4.7,
    price: 12,
    ageRestriction: "Tutti",
    location: { x: 45, y: 60 },
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "puppet-theater",
    name: "Teatro delle Marionette",
    description: "Spettacolo tradizionale con marionette per i più piccoli",
    venue: "Teatro Piccolo",
    duration: "35 min",
    category: "Bambini",
    times: ["15:15", "16:45"],
    capacity: 80,
    availableSeats: 12,
    rating: 4.6,
    price: 8,
    ageRestriction: "3-12 anni",
    location: { x: 30, y: 55 },
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "rock-concert",
    name: "Concerto Rock",
    description: "Musica dal vivo con la band del parco",
    venue: "Anfiteatro",
    duration: "60 min",
    category: "Musica",
    times: ["18:30"],
    capacity: 400,
    availableSeats: 89,
    rating: 4.5,
    price: 20,
    ageRestriction: "12+",
    location: { x: 80, y: 45 },
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "fairy-dance",
    name: "Danza delle Fate",
    description: "Spettacolo di danza con costumi elaborati e coreografie magiche",
    venue: "Giardino Incantato",
    duration: "40 min",
    category: "Danza",
    times: ["17:45"],
    capacity: 150,
    availableSeats: 23,
    rating: 4.8,
    price: 18,
    ageRestriction: "Tutti",
    location: { x: 25, y: 70 },
    image: "/placeholder.svg?height=200&width=300",
  },
]

// DATI RISTORANTI
export const restaurants: Restaurant[] = [
  {
    id: "central-restaurant",
    name: "Ristorante Centrale",
    category: "Ristorante",
    cuisine: "Italiana",
    priceRange: "$$$",
    rating: 4.7,
    description: "Ristorante principale con cucina italiana tradizionale e vista panoramica",
    location: { x: 50, y: 50 },
    image: "/placeholder.svg?height=200&width=300",
    features: ["Vista panoramica", "Cucina italiana", "Menu bambini", "Terrazza"],
    openingHours: "12:00 - 22:00",
  },
  {
    id: "pizza-corner",
    name: "Pizza Corner",
    category: "Fast Food",
    cuisine: "Pizza",
    priceRange: "$$",
    rating: 4.4,
    description: "Pizzeria veloce con pizza al taglio e specialità italiane",
    location: { x: 25, y: 70 },
    image: "/placeholder.svg?height=200&width=300",
    features: ["Pizza al taglio", "Servizio veloce", "Asporto", "Prezzi economici"],
    openingHours: "11:00 - 21:00",
  },
  {
    id: "burger-palace",
    name: "Burger Palace",
    category: "Fast Food",
    cuisine: "Americana",
    priceRange: "$$",
    rating: 4.3,
    description: "Hamburger gourmet e specialità americane",
    location: { x: 70, y: 55 },
    image: "/placeholder.svg?height=200&width=300",
    features: ["Burger gourmet", "Patatine fresche", "Milkshake", "Menu vegano"],
    openingHours: "11:30 - 21:30",
  },
  {
    id: "ice-cream-parlor",
    name: "Gelateria Dolce Vita",
    category: "Dolci",
    cuisine: "Gelato",
    priceRange: "$",
    rating: 4.8,
    description: "Gelateria artigianale con gusti unici e granite",
    location: { x: 45, y: 25 },
    image: "/placeholder.svg?height=200&width=300",
    features: ["Gelato artigianale", "Gusti stagionali", "Granite", "Senza glutine"],
    openingHours: "10:00 - 22:00",
  },
  {
    id: "snack-bar",
    name: "Snack Bar Express",
    category: "Snack",
    cuisine: "Varia",
    priceRange: "$",
    rating: 4.1,
    description: "Snack veloci, bevande e spuntini per ogni momento",
    location: { x: 30, y: 85 },
    image: "/placeholder.svg?height=200&width=300",
    features: ["Servizio 24h", "Snack veloci", "Bevande fresche", "Prezzi convenienti"],
    openingHours: "24h",
  },
  {
    id: "magic-cafe",
    name: "Caffè Magico",
    category: "Caffetteria",
    cuisine: "Caffè",
    priceRange: "$$",
    rating: 4.5,
    description: "Caffetteria tematica con dolci magici e bevande speciali",
    location: { x: 75, y: 35 },
    image: "/placeholder.svg?height=200&width=300",
    features: ["Tema magico", "Dolci speciali", "Caffè di qualità", "Atmosfera unica"],
    openingHours: "08:00 - 20:00",
  },
]

// DATI NEGOZI
export const shops: Shop[] = [
  {
    id: "main-gift-shop",
    name: "Gift Shop Principale",
    category: "Souvenir",
    description: "Il negozio principale con la più ampia selezione di souvenir del parco",
    location: { x: 40, y: 30 },
    image: "/placeholder.svg?height=200&width=300",
    specialties: ["Magliette EnjoyPark", "Peluche", "Gadget", "Cartoline"],
    openingHours: "09:00 - 22:00",
  },
  {
    id: "souvenir-shop",
    name: "Negozio Souvenir",
    category: "Souvenir",
    description: "Souvenir esclusivi e ricordi personalizzati della tua visita",
    location: { x: 60, y: 70 },
    image: "/placeholder.svg?height=200&width=300",
    specialties: ["Ricordi personalizzati", "Foto stampate", "Magneti", "Portachiavi"],
    openingHours: "10:00 - 21:00",
  },
  {
    id: "toy-store",
    name: "Negozio Giocattoli",
    category: "Giocattoli",
    description: "Giocattoli magici e educativi per bambini di tutte le età",
    location: { x: 35, y: 55 },
    image: "/placeholder.svg?height=200&width=300",
    specialties: ["Giocattoli educativi", "Peluche giganti", "Puzzle", "Giochi da tavolo"],
    openingHours: "10:00 - 20:00",
  },
  {
    id: "clothing-store",
    name: "Abbigliamento EnjoyPark",
    category: "Abbigliamento",
    description: "Abbigliamento ufficiale e accessori del parco",
    location: { x: 65, y: 30 },
    image: "/placeholder.svg?height=200&width=300",
    specialties: ["Abbigliamento ufficiale", "Cappelli", "Borse", "Accessori"],
    openingHours: "09:30 - 21:30",
  },
  {
    id: "photo-shop",
    name: "Foto Ricordo",
    category: "Fotografia",
    description: "Stampa le tue foto delle attrazioni e crea album personalizzati",
    location: { x: 25, y: 55 },
    image: "/placeholder.svg?height=200&width=300",
    specialties: ["Stampa foto", "Album personalizzati", "Cornici", "Foto digitali"],
    openingHours: "10:00 - 21:00",
  },
  {
    id: "magic-shop",
    name: "Negozio di Magia",
    category: "Specialità",
    description: "Trucchi di magia, bacchette e oggetti misteriosi",
    location: { x: 75, y: 75 },
    image: "/placeholder.svg?height=200&width=300",
    specialties: ["Trucchi di magia", "Bacchette magiche", "Cristalli", "Libri di magia"],
    openingHours: "11:00 - 20:00",
  },
]

// DATI SERVIZI
export const services: Service[] = [
  {
    id: "north-parking",
    name: "Parcheggio Nord",
    category: "Parcheggio",
    description: "Parcheggio principale con 500 posti auto",
    location: { x: 20, y: 10 },
    icon: "🚗",
    available24h: true,
    features: ["500 posti", "Videosorveglianza", "Illuminato", "Vicino ingresso"],
  },
  {
    id: "south-parking",
    name: "Parcheggio Sud",
    category: "Parcheggio",
    description: "Parcheggio secondario con navetta gratuita",
    location: { x: 80, y: 80 },
    icon: "🚗",
    available24h: true,
    features: ["300 posti", "Navetta gratuita", "Tariffa ridotta", "Posti disabili"],
  },
  {
    id: "vip-parking",
    name: "Parcheggio VIP",
    category: "Parcheggio",
    description: "Parcheggio riservato ai membri VIP",
    location: { x: 10, y: 50 },
    icon: "🌟",
    available24h: true,
    features: ["Solo VIP", "Posti riservati", "Servizio valet", "Copertura"],
  },
  {
    id: "first-aid",
    name: "Primo Soccorso",
    category: "Medico",
    description: "Centro medico con personale qualificato",
    location: { x: 55, y: 35 },
    icon: "🏥",
    available24h: true,
    features: ["Medico presente", "Attrezzature moderne", "Pronto intervento", "Farmacia"],
  },
  {
    id: "info-center",
    name: "Centro Informazioni",
    category: "Informazioni",
    description: "Punto informazioni principale del parco",
    location: { x: 45, y: 45 },
    icon: "ℹ️",
    available24h: false,
    features: ["Mappe gratuite", "Assistenza multilingue", "Prenotazioni", "Consigli"],
  },
  {
    id: "lost-found",
    name: "Oggetti Smarriti",
    category: "Assistenza",
    description: "Centro raccolta oggetti smarriti",
    location: { x: 35, y: 40 },
    icon: "🔍",
    available24h: false,
    features: ["Raccolta oggetti", "Sistema tracciamento", "Consegna gratuita", "Database digitale"],
  },
  {
    id: "main-restrooms",
    name: "Servizi Igienici Principali",
    category: "Servizi",
    description: "Servizi igienici principali con fasciatoio",
    location: { x: 50, y: 40 },
    icon: "🚻",
    available24h: true,
    features: ["Fasciatoio", "Accessibile", "Sempre pulito", "Carta gratuita"],
  },
  {
    id: "family-restrooms",
    name: "Servizi Famiglia",
    category: "Servizi",
    description: "Servizi igienici dedicati alle famiglie",
    location: { x: 30, y: 60 },
    icon: "👨‍👩‍👧‍👦",
    available24h: true,
    features: ["Spazio famiglie", "Fasciatoio grande", "Area gioco", "Sicurezza bambini"],
  },
  {
    id: "baby-care",
    name: "Area Cambio Bebè",
    category: "Famiglia",
    description: "Area dedicata al cambio e cura dei bebè",
    location: { x: 65, y: 50 },
    icon: "🍼",
    available24h: true,
    features: ["Fasciatoi multipli", "Scaldabiberon", "Area allattamento", "Prodotti gratuiti"],
  },
  {
    id: "wheelchair-rental",
    name: "Noleggio Sedie a Rotelle",
    category: "Accessibilità",
    description: "Noleggio sedie a rotelle e ausili per disabili",
    location: { x: 45, y: 35 },
    icon: "♿",
    available24h: false,
    features: ["Sedie a rotelle", "Ausili vari", "Noleggio gratuito", "Assistenza dedicata"],
  },
  {
    id: "lockers",
    name: "Armadietti",
    category: "Deposito",
    description: "Armadietti per depositare i tuoi effetti personali",
    location: { x: 55, y: 45 },
    icon: "🔒",
    available24h: true,
    features: ["Varie dimensioni", "Pagamento digitale", "Sicurezza garantita", "Accesso 24h"],
  },
  {
    id: "atm",
    name: "Bancomat",
    category: "Servizi Finanziari",
    description: "Sportello automatico per prelievi",
    location: { x: 40, y: 50 },
    icon: "💳",
    available24h: true,
    features: ["Prelievi", "Ricariche", "Commissioni basse", "Sempre attivo"],
  },
]

// FUNZIONI UTILITY
export const getAllLocations = () => {
  return [
    ...attractions.map((item) => ({ ...item, type: "attraction" as const })),
    ...shows.map((item) => ({ ...item, type: "show" as const })),
    ...restaurants.map((item) => ({ ...item, type: "restaurant" as const })),
    ...shops.map((item) => ({ ...item, type: "shop" as const })),
    ...services.map((item) => ({ ...item, type: "service" as const })),
  ]
}

export const getLocationById = (id: string) => {
  const allLocations = getAllLocations()
  return allLocations.find((location) => location.id === id)
}

export const getLocationsByType = (type: string) => {
  switch (type) {
    case "attraction":
      return attractions
    case "show":
      return shows
    case "restaurant":
      return restaurants
    case "shop":
      return shops
    case "service":
      return services
    default:
      return getAllLocations()
  }
}

export const searchLocations = (query: string) => {
  const allLocations = getAllLocations()
  return allLocations.filter(
    (location) =>
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.description.toLowerCase().includes(query.toLowerCase()),
  )
}
