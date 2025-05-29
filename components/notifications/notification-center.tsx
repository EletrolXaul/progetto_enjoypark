"use client"

import { useState } from "react"
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
import { Bell, Clock, Star, Gift, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/lib/contexts/language-context"

interface Notification {
  id: string
  type: "info" | "warning" | "success" | "promotion"
  title: string
  message: string
  time: string
  read: boolean
}

export function NotificationCenter() {
  const { t } = useLanguage()
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "warning",
      title: "Manutenzione Space Mission",
      message: "L'attrazione Space Mission sarà chiusa per manutenzione dalle 14:00 alle 16:00",
      time: "10 min fa",
      read: false,
    },
    {
      id: "2",
      type: "success",
      title: "Tempi di attesa ridotti",
      message: "Dragon Coaster ora ha solo 15 minuti di attesa!",
      time: "25 min fa",
      read: false,
    },
    {
      id: "3",
      type: "promotion",
      title: "Offerta speciale",
      message: "Sconto 20% sui biglietti premium fino a mezzanotte",
      time: "1 ora fa",
      read: true,
    },
    {
      id: "4",
      type: "info",
      title: "Nuovo spettacolo",
      message: "Non perdere il nuovo spettacolo delle luci alle 20:00",
      time: "2 ore fa",
      read: true,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "success":
        return <Star className="w-4 h-4 text-green-500" />
      case "promotion":
        return <Gift className="w-4 h-4 text-purple-500" />
      default:
        return <Clock className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifiche</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Segna tutte come lette
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nessuna notifica</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start space-x-3 p-3 cursor-pointer ${
                  !notification.read ? "bg-blue-50 dark:bg-blue-950" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{notification.title}</p>
                    {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
