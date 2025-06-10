"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, MapPin, Clock, Star, Trash2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { favoritesService, FavoriteItem } from "@/lib/services/favorites-service"

export default function FavoritesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const data = await favoritesService.getFavorites()
        setFavorites(data)
      } catch (error) {
        console.error("Errore nel caricamento dei preferiti:", error)
        toast({
          title: "Errore",
          description: "Impossibile caricare i preferiti. Riprova più tardi.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      loadFavorites()
    } else {
      setLoading(false)
    }
  }, [user, toast])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Devi effettuare l'accesso per vedere i tuoi preferiti</p>
            <Button asChild className="mt-4">
              <Link href="/">Torna alla Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const removeFavorite = async (id: string) => {
    try {
      const updatedFavorites = await favoritesService.removeFavorite(id)
      setFavorites(updatedFavorites)
      toast({
        title: "Rimosso dai preferiti",
        description: "L'elemento è stato rimosso dalla tua lista dei preferiti.",
      })
    } catch (error) {
      console.error("Errore nella rimozione del preferito:", error)
      toast({
        title: "Errore",
        description: "Impossibile rimuovere il preferito. Riprova più tardi.",
        variant: "destructive"
      })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'attraction': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'show': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'restaurant': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'attraction': return 'Attrazione'
      case 'show': return 'Spettacolo'
      case 'restaurant': return 'Ristorante'
      default: return type
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              I Miei Preferiti
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tutte le attrazioni, spettacoli e ristoranti che hai salvato
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
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
          ) : favorites.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nessun preferito salvato
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Inizia ad esplorare il parco e salva le tue attrazioni preferite!
                </p>
                <Button asChild>
                  <Link href="/attractions">Esplora Attrazioni</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <Badge className={`absolute top-2 left-2 ${getTypeColor(item.type)}`}>
                      {getTypeLabel(item.type)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => removeFavorite(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <MapPin className="h-4 w-4" />
                      {item.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{item.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        Aggiunto il {new Date(item.addedDate).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}