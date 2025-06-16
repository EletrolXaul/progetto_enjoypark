"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, Clock, MapPin, Star } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { parkService, type Attraction } from "@/lib/services/park-service"
import { favoritesService } from "@/lib/services/favorites-service"
import { ServerError } from "@/components/ui/server-error"
import Image from "next/image"
import Link from "next/link"

export default function AttractionsPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null)
        // Carica le attrazioni dal backend
        const attractionsData = await parkService.getAttractions();
        setAttractions(attractionsData);

        // Se l'utente è loggato, carica i suoi preferiti
        if (user) {
          const favoritesData = await favoritesService.getFavorites();
          setFavorites(favoritesData.map((fav) => fav.id));
        }
      } catch (error) {
        console.error("Errore nel caricamento delle attrazioni:", error);
        setError("network")
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const toggleFavorite = async (attraction: Attraction) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per salvare i preferiti.",
      });
      return;
    }

    try {
      if (favorites.includes(attraction.id)) {
        // Rimuovi dai preferiti
        await favoritesService.removeFavorite(attraction.id);
        setFavorites(favorites.filter((id) => id !== attraction.id));
        toast({
          title: "Rimosso dai preferiti",
          description: `${attraction.name} è stato rimosso dai tuoi preferiti.`,
        });
      } else {
        // Aggiungi ai preferiti
        await favoritesService.addFavorite({
          id: attraction.id,
          type: "attraction",
          name: attraction.name,
          description: attraction.description || "",
          location: attraction.location?.area || "", // Usa location.area invece di location direttamente
          rating: attraction.rating || 0,
          image: attraction.image || "/placeholder.jpg",
          addedDate: new Date().toISOString().split("T")[0],
        });
        setFavorites([...favorites, attraction.id]);
        toast({
          title: "Aggiunto ai preferiti",
          description: `${attraction.name} è stato aggiunto ai tuoi preferiti.`,
        });
      }
    } catch (error) {
      console.error("Errore nella gestione dei preferiti:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare i preferiti. Riprova più tardi.",
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

  // Se c'è un errore di rete, mostra il componente di errore
  if (error === "network") {
    return (
      <ServerError 
        title="Impossibile Caricare le Attrazioni"
        message="Il sistema del parco è temporaneamente offline. Le attrazioni non possono essere caricate al momento."
        onRetry={() => {
          setLoading(true)
          setError(null)
          // Ricarica i dati
          const loadData = async () => {
            try {
              const attractionsData = await parkService.getAttractions();
              setAttractions(attractionsData);
              if (user) {
                const favoritesData = await favoritesService.getFavorites();
                setFavorites(favoritesData.map((fav) => fav.id));
              }
            } catch (error) {
              setError("network")
            } finally {
              setLoading(false)
            }
          }
          loadData()
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Attrazioni
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Scopri tutte le emozionanti attrazioni del parco
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {attractions.map((attraction) => (
              <Card
                key={attraction.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <Link href={`/attractions/${attraction.id}`}>
                  <div className="relative">
                    <img
                      src={attraction.image || "/placeholder.jpg"}
                      alt={attraction.name}
                      className="w-full h-48 object-cover"
                    />
                    <Badge
                      className={`absolute top-2 left-2 ${getStatusColor(
                        attraction.status
                      )}`}
                    >
                      {getStatusLabel(attraction.status)}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      {attraction.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {attraction.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {attraction.waitTime !== undefined && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {attraction.waitTime} min
                        </div>
                      )}
                      {attraction.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {attraction.location.area}
                        </div>
                      )}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {attraction.rating}
                        </span>
                      </div>
                      <Badge variant="outline">{attraction.category}</Badge>
                    </div>
                  </CardContent>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white z-10"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleFavorite(attraction)
                  }}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      favorites.includes(attraction.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-500"
                    }`}
                  />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
