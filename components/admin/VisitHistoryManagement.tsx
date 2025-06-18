"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import DataTable from "./DataTable";
import CrudModal from "./CrudModal";
import { API_BASE_URL } from '../../lib/config';

interface VisitHistory {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  entry_time: string;
  exit_time: string | null;
  duration: number | null;
  attractions_visited: string[];
  shows_attended: string[];
  total_spent: number;
  visit_date: string;
  status: 'active' | 'completed' | 'cancelled';
}

export default function VisitHistoryManagement() {
  const { toast } = useToast();
  const [visitHistory, setVisitHistory] = useState<VisitHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<VisitHistory | null>(null);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    loadVisitHistory();
  }, []);

  const loadVisitHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/visit-history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      // Ensure we always set an array
      const visitHistoryData = response.data.data || response.data;
      setVisitHistory(Array.isArray(visitHistoryData) ? visitHistoryData : []);
    } catch (error) {
      setVisitHistory([]); // Set empty array on error
      toast({
        title: "Errore",
        description: "Impossibile caricare la cronologia visite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateFilter) {
      loadVisitHistory();
    }
  }, [dateFilter]);

  const exportVisitData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/visit-history/export`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
        params: {
          date: dateFilter || undefined,
          format: 'csv'
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `visit-history-${dateFilter || 'all'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Successo",
        description: "Dati esportati con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile esportare i dati",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "In Corso", variant: "default" as const },
      completed: { label: "Completata", variant: "default" as const },
      cancelled: { label: "Annullata", variant: "destructive" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const filteredVisits = visitHistory.filter(visit =>
    visit.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'user_name',
      label: 'Visitatore',
      render: (visit: VisitHistory) => (
        <div>
          <div className="font-medium">{visit.user_name}</div>
          <div className="text-sm text-gray-500">{visit.user_email}</div>
        </div>
      )
    },
    {
      key: 'visit_date',
      label: 'Data Visita',
      render: (visit: VisitHistory) => new Date(visit.visit_date).toLocaleDateString('it-IT')
    },
    {
      key: 'entry_time',
      label: 'Ingresso',
      render: (visit: VisitHistory) => new Date(visit.entry_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    },
    {
      key: 'exit_time',
      label: 'Uscita',
      render: (visit: VisitHistory) => 
        visit.exit_time 
          ? new Date(visit.exit_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
          : "In corso"
    },
    {
      key: 'duration',
      label: 'Durata',
      render: (visit: VisitHistory) => formatDuration(visit.duration)
    },
    {
      key: 'total_spent',
      label: 'Spesa Totale',
      render: (visit: VisitHistory) => `€${(visit.total_spent || 0).toFixed(2)}`
    },
    {
      key: 'status',
      label: 'Stato',
      render: (visit: VisitHistory) => getStatusBadge(visit.status)
    },
    {
      key: 'actions',
      label: 'Azioni',
      render: (visit: VisitHistory) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedVisit(visit);
            setModalOpen(true);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cronologia Visite</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca visite..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={exportVisitData} variant="outline">
            Esporta CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={filteredVisits}
          columns={columns}
          loading={loading}
          emptyMessage="Nessuna visita trovata"
        />
      </CardContent>

      <CrudModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedVisit(null);
        }}
        title={`Dettagli Visita - ${selectedVisit?.user_name}`}
      >
        {selectedVisit && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Visitatore:</label>
                <p>{selectedVisit.user_name}</p>
                <p className="text-sm text-gray-500">{selectedVisit.user_email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Data Visita:</label>
                <p>{new Date(selectedVisit.visit_date).toLocaleDateString('it-IT')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Orario Ingresso:</label>
                <p>{new Date(selectedVisit.entry_time).toLocaleString('it-IT')}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Orario Uscita:</label>
                <p>
                  {selectedVisit.exit_time 
                    ? new Date(selectedVisit.exit_time).toLocaleString('it-IT')
                    : "Visita in corso"
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Durata:</label>
                <p>{formatDuration(selectedVisit.duration)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Spesa Totale:</label>
                <p className="font-semibold">€{(Number(selectedVisit.total_spent) || 0).toFixed(2)}</p>{" "}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Stato:</label>
              <div className="mt-1">{getStatusBadge(selectedVisit.status)}</div>
            </div>

            {selectedVisit.attractions_visited.length > 0 && (
              <div>
                <label className="text-sm font-medium">Attrazioni Visitate:</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedVisit.attractions_visited.map((attraction, index) => (
                    <Badge key={index} variant="outline">
                      <MapPin className="h-3 w-3 mr-1" />
                      {attraction}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedVisit.shows_attended.length > 0 && (
              <div>
                <label className="text-sm font-medium">Spettacoli Seguiti:</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedVisit.shows_attended.map((show, index) => (
                    <Badge key={index} variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {show}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CrudModal>
    </Card>
  );
}