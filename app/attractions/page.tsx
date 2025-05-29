"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Star, Heart, Search, Filter, MapPin, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function AttractionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [favorites, setFavorites] = useState<number[]>([])

  const attractions = [
    {
      id: 1,
      name: "Dragon Coaster",
      category: "Montagne Russe",
      waitTime: 25,
      status: "open",
      thrillLevel: 5,
      minHeight: 140,
      description: "Un'emozionante montagna russa con loop e curve mozzafiato",
      duration: "3 min",
      capacity: 24,
      rating: 4.8,
    },
    {
      id: 2,
      name: "Splash Adventure",
      category: "Acquatiche",
      waitTime: 15,
      status: "open",
      thrillLevel: 3,
      minHeight: 120,
      description: "Avventura acquatica con cascate e rapide",
      duration: "5 min",
      capacity: 16,
      rating: 4.6,
    },
    {
      id: 3,
      name: "Magic Castle",
      category: "Famiglia",
      waitTime: 30,
      status: "open",
      thrillLevel: 2,
      minHeight: 100,
      description: "Un viaggio magico attraverso il castello incantato",
      duration: "8 min",
      capacity: 20,
      rating: 4.9,
    },
    {
      id: 4,
      name: "Space Mission",
      category: "Simulatori",
      waitTime: 0,
      status: "maintenance",
      thrillLevel: 4,
      minHeight: 130,
      description: "Simulatore spaziale con effetti 4D",
      duration: "6 min",
      capacity: 12,
      rating: 4.7,
    },
    {
      id: 5,
      name: "Fairy Tale Ride",
      category: "Famiglia",
      waitTime: 10,
      status: "open",
      thrillLevel: 1,
      minHeight: 80,
      description: "Giro tranquillo per tutta la famiglia",
      duration: "4 min",
      capacity: 32,
      rating: 4.3,
    },
    {
      id: 6,
      name: "Thunder Mountain",
      category: "Montagne Russe",
      waitTime: 45,
      status: "open",
      thrillLevel: 5,
      minHeight: 140,
      description: "La montagna russa più veloce del parco",
      duration: "2 min",
      capacity: 28,
      rating: 4.9,
    },
    {
      id: 7,
      name: "Pirate Ship",
      category: "Avventura",
      waitTime: 20,
      status: "open",
      thrillLevel: 3,
      minHeight: 110,
      description: "Nave pirata oscillante con vista panoramica",
      duration: "3 min",
      capacity: 40,
      rating: 4.4,
    },
    {
      id: 8,
      name: "Virtual Reality Experience",
      category: "Simulatori",
      waitTime: 35,
      status: "open",
      thrillLevel: 4,
      minHeight: 125,
      description: "Esperienza di realtà virtuale immersiva",
      duration: "10 min",
      capacity: 8,
      rating: 4.8,
    },
  ]

  const categories = ["all", "Montagne Russe", "Acquatiche", "Famiglia", "Simulatori", "Avventura"]

  const filteredAttractions = attractions
    .filter((attraction) => {
      const matchesSearch = attraction.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || attraction.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "waitTime":
          return a.waitTime - b.waitTime
        case "rating":
          return b.rating - a.rating
        case "thrillLevel":
          return b.thrillLevel - a.thrillLevel
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const getThrillLevelColor = (level: number) => {
    if (level <= 2) return "text-green-600"
    if (level <= 3) return "text-yellow-600"
    return "text-red-600"
  }

  const getWaitTimeColor = (waitTime: number) => {
    if (waitTime <= 15) return "bg-green-100 text-green-800"
    if (waitTime <= 30) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Attrazioni</h1>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {filteredAttractions.filter((a) => a.status === "open").length} Aperte
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtri e Ricerca</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cerca attrazioni..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

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

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordina per" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="waitTime">Tempo di attesa</SelectItem>
                  <SelectItem value="rating">Valutazione</SelectItem>
                  <SelectItem value="thrillLevel">Livello brivido</SelectItem>
                </SelectContent>
              </Select>

              <Button asChild variant="outline" className="w-full">
                <Link href="/planner">
                  <Clock className="w-4 h-4 mr-2" />
                  Aggiungi al Planner
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attractions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttractions.map((attraction) => (
            <Card key={attraction.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{attraction.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {attraction.category}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleFavorite(attraction.id)} className="p-1">
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(attraction.id) ? "fill-red-500 text-red-500" : "text-gray-400"
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{attraction.description}</p>

                {/* Status and Wait Time */}
                <div className="flex items-center justify-between mb-4">
                  {attraction.status === "open" ? (
                    <Badge className={getWaitTimeColor(attraction.waitTime)}>
                      <Clock className="w-3 h-3 mr-1" />
                      {attraction.waitTime} min
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Manutenzione</Badge>
                  )}

                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{attraction.rating}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Durata:</span>
                    <span className="font-medium">{attraction.duration}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Capacità:</span>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span className="font-medium">{attraction.capacity}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Altezza minima:</span>
                    <span className="font-medium">{attraction.minHeight} cm</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Livello brivido:</span>
                    <div className="flex items-center space-x-1">
                      <Zap className={`w-3 h-3 ${getThrillLevelColor(attraction.thrillLevel)}`} />
                      <span className={`font-medium ${getThrillLevelColor(attraction.thrillLevel)}`}>
                        {attraction.thrillLevel}/5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 mt-4">
                  <Button asChild size="sm" className="flex-1">
                    <Link href="/map">
                      <MapPin className="w-3 h-3 mr-1" />
                      Mappa
                    </Link>
                  </Button>

                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href="/planner">
                      <Clock className="w-3 h-3 mr-1" />
                      Pianifica
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAttractions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessuna attrazione trovata</h3>
              <p className="text-gray-600">Prova a modificare i filtri di ricerca</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
