"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  ArrowLeft,
  Users,
  Ticket,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parkService } from "@/lib/services/park-service";
import { usePlanner } from "@/lib/contexts/PlannerContext";
import Link from "next/link";

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

export default function ShowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addToPlannerGlobal, plannerItems } = usePlanner();
  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const loadShow = async () => {
      try {
        const showsData = await parkService.getShows();
        const foundShow = showsData.find((s) => s.id === params.id);

        if (foundShow) {
          setShow(foundShow);
        }
      } catch (error) {
        console.error("Errore nel caricamento dello spettacolo:", error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i dettagli dello spettacolo.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadShow();
    }
  }, [params.id]);

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

      // 3. Confronto per nome (fallback più robusto)
      if (show && item.name && show.name) {
        const itemName = item.name.toLowerCase().trim();
        const locationName = show.name.toLowerCase().trim();
        if (itemName === locationName) {
          return true;
        }
      }

      return false;
    });
  };

  const addToPlanner = () => {
    if (!show) return;

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

  const bookShow = async () => {
    if (!show) return;
    
    setIsBooking(true);
    try {
      // Usa il servizio park-service invece di simulare
      const booking = await parkService.createShowBooking({
        show_id: show.id,  // Cambiato da showId a show_id
        time_slot: show.time,  // Cambiato da time a time_slot
        seats_booked: 1  // Aggiunto il campo richiesto
      });
      
      // Aggiorna i posti disponibili
      setShow(prev => prev ? {
        ...prev,
        availableSeats: prev.availableSeats - 1
      } : null);
      
      toast({
        title: "Prenotazione confermata!",
        description: `Hai prenotato un posto per ${show.name}. Controlla la cronologia per i dettagli.`,
      });
      
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile completare la prenotazione. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna indietro
          </Button>
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">
                Spettacolo non trovato
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Lo spettacolo che stai cercando non esiste.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con pulsante indietro */}
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna agli spettacoli
        </Button>

        {/* Immagine principale */}
        <div className="relative mb-6">
          <img
            src={show.image || "/placeholder.svg"}
            alt={show.name}
            className="w-full h-64 md:h-96 object-cover rounded-lg"
          />
          <div className="absolute top-4 left-4">
            <Badge className={getCategoryColor(show.category)}>
              {show.category}
            </Badge>
          </div>
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 rounded-lg p-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-medium">{show.rating}</span>
            </div>
          </div>
        </div>

        {/* Informazioni principali */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl mb-2">
              {show.name}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              {show.description}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dettagli spettacolo */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Dettagli Spettacolo</h3>

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Orario</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {show.time} - Durata: {show.duration}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Luogo</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {show.venue}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Data</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(show.date).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Disponibilità e prezzo */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  Disponibilità e Prezzo
                </h3>

                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Posti disponibili</p>
                    <p
                      className={`text-sm font-medium ${getAvailabilityColor(
                        show.availableSeats,
                        show.capacity
                      )}`}
                    >
                      {show.availableSeats} su {show.capacity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="font-medium">Prezzo</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {show.price === 0 ? "Gratuito" : `€${show.price}`}
                    </p>
                    {show.price > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        Pagamento al botteghino
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-1">Età consigliata</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {show.ageRestriction}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Barra disponibilità */}
            <div>
              <p className="text-sm font-medium mb-2">Disponibilità posti</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    show.availableSeats / show.capacity > 0.5
                      ? "bg-green-500"
                      : show.availableSeats / show.capacity > 0.2
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${(show.availableSeats / show.capacity) * 100}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Azioni */}
        <div className="flex gap-4">
          <Button
            onClick={bookShow}
            className="flex-1"
            disabled={show.availableSeats === 0 || isBooking}
          >
            <Ticket className="w-4 h-4 mr-2" />
            {isBooking ? "Prenotando..." : 
             show.availableSeats === 0 ? "Sold Out" : "Prenota Posto"}
          </Button>
          <Button 
            variant={isLocationInPlanner(show.id) ? "secondary" : "outline"} 
            className="flex-1" 
            onClick={addToPlanner}
            disabled={isLocationInPlanner(show.id)}
          >
            {isLocationInPlanner(show.id) ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Aggiunto
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Aggiungi al Planner
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
