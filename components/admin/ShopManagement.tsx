"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import DataTable from "./DataTable";
import CrudModal from "./CrudModal";
import { API_BASE_URL } from '../../lib/config';

interface Shop {
  id: string;
  name: string;
  category: string;
  description: string;
  location_x: number;
  location_y: number;
  image: string;
  specialties: string[];
  opening_hours: string;
  created_at: string;
}

export default function ShopManagement() {
  const { toast } = useToast();
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/shops`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      const data = response.data.data || response.data;
      setShops(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Errore nel caricamento dei negozi:", error);
      setShops([]);
      toast({
        title: "Errore",
        description: "Impossibile caricare i negozi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(
    (shop) =>
      shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      label: "Nome",
      render: (shop: Shop) => <div className="font-medium">{shop.name}</div>,
    },
    {
      key: "category",
      label: "Categoria",
      render: (shop: Shop) => shop.category,
    },
    {
      key: "specialties_count",
      label: "Specialità",
      render: (shop: Shop) => (
        <Badge variant="outline">
          {shop.specialties?.length || 0} specialità
        </Badge>
      ),
    },
    {
      key: "opening_hours",
      label: "Orari",
      render: (shop: Shop) => shop.opening_hours || "Non specificato",
    },
    {
      key: 'location',
      label: 'Posizione',
      render: (shop: Shop) => {
        const hasLocation = shop.location_x !== null && shop.location_x !== undefined && 
                       shop.location_y !== null && shop.location_y !== undefined;
        
        return (
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span className={`text-xs ${!hasLocation ? 'text-muted-foreground italic' : ''}`}>
              {hasLocation ? `X: ${shop.location_x}, Y: ${shop.location_y}` : 'Coordinate non disponibili'}
            </span>
          </div>
        )
      }
    },
    {
      key: "actions",
      label: "Azioni",
      render: (shop: Shop) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedShop(shop);
              setModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestione Negozi</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca negozi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable data={filteredShops} columns={columns} loading={loading} />
        </CardContent>
      </Card>

      <CrudModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedShop(null);
        }}
        title={`Dettagli Negozio: ${selectedShop?.name || "N/A"}`}
      >
        {selectedShop && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome:</label>
              <p>{selectedShop.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Categoria:</label>
              <p>{selectedShop.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Descrizione:</label>
              <p>{selectedShop.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Posizione:</label>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>
                  X: {selectedShop.location_x}, Y: {selectedShop.location_y}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Orari di Apertura:</label>
              <p>{selectedShop.opening_hours}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Specialità:</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedShop.specialties?.map((specialty, index) => (
                  <Badge key={index} variant="outline">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CrudModal>
    </>
  );
}
