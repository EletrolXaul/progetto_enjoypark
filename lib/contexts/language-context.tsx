"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "it" | "en"

// Correzione: definisco il tipo corretto per le traduzioni
type TranslationValue = {
  it: string
  en: string
}

type TranslationsType = {
  [key: string]: TranslationValue
}

const translations: TranslationsType = {
  // Navigation
  "nav.home": { it: "Home", en: "Home" },
  "nav.map": { it: "Mappa", en: "Map" },
  "nav.attractions": { it: "Attrazioni", en: "Attractions" },
  "nav.shows": { it: "Spettacoli", en: "Shows" },
  "nav.planner": { it: "Planner", en: "Planner" },
  "nav.tickets": { it: "Biglietti", en: "Tickets" },
  "nav.info": { it: "Info", en: "Info" },
  
  // Common
  "common.loading": { it: "Caricamento...", en: "Loading..." },
  "common.save": { it: "Salva", en: "Save" },
  "common.cancel": { it: "Annulla", en: "Cancel" },
  "common.close": { it: "Chiudi", en: "Close" },
  "common.search": { it: "Cerca", en: "Search" },
  "common.filter": { it: "Filtra", en: "Filter" },
  "common.back": { it: "Indietro", en: "Back" },
  "common.next": { it: "Avanti", en: "Next" },
  "common.previous": { it: "Precedente", en: "Previous" },
  "common.open": { it: "Aperto", en: "Open" },
  "common.closed": { it: "Chiuso", en: "Closed" },
  "common.maintenance": { it: "Manutenzione", en: "Maintenance" },
  "common.minutes": { it: "min", en: "min" },
  "common.duration": { it: "Durata", en: "Duration" },
  "common.capacity": { it: "Capacità", en: "Capacity" },
  "common.rating": { it: "Valutazione", en: "Rating" },
  "common.height": { it: "Altezza minima", en: "Min Height" },
  "common.thrill": { it: "Livello brivido", en: "Thrill Level" },
  
  // Home page
  "home.welcome": { it: "Benvenuto a EnjoyPark!", en: "Welcome to EnjoyPark!" },
  "home.subtitle": {
    it: "Vivi un'esperienza magica nel nostro parco divertimenti. Pianifica la tua giornata perfetta!",
    en: "Experience the magic of our theme park. Plan your perfect day!",
  },
  "home.park.open": { it: "Parco Aperto", en: "Park Open" },
  "home.park.closed": { it: "Parco Chiuso", en: "Park Closed" },
  "home.back": { it: "← Torna alla Home", en: "← Back to Home" },
  // Stats
  "stats.attractions.open": { it: "Attrazioni Aperte", en: "Open Attractions" },
  "stats.wait.time": { it: "Tempo Attesa Medio", en: "Average Wait Time" },
  "stats.visitors.today": { it: "Visitatori Oggi", en: "Visitors Today" },
  "stats.shows.today": { it: "Spettacoli Oggi", en: "Shows Today" },
  // Map page
  "map.title": { it: "Mappa del Parco", en: "Park Map" },
  "map.search.title": { it: "Cerca Località", en: "Search Locations" },
  "map.search.placeholder": { it: "Cerca attrazioni, ristoranti...", en: "Search attractions, restaurants..." },
  "map.categories": { it: "Categorie", en: "Categories" },
  "map.legend": { it: "Legenda", en: "Legend" },
  "map.interactive": { it: "Mappa Interattiva", en: "Interactive Map" },
  "map.locations.found": { it: "località trovate", en: "locations found" },
  "map.location.list": { it: "Elenco Località", en: "Location List" },
  "map.my.location": { it: "La Mia Posizione", en: "My Location" },
  "map.entrance": { it: "🎪 INGRESSO PRINCIPALE", en: "🎪 MAIN ENTRANCE" },
  "map.category.all": { it: "Tutti", en: "All" },
  "map.category.attractions": { it: "Attrazioni", en: "Attractions" },
  "map.category.restaurants": { it: "Ristoranti", en: "Restaurants" },
  "map.category.shops": { it: "Negozi", en: "Shops" },
  "map.category.services": { it: "Servizi", en: "Services" },
  // Attractions page
  "attractions.title": { it: "Attrazioni", en: "Attractions" },
  "attractions.filters": { it: "Filtri e Ricerca", en: "Filters and Search" },
  "attractions.search.placeholder": { it: "Cerca attrazioni...", en: "Search attractions..." },
  "attractions.category.all": { it: "Tutte le categorie", en: "All categories" },
  "attractions.sort.name": { it: "Nome", en: "Name" },
  "attractions.sort.wait": { it: "Tempo di attesa", en: "Wait time" },
  "attractions.sort.rating": { it: "Valutazione", en: "Rating" },
  "attractions.sort.thrill": { it: "Livello brivido", en: "Thrill level" },
  "attractions.add.planner": { it: "Aggiungi al Planner", en: "Add to Planner" },
  "attractions.map": { it: "Mappa", en: "Map" },
  "attractions.plan": { it: "Pianifica", en: "Plan" },
  "attractions.none.found": { it: "Nessuna attrazione trovata", en: "No attractions found" },
  "attractions.none.description": {
    it: "Prova a modificare i filtri di ricerca",
    en: "Try modifying your search filters",
  },
  "attractions.categories.coaster": { it: "Montagne Russe", en: "Roller Coasters" },
  "attractions.categories.water": { it: "Acquatiche", en: "Water Rides" },
  "attractions.categories.family": { it: "Famiglia", en: "Family" },
  "attractions.categories.simulator": { it: "Simulatori", en: "Simulators" },
  "attractions.categories.adventure": { it: "Avventura", en: "Adventure" },
  // Account
  "account.login": { it: "Accedi", en: "Login" },
  "account.logout": { it: "Esci", en: "Logout" },
  "account.register": { it: "Registrati", en: "Register" },
  "account.profile": { it: "Profilo", en: "Profile" },
  "account.settings": { it: "Impostazioni", en: "Settings" },
  "account.favorites": { it: "Preferiti", en: "Favorites" },
  "account.history": { it: "Cronologia", en: "History" },
  // Theme
  "theme.light": { it: "Tema Chiaro", en: "Light Theme" },
  "theme.dark": { it: "Tema Scuro", en: "Dark Theme" },
  "theme.toggle": { it: "Cambia Tema", en: "Toggle Theme" },
  // Language
  "language.italian": { it: "Italiano", en: "Italian" },
  "language.english": { it: "Inglese", en: "English" },
  "language.change": { it: "Cambia Lingua", en: "Change Language" },
  // Tickets
  "tickets.title": { it: "I Miei Biglietti", en: "My Tickets" },
  "tickets.buy": { it: "Acquista Biglietti", en: "Buy Tickets" },
  "tickets.show.qr": { it: "Mostra QR Codes", en: "Show QR Codes" },
  "tickets.download": { it: "Scarica PDF", en: "Download PDF" },
  "tickets.order": { it: "Ordine", en: "Order" },
  "tickets.date": { it: "Data", en: "Date" },
  "tickets.status": { it: "Stato", en: "Status" },
  "tickets.total": { it: "Totale", en: "Total" },
  "tickets.valid": { it: "Valido", en: "Valid" },
  "tickets.used": { it: "Utilizzato", en: "Used" },
  "tickets.expired": { it: "Scaduto", en: "Expired" },
  // Locations names
  "location.dragon.coaster": { it: "Dragon Coaster", en: "Dragon Coaster" },
  "location.splash.adventure": { it: "Splash Adventure", en: "Splash Adventure" },
  "location.magic.castle": { it: "Magic Castle", en: "Magic Castle" },
  "location.space.mission": { it: "Space Mission", en: "Space Mission" },
  "location.fairy.tale": { it: "Fairy Tale Ride", en: "Fairy Tale Ride" },
  "location.thunder.mountain": { it: "Thunder Mountain", en: "Thunder Mountain" },
  "location.pirate.ship": { it: "Pirate Ship", en: "Pirate Ship" },
  "location.vr.experience": { it: "Virtual Reality Experience", en: "Virtual Reality Experience" },
  "location.carousel": { it: "Giostra dei Cavalli", en: "Carousel" },
  "location.ferris.wheel": { it: "Ruota Panoramica", en: "Ferris Wheel" },
  "location.bumper.cars": { it: "Auto Scontro", en: "Bumper Cars" },
  "location.haunted.house": { it: "Casa Stregata", en: "Haunted House" },
  "location.log.flume": { it: "Tronchi sull'Acqua", en: "Log Flume" },
  "location.spinning.cups": { it: "Tazze Rotanti", en: "Spinning Cups" },
  "location.sky.tower": { it: "Torre del Cielo", en: "Sky Tower" },
  // Restaurants
  "restaurant.centrale": { it: "Ristorante Centrale", en: "Central Restaurant" },
  "restaurant.pizza.corner": { it: "Pizza Corner", en: "Pizza Corner" },
  "restaurant.burger.palace": { it: "Burger Palace", en: "Burger Palace" },
  "restaurant.ice.cream": { it: "Gelateria Dolce Vita", en: "Sweet Life Ice Cream" },
  "restaurant.snack.bar": { it: "Snack Bar Express", en: "Express Snack Bar" },
  "restaurant.cafe.magic": { it: "Caffè Magico", en: "Magic Café" },
  "restaurant.food.court": { it: "Food Court", en: "Food Court" },
  "restaurant.candy.shop": { it: "Negozio di Dolci", en: "Candy Shop" },
  // Shops
  "shop.gift.main": { it: "Gift Shop Principale", en: "Main Gift Shop" },
  "shop.souvenirs": { it: "Negozio Souvenir", en: "Souvenir Shop" },
  "shop.toys": { it: "Negozio Giocattoli", en: "Toy Store" },
  "shop.clothing": { it: "Abbigliamento EnjoyPark", en: "EnjoyPark Clothing" },
  "shop.photo": { it: "Foto Ricordo", en: "Photo Memories" },
  "shop.magic": { it: "Negozio di Magia", en: "Magic Shop" },
  // Services
  "service.parking.north": { it: "Parcheggio Nord", en: "North Parking" },
  "service.parking.south": { it: "Parcheggio Sud", en: "South Parking" },
  "service.parking.vip": { it: "Parcheggio VIP", en: "VIP Parking" },
  "service.first.aid": { it: "Primo Soccorso", en: "First Aid" },
  "service.info.center": { it: "Centro Informazioni", en: "Information Center" },
  "service.lost.found": { it: "Oggetti Smarriti", en: "Lost & Found" },
  "service.restrooms.main": { it: "Servizi Igienici Principali", en: "Main Restrooms" },
  "service.restrooms.family": { it: "Servizi Famiglia", en: "Family Restrooms" },
  "service.baby.care": { it: "Area Cambio Bebè", en: "Baby Care Area" },
  "service.wheelchair": { it: "Noleggio Sedie a Rotelle", en: "Wheelchair Rental" },
  "service.lockers": { it: "Armadietti", en: "Lockers" },
  "service.atm": { it: "Bancomat", en: "ATM" },
}

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("it")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("enjoypark-language") as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    } else {
      const browserLanguage = navigator.language.startsWith("en") ? "en" : "it"
      setLanguage(browserLanguage)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("enjoypark-language", language)
  }, [language])

  // Correzione: tipizzazione corretta della funzione t
  const t = (key: string): string => {
    const translation = translations[key]
    if (translation && translation[language]) {
      return translation[language]
    }
    return key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
