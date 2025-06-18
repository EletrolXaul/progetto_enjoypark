"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Ticket, Receipt, Download } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { historyService, HistoryItem } from "@/lib/services/history-service"

export default function HistoryPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'visit' | 'purchase' | 'booking'>('all')

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const userHistory = await historyService.getHistory()
        setHistory(userHistory)
      } catch (error) {
        console.error('Errore nel caricamento della cronologia:', error)
        toast({
          title: "Errore",
          description: "Impossibile caricare la cronologia",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user, toast])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Devi effettuare l'accesso per vedere la cronologia</p>
            <Button asChild className="mt-4">
              <Link href="/">Torna alla Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredHistory = filter === 'all' ? history : history.filter(item => item.type === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completato'
      case 'pending': return 'In attesa'
      case 'cancelled': return 'Annullato'
      default: return status
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visit': return <Ticket className="h-5 w-5" />
      case 'purchase': return <Receipt className="h-5 w-5" />
      case 'booking': return <Calendar className="h-5 w-5" />
      default: return <Clock className="h-5 w-5" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'visit': return 'Visita'
      case 'purchase': return 'Acquisto'
      case 'booking': return 'Prenotazione'
      default: return type
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Cronologia Attività
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tutte le tue visite, acquisti e prenotazioni
            </p>
          </div>

          {/* Filtri */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  Tutto
                </Button>
                <Button
                  variant={filter === 'visit' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('visit')}
                >
                  Visite
                </Button>
                <Button
                  variant={filter === 'purchase' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('purchase')}
                >
                  Acquisti
                </Button>
                <Button
                  variant={filter === 'booking' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('booking')}
                >
                  Prenotazioni
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-32"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nessuna attività trovata
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {filter === 'all' 
                    ? "Non hai ancora nessuna attività registrata."
                    : `Non hai ancora nessuna attività di tipo "${getTypeLabel(filter)}".`
                  }
                </p>
                <Button asChild>
                  <Link href="/shows">Prenota Biglietti</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusLabel(item.status)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(item.date).toLocaleDateString('it-IT')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {item.time}
                            </div>
                            {item.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {item.location}
                              </div>
                            )}
                            {item.ticketNumber && (
                              <div className="flex items-center gap-1">
                                <Ticket className="h-4 w-4" />
                                {item.ticketNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {item.amount && (
                          <p className="text-lg font-semibold mb-2">
                            €{Number(item.amount).toFixed(2)}
                          </p>
                        )}
                        {item.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Ricevuta
                          </Button>
                        )}
                      </div>
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