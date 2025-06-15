"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Edit, Trash } from "lucide-react";
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
      // Gestisci sia il formato con 'data' che quello diretto
      const ordersData = response.data.data || response.data;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli ordini",
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
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'ordine",
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
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'ordine",
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
              <p>€{(Number(selectedOrder.total_price) || 0).toFixed(2)}</p>{" "}
              {/* Cambiato da total_amount */}
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
          </div>
        )}
      </CrudModal>
    </Card>
  );
}
