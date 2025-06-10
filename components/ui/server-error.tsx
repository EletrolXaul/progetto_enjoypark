import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import Image from "next/image"

interface ServerErrorProps {
  title?: string
  message?: string
  showRetry?: boolean
  onRetry?: () => void
  variant?: "full" | "inline"
  suggestions?: string[]
}

export function ServerError({
  title = "Servizio Temporaneamente Non Disponibile",
  message = "Il server del parco è attualmente offline. Riprova tra qualche minuto.",
  showRetry = true,
  onRetry,
  variant = "full"
}: ServerErrorProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  if (variant === "inline") {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <WifiOff className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                {title}
              </h3>
              <p className="text-red-600 dark:text-red-300 mt-1">
                {message}
              </p>
            </div>
            {showRetry && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Riprova
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-6">
          {/* Logo del sito */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">EP</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              EnjoyPark
            </h1>
          </div>

          {/* Icona di errore */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
              <WifiOff className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Messaggio di errore */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Suggerimenti */}
          <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">Cosa puoi fare:</p>
            <ul className="text-left space-y-1">
              <li>• Controlla la tua connessione internet</li>
              <li>• Riprova tra qualche minuto</li>
              <li>• Contatta il supporto se il problema persiste</li>
            </ul>
          </div>

          {/* Pulsanti di azione */}
          {showRetry && (
            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Riprova
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Torna alla Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}