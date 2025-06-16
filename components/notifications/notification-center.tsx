"use client"

import { useState, useEffect } from "react"
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
import axios from "axios"

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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Per ora, genera notifiche dinamiche basate su dati reali
        const response = await axios.get('http://127.0.0.1:8000/api/park/all')
        const parkData = response.data
        
        const dynamicNotifications: Notification[] = []
        
        // Genera notifiche basate sui tempi di attesa
        parkData.attractions?.forEach((attraction: any) => {
          if (attraction.wait_time && attraction.wait_time < 20) {
            dynamicNotifications.push({
              id: `wait-${attraction.id}`,
              type: "success",
              title: "Tempi di attesa ridotti",
              message: `${attraction.name} ora ha solo ${attraction.wait_time} minuti di attesa!`,
              time: "Ora",
              read: false,
            })
          }
        })
        
        // Aggiungi notifiche per spettacoli imminenti
        parkData.shows?.forEach((show: any) => {
          const showTime = new Date(show.next_show_time)
          const now = new Date()
          const timeDiff = showTime.getTime() - now.getTime()
          const minutesDiff = Math.floor(timeDiff / (1000 * 60))
          
          if (minutesDiff > 0 && minutesDiff <= 30) {
            dynamicNotifications.push({
              id: `show-${show.id}`,
              type: "info",
              title: "Spettacolo imminente",
              message: `${show.name} inizia tra ${minutesDiff} minuti`,
              time: `${minutesDiff} min`,
              read: false,
            })
          }
        })
        
        setNotifications(dynamicNotifications)
      } catch (error) {
        console.error('Errore nel caricamento notifiche:', error)
        // Fallback alle notifiche statiche in caso di errore
        setNotifications([
          {
            id: "1",
            type: "info",
            title: "Sistema notifiche",
            message: "Le notifiche dinamiche non sono disponibili",
            time: "Ora",
            read: false,
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
    
    // Aggiorna le notifiche ogni 5 minuti
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

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
