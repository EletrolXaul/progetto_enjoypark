"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  Calendar,
  Ticket,
  Star,
  Users,
  TrendingUp,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/language-context";
import { useAuth } from "@/lib/contexts/auth-context";

export default function HomePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [currentTime] = useState(new Date());

  const quickStats = [
    {
      label: t("stats.attractions.open"),
      value: "24/28",
      icon: Star,
      color: "text-blue-600",
    },
    {
      label: t("stats.wait.time"),
      value: "15 min",
      icon: Clock,
      color: "text-green-600",
    },
    {
      label: t("stats.visitors.today"),
      value: "12,450",
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: t("stats.shows.today"),
      value: "8",
      icon: Calendar,
      color: "text-orange-600",
    },
  ];

  const featuredAttractions = [
    {
      name: "Dragon Coaster",
      waitTime: 25,
      category: "Montagne Russe",
      status: "open",
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Splash Adventure",
      waitTime: 15,
      category: "Acquatiche",
      status: "open",
      rating: 4.6,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Magic Castle",
      waitTime: 30,
      category: "Famiglia",
      status: "open",
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300",
    },
  ];

  const upcomingShows = [
    {
      name: "Spettacolo dei Pirati",
      time: "14:30",
      venue: "Teatro Centrale",
      image: "/placeholder.svg?height=150&width=200",
    },
    {
      name: "Parata Magica",
      time: "16:00",
      venue: "Via Principale",
      image: "/placeholder.svg?height=150&width=200",
    },
    {
      name: "Show delle Luci",
      time: "20:00",
      venue: "Piazza del Castello",
      image: "/placeholder.svg?height=150&width=200",
    },
  ];

  const personalizedRecommendations = user
    ? [
        {
          name: "Thunder Mountain",
          reason: "Basato sui tuoi gusti per le montagne russe",
          waitTime: 20,
        },
        {
          name: "Virtual Reality Experience",
          reason: "Nuova attrazione che potrebbe piacerti",
          waitTime: 35,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {user
              ? `Bentornato, ${user.name.split(" ")[0]}!`
              : t("home.welcome")}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("home.subtitle")}
          </p>
          {user && (
            <div className="mt-4 flex items-center justify-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Ultima visita:{" "}
                {Array.isArray(user.visitHistory) &&
                user.visitHistory.length > 0
                  ? user.visitHistory[0].date
                  : "Prima volta"}
              </span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {quickStats.map((stat, index) => (
            <Card
              key={`stat-${stat.label}`} // Usa una chiave basata sui dati invece dell'indice
              className="text-center hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700"
            >
              <CardContent className="pt-6">
                <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Personalized Recommendations */}
        {user && personalizedRecommendations.length > 0 && (
          <Card className="mb-8 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Raccomandazioni per Te</span>
              </CardTitle>
              <CardDescription>
                Basate sui tuoi gusti e visite precedenti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {personalizedRecommendations.map((rec, index) => (
                  <div
                    key={`rec-${rec.name}`} // Usa una chiave basata sui dati invece dell'indice
                    className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {rec.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rec.reason}
                      </p>
                    </div>
                    <Badge variant="secondary">{rec.waitTime} min</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Navigation */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/map">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full group dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 group-hover:text-blue-600 transition-colors">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <span>Mappa Interattiva</span>
                </CardTitle>
                <CardDescription>
                  Esplora il parco con la nostra mappa dettagliata
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/attractions">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full group dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 group-hover:text-purple-600 transition-colors">
                  <Star className="w-6 h-6 text-purple-600" />
                  <span>Attrazioni</span>
                </CardTitle>
                <CardDescription>
                  Scopri tutte le attrazioni e i tempi di attesa
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/shows">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full group dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 group-hover:text-green-600 transition-colors">
                  <Calendar className="w-6 h-6 text-green-600" />
                  <span>Spettacoli</span>
                </CardTitle>
                <CardDescription>
                  Calendario completo degli spettacoli
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/planner">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full group dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 group-hover:text-orange-600 transition-colors">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <span>Planner Giornaliero</span>
                </CardTitle>
                <CardDescription>
                  Crea il tuo itinerario personalizzato
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/tickets">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full group dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 group-hover:text-red-600 transition-colors">
                  <Ticket className="w-6 h-6 text-red-600" />
                  <span>Biglietti</span>
                </CardTitle>
                <CardDescription>
                  Acquista i tuoi biglietti online
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/info">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full group dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 group-hover:text-teal-600 transition-colors">
                  <Clock className="w-6 h-6 text-teal-600" />
                  <span>Orari & Info</span>
                </CardTitle>
                <CardDescription>
                  Orari di apertura e informazioni utili
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Featured Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Featured Attractions */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Attrazioni in Evidenza</CardTitle>
              <CardDescription>
                Le attrazioni più popolari di oggi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featuredAttractions.map((attraction, index) => (
                  <div
                    key={`attr-${attraction.name}`} // Usa una chiave basata sui dati invece dell'indice
                    className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <img
                      src={attraction.image || "/placeholder.svg"}
                      alt={attraction.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {attraction.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">
                              {attraction.rating}
                            </span>
                          </div>
                          {user && (
                            <Button variant="ghost" size="sm">
                              <Heart className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {attraction.category}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {attraction.waitTime} min
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full mt-4">
                <Link href="/attractions">Vedi Tutte le Attrazioni</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Shows */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Prossimi Spettacoli</CardTitle>
              <CardDescription>
                Non perdere questi fantastici show
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingShows.map((show, index) => (
                  <div
                    key={`show-${show.name}-${show.time}`} // Usa una chiave basata sui dati invece dell'indice
                    className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <img
                      src={show.image || "/placeholder.svg"}
                      alt={show.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {show.name}
                        </h4>
                        <Badge variant="outline">{show.time}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {show.venue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full mt-4">
                <Link href="/shows">Vedi Tutti gli Spettacoli</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
