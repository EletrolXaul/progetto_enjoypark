"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import DataTable from "./DataTable";
import CrudModal from "./CrudModal";
import { API_BASE_URL } from '../../lib/config';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  location_x: number;
  location_y: number;
  icon: string;
  available_24h: boolean;
  features: string[];
  created_at: string;
}

export default function ServiceManagement() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/services`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      const data = response.data.data || response.data;
      
      // Debug: verifica i dati ricevuti
      console.log('Dati servizi dal backend:', data);
      if (data.length > 0) {
        console.log('Primo servizio - Coordinate:', {
          location_x: data[0].location_x,
          location_y: data[0].location_y,
          tipo: typeof data[0].location_x
        });
      }
      
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Errore nel caricamento dei servizi:", error);
      setServices([]);
      toast({
        title: "Errore",
        description: "Impossibile caricare i servizi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      label: "Nome",
      render: (service: Service) => (
        <div className="font-medium">{service.name}</div>
      ),
    },
    {
      key: "category",
      label: "Categoria",
      render: (service: Service) => service.category,
    },
    {
      key: "availability",
      label: "Disponibilità",
      render: (service: Service) => (
        <Badge variant={service.available_24h ? "default" : "secondary"}>
          <Clock className="h-3 w-3 mr-1" />
          {service.available_24h ? "24h" : "Orari limitati"}
        </Badge>
      ),
    },
    {
      key: "location",
      label: "Posizione",
      render: (service: Service) => {
        const hasLocation = service.location_x !== null && service.location_x !== undefined && 
                       service.location_y !== null && service.location_y !== undefined;
        
        return (
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span className={`text-xs ${!hasLocation ? 'text-muted-foreground italic' : ''}`}>
              {hasLocation ? `X: ${service.location_x}, Y: ${service.location_y}` : 'Coordinate non disponibili'}
            </span>
          </div>
        )
      }
    },
    {
      key: "features_count",
      label: "Caratteristiche",
      render: (service: Service) => (
        <Badge variant="outline">
          {service.features?.length || 0} caratteristiche
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Azioni",
      render: (service: Service) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedService(service);
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
          <CardTitle>Gestione Servizi</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca servizi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredServices}
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>

      <CrudModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedService(null);
        }}
        title={`Dettagli Servizio: ${selectedService?.name || "N/A"}`}
      >
        {selectedService && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome:</label>
              <p>{selectedService.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Categoria:</label>
              <p>{selectedService.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Descrizione:</label>
              <p>{selectedService.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Posizione:</label>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className={`${selectedService.location_x === null || selectedService.location_x === undefined || selectedService.location_y === null || selectedService.location_y === undefined ? 'text-muted-foreground italic' : ''}`}>
                  {selectedService.location_x !== null && selectedService.location_x !== undefined && selectedService.location_y !== null && selectedService.location_y !== undefined 
                    ? `X: ${selectedService.location_x}, Y: ${selectedService.location_y}` 
                    : 'Coordinate non disponibili'}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Disponibilità:</label>
              <Badge
                variant={
                  selectedService.available_24h ? "default" : "secondary"
                }
              >
                <Clock className="h-3 w-3 mr-1" />
                {selectedService.available_24h
                  ? "Disponibile 24h"
                  : "Orari limitati"}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Caratteristiche:</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedService.features?.map((feature, index) => (
                  <Badge key={index} variant="outline">
                    {feature}
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
