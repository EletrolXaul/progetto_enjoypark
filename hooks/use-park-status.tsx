import { useState, useEffect } from "react"

export function useParkStatus() {
  const [openingHours] = useState([
    { day: "Lunedì", hours: "Chiuso", status: "" },
    { day: "Martedì", hours: "10:00 - 18:00", status: "" },
    { day: "Mercoledì", hours: "10:00 - 18:00", status: "" },
    { day: "Giovedì", hours: "10:00 - 20:00", status: "" },
    { day: "Venerdì", hours: "10:00 - 22:00", status: "" },
    { day: "Sabato", hours: "10:00 - 22:00", status: "" },
    { day: "Domenica", hours: "10:00 - 18:00", status: "" },
  ])

  const [currentDaySchedule, setCurrentDaySchedule] = useState<{ day: string; hours: string; status: string } | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Funzione per ottenere il giorno corrente
  const getCurrentDay = () => {
    const today = new Date()
    const dayIndex = today.getDay() // 0 = Domenica, 1 = Lunedì, etc.

    const dayNames = [
      "Domenica", // 0
      "Lunedì", // 1
      "Martedì", // 2
      "Mercoledì", // 3
      "Giovedì", // 4
      "Venerdì", // 5
      "Sabato", // 6
    ]

    return dayNames[dayIndex]
  }

  // Funzione per determinare se il parco è aperto ora
  const checkIfParkIsOpen = () => {
    const now = new Date()
    const currentTime = now.getHours() * 100 + now.getMinutes() // Formato HHMM
    const currentDay = getCurrentDay()

    // Trova gli orari di oggi
    const todaySchedule = openingHours.find((schedule) => schedule.day === currentDay)
    setCurrentDaySchedule(todaySchedule || null)

    if (!todaySchedule || todaySchedule.hours === "Chiuso") {
      setIsOpen(false)
      return
    }

    // Estrai gli orari di apertura e chiusura
    const hoursMatch = todaySchedule.hours.match(/(\d{2}):(\d{2}) - (\d{2}):(\d{2})/)
    if (!hoursMatch) {
      setIsOpen(false)
      return
    }

    const openTime = Number.parseInt(hoursMatch[1]) * 100 + Number.parseInt(hoursMatch[2])
    const closeTime = Number.parseInt(hoursMatch[3]) * 100 + Number.parseInt(hoursMatch[4])

    setIsOpen(currentTime >= openTime && currentTime <= closeTime)
  }

  useEffect(() => {
    // Controlla subito
    checkIfParkIsOpen()

    // Aggiorna ogni minuto
    const interval = setInterval(checkIfParkIsOpen, 60000)

    return () => clearInterval(interval)
  }, [])

  return { isOpen, currentDaySchedule }
}