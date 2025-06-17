import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { ThemeProvider } from "@/lib/contexts/theme-context"
import { LanguageProvider } from "@/lib/contexts/language-context"
import { PlannerProvider } from "@/lib/contexts/PlannerContext"
import { Header } from "@/components/layout/header"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EnjoyPark - Il Tuo Parco Divertimenti",
  description: "Vivi un'esperienza magica nel nostro parco divertimenti. Pianifica la tua giornata perfetta!",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <PlannerProvider>
              <LanguageProvider>
                <div className="min-h-screen bg-background">
                  <Header />
                  <main>{children}</main>
                  <Toaster />
                </div>
              </LanguageProvider>
            </PlannerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}