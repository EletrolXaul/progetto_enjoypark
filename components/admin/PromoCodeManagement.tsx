"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import DataTable from "./DataTable";
import CrudModal from "./CrudModal";
import { API_BASE_URL } from '../../lib/config';

interface PromoCode {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  discount: number; // Cambiato da 'value'
  min_amount: number; // Cambiato da 'min_order_amount'
  max_discount?: number; // Aggiunto
  usage_limit: number; // Cambiato da 'max_uses'
  used_count: number; // Cambiato da 'current_uses'
  valid_until: string;
  is_active: boolean; // Cambiato da 'status'
  description: string; // Aggiunto
  created_at: string;
}

export default function PromoCodeManagement() {
  const { toast } = useToast();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(
    null
  );
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  // E modifica il formData per accettare tutti i tipi:
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    discount: 0, // Cambiato da 'value'
    min_amount: 0, // Cambiato da 'min_order_amount'
    max_discount: 0, // Aggiunto
    usage_limit: 0, // Cambiato da 'max_uses'
    valid_until: "",
    is_active: true, // Cambiato da 'status'
    description: "", // Aggiunto
  });

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://127.0.0.1:8000/api/admin/promo-codes",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );
      // Ensure we always set an array
      const promoCodesData = response.data.data || response.data;
      setPromoCodes(Array.isArray(promoCodesData) ? promoCodesData : []);
    } catch (error) {
      setPromoCodes([]); // Set empty array on error
      toast({
        title: "Errore",
        description: "Impossibile caricare i codici promozionali",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPromoCode = async () => {
    // Validazione
    if (!formData.code || !formData.valid_until) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/admin/promo-codes",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );
      loadPromoCodes();
      setModalOpen(false);
      resetForm();
      toast({
        title: "Successo",
        description: "Codice promozionale creato con successo",
      });
    } catch (error) {
      console.error('Errore dettagliato:', (error as any).response?.data);
      toast({
        title: "Errore",
        description: (error as any).response?.data?.message || "Impossibile creare il codice promozionale",
        variant: "destructive",
      });
    }
  };

  const updatePromoCode = async () => {
    if (!editingPromoCode) return;

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/admin/promo-codes/${editingPromoCode.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );
      loadPromoCodes();
      setModalOpen(false);
      setEditingPromoCode(null);
      resetForm();
      toast({
        title: "Successo",
        description: "Codice promozionale aggiornato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: (error as any).response?.data?.message || "Impossibile aggiornare il codice promozionale",
        variant: "destructive",
      });
    }
  };

  const deletePromoCode = async (promoCodeId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo codice promozionale?"))
      return;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/admin/promo-codes/${promoCodeId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );
      loadPromoCodes();
      toast({
        title: "Successo",
        description: "Codice promozionale eliminato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il codice promozionale",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      type: "percentage",
      discount: 0,
      min_amount: 0,
      max_discount: 0,
      usage_limit: 0,
      valid_until: "",
      is_active: true,
      description: "",
    });
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setFormData({
      code: promoCode.code,
      type: promoCode.type,
      discount: promoCode.discount,
      min_amount: promoCode.min_amount,
      max_discount: promoCode.max_discount || 0,
      usage_limit: promoCode.usage_limit,
      valid_until: promoCode.valid_until
        ? promoCode.valid_until.split("T")[0]
        : "",
      is_active: promoCode.is_active,
      description: promoCode.description,
    });
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleCreate = () => {
    resetForm();
    setEditingPromoCode(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Attivo", variant: "default" as const },
      inactive: { label: "Inattivo", variant: "secondary" as const },
      expired: { label: "Scaduto", variant: "destructive" as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant="outline">
        {type === "percentage" ? "Percentuale" : "Fisso"}
      </Badge>
    );
  };

  const filteredPromoCodes = promoCodes.filter((promoCode) =>
    promoCode.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "code",
      label: "Codice",
      render: (promoCode: PromoCode) => (
        <span className="font-mono font-bold">{promoCode.code}</span>
      ),
    },
    {
      key: "type",
      label: "Tipo",
      render: (promoCode: PromoCode) => getTypeBadge(promoCode.type),
    },
    {
      key: "discount",
      label: "Sconto",
      render: (promoCode: PromoCode) =>
        promoCode.type === "percentage"
          ? `${promoCode.discount || 0}%`
          : `€${Number(promoCode.discount || 0).toFixed(2)}`,
    },
    {
      key: "min_amount",
      label: "Ordine Minimo",
      render: (promoCode: PromoCode) => 
        `€${Number(promoCode.min_amount || 0).toFixed(2)}`,
    },
    {
      key: "usage",
      label: "Utilizzi",
      render: (promoCode: PromoCode) =>
        `${promoCode.used_count}/${promoCode.usage_limit || '∞'}`,
    },
    {
      key: "valid_until",
      label: "Scade il",
      render: (promoCode: PromoCode) =>
        new Date(promoCode.valid_until).toLocaleDateString("it-IT"),
    },
    {
      key: "is_active",
      label: "Stato",
      render: (promoCode: PromoCode) => (
        <Badge variant={promoCode.is_active ? "default" : "secondary"}>
          {promoCode.is_active ? "Attivo" : "Inattivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Azioni",
      render: (promoCode: PromoCode) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(promoCode)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => deletePromoCode(promoCode.id)}
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
        <CardTitle>Gestione Codici Promozionali</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca codici..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Codice
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={filteredPromoCodes}
          columns={columns}
          loading={loading}
          emptyMessage="Nessun codice promozionale trovato"
        />
      </CardContent>

      <CrudModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPromoCode(null);
          resetForm();
        }}
        title={
          modalMode === "create"
            ? "Nuovo Codice Promozionale"
            : "Modifica Codice Promozionale"
        }
        onSubmit={modalMode === "create" ? createPromoCode : updatePromoCode}
        submitLabel={modalMode === "create" ? "Crea" : "Aggiorna"}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="code">Codice</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              placeholder="SCONTO10"
              className="font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "percentage" | "fixed",
                  })
                }
                className="w-full p-2 border rounded"
              >
                <option value="percentage">Percentuale</option>
                <option value="fixed">Fisso</option>
              </select>
            </div>
            <div>
              <Label htmlFor="discount">
                Valore {formData.type === "percentage" ? "(%)" : "(€)"}
              </Label>
              <Input
                id="discount"
                type="number"
                step={formData.type === "percentage" ? "1" : "0.01"}
                value={formData.discount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_amount">Ordine Minimo (€)</Label>
              <Input
                id="min_amount"
                type="number"
                step="0.01"
                value={formData.min_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_amount: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="usage_limit">Utilizzi Massimi</Label>
              <Input
                id="usage_limit"
                type="number"
                value={formData.usage_limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usage_limit: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valid_until">Valido fino</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) =>
                  setFormData({ ...formData, valid_until: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="max_discount">Sconto Massimo (€)</Label>
              <Input
                id="max_discount"
                type="number"
                step="0.01"
                value={formData.max_discount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_discount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Opzionale per sconti percentuali"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descrizione del codice promozionale"
            />
          </div>
          <div>
            <Label htmlFor="is_active">Stato</Label>
            <select
              id="is_active"
              value={formData.is_active ? "true" : "false"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_active: e.target.value === "true",
                })
              }
              className="w-full p-2 border rounded"
            >
              <option value="true">Attivo</option>
              <option value="false">Inattivo</option>
            </select>
          </div>
        </div>
      </CrudModal>
    </Card>
  );
}
