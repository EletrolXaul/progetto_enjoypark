"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  Clock,
  MapPin,
  Star,
  ArrowLeft,
  Users,
  Camera,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { parkService, type Attraction } from "@/lib/services/park-service";
import { favoritesService } from "@/lib/services/favorites-service";
import { usePlanner } from "@/lib/contexts/PlannerContext";
import Image from "next/image";
import Link from "next/link";

export default function AttractionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToPlannerGlobal, plannerItems } = usePlanner();
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadAttraction = async () => {
      try {
        const attractionsData = await parkService.getAttractions();
        const foundAttraction = attractionsData.find((a) => a.id === params.id);

        if (foundAttraction) {
          setAttraction(foundAttraction);

          // Controlla se è nei preferiti
          if (user) {
            const favoritesData = await favoritesService.getFavorites();
            setIsFavorite(
              favoritesData.some((fav) => fav.id === foundAttraction.id)
            );
          }
        }
      } catch (error) {
        console.error("Errore nel caricamento dell'attrazione:", error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i dettagli dell'attrazione.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadAttraction();
    }
  }, [params.id, user]);

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per salvare i preferiti.",
      });
      return;
    }

    if (!attraction) return;

    try {
      if (isFavorite) {
        await favoritesService.removeFavorite(attraction.id);
        setIsFavorite(false);
        toast({
          title: "Rimosso dai preferiti",
          description: `${attraction.name} è stato rimosso dai tuoi preferiti.`,
        });
      } else {
        await favoritesService.addFavorite({
          id: attraction.id,
          type: "attraction",
          name: attraction.name,
          description: attraction.description || "",
          location: attraction.location?.area || "",
          rating: attraction.rating || 0,
          image: attraction.image || "/placeholder.jpg", // Added missing image property
          addedDate: new Date().toISOString().split("T")[0], // Added missing addedDate property
        });
        setIsFavorite(true);
        toast({
          title: "Aggiunto ai preferiti",
          description: `${attraction.name} è stato aggiunto ai tuoi preferiti.`,
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare i preferiti.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "closed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Aperta";
      case "closed":
        return "Chiusa";
      case "maintenance":
        return "In Manutenzione";
      default:
        return status;
    }
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
      if (attraction && item.name && attraction.name) {
        const itemName = item.name.toLowerCase().trim();
        const locationName = attraction.name.toLowerCase().trim();
        if (itemName === locationName) {
          return true;
        }
      }

      return false;
    });
  };

  const addToPlanner = () => {
    if (!attraction) return;

    // Controlla se l'elemento è già nel planner PRIMA di procedere
    if (isLocationInPlanner(attraction.id)) {
      toast({
        title: "Già nel planner",
        description: `${attraction.name} è già presente nel tuo programma`,
        variant: "destructive",
      });
      return;
    }

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const userSuffix = Math.random().toString(36).substr(2, 5);
    const uniqueId = `attraction-${attraction.id}-${timestamp}-${randomId}-${userSuffix}`;

    const newItem = {
      id: uniqueId,
      name: attraction.name,
      type: "attraction" as const,
      time: undefined,
      notes: undefined,
      priority: "medium" as const,
      completed: false,
      originalData: attraction,
    };

    addToPlannerGlobal(newItem);

    toast({
      title: "Aggiunto al planner",
      description: `${attraction.name} è stato aggiunto al tuo planner`,
    });
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

  if (!attraction) {
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
                Attrazione non trovata
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                L'attrazione che stai cercando non esiste.
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
          Torna alle attrazioni
        </Button>

        {/* Immagine principale */}
        <div className="relative mb-6">
          <img
            src={attraction.image || "/placeholder.jpg"}
            alt={attraction.name}
            className="w-full h-64 md:h-96 object-cover rounded-lg"
          />
          <div className="absolute top-4 left-4">
            <Badge className={getStatusColor(attraction.status)}>
              {getStatusLabel(attraction.status)}
            </Badge>
          </div>
          <Button
            onClick={toggleFavorite}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 bg-white/80 hover:bg-white"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
              }`}
            />
          </Button>
        </div>

        {/* Informazioni principali */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl md:text-3xl mb-2">
                  {attraction.name}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {attraction.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {attraction.location.area}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{attraction.rating}</span>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-sm">
                {attraction.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {attraction.description}
            </p>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {attraction.waitTime !== undefined && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Tempo di attesa</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {attraction.waitTime} minuti
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Capacità</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {attraction.capacity || "Non specificata"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Altezza minima</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {attraction.minHeight
                      ? `${attraction.minHeight} cm`
                      : "Nessuna restrizione"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Azioni */}
        <div className="flex gap-4">
          <Button 
            className="flex-1" 
            onClick={addToPlanner}
            disabled={isLocationInPlanner(attraction.id)}
            variant={isLocationInPlanner(attraction.id) ? "secondary" : "default"}
          >
            {isLocationInPlanner(attraction.id) ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Aggiunto
              </>
            ) : (
              "Aggiungi al Planner"
            )}
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/map">Visualizza sulla Mappa</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
