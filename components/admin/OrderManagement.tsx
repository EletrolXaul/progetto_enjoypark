"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Edit, Trash, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import DataTable from "./DataTable";
import CrudModal from "./CrudModal";

interface Order {
  id: string; // Cambiato da number a string
  order_number: string;
  user_id: string;
  user_name: string;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
  ticketItems?: Ticket[]; // Aggiungiamo i biglietti associati
}

interface Ticket {
  id: string;
  user_id: string;
  order_number: string;
  visit_date: string;
  ticket_type: string;
  price: number;
  status: string;
  qr_code: string;
  used_at?: string;
}

export default function OrderManagement() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://127.0.0.1:8000/api/admin/orders",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );
      
      console.log('Response from admin orders:', response.data);
      
      const ordersData = response.data.data || response.data;
      const ordersArray = Array.isArray(ordersData) ? ordersData : [];
      
      console.log('Orders loaded:', ordersArray.length);
      
      setOrders(ordersArray);
    } catch (error) {
      console.error("Error loading orders:", error);
      
      // Type-safe error handling
      let errorMessage = "Errore sconosciuto";
      
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setOrders([]);
      toast({
        title: "Errore",
        description: `Impossibile caricare gli ordini: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/admin/orders/${orderId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );
      loadOrders();
      toast({
        title: "Successo",
        description: "Stato ordine aggiornato",
      });
    } catch (error) {
      let errorMessage = "Impossibile aggiornare l'ordine";
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo ordine?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      loadOrders();
      toast({
        title: "Successo",
        description: "Ordine eliminato con successo",
      });
    } catch (error) {
      let errorMessage = "Impossibile eliminare l'ordine";
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "In Attesa", variant: "secondary" as const },
      confirmed: { label: "Confermato", variant: "default" as const },
      cancelled: { label: "Annullato", variant: "destructive" as const },
      completed: { label: "Completato", variant: "default" as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Aggiungi una verifica di sicurezza prima del filter
  const filteredOrders = Array.isArray(orders)
    ? orders.filter(
        (order) =>
          order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.order_number &&
            order.order_number
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          order.id.toString().includes(searchTerm)
      )
    : [];

  const columns = [
    {
      key: "order_number",
      label: "Numero Ordine",
      render: (order: Order) => order.order_number || `ORD-${order.id}`,
    },
    {
      key: "user_name",
      label: "Cliente",
      render: (order: Order) => order.user_name,
    },
    {
      key: "total_price", // Cambiato da 'total_amount'
      label: "Totale",
      render: (order: Order) => `€${(Number(order.total_price) || 0).toFixed(2)}`, // Safe conversion
    },
    {
      key: "status",
      label: "Stato",
      render: (order: Order) => getStatusBadge(order.status),
    },
    {
      key: "created_at",
      label: "Data",
      render: (order: Order) =>
        new Date(order.created_at).toLocaleDateString("it-IT"),
    },
    {
      key: "actions",
      label: "Azioni",
      render: (order: Order) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedOrder(order);
              setModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => deleteOrder(order.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestione Ordini</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca ordini..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={filteredOrders}
          columns={columns}
          loading={loading}
          emptyMessage="Nessun ordine trovato"
        />
      </CardContent>

      <CrudModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedOrder(null);
        }}
        title={`Dettagli Ordine ${selectedOrder?.id?.toString().substring(0, 8)}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cliente:</label>
              <p>{selectedOrder.user_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Totale:</label>
              <p>€{(Number(selectedOrder.total_price) || 0).toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Stato:</label>
              <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Aggiorna Stato:</label>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={() =>
                    updateOrderStatus(selectedOrder.id, "confirmed")
                  }
                  disabled={selectedOrder.status === "confirmed"}
                >
                  Conferma
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateOrderStatus(selectedOrder.id, "cancelled")
                  }
                  disabled={selectedOrder.status === "cancelled"}
                >
                  Annulla
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    updateOrderStatus(selectedOrder.id, "completed")
                  }
                  disabled={selectedOrder.status === "completed"}
                >
                  Completa
                </Button>
              </div>
            </div>
            
            {/* Sezione Biglietti */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Biglietti associati</h3>
              {selectedOrder.ticketItems && selectedOrder.ticketItems.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prezzo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.ticketItems.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{ticket.ticket_type}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">€{Number(ticket.price).toFixed(2)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <Badge 
                              variant={ticket.status === 'valid' ? 'default' : 
                                      ticket.status === 'used' ? 'secondary' : 'destructive'}
                            >
                              {ticket.status === 'valid' ? 'Valido' : 
                               ticket.status === 'used' ? 'Utilizzato' : 
                               ticket.status === 'expired' ? 'Scaduto' : 'Annullato'}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <QrCode className="h-4 w-4 mr-1" />
                              <span className="text-xs truncate max-w-[100px]">{ticket.qr_code}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nessun biglietto associato a questo ordine</p>
              )}
            </div>
          </div>
        )}
      </CrudModal>
    </Card>
  );
}
