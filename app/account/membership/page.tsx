"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Crown, Star, Gift, Calendar, Users, Zap, Check, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface MembershipTier {
  id: string
  name: string
  description: string
  price: number
  benefits: string[]
  color: string
  icon: React.ReactNode
}

interface UserMembership {
  tier: string
  startDate: string
  endDate: string
  visitsThisMonth: number
  totalVisits: number
  pointsEarned: number
  pointsToNextTier: number
  discountsUsed: number
}

export default function MembershipPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [membership, setMembership] = useState<UserMembership | null>(null)
  const [loading, setLoading] = useState(true)

  const membershipTiers: MembershipTier[] = [
    {
      id: "basic",
      name: "Basic",
      description: "Perfetto per visitatori occasionali",
      price: 0,
      benefits: [
        "Accesso al parco",
        "Mappa digitale",
        "Notifiche eventi"
      ],
      color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      icon: <Users className="h-5 w-5" />
    },
    {
      id: "premium",
      name: "Premium",
      description: "Per chi ama visitare il parco regolarmente",
      price: 29.99,
      benefits: [
        "Tutti i benefici Basic",
        "10% sconto su cibo e bevande",
        "Accesso prioritario alle attrazioni",
        "1 ospite gratuito al mese",
        "Parcheggio gratuito"
      ],
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      icon: <Star className="h-5 w-5" />
    },
    {
      id: "vip",
      name: "VIP",
      description: "L'esperienza definitiva per i veri appassionati",
      price: 59.99,
      benefits: [
        "Tutti i benefici Premium",
        "20% sconto su tutto",
        "Accesso VIP alle nuove attrazioni",
        "3 ospiti gratuiti al mese",
        "Concierge personale",
        "Eventi esclusivi",
        "Gift annuale"
      ],
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      icon: <Crown className="h-5 w-5" />
    }
  ]

  useEffect(() => {
    // Simula il caricamento dei dati membership
    const mockMembership: UserMembership = {
      tier: "premium",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      visitsThisMonth: 3,
      totalVisits: 15,
      pointsEarned: 1250,
      pointsToNextTier: 750,
      discountsUsed: 8
    }
    
    setTimeout(() => {
      setMembership(mockMembership)
      setLoading(false)
    }, 1000)
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Devi effettuare l'accesso per vedere la membership</p>
            <Button asChild className="mt-4">
              <Link href="/">Torna alla Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentTier = membershipTiers.find(tier => tier.id === membership?.tier)
  const nextTier = membershipTiers.find(tier => {
    const currentIndex = membershipTiers.findIndex(t => t.id === membership?.tier)
    return membershipTiers[currentIndex + 1]?.id === tier.id
  })

  const progressToNextTier = membership ? 
    ((membership.pointsEarned / (membership.pointsEarned + membership.pointsToNextTier)) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              La Mia Membership
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestisci il tuo abbonamento e scopri tutti i vantaggi
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stato Membership Attuale */}
              {membership && currentTier && (
                <Card className="border-2 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${currentTier.color}`}>
                          {currentTier.icon}
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Membership {currentTier.name}
                            <Badge className={currentTier.color}>Attiva</Badge>
                          </CardTitle>
                          <p className="text-gray-600 dark:text-gray-400">
                            Valida fino al {new Date(membership.endDate).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">
                        Rinnova
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {membership.visitsThisMonth}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Visite questo mese</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {membership.totalVisits}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Visite totali</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {membership.pointsEarned}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Punti guadagnati</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {membership.discountsUsed}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sconti utilizzati</p>
                      </div>
                    </div>

                    {nextTier && (
                      <div className="mt-6">
                        <Separator className="mb-4" />
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progresso verso {nextTier.name}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {membership.pointsToNextTier} punti rimanenti
                          </span>
                        </div>
                        <Progress value={progressToNextTier} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Tutti i Tier Disponibili */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Piani Membership Disponibili
                </h2>
                <div className="grid gap-6 lg:grid-cols-3">
                  {membershipTiers.map((tier) => (
                    <Card 
                      key={tier.id} 
                      className={`relative ${membership?.tier === tier.id ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      {membership?.tier === tier.id && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-500 text-white">
                            Piano Attuale
                          </Badge>
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-full ${tier.color}`}>
                            {tier.icon}
                          </div>
                          <div>
                            <CardTitle>{tier.name}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {tier.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-3xl font-bold">
                          {tier.price === 0 ? 'Gratuito' : `€${tier.price}/mese`}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 mb-6">
                          {tier.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className="w-full" 
                          variant={membership?.tier === tier.id ? 'outline' : 'default'}
                          disabled={membership?.tier === tier.id}
                        >
                          {membership?.tier === tier.id ? 'Piano Attuale' : 
                           tier.price === 0 ? 'Gratuito' : 'Upgrade'}
                          {membership?.tier !== tier.id && tier.price > 0 && (
                            <ArrowRight className="h-4 w-4 ml-2" />
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Vantaggi Esclusivi */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Vantaggi Esclusivi Membership
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Accesso Prioritario</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Salta le code nelle attrazioni più popolari
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Sconti Esclusivi</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Risparmia su cibo, bevande e souvenir
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                        <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Eventi Speciali</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Inviti a eventi esclusivi per membri
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}