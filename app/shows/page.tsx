"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Search,
  Filter,
  Users,
  Ticket,
  CheckCircle,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/language-context";
import {
  parkService,
  type Show as ParkServiceShow,
} from "@/lib/services/park-service";
import { ServerError } from "@/components/ui/server-error";
import { useToast } from "@/hooks/use-toast";
import { usePlanner } from "@/lib/contexts/PlannerContext";

interface Show {
  id: string;
  name: string;
  description: string;
  venue: string;
  duration: string;
  category: string;
  time: string;
  date: string;
  capacity: number;
  availableSeats: number;
  rating: number;
  price: number;
  ageRestriction: string;
  image: string;
}

export default function ShowsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { addToPlannerGlobal, plannerItems } = usePlanner();
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("time");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  
  // Aggiungi queste variabili mancanti
  const [bookingShow, setBookingShow] = useState<string | null>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);

  // Funzione per caricare le prenotazioni dell'utente
  const loadUserBookings = async () => {
    try {
      const bookings = await parkService.getUserBookings();
      setUserBookings(bookings);
    } catch (error) {
      console.error('Errore nel caricamento delle prenotazioni:', error);
    }
  };

  // Funzione per controllare se l'utente ha già prenotato questo spettacolo oggi
  const hasBookedShowToday = (showId: string, showDate: string): boolean => {
    return Array.isArray(userBookings) && userBookings.some(booking => 
      booking.showId === showId && 
      booking.date === showDate
    );
  };

  // Funzione per prenotare uno spettacolo
  const bookShow = async (show: Show) => {
    if (bookingShow === show.id) return;
    
    // Controlla se l'utente ha già prenotato questo spettacolo oggi
    if (hasBookedShowToday(show.id, show.date)) {
      toast({
        title: "Prenotazione non consentita",
        description: `Hai già prenotato ${show.name} per oggi. Puoi prenotare lo stesso spettacolo massimo una volta al giorno.`,
        variant: "destructive",
      });
      return;
    }
    
    setBookingShow(show.id);
    try {
      // Chiamata API al server per creare la prenotazione
      const booking = await parkService.createShowBooking({
        show_id: show.id,  // Cambiato da showId a show_id
        time_slot: show.time,  // Cambiato da time a time_slot
        seats_booked: 1  // Aggiunto campo richiesto
      });
      
      // Aggiorna i posti disponibili localmente
      setShows(prevShows => 
        prevShows.map(s => 
          s.id === show.id 
            ? { ...s, availableSeats: s.availableSeats - 1 }
            : s
        )
      );
      
      // Ricarica le prenotazioni dell'utente
      await loadUserBookings();
      
      toast({
        title: "Prenotazione confermata!",
        description: `Hai prenotato un posto per ${show.name}. Controlla la cronologia per i dettagli.`,
      });
      
    } catch (error) {
      console.error('Errore nella prenotazione:', error);
      toast({
        title: "Errore",
        description: "Impossibile completare la prenotazione. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setBookingShow(null);
    }
  };

  const loadShows = async () => {
    try {
      setLoading(true);
      setNetworkError(false);
      const showsData = await parkService.getShows();
      console.log("Dati spettacoli ricevuti:", showsData); // Per debug
      setShows(showsData);
    } catch (error: any) {
      console.error("Errore nel caricamento degli spettacoli:", error);
      if (
        error.code === "ERR_NETWORK" ||
        error.message?.includes("Network Error")
      ) {
        setNetworkError(true);
      } else {
        toast({
          title: "Errore",
          description:
            "Impossibile caricare gli spettacoli. Riprova più tardi.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShows();
    loadUserBookings(); // Carica anche le prenotazioni dell'utente
  }, []);

  // Se c'è un errore di rete, mostra il componente ServerError
  if (networkError) {
    return (
      <ServerError
        title="Server Non Disponibile"
        message="Non riusciamo a connetterci al server per caricare gli spettacoli."
        onRetry={loadShows}
        variant="full"
      />
    );
  }

  const categories = [
    "all",
    "Avventura",
    "Famiglia",
    "Notturno",
    "Bambini",
    "Musica",
    "Danza",
  ];

  const filteredShows = shows
    .filter((show) => {
      const matchesSearch =
        show.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        show.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || show.category === categoryFilter;
      const matchesDate = show.date === selectedDate;
      return matchesSearch && matchesCategory && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "time":
          return a.time.localeCompare(b.time);
        case "rating":
          return b.rating - a.rating;
        case "availability":
          return b.availableSeats - a.availableSeats;
        case "price":
          return a.price - b.price;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Avventura":
        return "bg-red-100 text-red-600 border-red-600 dark:bg-red-900 dark:text-red-200";
      case "Famiglia":
        return "bg-green-100 text-green-600 border-green-600 dark:bg-green-900 dark:text-green-200";
      case "Notturno":
        return "bg-purple-100 text-purple-600 border-purple-600 dark:bg-purple-900 dark:text-purple-200";
      case "Bambini":
        return "bg-yellow-100 text-yellow-600 border-yellow-600 dark:bg-yellow-900 dark:text-yellow-200";
      case "Musica":
        return "bg-blue-100 text-blue-600 border-blue-600 dark:bg-blue-900 dark:text-blue-200";
      case "Danza":
        return "bg-pink-100 text-pink-600 border-pink-600 dark:bg-pink-900 dark:text-pink-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-600 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getAvailabilityColor = (availableSeats: number, capacity: number) => {
    const percentage = (availableSeats / capacity) * 100;
    if (percentage > 50) return "text-green-600 dark:text-green-400";
    if (percentage > 20) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const isLocationInPlanner = (locationId: string | number): boolean => {
    return plannerItems.some((item) => {
      // 1. Confronto diretto per ID
      if (
        item.originalData?.id &&
        item.originalData.id.toString() === locationId.toString()
      ) {
        return true;
      }

      // 2. Confronto per ID ricostruito (se originalData manca)
      if (!item.originalData && item.id) {
        const parts = String(item.id).split("-");
        if (parts.length >= 2 && parts[1] === locationId.toString()) {
          return true;
        }
      }

      return false;
    });
  };

  const addToPlanner = (show: Show) => {
    // Controlla se l'elemento è già nel planner PRIMA di procedere
    if (isLocationInPlanner(show.id)) {
      toast({
        title: "Già nel planner",
        description: `${show.name} è già presente nel tuo programma`,
        variant: "destructive",
      });
      return;
    }

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const userSuffix = Math.random().toString(36).substr(2, 5);
    const uniqueId = `show-${show.id}-${timestamp}-${randomId}-${userSuffix}`;

    const newItem = {
      id: uniqueId,
      name: show.name,
      type: "show" as const,
      time: show.time,
      notes: undefined,
      priority: "medium" as const,
      completed: false,
      originalData: show,
    };

    addToPlannerGlobal(newItem);

    toast({
      title: "Aggiunto al planner",
      description: `${show.name} è stato aggiunto al tuo planner`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" className="hidden sm:flex">
                <Link href="/">← Torna alla Home</Link>
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Spettacoli
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400 hidden sm:block"
              >
                {filteredShows.length} Spettacoli Oggi
              </Badge>

              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="sm:hidden"
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
              >
                <Filter className="w-4 h-4" />
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="sm:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Filters - Mobile */}
      {isFiltersVisible && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sm:hidden">
          <div className="p-4 space-y-3">
            {/* Header con pulsante di chiusura */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtri</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFiltersVisible(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca spettacoli..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date */}
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />

            {/* Category */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "Tutte le categorie" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordina per" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Orario</SelectItem>
                <SelectItem value="rating">Valutazione</SelectItem>
                <SelectItem value="availability">Disponibilità</SelectItem>
                <SelectItem value="price">Prezzo</SelectItem>
                <SelectItem value="name">Nome</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Desktop Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 dark:bg-gray-800 dark:border-gray-700 hidden sm:block">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtri e Ricerca</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cerca spettacoli..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Date */}
              <div>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Category */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "Tutte le categorie" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordina per" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">Orario</SelectItem>
                  <SelectItem value="rating">Valutazione</SelectItem>
                  <SelectItem value="availability">Disponibilità</SelectItem>
                  <SelectItem value="price">Prezzo</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Shows Grid */}
      <div className={`${isFiltersVisible ? "mt-64 sm:mt-0" : ""}`}>
        {filteredShows.length === 0 ? (
          <Card className="text-center py-12 dark:bg-gray-800 dark:border-gray-700">
            <CardContent>
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nessuno spettacolo trovato
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Prova a modificare i filtri di ricerca o seleziona una data
                diversa
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShows.map((show) => (
              <Card
                key={show.id}
                className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
              >
                <Link href={`/shows/${show.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getCategoryColor(show.category)}>
                        {show.category}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {show.rating}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{show.name}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {show.description}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Show Image */}
                    <img
                      src={show.image || "/placeholder.svg"}
                      alt={show.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />

                    {/* Show Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {show.time}
                          </span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {show.duration}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {show.venue}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span
                            className={`font-medium ${getAvailabilityColor(
                              show.availableSeats,
                              show.capacity
                            )}`}
                          >
                            {show.availableSeats} posti disponibili
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          su {show.capacity}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Età: {show.ageRestriction}
                        </span>
                        <div className="text-right">
                          {show.price === 0 ? (
                            <Badge className="bg-green-500">Gratuito</Badge>
                          ) : (
                            <div className="text-right">
                              <span className="font-bold text-lg">
                                €{show.price}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Pagamento al botteghino
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Availability Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          show.availableSeats / show.capacity > 0.5
                            ? "bg-green-500"
                            : show.availableSeats / show.capacity > 0.2
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${
                            (show.availableSeats / show.capacity) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Link>

                {/* Actions - fuori dal Link per evitare link annidati */}
                <CardContent className="pt-0">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={
                        show.availableSeats === 0 || 
                        bookingShow === show.id ||
                        hasBookedShowToday(show.id, show.date)
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        bookShow(show);
                      }}
                    >
                      <Ticket className="w-3 h-3 mr-1" />
                      {bookingShow === show.id ? "Prenotando..." :
                       hasBookedShowToday(show.id, show.date) ? "Già prenotato" :
                       show.availableSeats === 0 ? "Sold Out" : "Prenota"}
                    </Button>

                    {!isLocationInPlanner(show.id) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToPlanner(show);
                        }}
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Aggiungi
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-green-100 text-green-700 border-green-400"
                        disabled
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aggiunto
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 hidden sm:flex flex-col sm:flex-row gap-4">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/planner">
              <Calendar className="w-4 h-4 mr-2" />
              Crea il Tuo Programma
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/map">
              <MapPin className="w-4 h-4 mr-2" />
              Trova i Teatri
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/tickets">
              <Ticket className="w-4 h-4 mr-2" />
              Acquista Biglietti
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 sm:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 sm:hidden transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Menu
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/" onClick={() => setIsSidebarOpen(false)}>
                  ← Torna alla Home
                </Link>
              </Button>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Azioni Rapide
                </h3>

                <div className="space-y-3">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link
                      href="/planner"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Crea il Tuo Programma
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/map" onClick={() => setIsSidebarOpen(false)}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Trova i Teatri
                    </Link>
                  </Button>

                  <Button asChild className="w-full justify-start">
                    <Link
                      href="/tickets"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Acquista Biglietti
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                >
                  {filteredShows.length} Spettacoli Oggi
                </Badge>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
