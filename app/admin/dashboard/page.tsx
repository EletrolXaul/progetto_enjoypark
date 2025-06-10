"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ticket, Euro, TrendingUp, Search, Download, QrCode, Filter } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import axios from 'axios'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const response = await axios.get('http://127.0.0.1:8000/api/admin/orders', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('enjoypark-token')}`
          }
        })
        setOrders(response.data)
        setError(null)
      } catch (error) {
        console.error("Errore nel caricamento ordini:", error)
        setError("Impossibile caricare gli ordini. Verifica che il backend sia attivo.")
      } finally {
        setLoading(false)
      }
    }
    
    if (user?.isAdmin) {
      loadOrders()
    }
  }, [user])

  // Redirect se non admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Accesso riservato agli amministratori</p>
            <Button asChild className="mt-4">
              <Link href="/">Torna alla Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
    totalTickets: orders.reduce((sum, order) => sum + order.qrCodes.length, 0),
    todayOrders: orders.filter((order) => new Date(order.purchaseDate).toDateString() === new Date().toDateString())
      .length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confermato</Badge>
      case "used":
        return <Badge className="bg-blue-500">Utilizzato</Badge>
      case "expired":
        return <Badge variant="destructive">Scaduto</Badge>
      default:
        return <Badge variant="outline">In attesa</Badge>
    }
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/admin/qr-validator">
                  <QrCode className="w-4 h-4 mr-2" />
                  Validatore QR
                </Link>
              </Button>
              <Badge className="bg-purple-500">Admin</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Ticket className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ordini Totali</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Euro className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ricavi Totali</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">€{stats.totalRevenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <QrCode className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Biglietti Venduti</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTickets}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ordini Oggi</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList>
            <TabsTrigger value="orders">Gestione Ordini</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Impostazioni</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {/* Filters */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filtri</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cerca per ID, nome o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">Tutti gli stati</option>
                    <option value="confirmed">Confermati</option>
                    <option value="used">Utilizzati</option>
                    <option value="expired">Scaduti</option>
                  </select>

                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Esporta CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Ordini ({filteredOrders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <h4 className="font-semibold">{order.id}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(order.purchaseDate).toLocaleDateString("it-IT")}
                          </p>
                          {getStatusBadge(order.status)}
                        </div>

                        <div>
                          <p className="font-medium">{order.customerInfo.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerInfo.email}</p>
                          {order.customerInfo.phone && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerInfo.phone}</p>
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-lg">€{order.totalPrice}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{order.qrCodes.length} biglietti</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Visita: {new Date(order.visitDate).toLocaleDateString("it-IT")}
                          </p>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <Button size="sm" variant="outline">
                            <QrCode className="w-4 h-4 mr-2" />
                            Vedi QR Codes
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Analytics e Reportistica</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Sezione analytics in sviluppo - qui verranno mostrati grafici e statistiche dettagliate.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Impostazioni Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Sezione impostazioni in sviluppo - qui sarà possibile configurare prezzi, codici promo, ecc.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
