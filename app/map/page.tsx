"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  MapPin,
  Search,
  Navigation,
  Clock,
  Star,
  Utensils,
  ShoppingBag,
  Car,
  Calendar,
  Users,
  Euro,
} from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/contexts/language-context"
import { getAllLocations, searchLocations } from "@/lib/park-data"
import { useSearchParams } from "next/navigation"

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const { t } = useLanguage()

  const searchParams = useSearchParams()
  const highlightId = searchParams.get("highlight")
  const [highlightedLocation, setHighlightedLocation] = useState<string | null>(null)

  // Effetto per evidenziare una struttura specifica
  useEffect(() => {
    if (highlightId) {
      setHighlightedLocation(highlightId)
      // Trova la struttura e aprila automaticamente
      const allLocations = getAllLocations()
      const locationToHighlight = allLocations.find((loc) => loc.id === highlightId)
      if (locationToHighlight) {
        setSelectedLocation(locationToHighlight)
        // Scroll verso la struttura evidenziata dopo un breve delay
        setTimeout(() => {
          const element = document.getElementById(`location-${highlightId}`)
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        }, 100)
      }
    }
  }, [highlightId])

  const allLocations = getAllLocations()
  const filteredLocations = searchTerm
    ? searchLocations(searchTerm)
    : selectedCategory === "all"
      ? allLocations
      : allLocations.filter((location) => location.type === selectedCategory)

  const categories = [
    { id: "all", name: "Tutti", icon: MapPin },
    { id: "attraction", name: "Attrazioni", icon: Star },
    { id: "restaurant", name: "Ristoranti", icon: Utensils },
    { id: "shop", name: "Negozi", icon: ShoppingBag },
    { id: "service", name: "Servizi", icon: Car },
    { id: "show", name: "Spettacoli", icon: Calendar },
  ]

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "attraction":
        return Star
      case "restaurant":
        return Utensils
      case "shop":
        return ShoppingBag
      case "service":
        return Car
      case "show":
        return Calendar
      default:
        return MapPin
    }
  }

  const getLocationColor = (type: string) => {
    switch (type) {
      case "attraction":
        return "bg-blue-500"
      case "restaurant":
        return "bg-green-500"
      case "shop":
        return "bg-purple-500"
      case "service":
        return "bg-orange-500"
      case "show":
        return "bg-pink-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleLocationClick = (location: any) => {
    setSelectedLocation(location)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href="/">{t("home.back")}</Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("map.title")}</h1>
              {highlightedLocation && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">
                  📍 Struttura evidenziata
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {highlightedLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHighlightedLocation(null)
                    setSelectedLocation(null)
                  }}
                >
                  Rimuovi evidenziazione
                </Button>
              )}
              <Button variant="outline" className="flex items-center space-x-2">
                <Navigation className="w-4 h-4" />
                <span>{t("map.my.location")}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("map.search.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t("map.search.placeholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("map.categories")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <category.icon className="w-4 h-4 mr-2" />
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("map.legend")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Attrazioni</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Ristoranti</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Negozi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Servizi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <span className="text-sm">Spettacoli</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t("map.interactive")}</span>
                  <Badge variant="outline">
                    {filteredLocations.length} {t("map.locations.found")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  {/* Theme Park Background */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat cursor-pointer"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 40% 70%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, rgba(251, 191, 36, 0.3) 0%, transparent 50%),
                        linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 25%, #fef3c7 50%, #fce7f3 75%, #ede9fe 100%)
                      `,
                    }}
                  >
                    {/* Decorative elements */}
                    <div className="absolute top-4 left-4 text-2xl opacity-30">🎠</div>
                    <div className="absolute top-8 right-8 text-2xl opacity-30">🎡</div>
                    <div className="absolute bottom-8 left-8 text-2xl opacity-30">🎢</div>
                    <div className="absolute bottom-4 right-4 text-2xl opacity-30">🎪</div>

                    {/* Paths */}
                    <svg className="absolute inset-0 w-full h-full">
                      <defs>
                        <pattern id="walkway" patternUnits="userSpaceOnUse" width="4" height="4">
                          <rect width="4" height="4" fill="rgba(156, 163, 175, 0.2)" />
                          <circle cx="2" cy="2" r="0.5" fill="rgba(75, 85, 99, 0.3)" />
                        </pattern>
                      </defs>
                      <path
                        d="M 50 50 Q 200 100 400 200 T 600 300"
                        stroke="url(#walkway)"
                        strokeWidth="8"
                        fill="none"
                        opacity="0.6"
                      />
                      <path
                        d="M 100 100 Q 300 150 500 200 Q 600 250 700 400"
                        stroke="url(#walkway)"
                        strokeWidth="6"
                        fill="none"
                        opacity="0.5"
                      />
                    </svg>
                  </div>

                  {/* Location Markers */}
                  {filteredLocations.map((location) => {
                    const IconComponent = getLocationIcon(location.type)
                    const isHighlighted = highlightedLocation === location.id
                    return (
                      <div
                        key={location.id}
                        id={`location-${location.id}`}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group ${
                          isHighlighted ? "z-20" : "z-10"
                        }`}
                        style={{
                          left: `${location.location.x}%`,
                          top: `${location.location.y}%`,
                        }}
                        onClick={() => handleLocationClick(location)}
                      >
                        {/* Anello di evidenziazione */}
                        {isHighlighted && (
                          <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                        )}
                        {isHighlighted && (
                          <div className="absolute inset-0 w-10 h-10 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-full opacity-50"></div>
                        )}

                        <div
                          className={`w-8 h-8 ${getLocationColor(location.type)} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border-2 ${
                            isHighlighted ? "border-yellow-400 border-4 scale-125" : "border-white"
                          }`}
                        >
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>

                        {/* Tooltip */}
                        <div
                          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 ${
                            isHighlighted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          } transition-opacity z-10`}
                        >
                          <div
                            className={`bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap max-w-48 ${
                              isHighlighted ? "bg-yellow-600" : ""
                            }`}
                          >
                            <div className="font-semibold">{location.name}</div>
                            {location.type === "attraction" && (location as any).waitTime !== undefined && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{(location as any).waitTime} min</span>
                              </div>
                            )}
                            {location.type === "attraction" && (location as any).status === "maintenance" && (
                              <div className="text-red-300">Manutenzione</div>
                            )}
                            {isHighlighted && <div className="text-yellow-200 font-semibold">📍 Evidenziato</div>}
                          </div>
                          <div
                            className={`absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent ${
                              isHighlighted ? "border-t-yellow-600" : "border-t-black"
                            }`}
                          ></div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Entrance */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg border-2 border-white">
                      {t("map.entrance")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location List */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t("map.location.list")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredLocations.map((location) => {
                    const IconComponent = getLocationIcon(location.type)
                    const isHighlighted = highlightedLocation === location.id
                    return (
                      <div
                        key={location.id}
                        id={`list-location-${location.id}`}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          isHighlighted
                            ? "bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400"
                            : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => handleLocationClick(location)}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 ${getLocationColor(location.type)} rounded-full flex items-center justify-center ${
                              isHighlighted ? "ring-2 ring-yellow-400" : ""
                            }`}
                          >
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4
                              className={`font-semibold ${isHighlighted ? "text-yellow-800 dark:text-yellow-200" : ""}`}
                            >
                              {location.name}
                              {isHighlighted && <span className="ml-2">📍</span>}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{location.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {location.type === "attraction" &&
                            (location as any).waitTime !== undefined &&
                            (location as any).status !== "maintenance" && (
                              <Badge variant="secondary">{(location as any).waitTime} min</Badge>
                            )}
                          {location.type === "attraction" && (location as any).status === "maintenance" && (
                            <Badge variant="destructive">Manutenzione</Badge>
                          )}
                          {location.type === "show" && <Badge variant="secondary">€{(location as any).price}</Badge>}
                          {location.type === "restaurant" && (
                            <Badge variant="secondary">{(location as any).priceRange}</Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Location Detail Dialog */}
      <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedLocation && (
                <>
                  {(() => {
                    const IconComponent = getLocationIcon(selectedLocation.type)
                    return <IconComponent className="w-5 h-5" />
                  })()}
                  <span>{selectedLocation.name}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedLocation && (
            <div className="space-y-4">
              {/* Image */}
              <img
                src={selectedLocation.image || "/placeholder.svg?height=200&width=400"}
                alt={selectedLocation.name}
                className="w-full h-48 object-cover rounded-lg"
              />

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400">{selectedLocation.description}</p>

              {/* Type-specific information */}
              {selectedLocation.type === "attraction" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Tempo di attesa:</strong> {selectedLocation.waitTime} min
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Valutazione:</strong> {selectedLocation.rating}/5
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Capacità:</strong> {selectedLocation.capacity} persone
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Durata:</strong> {selectedLocation.duration}
                    </div>
                    <div className="text-sm">
                      <strong>Altezza minima:</strong> {selectedLocation.minHeight} cm
                    </div>
                    <div className="text-sm">
                      <strong>Livello brivido:</strong> {selectedLocation.thrillLevel}/5
                    </div>
                  </div>
                </div>
              )}

              {selectedLocation.type === "show" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Venue:</strong> {selectedLocation.venue}
                    </div>
                    <div className="text-sm">
                      <strong>Durata:</strong> {selectedLocation.duration}
                    </div>
                    <div className="text-sm">
                      <strong>Categoria:</strong> {selectedLocation.category}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Prezzo:</strong> €{selectedLocation.price}
                    </div>
                    <div className="text-sm">
                      <strong>Età:</strong> {selectedLocation.ageRestriction}
                    </div>
                    <div className="text-sm">
                      <strong>Posti disponibili:</strong> {selectedLocation.availableSeats}
                    </div>
                  </div>
                </div>
              )}

              {selectedLocation.type === "restaurant" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Cucina:</strong> {selectedLocation.cuisine}
                    </div>
                    <div className="text-sm">
                      <strong>Fascia prezzo:</strong> {selectedLocation.priceRange}
                    </div>
                    <div className="text-sm">
                      <strong>Valutazione:</strong> {selectedLocation.rating}/5
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Orari:</strong> {selectedLocation.openingHours}
                    </div>
                  </div>
                </div>
              )}

              {selectedLocation.type === "shop" && (
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Categoria:</strong> {selectedLocation.category}
                  </div>
                  <div className="text-sm">
                    <strong>Orari:</strong> {selectedLocation.openingHours}
                  </div>
                  <div className="text-sm">
                    <strong>Specialità:</strong> {selectedLocation.specialties?.join(", ")}
                  </div>
                </div>
              )}

              {selectedLocation.type === "service" && (
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Categoria:</strong> {selectedLocation.category}
                  </div>
                  <div className="text-sm">
                    <strong>Disponibilità:</strong> {selectedLocation.available24h ? "24h" : "Orari limitati"}
                  </div>
                  <div className="text-sm">
                    <strong>Servizi:</strong> {selectedLocation.features?.join(", ")}
                  </div>
                </div>
              )}

              {/* Features/Characteristics */}
              {(selectedLocation.features || selectedLocation.specialties) && (
                <div>
                  <h4 className="font-semibold mb-2">Caratteristiche</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedLocation.features || selectedLocation.specialties || []).map(
                      (feature: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {feature}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-4 pt-4 border-t">
                <Button asChild className="flex-1">
                  <Link href="/planner">
                    <Calendar className="w-4 h-4 mr-2" />
                    Aggiungi al Planner
                  </Link>
                </Button>

                {selectedLocation.type === "attraction" && (
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/attractions">
                      <Star className="w-4 h-4 mr-2" />
                      Vedi Dettagli
                    </Link>
                  </Button>
                )}

                {selectedLocation.type === "show" && (
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/shows">
                      <Calendar className="w-4 h-4 mr-2" />
                      Prenota Spettacolo
                    </Link>
                  </Button>
                )}

                {(selectedLocation.type === "show" || selectedLocation.type === "attraction") && (
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/tickets">
                      <Euro className="w-4 h-4 mr-2" />
                      Acquista Biglietti
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
