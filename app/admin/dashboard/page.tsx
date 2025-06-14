"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ticket,
  Euro,
  TrendingUp,
  Search,
  Download,
  QrCode,
  Filter,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// Aggiungi queste interfacce all'inizio del file
interface Order {
  id: string
  order_number?: string
  status: string
  purchaseDate?: string
  purchase_date?: string
  totalPrice?: number
  total_price?: number
  visitDate?: string
  visit_date?: string
  customerInfo?: {
    name: string
    email: string
    phone?: string
  }
  user?: {
    name: string
    email: string
  }
  qrCodes?: any[]
}

interface User {
  id: string
  name: string
  email: string
  isAdmin?: boolean
  is_admin?: boolean
  created_at?: string // Aggiunta proprietà mancante
}

interface PromoCode {
  id: string
  code: string
  is_active: boolean
  discount: number
  type?: string // Aggiunta proprietà mancante
  valid_until?: string // Aggiunta proprietà mancante
  used_count?: number // Aggiunta proprietà mancante
  usage_limit?: number // Aggiunta proprietà mancante
}

// Aggiungi anche l'interfaccia per i ticket se non esiste
interface Ticket {
  id: string
  status: string
  visit_date?: string // Proprietà che potrebbe essere undefined
  used_at?: string
  // altre proprietà...
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("enjoypark-token");
      // Rimuovi: console.log("Token utilizzato:", token);

      const response = await axios.get(
        "http://127.0.0.1:8000/api/admin/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrders(response.data);
      setError(null);
    } catch (error: any) {
      // Aggiungi tipizzazione 'any' o usa un tipo più specifico
      console.error("Errore nel caricamento ordini:", error);
      // Mostra più dettagli sull'errore
      if (error.response) {
        console.error("Dettagli risposta:", error.response.data);
        console.error("Status:", error.response.status);
        setError(
          `Errore ${error.response.status}: ${JSON.stringify(
            error.response.data
          )}`
        );
      } else {
        setError(
          "Impossibile caricare gli ordini. Verifica che il backend sia attivo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/admin/tickets",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );
      setTickets(response.data);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare i ticket",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );
      loadOrders();
      toast({
        title: "Successo",
        description: "Status ordine aggiornato",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo status",
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo ordine?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      loadOrders();
      toast({
        title: "Successo",
        description: "Ordine eliminato",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'ordine",
        variant: "destructive",
      });
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Errore nel caricamento utenti:", error);
    }
  };

  const updateUserRole = async (userId: string, isAdmin: boolean) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/admin/users/${userId}/role`,
        { is_admin: isAdmin },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );
      loadUsers();
      toast({
        title: "Successo",
        description: "Ruolo utente aggiornato",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il ruolo",
        variant: "destructive",
      });
    }
  };

  const loadPromoCodes = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/admin/promo-codes",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );
      setPromoCodes(response.data);
    } catch (error) {
      console.error("Errore nel caricamento codici promo:", error);
    }
  };

  const togglePromoCodeStatus = async (codeId: string, isActive: boolean) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/admin/promo-codes/${codeId}/status`,
        { is_active: isActive },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );
      loadPromoCodes();
      toast({
        title: "Successo",
        description: "Stato codice promo aggiornato",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      loadOrders();
      loadTickets();
      loadUsers();
      loadPromoCodes();
    }
  }, [user]);

  // Redirect se non admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Accesso riservato agli amministratori
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Torna alla Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Caricamento...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={loadOrders} className="mt-4">
              Riprova
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customerInfo?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtro per utenti
  const filteredUsers = users.filter((user) => {
    return (
      user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  });

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => {
      const price = Number(order.totalPrice || order.total_price || 0);
      return sum + (isNaN(price) ? 0 : price);
    }, 0),
    totalTickets: orders.reduce(
      (sum, order) => sum + (order.qrCodes?.length || 0),
      0
    ),
    todayOrders: orders.filter(
      (order) => {
        const purchaseDate = order.purchaseDate || order.purchase_date;
        if (!purchaseDate) return false;
        return new Date(purchaseDate).toDateString() === new Date().toDateString();
      }
    ).length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confermato</Badge>;
      case "used":
        return <Badge className="bg-blue-500">Utilizzato</Badge>;
      case "expired":
        return <Badge variant="destructive">Scaduto</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Annullato</Badge>;
      default:
        return <Badge variant="outline">In attesa</Badge>;
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard Admin
              </h1>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Ordini Totali
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalOrders}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Ricavi Totali
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">€{Number(stats.totalRevenue || 0).toFixed(2)}</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Biglietti Venduti
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalTickets}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Ordini Oggi
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.todayOrders}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList>
            <TabsTrigger value="orders">Gestione Ordini</TabsTrigger>
            <TabsTrigger value="tickets">Gestione Ticket</TabsTrigger>
            <TabsTrigger value="users">Gestione Utenti</TabsTrigger>
            <TabsTrigger value="promo">Codici Promo</TabsTrigger>
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
                    <option value="pending">In attesa</option>
                    <option value="confirmed">Confermati</option>
                    <option value="used">Utilizzati</option>
                    <option value="expired">Scaduti</option>
                    <option value="cancelled">Annullati</option>
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
                    <div
                      key={order.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                    >
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <h4 className="font-semibold">
                            {order.order_number || order.id}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.purchaseDate || order.purchase_date
                              ? new Date(
                                  order.purchaseDate || order.purchase_date
                                ).toLocaleDateString("it-IT")
                              : "N/A"}
                          </p>
                          {getStatusBadge(order.status)}
                        </div>

                        <div>
                          <p className="font-medium">
                            {order.customerInfo?.name ||
                              order.user?.name ||
                              "N/A"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.customerInfo?.email ||
                              order.user?.email ||
                              "N/A"}
                          </p>
                          {order.customerInfo?.phone && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {order.customerInfo.phone}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-lg">
                            €{order.totalPrice || order.total_price || 0}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.qrCodes?.length || 0} biglietti
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Visita:{" "}
                            {order.visitDate || order.visit_date
                              ? new Date(
                                  order.visitDate || order.visit_date
                                ).toLocaleDateString("it-IT")
                              : "N/A"}
                          </p>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order.id, e.target.value)
                            }
                            className="text-xs px-2 py-1 border rounded"
                          >
                            <option value="pending">In attesa</option>
                            <option value="confirmed">Confermato</option>
                            <option value="used">Utilizzato</option>
                            <option value="expired">Scaduto</option>
                            <option value="cancelled">Annullato</option>
                          </select>

                          <Button size="sm" variant="outline">
                            <QrCode className="w-4 h-4 mr-2" />
                            Vedi QR Codes
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteOrder(order.id)}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Elimina
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Ticket Individuali</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                      >
                        <div className="grid md:grid-cols-5 gap-4">
                          <div>
                            <h4 className="font-semibold">{ticket.qr_code}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {ticket.ticket_type}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">€{ticket.price}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {ticket.order_number}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm">
                              {new Date(ticket.visit_date).toLocaleDateString(
                                "it-IT"
                              )}
                            </p>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {ticket.used_at
                                ? `Usato: ${new Date(
                                    ticket.used_at
                                  ).toLocaleDateString("it-IT")}`
                                : "Non utilizzato"}
                            </p>
                          </div>
                          <div>
                            <Button size="sm" variant="outline">
                              Gestisci
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Nessun ticket disponibile</p>
                    </div>
                  )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">
                      Statistiche Vendite
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Totale Ordini:</span>
                        <span className="font-semibold">
                          {stats.totalOrders}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ricavi Totali:</span>
                        <span className="font-semibold">
                          {stats.totalRevenue.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ticket Venduti:</span>
                        <span className="font-semibold">
                          {stats.totalTickets}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ordini Oggi:</span>
                        <span className="font-semibold">
                          {stats.todayOrders}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">
                      Distribuzione Ordini
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Confermati:</span>
                        <div className="flex items-center">
                          <div className="w-40 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-green-500 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  (orders.filter(
                                    (o) => o.status === "confirmed"
                                  ).length /
                                    Math.max(orders.length, 1)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span>
                            {
                              orders.filter((o) => o.status === "confirmed")
                                .length
                            }
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Utilizzati:</span>
                        <div className="flex items-center">
                          <div className="w-40 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-blue-500 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  (orders.filter((o) => o.status === "used")
                                    .length /
                                    Math.max(orders.length, 1)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span>
                            {orders.filter((o) => o.status === "used").length}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Scaduti:</span>
                        <div className="flex items-center">
                          <div className="w-40 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-red-500 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  (orders.filter((o) => o.status === "expired")
                                    .length /
                                    Math.max(orders.length, 1)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span>
                            {
                              orders.filter((o) => o.status === "expired")
                                .length
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-center mt-4">
                  Ulteriori grafici e statistiche dettagliate saranno
                  disponibili nelle prossime versioni.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Gestione Utenti</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cerca utenti..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">Nome</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Ruolo</th>
                        <th scope="col" className="px-6 py-3">Data Registrazione</th>
                        <th scope="col" className="px-6 py-3">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(user => 
                          user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
                        )
                        .map((user) => (
                      <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4">{user.name}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">
                          {user.is_admin ? (
                            <Badge className="bg-purple-500">Admin</Badge>
                          ) : (
                            <Badge variant="secondary">Utente</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserRole(user.id, !user.is_admin)}
                          >
                            {user.is_admin ? "Rimuovi Admin" : "Rendi Admin"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Aggiungi questa sezione per i codici promo */}
          <TabsContent value="promo" className="space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Gestione Codici Promozionali</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">Codice</th>
                        <th scope="col" className="px-6 py-3">Tipo</th>
                        <th scope="col" className="px-6 py-3">Valore</th>
                        <th scope="col" className="px-6 py-3">Valido fino</th>
                        <th scope="col" className="px-6 py-3">Utilizzi</th>
                        <th scope="col" className="px-6 py-3">Stato</th>
                        <th scope="col" className="px-6 py-3">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promoCodes.map((code) => (
                        <tr
                          key={code.id}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                        >
                          <td className="px-6 py-4 font-medium">{code.code}</td>
                          <td className="px-6 py-4">
                            {code.type === "fixed" ? "Fisso" : "Percentuale"}
                          </td>
                          <td className="px-6 py-4">
                            {code.type === "fixed"
                              ? `€${code.discount}`
                              : `${code.discount}%`}
                          </td>
                          <td className="px-6 py-4">
                            {new Date(code.valid_until).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {code.used_count}/{code.usage_limit || "∞"}
                          </td>
                          <td className="px-6 py-4">
                            {code.is_active ? (
                              <Badge className="bg-green-500">Attivo</Badge>
                            ) : (
                              <Badge variant="secondary">Inattivo</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  togglePromoCodeStatus(
                                    code.id,
                                    !code.is_active
                                  )
                                }
                              >
                                {code.is_active ? "Disattiva" : "Attiva"}
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/promo-codes/${code.id}`}>
                                  Modifica
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mantieni solo una sezione settings */}
          <TabsContent value="settings">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Impostazioni Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Sezione impostazioni in sviluppo - qui sarà possibile
                  configurare prezzi, codici promo, ecc.
                </p>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">
                    Altre Impostazioni
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ulteriori impostazioni di sistema saranno disponibili nelle
                    prossime versioni.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
