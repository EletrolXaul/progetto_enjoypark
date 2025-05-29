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

  // Locations positioned more accurately based on the park map zones
  const mapLocations = [
    // ADVENTURE ZONE (Top Left - Green area with roller coaster, pyramid, pirate ship)
    { id: 1, name: t("location.dragon.coaster"), type: "attraction", zone: "adventure", x: 18, y: 12, waitTime: 25 },
    { id: 2, name: t("location.pyramid.adventure"), type: "attraction", zone: "adventure", x: 25, y: 18, waitTime: 20 },
    { id: 3, name: t("location.pirate.ship"), type: "attraction", zone: "adventure", x: 15, y: 25, waitTime: 15 },
    { id: 4, name: t("location.jungle.cruise"), type: "attraction", zone: "adventure", x: 12, y: 20, waitTime: 18 },
    { id: 5, name: t("location.treasure.hunt"), type: "attraction", zone: "adventure", x: 22, y: 25, waitTime: 12 },
    { id: 6, name: t("restaurant.pirate.tavern"), type: "restaurant", zone: "adventure", x: 20, y: 22 },
    { id: 7, name: t("restaurant.jungle.cafe"), type: "restaurant", zone: "adventure", x: 16, y: 28 },
    { id: 8, name: t("shop.adventure.gear"), type: "shop", zone: "adventure", x: 19, y: 15 },
    { id: 9, name: t("shop.treasure.chest"), type: "shop", zone: "adventure", x: 23, y: 22 },
    { id: 10, name: t("service.first.aid"), type: "service", zone: "adventure", x: 17, y: 19 },

    // FANTASY ZONE (Top Right - Purple area with castle)
    { id: 11, name: t("location.magic.castle"), type: "attraction", zone: "fantasy", x: 78, y: 15, waitTime: 30 },
    { id: 12, name: t("location.fairy.tale"), type: "attraction", zone: "fantasy", x: 72, y: 12, waitTime: 10 },
    { id: 13, name: t("location.dragon.tower"), type: "attraction", zone: "fantasy", x: 82, y: 18, waitTime: 22 },
    { id: 14, name: t("location.enchanted.carousel"), type: "attraction", zone: "fantasy", x: 75, y: 22, waitTime: 8 },
    { id: 15, name: t("location.unicorn.ride"), type: "attraction", zone: "fantasy", x: 80, y: 25, waitTime: 14 },
    { id: 16, name: t("location.magic.show"), type: "attraction", zone: "fantasy", x: 76, y: 28, waitTime: 0 },
    { id: 17, name: t("restaurant.royal.feast"), type: "restaurant", zone: "fantasy", x: 74, y: 20 },
    { id: 18, name: t("restaurant.magic.treats"), type: "restaurant", zone: "fantasy", x: 79, y: 22 },
    { id: 19, name: t("shop.magic.wands"), type: "shop", zone: "fantasy", x: 77, y: 17 },
    { id: 20, name: t("shop.princess.boutique"), type: "shop", zone: "fantasy", x: 81, y: 20 },
    { id: 21, name: t("service.info.center"), type: "service", zone: "fantasy", x: 75, y: 25 },

    // SPACE ZONE (Bottom Left - Blue area with rocket)
    { id: 22, name: t("location.space.mission"), type: "attraction", zone: "space", x: 22, y: 78, waitTime: 35 },
    { id: 23, name: t("location.rocket.launch"), type: "attraction", zone: "space", x: 18, y: 75, waitTime: 28 },
    { id: 24, name: t("location.alien.encounter"), type: "attraction", zone: "space", x: 25, y: 82, waitTime: 25 },
    { id: 25, name: t("location.galaxy.spinner"), type: "attraction", zone: "space", x: 20, y: 80, waitTime: 12 },
    { id: 26, name: t("location.mars.explorer"), type: "attraction", zone: "space", x: 16, y: 78, waitTime: 18 },
    { id: 27, name: t("restaurant.space.diner"), type: "restaurant", zone: "space", x: 22, y: 75 },
    { id: 28, name: t("restaurant.cosmic.cafe"), type: "restaurant", zone: "space", x: 19, y: 83 },
    { id: 29, name: t("shop.space.gear"), type: "shop", zone: "space", x: 24, y: 79 },
    { id: 30, name: t("shop.alien.souvenirs"), type: "shop", zone: "space", x: 17, y: 81 },
    { id: 31, name: t("service.space.station"), type: "service", zone: "space", x: 21, y: 77 },

    // WESTERN ZONE (Bottom Right - Yellow/desert area with western buildings)
    { id: 32, name: t("location.wild.west.coaster"), type: "attraction", zone: "western", x: 78, y: 75, waitTime: 30 },
    { id: 33, name: t("location.sheriff.showdown"), type: "attraction", zone: "western", x: 75, y: 78, waitTime: 15 },
    { id: 34, name: t("location.gold.mine.ride"), type: "attraction", zone: "western", x: 82, y: 80, waitTime: 20 },
    { id: 35, name: t("location.horse.carousel"), type: "attraction", zone: "western", x: 80, y: 75, waitTime: 6 },
    { id: 36, name: t("location.stagecoach.ride"), type: "attraction", zone: "western", x: 76, y: 82, waitTime: 10 },
    { id: 37, name: t("restaurant.saloon"), type: "restaurant", zone: "western", x: 77, y: 77 },
    { id: 38, name: t("restaurant.bbq.ranch"), type: "restaurant", zone: "western", x: 81, y: 78 },
    { id: 39, name: t("shop.western.store"), type: "shop", zone: "western", x: 79, y: 80 },
    { id: 40, name: t("shop.cowboy.gear"), type: "shop", zone: "western", x: 75, y: 80 },
    { id: 41, name: t("service.sheriff.office"), type: "service", zone: "western", x: 78, y: 82 },

    // CENTRAL AREA (Services and main facilities along the paths)
    { id: 42, name: t("service.main.entrance"), type: "service", zone: "central", x: 50, y: 92 },
    { id: 43, name: t("restaurant.central.plaza"), type: "restaurant", zone: "central", x: 50, y: 50 },
    { id: 44, name: t("shop.gift.main"), type: "shop", zone: "central", x: 48, y: 52 },
    { id: 45, name: t("service.lost.found"), type: "service", zone: "central", x: 52, y: 48 },
    { id: 46, name: t("service.restrooms.main"), type: "service", zone: "central", x: 50, y: 45 },
    { id: 47, name: t("service.parking.main"), type: "service", zone: "central", x: 50, y: 88 },
    { id: 48, name: t("service.atm"), type: "service", zone: "central", x: 48, y: 48 },
    { id: 49, name: t("service.baby.care"), type: "service", zone: "central", x: 52, y: 52 },
  ]

  const categories = [
    { id: "all", name: t("map.category.all"), icon: MapPin },
    { id: "attraction", name: t("map.category.attractions"), icon: Star },
    { id: "restaurant", name: t("map.category.restaurants"), icon: Utensils },
    { id: "shop", name: t("map.category.shops"), icon: ShoppingBag },
    { id: "service", name: t("map.category.services"), icon: Car },
  ]

  const zones = [
    { id: "adventure", name: t("zones.adventure"), color: "bg-green-500" },
    { id: "fantasy", name: t("zones.fantasy"), color: "bg-purple-500" },
    { id: "space", name: t("zones.space"), color: "bg-blue-500" },
    { id: "western", name: t("zones.western"), color: "bg-yellow-500" },
    { id: "central", name: t("zones.central"), color: "bg-gray-500" },
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
        return "bg-red-500"
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

            {/* Zones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("map.zones")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {zones.map((zone) => (
                    <div key={zone.id} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 ${zone.color} rounded-full`}></div>
                      <span className="text-sm">{zone.name}</span>
                    </div>
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
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
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
            <Card className="h-[700px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t("map.interactive")}</span>
                  <Badge variant="outline">
                    {filteredLocations.length} {t("map.locations.found")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-2">
                <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  {/* Enhanced Park Map Background */}
                  <div className="absolute inset-0">
                    <img
                      src="/images/parkmap.png"
                      alt="EnjoyPark Map"
                      className="w-full h-full object-cover brightness-110 contrast-105 saturate-110"
                    />
                    {/* Subtle overlay to enhance contrast without darkening too much */}
                    <div className="absolute inset-0 bg-white bg-opacity-5"></div>
                  </div>

                  {/* Location Markers with enhanced visibility */}
                  {filteredLocations.map((location) => {
                    const IconComponent = getLocationIcon(location.type)
                    return (
                      <div
                        key={location.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                        style={{
                          left: `${location.x}%`,
                          top: `${location.y}%`,
                        }}
                      >
                        {/* Marker with enhanced shadow and border */}
                        <div
                          className={`w-10 h-10 ${getLocationColor(location.type)} rounded-full flex items-center justify-center shadow-xl group-hover:scale-125 transition-all duration-200 border-3 border-white ring-2 ring-black ring-opacity-20`}
                        >
                          <IconComponent className="w-5 h-5 text-white drop-shadow-sm" />
                        </div>

                        {/* Enhanced Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap max-w-64 shadow-xl border border-gray-700">
                            <div className="font-bold text-yellow-300">{location.name}</div>
                            <div className="text-gray-300 text-xs capitalize mb-1">{location.type}</div>
                            {location.waitTime !== undefined && (
                              <div className="flex items-center space-x-1 text-green-300">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs">
                                  {location.waitTime} {t("common.minutes")}
                                </span>
                              </div>
                            )}
                            {location.status === "maintenance" && (
                              <div className="text-red-400 text-xs">{t("common.maintenance")}</div>
                            )}
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-6 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Enhanced Zone Labels with better visibility */}
                  <div className="absolute top-6 left-6 bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-white">
                    🌿 {t("zones.adventure")}
                  </div>
                  <div className="absolute top-6 right-6 bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-white">
                    🏰 {t("zones.fantasy")}
                  </div>
                  <div className="absolute bottom-6 left-6 bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-white">
                    🚀 {t("zones.space")}
                  </div>
                  <div className="absolute bottom-6 right-6 bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-white">
                    🤠 {t("zones.western")}
                  </div>

                  {/* Main Entrance Marker */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-xl border-2 border-white text-center">
                    🎪 {t("map.entrance")}
                    <div className="text-xs opacity-90">{t("map.welcome")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Location List */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t("map.location.list")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredLocations.map((location) => {
                    const IconComponent = getLocationIcon(location.type)
                    const zone = zones.find((z) => z.id === location.zone)
                    return (
                      <div
                        key={location.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 ${getLocationColor(location.type)} rounded-full flex items-center justify-center shadow-md`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{location.name}</h4>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{location.type}</p>
                              {zone && (
                                <Badge variant="outline" className="text-xs">
                                  {zone.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {location.waitTime !== undefined && location.status !== "maintenance" && (
                            <Badge variant="secondary" className="font-semibold">
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
