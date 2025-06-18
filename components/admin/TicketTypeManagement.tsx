import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import DataTable from "./DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { API_BASE_URL } from '../../lib/config';

interface TicketType {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export default function TicketTypeManagement() {
  const { toast } = useToast();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);

  useEffect(() => {
    loadTicketTypes();
  }, []);

  const loadTicketTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/ticket-types`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      setTicketTypes(response.data.data || response.data);
    } catch (error) {
      console.error("Errore nel caricamento dei tipi di biglietto:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i tipi di biglietto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (ticketType: TicketType) => {
    setSelectedTicketType(ticketType);
    setDetailModalOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Attivo" : "Inattivo"}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: { [key: string]: string } = {
      "standard": "bg-blue-100 text-blue-800",
      "premium": "bg-purple-100 text-purple-800",
      "vip": "bg-yellow-100 text-yellow-800",
      "family": "bg-green-100 text-green-800",
    };
    
    return (
      <Badge className={colors[type.toLowerCase()] || "bg-gray-100 text-gray-800"}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  const filteredTicketTypes = ticketTypes.filter((ticketType) =>
    ticketType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticketType.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (ticketType: TicketType) => (
        <span className="font-mono text-sm">{ticketType.id}</span>
      ),
    },
    {
      key: "name",
      label: "Nome",
      render: (ticketType: TicketType) => (
        <div className="font-medium">{ticketType.name}</div>
      ),
    },
    {
      key: "type",
      label: "Tipo",
      render: (ticketType: TicketType) => getTypeBadge(ticketType.type),
    },
    {
      key: "price",
      label: "Prezzo",
      render: (ticketType: TicketType) => (
        <div className="flex items-center gap-1 font-semibold text-green-600">
          <Euro className="h-4 w-4" />
          {Number(ticketType.price || 0).toFixed(2)}
        </div>
      ),
    },
    {
      key: "description",
      label: "Descrizione",
      render: (ticketType: TicketType) => (
        <div className="max-w-xs truncate" title={ticketType.description}>
          {ticketType.description}
        </div>
      ),
    },
    {
      key: "features",
      label: "Caratteristiche",
      render: (ticketType: TicketType) => (
        <div className="flex flex-wrap gap-1">
          {ticketType.features?.slice(0, 2).map((feature, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
          {ticketType.features?.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{ticketType.features.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Stato",
      render: (ticketType: TicketType) => getStatusBadge(ticketType.is_active),
    },
    {
      key: "created_at",
      label: "Creato il",
      render: (ticketType: TicketType) => (
        <span className="text-sm text-gray-500">
          {new Date(ticketType.created_at).toLocaleDateString("it-IT")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Azioni",
      render: (ticketType: TicketType) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDetails(ticketType)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Dettagli
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gestione Tipi di Biglietto</span>
            <Badge variant="secondary">{filteredTicketTypes.length} totali</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cerca per nome o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <DataTable
            data={filteredTicketTypes}
            columns={columns}
            loading={loading}
            emptyMessage="Nessun tipo di biglietto trovato"
          />
        </CardContent>
      </Card>

      {/* Modal Dettagli */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dettagli Tipo di Biglietto</DialogTitle>
          </DialogHeader>
          {selectedTicketType && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="font-mono">{selectedTicketType.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome</label>
                  <p className="font-semibold">{selectedTicketType.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo</label>
                  <div className="mt-1">{getTypeBadge(selectedTicketType.type)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Prezzo</label>
                  <div className="flex items-center gap-1 font-semibold text-green-600 text-lg">
                    <Euro className="h-5 w-5" />
                    {Number(selectedTicketType.price || 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stato</label>
                  <div className="mt-1">{getStatusBadge(selectedTicketType.is_active)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data Creazione</label>
                  <p>{new Date(selectedTicketType.created_at).toLocaleString("it-IT")}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Descrizione</label>
                <p className="mt-1 text-gray-700">{selectedTicketType.description}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Caratteristiche</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTicketType.features?.map((feature, index) => (
                    <Badge key={index} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}