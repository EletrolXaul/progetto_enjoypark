"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Navigation, Clock, Star, Utensils, ShoppingBag, Car } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/contexts/language-context"

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { t } = useLanguage()

  // Expanded locations with more attractions, restaurants, shops, and services
  const mapLocations = [
    // Attractions
    { id: 1, name: t("location.dragon.coaster"), type: "attraction", category: "thrill", x: 30, y: 20, waitTime: 25 },
    { id: 2, name: t("location.splash.adventure"), type: "attraction", category: "water", x: 60, y: 40, waitTime: 15 },
    { id: 3, name: t("location.magic.castle"), type: "attraction", category: "family", x: 45, y: 60, waitTime: 30 },
    {
      id: 4,
      name: t("location.space.mission"),
      type: "attraction",
      category: "simulator",
      x: 70,
      y: 25,
      waitTime: 0,
      status: "maintenance",
    },
    { id: 5, name: t("location.fairy.tale"), type: "attraction", category: "family", x: 25, y: 45, waitTime: 10 },
    { id: 6, name: t("location.thunder.mountain"), type: "attraction", category: "thrill", x: 75, y: 65, waitTime: 45 },
    { id: 7, name: t("location.pirate.ship"), type: "attraction", category: "adventure", x: 35, y: 75, waitTime: 20 },
    { id: 8, name: t("location.vr.experience"), type: "attraction", category: "simulator", x: 65, y: 15, waitTime: 35 },
    { id: 9, name: t("location.carousel"), type: "attraction", category: "family", x: 40, y: 35, waitTime: 5 },
    { id: 10, name: t("location.ferris.wheel"), type: "attraction", category: "family", x: 80, y: 45, waitTime: 12 },
    { id: 11, name: t("location.bumper.cars"), type: "attraction", category: "family", x: 20, y: 65, waitTime: 8 },
    { id: 12, name: t("location.haunted.house"), type: "attraction", category: "thrill", x: 55, y: 80, waitTime: 22 },
    { id: 13, name: t("location.log.flume"), type: "attraction", category: "water", x: 15, y: 30, waitTime: 18 },
    { id: 14, name: t("location.spinning.cups"), type: "attraction", category: "family", x: 85, y: 30, waitTime: 6 },
    { id: 15, name: t("location.sky.tower"), type: "attraction", category: "adventure", x: 50, y: 10, waitTime: 15 },

    // Restaurants
    { id: 16, name: t("restaurant.centrale"), type: "restaurant", category: "dining", x: 50, y: 50 },
    { id: 17, name: t("restaurant.pizza.corner"), type: "restaurant", category: "dining", x: 25, y: 70 },
    { id: 18, name: t("restaurant.burger.palace"), type: "restaurant", category: "dining", x: 70, y: 55 },
    { id: 19, name: t("restaurant.ice.cream"), type: "restaurant", category: "dining", x: 45, y: 25 },
    { id: 20, name: t("restaurant.snack.bar"), type: "restaurant", category: "dining", x: 30, y: 85 },
    { id: 21, name: t("restaurant.cafe.magic"), type: "restaurant", category: "dining", x: 75, y: 35 },
    { id: 22, name: t("restaurant.food.court"), type: "restaurant", category: "dining", x: 55, y: 65 },
    { id: 23, name: t("restaurant.candy.shop"), type: "restaurant", category: "dining", x: 40, y: 15 },

    // Shops
    { id: 24, name: t("shop.gift.main"), type: "shop", category: "shopping", x: 40, y: 30 },
    { id: 25, name: t("shop.souvenirs"), type: "shop", category: "shopping", x: 60, y: 70 },
    { id: 26, name: t("shop.toys"), type: "shop", category: "shopping", x: 35, y: 55 },
    { id: 27, name: t("shop.clothing"), type: "shop", category: "shopping", x: 65, y: 30 },
    { id: 28, name: t("shop.photo"), type: "shop", category: "shopping", x: 25, y: 55 },
    { id: 29, name: t("shop.magic"), type: "shop", category: "shopping", x: 75, y: 75 },

    // Services
    { id: 30, name: t("service.parking.north"), type: "service", category: "parking", x: 20, y: 10 },
    { id: 31, name: t("service.parking.south"), type: "service", category: "parking", x: 80, y: 80 },
    { id: 32, name: t("service.parking.vip"), type: "service", category: "parking", x: 10, y: 50 },
    { id: 33, name: t("service.first.aid"), type: "service", category: "medical", x: 55, y: 35 },
    { id: 34, name: t("service.info.center"), type: "service", category: "info", x: 45, y: 45 },
    { id: 35, name: t("service.lost.found"), type: "service", category: "info", x: 35, y: 40 },
    { id: 36, name: t("service.restrooms.main"), type: "service", category: "facilities", x: 50, y: 40 },
    { id: 37, name: t("service.restrooms.family"), type: "service", category: "facilities", x: 30, y: 60 },
    { id: 38, name: t("service.baby.care"), type: "service", category: "facilities", x: 65, y: 50 },
    { id: 39, name: t("service.wheelchair"), type: "service", category: "accessibility", x: 45, y: 35 },
    { id: 40, name: t("service.lockers"), type: "service", category: "facilities", x: 55, y: 45 },
    { id: 41, name: t("service.atm"), type: "service", category: "facilities", x: 40, y: 50 },
  ]

  const categories = [
    { id: "all", name: t("map.category.all"), icon: MapPin },
    { id: "attraction", name: t("map.category.attractions"), icon: Star },
    { id: "restaurant", name: t("map.category.restaurants"), icon: Utensils },
    { id: "shop", name: t("map.category.shops"), icon: ShoppingBag },
    { id: "service", name: t("map.category.services"), icon: Car },
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
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Navigation className="w-4 h-4" />
              <span>{t("map.my.location")}</span>
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
                    <span className="text-sm">{t("map.category.attractions")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{t("map.category.restaurants")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">{t("map.category.shops")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">{t("map.category.services")}</span>
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
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
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
                    {/* Decorative elements for theme park atmosphere */}
                    <div className="absolute top-4 left-4 text-2xl opacity-30">🎠</div>
                    <div className="absolute top-8 right-8 text-2xl opacity-30">🎡</div>
                    <div className="absolute bottom-8 left-8 text-2xl opacity-30">🎢</div>
                    <div className="absolute bottom-4 right-4 text-2xl opacity-30">🎪</div>
                    <div className="absolute top-1/2 left-1/4 text-xl opacity-20">🎭</div>
                    <div className="absolute top-1/3 right-1/3 text-xl opacity-20">🎨</div>
                    <div className="absolute bottom-1/3 left-1/2 text-xl opacity-20">🎯</div>

                    {/* Paths representing walkways */}
                    <svg className="absolute inset-0 w-full h-full">
                      <defs>
                        <pattern id="walkway" patternUnits="userSpaceOnUse" width="4" height="4">
                          <rect width="4" height="4" fill="rgba(156, 163, 175, 0.2)" />
                          <circle cx="2" cy="2" r="0.5" fill="rgba(75, 85, 99, 0.3)" />
                        </pattern>
                      </defs>

                      {/* Main walkway paths */}
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
                      <path
                        d="M 150 50 L 150 450 M 50 150 L 650 150 M 50 350 L 650 350"
                        stroke="url(#walkway)"
                        strokeWidth="4"
                        fill="none"
                        opacity="0.4"
                      />
                    </svg>
                  </div>

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
                          className={`w-8 h-8 ${getLocationColor(location.type)} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border-2 border-white`}
                        >
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap max-w-48">
                            <div className="font-semibold">{location.name}</div>
                            {location.waitTime !== undefined && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {location.waitTime} {t("common.minutes")}
                                </span>
                              </div>
                            )}
                            {location.status === "maintenance" && (
                              <div className="text-red-300">{t("common.maintenance")}</div>
                            )}
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
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
                    return (
                      <div
                        key={location.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 ${getLocationColor(location.type)} rounded-full flex items-center justify-center`}
                          >
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{location.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{location.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {location.waitTime !== undefined && location.status !== "maintenance" && (
                            <Badge variant="secondary">
                              {location.waitTime} {t("common.minutes")}
                            </Badge>
                          )}
                          {location.status === "maintenance" && (
                            <Badge variant="destructive">{t("common.maintenance")}</Badge>
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
    </div>
  )
}
