"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Navigation, Clock, Star, Utensils, ShoppingBag, Car } from "lucide-react"
import Link from "next/link"

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const mapLocations = [
    { id: 1, name: "Dragon Coaster", type: "attraction", category: "thrill", x: 30, y: 20, waitTime: 25 },
    { id: 2, name: "Splash Adventure", type: "attraction", category: "water", x: 60, y: 40, waitTime: 15 },
    { id: 3, name: "Magic Castle", type: "attraction", category: "family", x: 45, y: 60, waitTime: 30 },
    {
      id: 4,
      name: "Space Mission",
      type: "attraction",
      category: "simulator",
      x: 70,
      y: 25,
      waitTime: 0,
      status: "maintenance",
    },
    { id: 5, name: "Ristorante Centrale", type: "restaurant", category: "dining", x: 50, y: 50 },
    { id: 6, name: "Pizza Corner", type: "restaurant", category: "dining", x: 25, y: 70 },
    { id: 7, name: "Gift Shop Principale", type: "shop", category: "shopping", x: 40, y: 30 },
    { id: 8, name: "Parcheggio Nord", type: "service", category: "parking", x: 20, y: 10 },
    { id: 9, name: "Parcheggio Sud", type: "service", category: "parking", x: 80, y: 80 },
    { id: 10, name: "Primo Soccorso", type: "service", category: "medical", x: 55, y: 35 },
  ]

  const categories = [
    { id: "all", name: "Tutti", icon: MapPin },
    { id: "attraction", name: "Attrazioni", icon: Star },
    { id: "restaurant", name: "Ristoranti", icon: Utensils },
    { id: "shop", name: "Negozi", icon: ShoppingBag },
    { id: "service", name: "Servizi", icon: Car },
  ]

  const filteredLocations = mapLocations.filter((location) => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || location.type === selectedCategory
    return matchesSearch && matchesCategory
  })

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
      default:
        return "bg-gray-500"
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Mappa del Parco</h1>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Navigation className="w-4 h-4" />
              <span>La Mia Posizione</span>
            </Button>
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
                <CardTitle className="text-lg">Cerca Località</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cerca attrazioni, ristoranti..."
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
                <CardTitle className="text-lg">Categorie</CardTitle>
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
                <CardTitle className="text-lg">Legenda</CardTitle>
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Mappa Interattiva</span>
                  <Badge variant="outline">{filteredLocations.length} località trovate</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="relative w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
                  {/* Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 opacity-30"></div>

                  {/* Paths */}
                  <svg className="absolute inset-0 w-full h-full">
                    <path
                      d="M 50 50 Q 200 100 400 200 T 600 300"
                      stroke="#8B5CF6"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="5,5"
                      opacity="0.6"
                    />
                    <path d="M 100 100 L 500 400" stroke="#10B981" strokeWidth="2" fill="none" opacity="0.4" />
                  </svg>

                  {/* Location Markers */}
                  {filteredLocations.map((location) => {
                    const IconComponent = getLocationIcon(location.type)
                    return (
                      <div
                        key={location.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{
                          left: `${location.x}%`,
                          top: `${location.y}%`,
                        }}
                      >
                        <div
                          className={`w-8 h-8 ${getLocationColor(location.type)} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            <div className="font-semibold">{location.name}</div>
                            {location.waitTime !== undefined && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{location.waitTime} min</span>
                              </div>
                            )}
                            {location.status === "maintenance" && <div className="text-red-300">Manutenzione</div>}
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Entrance */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
                      🎪 INGRESSO PRINCIPALE
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location List */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Elenco Località</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredLocations.map((location) => {
                    const IconComponent = getLocationIcon(location.type)
                    return (
                      <div key={location.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 ${getLocationColor(location.type)} rounded-full flex items-center justify-center`}
                          >
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{location.name}</h4>
                            <p className="text-sm text-gray-600 capitalize">{location.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {location.waitTime !== undefined && location.status !== "maintenance" && (
                            <Badge variant="secondary">{location.waitTime} min</Badge>
                          )}
                          {location.status === "maintenance" && <Badge variant="destructive">Manutenzione</Badge>}
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
    </div>
  )
}
