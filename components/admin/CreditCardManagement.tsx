"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Trash, CreditCard, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import DataTable from "./DataTable";
import CrudModal from "./CrudModal";
import { API_BASE_URL } from '../../lib/config';

interface CreditCardInfo {
  id: string;
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  type: string;
  result: string;
  message?: string;
  created_at: string;
  // Aggiungi queste proprietà mancanti:
  user_name?: string;
  user_email?: string;
  card_last_four?: string;
  card_brand?: string;
  card_type?: string;
  is_default?: boolean;
  expiry_month?: number;
  expiry_year?: number;
  total_transactions?: number;
  total_amount?: number;
  last_used?: string;
  status?: string;
}

export default function CreditCardManagement() {
  const { toast } = useToast();
  const [creditCards, setCreditCards] = useState<CreditCardInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCardInfo | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    loadCreditCards();
  }, []);

  const loadCreditCards = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/credit-cards`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      // Ensure we always set an array
      const creditCardsData = response.data.data || response.data;
      setCreditCards(Array.isArray(creditCardsData) ? creditCardsData : []);
    } catch (error) {
      setCreditCards([]); // Set empty array on error
      toast({
        title: "Errore",
        description: "Impossibile caricare le carte di credito",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreditCards();
  }, [statusFilter]);

  const blockCard = async (cardId: string) => {
    if (!confirm("Sei sicuro di voler bloccare questa carta?")) return;

    try {
      await axios.put(`${API_BASE_URL}/api/admin/credit-cards/${cardId}/block`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      loadCreditCards();
      toast({
        title: "Successo",
        description: "Carta bloccata con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile bloccare la carta",
        variant: "destructive",
      });
    }
  };

  const unblockCard = async (cardId: string) => {
    if (!confirm("Sei sicuro di voler sbloccare questa carta?")) return;

    try {
      await axios.put(`${API_BASE_URL}/api/admin/credit-cards/${cardId}/unblock`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      loadCreditCards();
      toast({
        title: "Successo",
        description: "Carta sbloccata con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile sbloccare la carta",
        variant: "destructive",
      });
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa carta? Questa azione è irreversibile.")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/credit-cards/${cardId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      loadCreditCards();
      toast({
        title: "Successo",
        description: "Carta eliminata con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare la carta",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Attiva", variant: "default" as const },
      expired: { label: "Scaduta", variant: "secondary" as const },
      blocked: { label: "Bloccata", variant: "destructive" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getBrandIcon = (brand: string | undefined) => {
    // In un'implementazione reale, potresti usare icone specifiche per ogni brand
    return <CreditCard className="h-4 w-4" />;
  };

  const isExpiringSoon = (month: number | undefined, year: number | undefined) => {
    if (!month || !year) return false;
    const now = new Date();
    const expiry = new Date(year, month - 1);
    const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3);
    return expiry <= threeMonthsFromNow && expiry > now;
  };

  const filteredCards = creditCards.filter(card =>
    card.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.card_last_four?.includes(searchTerm) ||
    card.card_brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'user',
      label: 'Utente',
      render: (card: CreditCardInfo) => (
        <div>
          <div className="font-medium">{card.user_name}</div>
          <div className="text-sm text-gray-500">{card.user_email}</div>
        </div>
      )
    },
    // Nel render delle colonne, aggiungi controlli per le proprietà undefined:
    {
      key: 'card_info',
      label: 'Carta',
      render: (card: CreditCardInfo) => (
        <div className="flex items-center gap-2">
          {getBrandIcon(card.card_brand || '')}
          <div>
            <div className="font-medium">
              {(card.card_brand || '').toUpperCase()} ****{card.card_last_four || ''}
            </div>
            <div className="text-sm text-gray-500">{card.card_type || ''}</div>
          </div>
          {card.is_default && (
            <Badge variant="outline" className="text-xs">Default</Badge>
          )}
        </div>
      )
    },
    {
      key: 'expiry',
      label: 'Scadenza',
      render: (card: CreditCardInfo) => (
        <div className="flex items-center gap-2">
          <span>{String(card.expiry_month || 0).padStart(2, '0')}/{card.expiry_year || 0}</span>
          {card.expiry_month && card.expiry_year && isExpiringSoon(card.expiry_month, card.expiry_year) && (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
        </div>
      )
    },
    {
      key: 'transactions',
      label: 'Transazioni',
      render: (card: CreditCardInfo) => (
        <div>
          <div className="font-medium">{card.total_transactions || 0}</div>
          <div className="text-sm text-gray-500">€{(card.total_amount || 0).toFixed(2)}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Stato',
      render: (card: CreditCardInfo) => getStatusBadge(card.status || 'active')
    },
    {
      key: 'actions',
      label: 'Azioni',
      render: (card: CreditCardInfo) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCard(card);
              setModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {card.status === 'active' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => blockCard(card.id)}
              className="text-orange-600 hover:text-orange-700"
            >
              Blocca
            </Button>
          ) : card.status === 'blocked' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => unblockCard(card.id)}
              className="text-green-600 hover:text-green-700"
            >
              Sblocca
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            onClick={() => deleteCard(card.id)}
            className="text-red-600 hover:text-red-700"
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
        <CardTitle>Gestione Carte di Credito</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca carte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Tutti gli stati</option>
            <option value="active">Attive</option>
            <option value="expired">Scadute</option>
            <option value="blocked">Bloccate</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={filteredCards}
          columns={columns}
          loading={loading}
          emptyMessage="Nessuna carta di credito trovata"
        />
      </CardContent>

      <CrudModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCard(null);
        }}
        title={`Dettagli Carta - ${(selectedCard?.card_brand || '').toUpperCase()} ****${selectedCard?.card_last_four || ''}`}
      >
        {selectedCard && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Proprietario:</label>
                <p>{selectedCard.user_name}</p>
                <p className="text-sm text-gray-500">{selectedCard.user_email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Tipo Carta:</label>
                <p>{selectedCard.card_type}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Brand:</label>
                <p className="font-semibold">{(selectedCard.card_brand || '').toUpperCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Ultime 4 cifre:</label>
                <p className="font-mono">****{selectedCard.card_last_four || ''}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Scadenza:</label>
                <p>{String(selectedCard.expiry_month || 0).padStart(2, '0')}/{selectedCard.expiry_year || 0}</p>
                {selectedCard.expiry_month && selectedCard.expiry_year && isExpiringSoon(selectedCard.expiry_month, selectedCard.expiry_year) && (
                  <p className="text-sm text-orange-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Scade presto
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Stato:</label>
                <div className="mt-1">{getStatusBadge(selectedCard.status || 'active')}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Transazioni Totali:</label>
                <p className="font-semibold">{selectedCard.total_transactions || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Importo Totale:</label>
                <p className="font-semibold">€{(selectedCard.total_amount || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Registrata il:</label>
                <p>{new Date(selectedCard.created_at).toLocaleDateString('it-IT')}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Ultimo utilizzo:</label>
                <p>
                  {selectedCard.last_used 
                    ? new Date(selectedCard.last_used).toLocaleDateString('it-IT')
                    : "Mai utilizzata"
                  }
                </p>
              </div>
            </div>

            {selectedCard.is_default && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  Questa è la carta di pagamento predefinita dell'utente
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              {selectedCard.status === 'active' && (
                <Button
                  onClick={() => {
                    blockCard(selectedCard.id);
                    setModalOpen(false);
                  }}
                  variant="outline"
                  className="text-orange-600 hover:text-orange-700"
                >
                  Blocca Carta
                </Button>
              )}
              {selectedCard.status === 'blocked' && (
                <Button
                  onClick={() => {
                    unblockCard(selectedCard.id);
                    setModalOpen(false);
                  }}
                  variant="outline"
                  className="text-green-600 hover:text-green-700"
                >
                  Sblocca Carta
                </Button>
              )}
              <Button
                onClick={() => {
                  deleteCard(selectedCard.id);
                  setModalOpen(false);
                }}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                Elimina Carta
              </Button>
            </div>
          </div>
        )}
      </CrudModal>
    </Card>
  );
}