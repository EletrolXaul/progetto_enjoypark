"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { User, Settings, Heart, History, LogOut, Moon, Sun, Globe, Menu, Star } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useTheme } from "@/lib/contexts/theme-context"
import { useLanguage } from "@/lib/contexts/language-context"
import { LoginDialog } from "@/components/auth/login-dialog"
import { NotificationCenter } from "@/components/notifications/notification-center"

export function Header() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [showLogin, setShowLogin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationItems = [
    { href: "/", label: t("nav.home") },
    { href: "/map", label: t("nav.map") },
    { href: "/attractions", label: t("nav.attractions") },
    { href: "/shows", label: t("nav.shows") },
    { href: "/planner", label: t("nav.planner") },
    { href: "/tickets", label: t("nav.tickets") },
    { href: "/info", label: t("nav.info") },
  ]

  const getMembershipBadge = (membership: string) => {
    switch (membership) {
      case "premium":
        return <Badge className="bg-yellow-500">Premium</Badge>
      case "vip":
        return <Badge className="bg-purple-500">VIP</Badge>
      default:
        return <Badge variant="outline">Standard</Badge>
    }
  }

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EP</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EnjoyPark
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Park Status */}
              <Badge
                variant="outline"
                className="text-green-600 border-green-600 dark:text-green-400 dark:border-green-400 hidden sm:inline-flex"
              >
                {t("home.park.open")}
              </Badge>

              {/* Theme Toggle */}
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="hidden sm:inline-flex">
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>

              {/* Language Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    <Globe className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setLanguage("it")}
                    className={language === "it" ? "bg-gray-100 dark:bg-gray-800" : ""}
                  >
                    🇮🇹 {t("language.italian")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLanguage("en")}
                    className={language === "en" ? "bg-gray-100 dark:bg-gray-800" : ""}
                  >
                    🇬🇧 {t("language.english")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              {user && <NotificationCenter />}

              {/* User Menu or Login */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        <div className="pt-1">{getMembershipBadge(user.membership)}</div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>{t("account.profile")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/favorites">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>{t("account.favorites")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/history">
                        <History className="mr-2 h-4 w-4" />
                        <span>{t("account.history")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/membership">
                        <Star className="mr-2 h-4 w-4" />
                        <span>{t("account.membership")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t("account.settings")}</span>
                      </Link>
                    </DropdownMenuItem>
                    {user?.isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Dashboard Admin</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("account.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setShowLogin(true)} size="sm">
                  {t("account.login")}
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>Naviga nell'app EnjoyPark</SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-sm font-medium">{t("theme.toggle")}</span>
                        <Button variant="ghost" size="sm" onClick={toggleTheme}>
                          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div className="px-3 py-2">
                        <span className="text-sm font-medium block mb-2">{t("language.change")}</span>
                        <div className="space-y-1">
                          <Button
                            variant={language === "it" ? "default" : "ghost"}
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setLanguage("it")}
                          >
                            🇮🇹 {t("language.italian")}
                          </Button>
                          <Button
                            variant={language === "en" ? "default" : "ghost"}
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setLanguage("en")}
                          >
                            🇬🇧 {t("language.english")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </>
  )
}
