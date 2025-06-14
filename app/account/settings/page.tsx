"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Moon, Sun, Bell, Shield, Smartphone, Download } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import { useTheme } from "@/lib/contexts/theme-context"
import { useLanguage } from "@/lib/contexts/language-context"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { toast } = useToast()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Devi effettuare l'accesso per vedere le impostazioni</p>
            <Button asChild className="mt-4">
              <Link href="/">Torna alla Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleNotificationChange = (type: string, value: boolean) => {
    updateProfile({
      preferences: {
        ...user.preferences,
        [type]: value,
      },
    })
    toast({
      title: "Impostazioni aggiornate",
      description: "Le tue preferenze sono state salvate.",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href="/">← Torna alla Home</Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Impostazioni</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Appearance */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sun className="w-5 h-5" />
                <span>Aspetto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tema</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Scegli tra tema chiaro e scuro</p>
                </div>
                <Select value={theme} onValueChange={(value: "light" | "dark") => setTheme(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center space-x-2">
                        <Sun className="w-4 h-4" />
                        <span>Chiaro</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center space-x-2">
                        <Moon className="w-4 h-4" />
                        <span>Scuro</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lingua</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Seleziona la lingua dell'interfaccia</p>
                </div>
                <Select value={language} onValueChange={(value: "it" | "en") => setLanguage(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">
                      <div className="flex items-center space-x-2">
                        <span>🇮🇹</span>
                        <span>Italiano</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="en">
                      <div className="flex items-center space-x-2">
                        <span>🇬🇧</span>
                        <span>English</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifiche</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifiche push</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ricevi notifiche su tempi di attesa e aggiornamenti
                  </p>
                </div>
                <Switch
                  checked={user.preferences?.notifications || false}
                  onCheckedChange={(checked) => handleNotificationChange("notifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Newsletter</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ricevi aggiornamenti via email su eventi e offerte
                  </p>
                </div>
                <Switch
                  checked={user.preferences?.newsletter || false}
                  onCheckedChange={(checked) => handleNotificationChange("newsletter", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifiche attrazioni</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avvisi quando i tempi di attesa si riducono
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifiche spettacoli</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Promemoria per gli spettacoli nel tuo planner
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Offerte speciali</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notifiche per sconti e promozioni esclusive
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacy e Sicurezza</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Condivisione dati analytics</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Aiutaci a migliorare l'app condividendo dati anonimi
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Localizzazione</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Permetti all'app di accedere alla tua posizione
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Profilo pubblico</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rendi visibili le tue recensioni e valutazioni
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Gestisci dati personali
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Scarica i tuoi dati
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Richiedi cancellazione dati
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>Impostazioni App</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Download automatico mappe</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scarica automaticamente le mappe per uso offline
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aggiornamenti automatici</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aggiorna automaticamente i tempi di attesa</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modalità risparmio dati</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Riduci l'uso dei dati mobili</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cache immagini</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Salva le immagini per un caricamento più veloce
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">245 MB</span>
                  <Button variant="outline" size="sm">
                    Svuota
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Versione app</span>
                  <span className="text-sm text-gray-600">2.1.0</span>
                </div>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Controlla aggiornamenti
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Supporto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Centro assistenza
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Contatta il supporto
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Segnala un problema
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Valuta l'app
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
