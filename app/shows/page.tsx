"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Star, Heart } from "lucide-react"
import Link from "next/link"

export default function ShowsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [favorites, setFavorites] = useState<number[]>([])

  const shows = [
    {
      id: 1,
      name: "Spettacolo dei Pirati",
      venue: "Teatro Centrale",
      times: ["11:00", "14:30", "17:00", "19:30"],
      duration: "45 min",
      capacity: 300,
      description: "Avventura epica con pirati, battaglie navali e effetti speciali mozzafiato",
      category: "Avventura",
      rating: 4.8,
      ageRecommendation: "6+",
      language: "Italiano",
    },
    {
      id: 2,
      name: "Parata Magica",
      venue: "Via Principale",
      times: ["12:00", "16:00"],
      duration: "30 min",
      capacity: 1000,
      description: "Parata colorata con carri allegorici, personaggi fantastici e musica dal vivo",
      category: "Parata",
      rating: 4.9,
      ageRecommendation: "Tutti",
      language: "Multilingue",
    },
    {
      id: 3,
      name: "Show delle Luci",
      venue: "Piazza del Castello",
      times: ["20:00", "21:30"],
      duration: "25 min",
      capacity: 500,
      description: "Spettacolo di luci laser sincronizzate con musica epica",
      category: "Tecnologico",
      rating: 4.7,
      ageRecommendation: "Tutti",
      language: "Senza parole",
    },
    {
      id: 4,
      name: "Circo delle Meraviglie",
      venue: "Tendone del Circo",
      times: ["13:00", "15:30", "18:00"],
      duration: "50 min",
      capacity: 200,
      description: "Acrobati, giocolieri e clown in uno spettacolo circense tradizionale",
      category: "Circo",
      rating: 4.6,
      ageRecommendation: "3+",
      language: "Italiano",
    },
    {
      id: 5,
      name: "Musical Fantasy",
      venue: "Teatro delle Stelle",
      times: ["15:00", "18:30"],
      duration: "60 min",
      capacity: 400,
      description: "Musical originale con canzoni, balli e costumi fantastici",
      category: "Musical",
      rating: 4.9,
      ageRecommendation: "8+",
      language: "Italiano",
    },
    {
      id: 6,
      name: "Incontro con i Personaggi",
      venue: "Villaggio Fatato",
      times: ["10:30", "13:30", "16:30"],
      duration: "20 min",
      capacity: 50,
      description: "Incontra i tuoi personaggi preferiti per foto e autografi",
      category: "Interattivo",
      rating: 4.5,
      ageRecommendation: "Tutti",
      language: "Multilingue",
    },
  ]

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Avventura":
        return "bg-blue-100 text-blue-800"
      case "Parata":
        return "bg-purple-100 text-purple-800"
      case "Tecnologico":
        return "bg-green-100 text-green-800"
      case "Circo":
        return "bg-orange-100 text-orange-800"
      case "Musical":
        return "bg-pink-100 text-pink-800"
      case "Interattivo":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNextShowTime = (times: string[]) => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    for (const time of times) {
      const [hours, minutes] = time.split(":").map(Number)
      const showTime = hours * 60 + minutes
      if (showTime > currentTime) {
        return time
      }
    }
    return times[0] // Next day first show
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
              <h1 className="text-2xl font-bold text-gray-900">Spettacoli</h1>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              {shows.length} Spettacoli Oggi
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Seleziona Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-sm text-gray-600">
                Mostra spettacoli per:{" "}
                {new Date(selectedDate).toLocaleDateString("it-IT", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shows Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {shows.map((show) => (
            <Card key={show.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{show.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getCategoryColor(show.category)}>{show.category}</Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{show.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleFavorite(show.id)} className="p-1">
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(show.id) ? "fill-red-500 text-red-500" : "text-gray-400"
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 mb-4">{show.description}</p>

                {/* Show Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{show.venue}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>
                      Durata: <span className="font-medium">{show.duration}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>
                      Capacità: <span className="font-medium">{show.capacity} posti</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Età consigliata:</span>
                      <div className="font-medium">{show.ageRecommendation}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Lingua:</span>
                      <div className="font-medium">{show.language}</div>
                    </div>
                  </div>
                </div>

                {/* Show Times */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Orari di oggi:</h4>
                  <div className="flex flex-wrap gap-2">
                    {show.times.map((time, index) => {
                      const isNext = time === getNextShowTime(show.times)
                      return (
                        <Badge
                          key={index}
                          variant={isNext ? "default" : "outline"}
                          className={isNext ? "bg-green-600" : ""}
                        >
                          {time}
                          {isNext && " (Prossimo)"}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href="/map">
                      <MapPin className="w-3 h-3 mr-1" />
                      Trova Venue
                    </Link>
                  </Button>

                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href="/planner">
                      <Calendar className="w-3 h-3 mr-1" />
                      Aggiungi al Planner
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Schedule Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Programma Completo della Giornata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shows
                .flatMap((show) =>
                  show.times.map((time) => ({
                    time,
                    name: show.name,
                    venue: show.venue,
                    duration: show.duration,
                    category: show.category,
                  })),
                )
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-bold text-blue-600 min-w-[60px]">{event.time}</div>
                      <div>
                        <h4 className="font-semibold">{event.name}</h4>
                        <p className="text-sm text-gray-600">
                          {event.venue} • {event.duration}
                        </p>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
