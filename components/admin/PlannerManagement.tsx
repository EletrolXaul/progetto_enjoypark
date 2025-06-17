"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Calendar, Clock, User, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import DataTable from "./DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PlannerItem {
  id: string;
  user_id: string;
  date: string;
  item_id: string;
  name: string;
  type: string;
  time: string;
  notes: string;
  priority: string;
  completed: boolean;
  original_data: any;
  created_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function PlannerManagement() {
  const { toast } = useToast();
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PlannerItem | null>(null);

  useEffect(() => {
    loadPlannerItems();
  }, []);

  const loadPlannerItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/api/admin/planner-items", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      setPlannerItems(response.data.data || response.data);
    } catch (error) {
      console.error("Errore nel caricamento degli elementi del planner:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli elementi del planner",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item: PlannerItem) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const getTypeBadge = (type: string) => {
    const colors: { [key: string]: string } = {
      "attraction": "bg-blue-100 text-blue-800",
      "show": "bg-purple-100 text-purple-800",
      "restaurant": "bg-orange-100 text-orange-800",
      "shop": "bg-green-100 text-green-800",
      "service": "bg-gray-100 text-gray-800",
    };
    
    return (
      <Badge className={colors[type.toLowerCase()] || "bg-gray-100 text-gray-800"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: { [key: string]: string } = {
      "high": "bg-red-100 text-red-800",
      "medium": "bg-yellow-100 text-yellow-800",
      "low": "bg-green-100 text-green-800",
    };
    
    return (
      <Badge className={colors[priority.toLowerCase()] || "bg-gray-100 text-gray-800"}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getCompletedBadge = (completed: boolean) => {
    return (
      <Badge variant={completed ? "default" : "secondary"} className="flex items-center gap-1">
        {completed ? (
          <><CheckCircle className="h-3 w-3" /> Completato</>
        ) : (
          <><XCircle className="h-3 w-3" /> In Corso</>
        )}
      </Badge>
    );
  };

  const filteredItems = plannerItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (item: PlannerItem) => (
        <span className="font-mono text-sm">{item.id}</span>
      ),
    },
    {
      key: "user",
      label: "Utente",
      render: (item: PlannerItem) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium">{item.user?.name || 'N/A'}</div>
            <div className="text-xs text-gray-500">{item.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "date",
      label: "Data",
      render: (item: PlannerItem) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(item.date).toLocaleDateString("it-IT")}</span>
        </div>
      ),
    },
    {
      key: "name",
      label: "Nome Elemento",
      render: (item: PlannerItem) => (
        <div className="font-medium max-w-xs truncate" title={item.name}>
          {item.name}
        </div>
      ),
    },
    {
      key: "type",
      label: "Tipo",
      render: (item: PlannerItem) => getTypeBadge(item.type),
    },
    {
      key: "time",
      label: "Orario",
      render: (item: PlannerItem) => (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{item.time || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priorità",
      render: (item: PlannerItem) => getPriorityBadge(item.priority),
    },
    {
      key: "completed",
      label: "Stato",
      render: (item: PlannerItem) => getCompletedBadge(item.completed),
    },
    {
      key: "notes",
      label: "Note",
      render: (item: PlannerItem) => (
        <div className="max-w-xs truncate" title={item.notes}>
          {item.notes || 'Nessuna nota'}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Creato il",
      render: (item: PlannerItem) => (
        <span className="text-sm text-gray-500">
          {new Date(item.created_at).toLocaleDateString("it-IT")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Azioni",
      render: (item: PlannerItem) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDetails(item)}
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
            <span>Gestione Planner Utenti</span>
            <Badge variant="secondary">{filteredItems.length} totali</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cerca per nome, utente o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <DataTable
            data={filteredItems}
            columns={columns}
            loading={loading}
            emptyMessage="Nessun elemento del planner trovato"
          />
        </CardContent>
      </Card>

      {/* Modal Dettagli */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Dettagli Elemento Planner</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="font-mono">{selectedItem.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ID Elemento</label>
                  <p className="font-mono">{selectedItem.item_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome</label>
                  <p className="font-semibold">{selectedItem.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo</label>
                  <div className="mt-1">{getTypeBadge(selectedItem.type)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data</label>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(selectedItem.date).toLocaleDateString("it-IT")}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Orario</label>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{selectedItem.time || 'Non specificato'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priorità</label>
                  <div className="mt-1">{getPriorityBadge(selectedItem.priority)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stato</label>
                  <div className="mt-1">{getCompletedBadge(selectedItem.completed)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data Creazione</label>
                  <p>{new Date(selectedItem.created_at).toLocaleString("it-IT")}</p>
                </div>
              </div>
              
              {selectedItem.user && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Informazioni Utente</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nome</label>
                      <p>{selectedItem.user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p>{selectedItem.user.email}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedItem.notes && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-500">Note</label>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">{selectedItem.notes}</p>
                </div>
              )}
              
              {selectedItem.original_data && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-500">Dati Originali</label>
                  <pre className="mt-1 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(selectedItem.original_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}