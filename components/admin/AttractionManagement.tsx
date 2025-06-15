"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import DataTable from "./DataTable";
import CrudModal from "./CrudModal";

interface Attraction {
  id: string;
  name: string;
  description: string;
  category: string;
  wait_time: number;
  status: 'open' | 'closed' | 'maintenance';
  thrill_level: number; // 1-5
  min_height: number; // cm
  duration: string; // string, non number
  capacity: number;
  rating: number; // decimal
  location_x: number;
  location_y: number;
  image: string;
  features: string[]; // array di caratteristiche
  created_at: string;
}

export default function AttractionManagement() {
  const { toast } = useToast();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    min_height: 0,
    capacity: 0,  
    duration: 0,
    status: 'open' as const,
    location_x: 0,  // Aggiunto
    location_y: 0,  // Aggiunto
    wait_time: 0
  });

  useEffect(() => {
    loadAttractions();
  }, []);

  const loadAttractions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/api/admin/attractions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      // Ensure we always set an array
      const attractionsData = response.data.data || response.data;
      setAttractions(Array.isArray(attractionsData) ? attractionsData : []);
    } catch (error) {
      setAttractions([]); // Set empty array on error
      toast({
        title: "Errore",
        description: "Impossibile caricare le attrazioni",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAttraction = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/api/admin/attractions", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      loadAttractions();
      setModalOpen(false);
      resetForm();
      toast({
        title: "Successo",
        description: "Attrazione creata con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare l'attrazione",
        variant: "destructive",
      });
    }
  };

  const updateAttraction = async () => {
    if (!editingAttraction) return;
    
    try {
      await axios.put(`http://127.0.0.1:8000/api/admin/attractions/${editingAttraction.id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      loadAttractions();
      setModalOpen(false);
      setEditingAttraction(null);
      resetForm();
      toast({
        title: "Successo",
        description: "Attrazione aggiornata con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'attrazione",
        variant: "destructive",
      });
    }
  };

  const deleteAttraction = async (attractionId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa attrazione?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/attractions/${attractionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      loadAttractions();
      toast({
        title: "Successo",
        description: "Attrazione eliminata con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'attrazione",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      wait_time: 0,
      status: 'open',
      thrill_level: 1,
      min_height: 0,
      duration: '',
      capacity: 0,
      rating: 0,
      location_x: 0,
      location_y: 0,
      image: '',
      features: []
    });
  };

  const handleEdit = (attraction: Attraction) => {
    setEditingAttraction(attraction);
    setFormData({
      name: attraction.name,
      description: attraction.description,
      category: attraction.category,
      min_height: attraction.min_height,
      capacity: attraction.capacity,  // Cambiato da max_capacity
      duration: attraction.duration,
      status: attraction.status,
      location_x: attraction.location_x,  // Aggiunto
      location_y: attraction.location_y,  // Aggiunto
      wait_time: attraction.wait_time
    });
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleCreate = () => {
    resetForm();
    setEditingAttraction(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: "Aperta", variant: "default" as const },
      closed: { label: "Chiusa", variant: "secondary" as const },
      maintenance: { label: "Manutenzione", variant: "destructive" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredAttractions = attractions.filter((attraction) =>
    attraction.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attraction.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      render: (attraction: Attraction) => attraction.name
    },
    {
      key: 'category',
      label: 'Categoria',
      render: (attraction: Attraction) => attraction.category
    },
    {
      key: 'location',
      label: 'Posizione',
      render: (attraction: Attraction) => attraction.location
    },
    {
      key: 'capacity',
      label: 'Capacità',
      render: (attraction: Attraction) => attraction.max_capacity
    },
    {
      key: 'wait_time',
      label: 'Tempo Attesa',
      render: (attraction: Attraction) => `${attraction.wait_time} min`
    },
    {
      key: 'status',
      label: 'Stato',
      render: (attraction: Attraction) => getStatusBadge(attraction.status)
    },
    {
      key: 'actions',
      label: 'Azioni',
      render: (attraction: Attraction) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(attraction)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => deleteAttraction(attraction.id)}
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
        <CardTitle>Gestione Attrazioni</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca attrazioni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuova Attrazione
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={filteredAttractions}
          columns={columns}
          loading={loading}
          emptyMessage="Nessuna attrazione trovata"
        />
      </CardContent>

      <CrudModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAttraction(null);
          resetForm();
        }}
        title={modalMode === 'create' ? 'Nuova Attrazione' : 'Modifica Attrazione'}
        onSubmit={modalMode === 'create' ? createAttraction : updateAttraction}
        submitLabel={modalMode === 'create' ? 'Crea' : 'Aggiorna'}
      >
        // Nel form modale, sostituire il contenuto con:
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nome dell'attrazione"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrizione dell'attrazione"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="Categoria"
              />
            </div>
            <div>
              <Label htmlFor="duration">Durata</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="es. 5 minuti"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="min_height">Altezza Min (cm)</Label>
              <Input
                id="min_height"
                type="number"
                value={formData.min_height}
                onChange={(e) => setFormData({...formData, min_height: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacità</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="thrill_level">Livello Brivido (1-5)</Label>
              <Input
                id="thrill_level"
                type="number"
                min="1"
                max="5"
                value={formData.thrill_level}
                onChange={(e) => setFormData({...formData, thrill_level: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location_x">Coordinata X</Label>
              <Input
                id="location_x"
                type="number"
                step="0.000001"
                value={formData.location_x}
                onChange={(e) => setFormData({...formData, location_x: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="location_y">Coordinata Y</Label>
              <Input
                id="location_y"
                type="number"
                step="0.000001"
                value={formData.location_y}
                onChange={(e) => setFormData({...formData, location_y: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">Valutazione</Label>
              <Input
                id="rating"
                type="number"
                step="0.01"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="wait_time">Tempo Attesa (min)</Label>
              <Input
                id="wait_time"
                type="number"
                value={formData.wait_time}
                onChange={(e) => setFormData({...formData, wait_time: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="image">URL Immagine</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              placeholder="URL dell'immagine"
            />
          </div>
          
          <div>
            <Label htmlFor="features">Caratteristiche (separate da virgola)</Label>
            <Input
              id="features"
              value={Array.isArray(formData.features) ? formData.features.join(', ') : ''}
              onChange={(e) => setFormData({...formData, features: e.target.value.split(',').map(f => f.trim()).filter(f => f)})}
              placeholder="es. Adrenalina, Famiglia, Al coperto"
            />
          </div>
          
          <div>
            <Label htmlFor="status">Stato</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as 'open' | 'closed' | 'maintenance'})}
              className="w-full p-2 border rounded"
            >
              <option value="open">Aperta</option>
              <option value="closed">Chiusa</option>
              <option value="maintenance">Manutenzione</option>
            </select>
          </div>
        </div>
      </CrudModal>
    </Card>
  );
}