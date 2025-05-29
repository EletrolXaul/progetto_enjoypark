"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Plus, Trash2, MapPin, Star, Calendar, Save, Download, Share } from "lucide-react"
import Link from "next/link"

interface PlannerItem {
  id: number
  type: "attraction" | "show" | "meal" | "break"
  name: string
  time: string
  duration: number
  location: string
  notes?: string
  waitTime?: number
}

export default function PlannerPage() {
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([
    {
      id: 1,
      type: "attraction",
      name: "Dragon Coaster",
      time: "10:00",
      duration: 30,
      location: "Area Avventura",
      waitTime: 25,
    },
    {
      id: 2,
      type: "show",
      name: "Spettacolo dei Pirati",
      time: "11:00",
      duration: 45,
      location: "Teatro Centrale",
    },
    {
      id: 3,
      type: "meal",
      name: "Pranzo",
      time: "12:30",
      duration: 60,
      location: "Ristorante Centrale",
      notes: "Prenotazione per 4 persone",
    },
  ])

  const [newItem, setNewItem] = useState({
    type: "attraction" as const,
    name: "",
    time: "",
    duration: 30,
    location: "",
    notes: "",
  })

  const suggestedItems = [
    { type: "attraction", name: "Magic Castle", location: "Area Famiglia", waitTime: 30 },
    { type: "attraction", name: "Splash Adventure", location: "Area Acquatica", waitTime: 15 },
    { type: "show", name: "Parata Magica", location: "Via Principale", time: "16:00" },
    { type: "show", name: "Show delle Luci", location: "Piazza del Castello", time: "20:00" },
  ]

  const addItem = () => {
    if (newItem.name && newItem.time) {
      const item: PlannerItem = {
        id: Date.now(),
        type: newItem.type,
        name: newItem.name,
        time: newItem.time,
        duration: newItem.duration,
        location: newItem.location,
        notes: newItem.notes || undefined,
      }
      setPlannerItems([...plannerItems, item].sort((a, b) => a.time.localeCompare(b.time)))
      setNewItem({
        type: "attraction",
        name: "",
        time: "",
        duration: 30,
        location: "",
        notes: "",
      })
    }
  }

  const removeItem = (id: number) => {
    setPlannerItems(plannerItems.filter((item) => item.id !== id))
  }

  const addSuggestedItem = (suggested: any) => {
    const item: PlannerItem = {
      id: Date.now(),
      type: suggested.type,
      name: suggested.name,
      time: suggested.time || "",
      duration: suggested.type === "show" ? 45 : 30,
      location: suggested.location,
      waitTime: suggested.waitTime,
    }
    setPlannerItems([...plannerItems, item].sort((a, b) => a.time.localeCompare(b.time)))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "attraction":
        return Star
      case "show":
        return Calendar
      case "meal":
        return "🍽️"
      case "break":
        return "☕"
      default:
        return Clock
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "attraction":
        return "bg-blue-100 text-blue-800"
      case "show":
        return "bg-purple-100 text-purple-800"
      case "meal":
        return "bg-green-100 text-green-800"
      case "break":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const endMinutes = hours * 60 + minutes + duration
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`
  }

  const getTotalDuration = () => {
    return plannerItems.reduce((total, item) => total + item.duration, 0)
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
              <h1 className="text-2xl font-bold text-gray-900">Planner Giornaliero</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Salva
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Condividi
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Esporta
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Planner */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Riepilogo della Giornata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{plannerItems.length}</div>
                    <div className="text-sm text-gray-600">Attività</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m
                    </div>
                    <div className="text-sm text-gray-600">Durata Totale</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {plannerItems.filter((item) => item.type === "attraction").length}
                    </div>
                    <div className="text-sm text-gray-600">Attrazioni</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Il Tuo Itinerario</CardTitle>
              </CardHeader>
              <CardContent>
                {plannerItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessuna attività pianificata</h3>
                    <p className="text-gray-600">
                      Aggiungi attrazioni e spettacoli per creare il tuo itinerario perfetto
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {plannerItems.map((item, index) => {
                      const IconComponent = getTypeIcon(item.type)
                      return (
                        <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              {typeof IconComponent === "string" ? (
                                <span className="text-lg">{IconComponent}</span>
                              ) : (
                                <IconComponent className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold">{item.name}</h4>
                                <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {item.time} - {calculateEndTime(item.time, item.duration)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{item.location}</span>
                                </div>
                                {item.waitTime && (
                                  <Badge variant="outline" className="text-xs">
                                    Attesa: {item.waitTime} min
                                  </Badge>
                                )}
                              </div>
                              {item.notes && <p className="text-gray-500 italic">{item.notes}</p>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Add New Item */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Aggiungi Attività</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="attraction">Attrazione</option>
                    <option value="show">Spettacolo</option>
                    <option value="meal">Pasto</option>
                    <option value="break">Pausa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Nome dell'attività"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Orario</label>
                    <Input
                      type="time"
                      value={newItem.time}
                      onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Durata (min)</label>
                    <Input
                      type="number"
                      value={newItem.duration}
                      onChange={(e) => setNewItem({ ...newItem, duration: Number.parseInt(e.target.value) })}
                      min="5"
                      step="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Località</label>
                  <Input
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    placeholder="Dove si trova"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Note (opzionale)</label>
                  <Textarea
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    placeholder="Note aggiuntive"
                    rows={2}
                  />
                </div>

                <Button onClick={addItem} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi al Planner
                </Button>
              </CardContent>
            </Card>

            {/* Suggested Items */}
            <Card>
              <CardHeader>
                <CardTitle>Suggerimenti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">{item.location}</p>
                        {item.waitTime && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {item.waitTime} min attesa
                          </Badge>
                        )}
                        {item.time && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {item.time}
                          </Badge>
                        )}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => addSuggestedItem(item)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/attractions">
                      <Star className="w-3 h-3 mr-2" />
                      Sfoglia Attrazioni
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/shows">
                      <Calendar className="w-3 h-3 mr-2" />
                      Sfoglia Spettacoli
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Consigli Utili</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Pianifica le attrazioni più popolari al mattino presto</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Prenota i pasti durante le ore meno affollate</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Lascia tempo extra per spostarti tra le aree</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Controlla gli orari degli spettacoli in anticipo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
