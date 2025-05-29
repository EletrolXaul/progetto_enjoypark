"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { QRValidator } from "@/components/qr-validator"

export default function QRValidatorPage() {
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Validatore QR Code</h1>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sistema di controllo accessi</div>
          </div>
        </div>
      </header>

      <div className="py-8">
        <QRValidator />
      </div>
    </div>
  )
}
