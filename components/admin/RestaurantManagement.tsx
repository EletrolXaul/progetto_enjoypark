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

interface Restaurant {
  id: string;
  name: string;
  category: string;
  cuisine: string;
  price_range: string;
  rating: number;
  description: string;
  location_x: number;
  location_y: number;
  image: string;
  features: string[];
  opening_hours: string;
  created_at: string;
}

export default function RestaurantManagement() {
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://127.0.0.1:8000/api/restaurants",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );
      const data = response.data.data || response.data;
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Errore nel caricamento dei ristoranti:", error);
      setRestaurants([]);
      toast({
        title: "Errore",
        description: "Impossibile caricare i ristoranti",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      label: "Nome",
      render: (restaurant: Restaurant) => (
        <div className="font-medium">{restaurant.name}</div>
      ),
    },
    {
      key: "category",
      label: "Categoria",
      render: (restaurant: Restaurant) => restaurant.category,
    },
    {
      key: "cuisine",
      label: "Cucina",
      render: (restaurant: Restaurant) => restaurant.cuisine,
    },
    {
      key: "price_range",
      label: "Fascia Prezzo",
      render: (restaurant: Restaurant) => (
        <span
          className={
            restaurant.price_range ? "" : "text-muted-foreground italic"
          }
        >
          {restaurant.price_range || "Da definire"}
        </span>
      ),
    },
    {
      key: "rating",
      label: "Valutazione",
      render: (restaurant: Restaurant) => (
        <Badge variant="outline">
          ⭐ {Number(restaurant.rating || 0).toFixed(1)}
        </Badge>
      ),
    },
    {
      key: "location",
      label: "Posizione",
      render: (restaurant: Restaurant) => {
        const hasLocation = restaurant.location_x !== null && restaurant.location_x !== undefined && 
                       restaurant.location_y !== null && restaurant.location_y !== undefined;
        
        return (
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span className={`text-xs ${!hasLocation ? 'text-muted-foreground italic' : ''}`}>
              {hasLocation ? `X: ${restaurant.location_x}, Y: ${restaurant.location_y}` : 'Coordinate non disponibili'}
            </span>
          </div>
        )
      }
    },
    {
      key: "opening_hours",
      label: "Orari Apertura",
      render: (restaurant: Restaurant) => (
        <span
          className={`text-sm ${
            !restaurant.opening_hours ? "text-muted-foreground italic" : ""
          }`}
        >
          {restaurant.opening_hours || "Da definire"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Azioni",
      render: (restaurant: Restaurant) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedRestaurant(restaurant);
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
          <CardTitle>Gestione Ristoranti</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca ristoranti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredRestaurants}
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>

      <CrudModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedRestaurant(null);
        }}
        title={`Dettagli Ristorante: ${selectedRestaurant?.name || "N/A"}`}
      >
        {selectedRestaurant && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome:</label>
              <p>{selectedRestaurant.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Categoria:</label>
              <p>{selectedRestaurant.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Tipo di Cucina:</label>
              <p>{selectedRestaurant.cuisine}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Fascia di Prezzo:</label>
              <p>{selectedRestaurant.price_range}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Valutazione:</label>
              <Badge variant="outline">
                ⭐ {Number(selectedRestaurant.rating || 0).toFixed(1)}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Descrizione:</label>
              <p>{selectedRestaurant.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Posizione:</label>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>
                  X: {selectedRestaurant.location_x}, Y:{" "}
                  {selectedRestaurant.location_y}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Orari di Apertura:</label>
              <p>{selectedRestaurant.opening_hours}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Caratteristiche:</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedRestaurant.features?.map((feature, index) => (
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
