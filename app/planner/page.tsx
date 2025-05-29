"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type ItemType = "attraction" | "show"

interface Item {
  id: string
  name: string
  type: ItemType
  location: string
}

const initialItems: Item[] = [
  {
    id: "1",
    name: "Colosseum",
    type: "attraction",
    location: "Rome, Italy",
  },
  {
    id: "2",
    name: "Uffizi Gallery",
    type: "attraction",
    location: "Florence, Italy",
  },
  {
    id: "3",
    name: "The Lion King",
    type: "show",
    location: "London, UK",
  },
]

export default function PlannerPage() {
  const [items, setItems] = useState<Item[]>([])
  const [newItem, setNewItem] = useState<Omit<Item, "id">>({
    name: "",
    type: "attraction",
    location: "",
  })

  const addItem = () => {
    setItems([...items, { ...newItem, id: String(Date.now()) }])
    setNewItem({ name: "", type: "attraction", location: "" })
  }

  const suggestedItems = initialItems.filter(
    (item) => !items.find((existingItem) => existingItem.name === item.name && existingItem.location === item.location),
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href="/">← Torna alla Home</Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Planner Giornaliero</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Aggiungi Attività</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Nome
              </label>
              <input
                type="text"
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Tipo
              </label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="attraction">Attrazione</option>
                <option value="show">Spettacolo</option>
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Luogo
              </label>
              <input
                type="text"
                id="location"
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <Button onClick={addItem} className="mt-4">
            Aggiungi
          </Button>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Il Mio Itinerario</h2>
          {items.length === 0 ? (
            <div className="p-4 rounded-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nessuna attività pianificata</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Aggiungi attrazioni e spettacoli per creare il tuo itinerario perfetto
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-sm">
                      {item.type === "attraction" ? "A" : "S"}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{item.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Suggerimenti</h2>
          <div className="space-y-3">
            {suggestedItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{item.location}</p>
                </div>
                <Button size="sm" onClick={() => setItems([...items, { ...item, id: String(Date.now()) }])}>
                  Aggiungi
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
