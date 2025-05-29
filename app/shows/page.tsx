"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Teatro":
      return "bg-red-100 text-red-600 border-red-600 dark:bg-red-600 dark:text-red-100 dark:border-red-100"
    case "Musica":
      return "bg-green-100 text-green-600 border-green-600 dark:bg-green-600 dark:text-green-100 dark:border-green-100"
    case "Danza":
      return "bg-purple-100 text-purple-600 border-purple-600 dark:bg-purple-600 dark:text-purple-100 dark:border-purple-100"
    case "Cinema":
      return "bg-yellow-100 text-yellow-600 border-yellow-600 dark:bg-yellow-600 dark:text-yellow-100 dark:border-yellow-100"
    default:
      return "bg-gray-100 text-gray-600 border-gray-600 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-100"
  }
}

const ShowsPage = () => {
  const [shows, setShows] = useState([
    {
      date: "2024-09-21",
      events: [
        { time: "18:00", name: "Romeo e Giulietta", venue: "Teatro Nuovo", duration: "2h 30m", category: "Teatro" },
        { time: "21:00", name: "Aida", venue: "Arena di Verona", duration: "3h", category: "Musica" },
      ],
      description: "Una descrizione dello spettacolo di oggi.",
    },
    {
      date: "2024-09-22",
      events: [
        { time: "19:00", name: "Il Lago dei Cigni", venue: "Teatro Carlo Felice", duration: "2h", category: "Danza" },
        { time: "20:30", name: "Bohemian Rhapsody", venue: "Cinema Odeon", duration: "2h 15m", category: "Cinema" },
      ],
      description: "Una descrizione dello spettacolo di domani.",
    },
  ])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const filteredShows = shows.filter((show) => show.date === selectedDate)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href="/">← Torna alla Home</Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spettacoli</h1>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400">
              {shows.length} Spettacoli Oggi
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Seleziona una data:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Visualizza gli spettacoli per la data selezionata.
          </div>
        </div>

        {filteredShows.length > 0 ? (
          filteredShows.map((show) => (
            <div key={show.date} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Spettacoli del {show.date}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{show.description}</p>
              <div className="space-y-4">
                {show.events.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400 min-w-[60px]">
                        {event.time}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{event.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {event.venue} • {event.duration}
                        </p>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Nessuno spettacolo trovato per la data selezionata.</p>
        )}
      </main>
    </div>
  )
}

export default ShowsPage
