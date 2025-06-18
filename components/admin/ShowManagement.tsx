"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import DataTable from "./DataTable";
import CrudModal from "./CrudModal";
import { API_BASE_URL } from '../../lib/config';

interface Show {
  id: string;
  slug: string;
  name: string;
  description: string;
  venue: string;
  duration: string; // string nel backend
  category: string;
  times: string[];
  capacity: number;
  available_seats: number;
  rating: number;
  price: number;
  age_restriction: string; // string nel backend
  location_x: number;
  location_y: number;
  image: string;
  status: 'active' | 'inactive' | 'maintenance'; // Aggiunta proprietà mancante
  created_at: string;
}

export default function ShowManagement() {
  const { toast } = useToast();
  const [shows, setShows] = useState<Show[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState({
    name: '',
    slug: '', // Aggiunto
    description: '',
    venue: '', // Aggiunto
    duration: '', // Cambiato da number a string
    category: '', // Aggiunto
    capacity: 0,
    available_seats: 0, // Aggiunto
    rating: 0, // Aggiunto
    price: 0,
    age_restriction: '', // Aggiunto
    location_x: 0,
    location_y: 0,
    image: '', // Aggiunto
    status: 'active' as 'active' | 'inactive' | 'maintenance', // Aggiunto
    times: ''
  });

  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/shows`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      // Ensure we always set an array
      const showsData = response.data.data || response.data;
      setShows(Array.isArray(showsData) ? showsData : []);
    } catch (error) {
      setShows([]); // Set empty array on error
      toast({
        title: "Errore",
        description: "Impossibile caricare gli spettacoli",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createShow = async () => {
    try {
      // Assicurati che ci siano coordinate e immagine
      const showData = {
        ...formData,
        times: formData.times.split(',').map(time => time.trim()),
        location_x: formData.location_x || Math.floor(Math.random() * 100),
        location_y: formData.location_y || Math.floor(Math.random() * 100),
        image: formData.image || '/placeholder.jpg'
      };
      
      await axios.post(`${API_BASE_URL}/api/admin/shows`, showData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      loadShows();
      setModalOpen(false);
      resetForm();
      toast({
        title: "Successo",
        description: "Spettacolo creato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare lo spettacolo",
        variant: "destructive",
      });
    }
  };

  const updateShow = async () => {
    if (!editingShow) return;
    
    try {
      const showData = {
        ...formData,
        times: formData.times.split(',').map(time => time.trim())  // Cambiato da show_times
      };
      await axios.put(`${API_BASE_URL}/api/admin/shows/${editingShow.id}`, showData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      loadShows();
      setModalOpen(false);
      setEditingShow(null);
      resetForm();
      toast({
        title: "Successo",
        description: "Spettacolo aggiornato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo spettacolo",
        variant: "destructive",
      });
    }
  };

  const deleteShow = async (showId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo spettacolo?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/shows/${showId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      loadShows();
      toast({
        title: "Successo",
        description: "Spettacolo eliminato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare lo spettacolo",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    // Genera coordinate casuali tra 0 e 100
    const randomX = Math.floor(Math.random() * 100);
    const randomY = Math.floor(Math.random() * 100);
    
    setFormData({
      name: '',
      slug: '',
      description: '',
      venue: '',
      duration: '', // string invece di number
      category: '',
      capacity: 0,
      available_seats: 0,
      rating: 0,
      price: 0,
      age_restriction: '',
      location_x: randomX, // Coordinate casuali
      location_y: randomY, // Coordinate casuali
      image: '/placeholder.jpg', // Immagine placeholder di default
      status: 'active' as 'active' | 'inactive' | 'maintenance',
      times: ''
    });
  };

  const handleEdit = (show: Show) => {
    setEditingShow(show);
    setFormData({
      name: show.name,
      slug: show.slug,
      description: show.description,
      venue: show.venue,
      duration: show.duration,
      category: show.category,
      capacity: show.capacity,
      available_seats: show.available_seats,
      rating: show.rating,
      price: show.price,
      age_restriction: show.age_restriction,
      location_x: show.location_x,
      location_y: show.location_y,
      image: show.image,
      status: show.status,
      times: show.times.join(', ')
    });
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleCreate = () => {
    resetForm();
    setEditingShow(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Attivo", variant: "default" as const },
      inactive: { label: "Inattivo", variant: "secondary" as const },
      maintenance: { label: "Manutenzione", variant: "destructive" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredShows = shows.filter((show) =>
    show.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    show.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    show.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      render: (show: Show) => show.name
    },
    {
      key: 'venue',
      label: 'Luogo',
      render: (show: Show) => show.venue
    },
    {
      key: 'category',
      label: 'Categoria',
      render: (show: Show) => show.category
    },
    {
      key: 'duration',
      label: 'Durata',
      render: (show: Show) => show.duration
    },
    {
      key: 'capacity',
      label: 'Capacità',
      render: (show: Show) => show.capacity
    },
    {
      key: 'available_seats',
      label: 'Posti Disponibili',
      render: (show: Show) => show.available_seats
    },
    {
      key: 'price',
      label: 'Prezzo',
      render: (show: Show) => `€${Number(show.price || 0).toFixed(2)}`
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (show: Show) => `${show.rating}/5`
    },
    {
      key: 'status',
      label: 'Stato',
      render: (show: Show) => getStatusBadge(show.status)
    },
    {
      key: 'actions',
      label: 'Azioni',
      render: (show: Show) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(show)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => deleteShow(show.id)}
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
        <CardTitle>Gestione Spettacoli</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca spettacoli..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Spettacolo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={filteredShows}
          columns={columns}
          loading={loading}
          emptyMessage="Nessuno spettacolo trovato"
        />
      </CardContent>

      <CrudModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingShow(null);
          resetForm();
        }}
        title={modalMode === 'create' ? 'Nuovo Spettacolo' : 'Modifica Spettacolo'}
        onSubmit={modalMode === 'create' ? createShow : updateShow}
        submitLabel={modalMode === 'create' ? 'Crea' : 'Aggiorna'}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nome dello spettacolo"
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              placeholder="slug-spettacolo"
            />
          </div>
          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrizione dello spettacolo"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="venue">Luogo</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData({...formData, venue: e.target.value})}
                placeholder="Luogo dello spettacolo"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="Categoria"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Durata</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})} // string invece di number
                placeholder="45 min"
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="available_seats">Posti Disponibili</Label>
              <Input
                id="available_seats"
                type="number"
                value={formData.available_seats}
                onChange={(e) => setFormData({...formData, available_seats: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="price">Prezzo (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div>
            <Label htmlFor="age_restriction">Restrizione età</Label>
            <Input
              id="age_restriction"
              value={formData.age_restriction}
              onChange={(e) => setFormData({...formData, age_restriction: e.target.value})}
              placeholder="Tutti"
            />
          </div>
          <div>
            <Label htmlFor="times">Orari (separati da virgola)</Label>
            <Input
              id="times"
              value={formData.times}
              onChange={(e) => setFormData({...formData, times: e.target.value})}
              placeholder="10:00, 14:00, 18:00"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location_x">Posizione X</Label>
              <Input
                id="location_x"
                type="number"
                step="0.000001"
                value={formData.location_x}
                onChange={(e) => setFormData({...formData, location_x: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="location_y">Posizione Y</Label>
              <Input
                id="location_y"
                type="number"
                step="0.000001"
                value={formData.location_y}
                onChange={(e) => setFormData({...formData, location_y: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="image">Immagine URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              placeholder="URL dell'immagine"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Stato</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive' | 'maintenance'})}
              className="w-full p-2 border rounded"
            >
              <option value="active">Attivo</option>
              <option value="inactive">Inattivo</option>
              <option value="maintenance">Manutenzione</option>
            </select>
          </div>
        </div>
      </CrudModal>
    </Card>
  );
}
