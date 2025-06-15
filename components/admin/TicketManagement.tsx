"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, QrCode, Eye, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import DataTable from "./DataTable";
import CrudModal from "./CrudModal";

interface Ticket {
  id: string;
  user_id: string;
  user_name: string;
  ticket_type: string;
  price: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  visit_date: string;  // Cambiato da valid_from/valid_until
  qr_code: string;
  created_at: string;
}

export default function TicketManagement() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/api/admin/tickets", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      // Ensure we always set an array
      const ticketsData = response.data.data || response.data;
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (error) {
      setTickets([]); // Set empty array on error
      toast({
        title: "Errore",
        description: "Impossibile caricare i biglietti",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/admin/tickets/${ticketId}`, 
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );
      loadTickets();
      toast({
        title: "Successo",
        description: "Stato biglietto aggiornato",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il biglietto",
        variant: "destructive",
      });
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo biglietto?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      loadTickets();
      toast({
        title: "Successo",
        description: "Biglietto eliminato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il biglietto",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Attivo", variant: "default" as const },
      used: { label: "Utilizzato", variant: "secondary" as const },
      expired: { label: "Scaduto", variant: "destructive" as const },
      cancelled: { label: "Annullato", variant: "destructive" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticket_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'id',
      label: 'ID Biglietto',
      render: (ticket: Ticket) => ticket.id.toString().substring(0, 8)
    },
    {
      key: 'user_name',
      label: 'Cliente',
      render: (ticket: Ticket) => ticket.user_name
    },
    {
      key: 'ticket_type',
      label: 'Tipo',
      render: (ticket: Ticket) => ticket.ticket_type
    },
    {
      key: 'price',
      label: 'Prezzo',
      render: (ticket: Ticket) => `€${Number(ticket.price || 0).toFixed(2)}`
    },
    {
      key: 'status',
      label: 'Stato',
      render: (ticket: Ticket) => getStatusBadge(ticket.status)
    },
    {
      key: 'visit_date',
      label: 'Data visita',
      render: (ticket: Ticket) => new Date(ticket.visit_date).toLocaleDateString('it-IT')
    },
    {
      key: 'actions',
      label: 'Azioni',
      render: (ticket: Ticket) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedTicket(ticket);
              setModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => deleteTicket(ticket.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestione Biglietti</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca biglietti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={filteredTickets}
          columns={columns}
          loading={loading}
          emptyMessage="Nessun biglietto trovato"
        />
      </CardContent>

      <CrudModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTicket(null);
        }}
        title={`Dettagli Biglietto ${selectedTicket?.id ? String(selectedTicket.id).substring(0, 8) : 'N/A'}`}
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cliente:</label>
              <p>{selectedTicket.user_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Tipo:</label>
              <p>{selectedTicket.ticket_type}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Prezzo:</label>
              <p>€{(Number(selectedTicket.price) || 0).toFixed(2)}</p>{" "}
            </div>
            <div>
              <label className="text-sm font-medium">Stato:</label>
              <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Data visita:</label>
              <p>{new Date(selectedTicket.visit_date).toLocaleDateString('it-IT')}</p>
            </div>
            <div>
              <label className="text-sm font-medium">QR Code:</label>
              <div className="mt-2 p-4 bg-gray-100 rounded text-center">
                <QrCode className="h-16 w-16 mx-auto mb-2" />
                <p className="text-xs text-gray-600">{selectedTicket.qr_code}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Aggiorna Stato:</label>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => updateTicketStatus(selectedTicket.id, 'used')}
                  disabled={selectedTicket.status === 'used'}
                >
                  Segna come Usato
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateTicketStatus(selectedTicket.id, 'cancelled')}
                  disabled={selectedTicket.status === 'cancelled'}
                >
                  Annulla
                </Button>
              </div>
            </div>
          </div>
        )}
      </CrudModal>
    </Card>
  );
}