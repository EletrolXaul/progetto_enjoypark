"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Search,
  Plus,
  Trash2,
  Star,
  MapPin,
  Utensils,
  ShoppingBag,
  Car,
  Download,
  Share,
  Users,
  Euro,
  Heart,
  CheckCircle,
  Circle,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { parkService } from "@/lib/services/park-service";
import { ServerError } from "@/components/ui/server-error";
import { useAuth } from "@/lib/contexts/auth-context";
import { usePlanner } from "@/lib/contexts/PlannerContext";
import axios from "axios";

interface PlannerItem {
  id: string;
  name: string;
  type: "attraction" | "show" | "restaurant" | "shop" | "service";
  time?: string;
  notes?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  originalData?: any; // Dati originali della struttura
}

export default function PlannerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { plannerItems, addToPlannerGlobal, removeFromPlannerGlobal, refreshPlanner, setPlannerItems } = usePlanner();
  
  // ALL useState hooks MUST be declared before any conditional returns
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);

  // ALL useEffect hooks MUST also be declared before any conditional returns
  useEffect(() => {
    const loadPlanner = async () => {
      if (user) {
        try {
          setLoading(true);
          setNetworkError(false);
          
          const response = await axios.get('http://127.0.0.1:8000/api/planner/items', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('enjoypark-token')}`
            },
            params: {
              date: selectedDate
            }
          });
          
          const responseData = response.data.data || [];
          
          // Ricostruisci originalData per gli elementi che ne sono privi
          const enhancedData = responseData.map((item: any) => {
            if (!item.originalData && item.id) {
              // Prova a ricostruire originalData dall'ID
              const parts = String(item.id).split('-');
              if (parts.length >= 2) {
                const originalId = parts[1];
                // Trova l'elemento corrispondente in allLocations se disponibile
                const foundLocation = allLocations?.find(loc => loc.id.toString() === originalId);
                if (foundLocation) {
                  item.originalData = foundLocation;
                } else {
                  // Crea un originalData minimale
                  item.originalData = {
                    id: parseInt(originalId),
                    name: item.name,
                    type: item.type
                  };
                }
              }
            }
            return item;
          });
          
          setPlannerItems(enhancedData);
          
        } catch (error) {
          console.error("Errore nel caricamento del planner dal backend:", error);
          setNetworkError(true);
          setPlannerItems([]);
          
          toast({
            title: "Errore di connessione",
            description: "Impossibile caricare il planner dal server. Riprova più tardi.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setPlannerItems([]);
      }
    };

    loadPlanner();
  }, [selectedDate, user, toast]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        setNetworkError(false);
        const locations = await parkService.getAllLocations();
        setAllLocations(locations);
        setError(null);
      } catch (error) {
        console.error("Errore nel caricamento delle location:", error);
        setNetworkError(true);
        setError(
          "Impossibile caricare i dati del parco. Verifica che il backend sia attivo."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  useEffect(() => {
    if (user && plannerItems.length > 0) {
      // Salva SOLO sul backend, non più su localStorage
      const savePlanner = async () => {
          try {
            // Validate and clean data before sending
            const validatedItems = plannerItems.map(item => ({
              item_id: item.id,
              name: item.name,
              type: item.type,
              time: item.time || null,
              notes: item.notes || null,
              priority: item.priority,
              completed: item.completed,
              original_data: item.originalData || null  // Cambiato da originalData a original_data
            }));

            console.log('Planner items prima della validazione:', plannerItems);
            console.log('Validated items:', validatedItems);
            console.log('Selected date:', selectedDate);
            console.log('Dati inviati al backend:', { date: selectedDate, items: validatedItems }); // Debug

            await axios.post('http://127.0.0.1:8000/api/planner/items', {
              date: selectedDate,
              items: validatedItems
            }, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('enjoypark-token')}`
              }
            });
          
          // Mostra messaggio di successo
          toast({
            title: "Planner salvato",
            description: "Il tuo planner è stato salvato sul server",
          });
          
        } catch (error) {
          console.error("Errore nel salvataggio del planner nel backend:", error);
          
          // NON salva più su localStorage in caso di errore
          toast({
            title: "Errore di salvataggio",
            description: "Impossibile salvare il planner sul server. Riprova più tardi.",
            variant: "destructive"
          });
        }
      };

      savePlanner();
    }
  }, [plannerItems, selectedDate, user, toast]);

  const syncWithServer = async () => {
    if (!user || plannerItems.length === 0) return;
    
    try {
      const validatedItems = plannerItems.map(item => ({
        item_id: item.id,
        name: item.name,
        type: item.type,
        time: item.time || null,
        notes: item.notes || null,
        priority: item.priority,
        completed: item.completed,
        original_data: item.originalData || null
      }));

      await axios.post('http://127.0.0.1:8000/api/planner/items', {
        date: selectedDate,
        items: validatedItems
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('enjoypark-token')}`
        }
      });
      
      // Rimuovi i dati locali dopo la sincronizzazione
      localStorage.removeItem(`enjoypark-planner-${user.id}-${selectedDate}`);
      
      toast({
        title: "Sincronizzazione completata",
        description: "Il planner è stato sincronizzato con il server",
      });
      
    } catch (error) {
      toast({
        title: "Errore di sincronizzazione",
        description: "Impossibile sincronizzare con il server",
        variant: "destructive"
      });
    }
  };

  const removeDuplicates = () => {
    const uniqueItems = plannerItems.filter((item, index, self) => {
      // Trova il primo elemento con lo stesso nome
      const firstIndex = self.findIndex(i => 
        i.name.toLowerCase().trim() === item.name.toLowerCase().trim()
      );
      return index === firstIndex;
    });
    
    setPlannerItems(uniqueItems);
    
    // Se l'utente è loggato, aggiorna anche sul server
    if (user) {
      // Salva la lista pulita sul server
      const savePlanner = async () => {
        try {
          const validatedItems = uniqueItems.map(item => ({
            item_id: item.id,
            name: item.name,
            type: item.type,
            time: item.time || null,
            notes: item.notes || null,
            priority: item.priority,
            completed: item.completed,
            original_data: item.originalData || null
          }));

          await axios.post('http://127.0.0.1:8000/api/planner/items', {
            date: selectedDate,
            items: validatedItems
          }, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('enjoypark-token')}`
            }
          });
          
          toast({
            title: "Duplicati rimossi",
            description: "Gli elementi duplicati sono stati rimossi dal planner",
          });
          
        } catch (error) {
          console.error("Errore nel salvataggio dopo rimozione duplicati:", error);
          toast({
            title: "Errore di salvataggio",
            description: "Impossibile salvare le modifiche sul server",
            variant: "destructive"
          });
        }
      };
      
      savePlanner();
    }
  };

  // ONLY AFTER all hooks are declared, you can have conditional returns
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Devi essere loggato per accedere al planner</p>
            <Button asChild className="mt-4">
              <Link href="/auth/login">Accedi</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Logica di filtro aggiornata per usare i dati dal backend
  const filteredLocations = searchTerm
    ? allLocations.filter(
        (location) =>
          location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (location.description &&
            location.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : selectedCategory === "all"
    ? allLocations
    : allLocations.filter((location) => location.type === selectedCategory);

  const addToPlanner = (location: any) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const userSuffix = Math.random().toString(36).substr(2, 5);
    const uniqueId = `${location.type}-${location.id}-${timestamp}-${randomId}-${userSuffix}`;
    
    const newItem: PlannerItem = {
      id: uniqueId,
      name: location.name,
      type: location.type as "attraction" | "show" | "restaurant" | "shop" | "service",
      time: selectedTime || undefined,
      notes: notes || undefined,
      priority: priority,
      completed: false,
      originalData: location,
    };

    // Controlla duplicati
    const exists = plannerItems.some(item => 
      item.originalData?.id === location.id && 
      item.type === location.type
    );
    
    if (exists) {
      toast({
        title: "Elemento già presente",
        description: `${location.name} è già nel tuo planner`,
        variant: "destructive"
      });
      return;
    }
    
    addToPlannerGlobal(newItem);
    
    // Reset form
    setSelectedTime("");
    setNotes("");
    setPriority("medium");

    toast({
      title: "Aggiunto al planner!",
      description: `${location.name} è stato aggiunto al tuo programma`,
    });
  };

  const removeFromPlanner = async (itemId: string) => {
    // Aggiorna lo stato locale
    const updatedItems = plannerItems.filter((item) => item.id !== itemId);
    setPlannerItems(updatedItems);
    
    // Se l'utente è loggato, sincronizza con il server
    if (user) {
      try {
        // Prepara i dati per il server
        const validatedItems = updatedItems.map(item => ({
          item_id: item.id,
          name: item.name,
          type: item.type,
          time: item.time || null,
          notes: item.notes || null,
          priority: item.priority,
          completed: item.completed,
          original_data: item.originalData || null
        }));

        // Invia al server
        await axios.post('http://127.0.0.1:8000/api/planner/items', {
          date: selectedDate,
          items: validatedItems
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('enjoypark-token')}`
          }
        });
      } catch (error) {
        console.error("Errore nella sincronizzazione con il server:", error);
        
        toast({
          title: "Errore di sincronizzazione",
          description: "Impossibile sincronizzare con il server. Riprova più tardi.",
          variant: "destructive"
        });
      }
    } else {
      // Se l'utente non è loggato, mostra un messaggio
      toast({
        title: "Utente non autenticato",
        description: "Devi effettuare l'accesso per salvare le modifiche sul server.",
        variant: "destructive"
      });
    }

    toast({
      title: "Rimosso dal planner",
      description: "Elemento rimosso dal tuo programma",
    });
  };

  const toggleCompleted = async (itemId: string) => {
    // Aggiorna lo stato locale
    const updatedItems = plannerItems.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setPlannerItems(updatedItems);
    
    // Se l'utente è loggato, sincronizza con il server
    if (user) {
      try {
        // Prepara i dati per il server
        const validatedItems = updatedItems.map(item => ({
          item_id: item.id,
          name: item.name,
          type: item.type,
          time: item.time || null,
          notes: item.notes || null,
          priority: item.priority,
          completed: item.completed,
          original_data: item.originalData || null
        }));

        // Invia al server
        await axios.post('http://127.0.0.1:8000/api/planner/items', {
          date: selectedDate,
          items: validatedItems
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('enjoypark-token')}`
          }
        });
      } catch (error) {
        console.error("Errore nella sincronizzazione con il server:", error);
        
        toast({
          title: "Errore di sincronizzazione",
          description: "Impossibile sincronizzare con il server. Riprova più tardi.",
          variant: "destructive"
        });
      }
    } else {
      // Se l'utente non è loggato, mostra un messaggio
      toast({
        title: "Utente non autenticato",
        description: "Devi effettuare l'accesso per salvare le modifiche sul server.",
        variant: "destructive"
      });
    }
  };

  const updateItemTime = (itemId: string, newTime: string) => {
    setPlannerItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, time: newTime } : item
      )
    );
  };

  const updateItemNotes = (itemId: string, newNotes: string) => {
    setPlannerItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, notes: newNotes } : item
      )
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "attraction":
        return <Star className="w-4 h-4" />;
      case "show":
        return <Calendar className="w-4 h-4" />;
      case "restaurant":
        return <Utensils className="w-4 h-4" />;
      case "shop":
        return <ShoppingBag className="w-4 h-4" />;
      case "service":
        return <Car className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "attraction":
        return "bg-blue-100 text-blue-600 border-blue-600 dark:bg-blue-900 dark:text-blue-200";
      case "show":
        return "bg-purple-100 text-purple-600 border-purple-600 dark:bg-purple-900 dark:text-purple-200";
      case "restaurant":
        return "bg-green-100 text-green-600 border-green-600 dark:bg-green-900 dark:text-green-200";
      case "shop":
        return "bg-yellow-100 text-yellow-600 border-yellow-600 dark:bg-yellow-900 dark:text-yellow-200";
      case "service":
        return "bg-gray-100 text-gray-600 border-gray-600 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-600 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Bassa";
      default:
        return "Media";
    }
  };

  const sortedPlannerItems = [...(plannerItems || [])].sort((a, b) => {
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    if (a.time && !b.time) return -1;
    if (!a.time && b.time) return 1;
    return 0;
  });

  const exportPlanner = () => {
    const plannerText = `
🎢 PLANNER ENJOYPARK - ${new Date(selectedDate).toLocaleDateString("it-IT")}

${sortedPlannerItems
  .map(
    (item) =>
      `${item.time || "Orario da definire"} - ${item.name} (${item.type})
  ${item.notes ? `Note: ${item.notes}` : ""}
  ${item.completed ? "✅ Completato" : "⏳ Da fare"}
`
  )
  .join("\n")}

Generato da EnjoyPark App
    `.trim();

    navigator.clipboard.writeText(plannerText);
    toast({
      title: "Planner copiato!",
      description: "Il tuo programma è stato copiato negli appunti",
    });
  };

  const isLocationInPlanner = (locationId: string) => {
    return plannerItems.some((item) => {
      // Caso 1: Confronto diretto con l'ID dell'elemento originale
      if (item.originalData?.id === locationId) {
        return true;
      }
      
      // Caso 2: Se originalData non ha ID, prova a ricostruirlo dall'item.id
      if (item.id && !item.originalData?.id) {
        const itemIdString = String(item.id);
        const itemIdParts = itemIdString.split('-');
        if (itemIdParts.length >= 2) {
          const reconstructedId = `${itemIdParts[0]}-${itemIdParts[1]}`;
          if (reconstructedId === locationId) {
            return true;
          }
        }
      }
      
      return false;
    });
  };

  // Se c'è un errore di rete, mostra il componente di errore
  if (networkError) {
    return (
      <ServerError 
        title="Planner Non Disponibile"
        message="Il sistema di pianificazione del parco è temporaneamente offline. Non è possibile accedere alle funzionalità del planner."
        onRetry={() => {
          setLoading(true)
          setNetworkError(false)
          setError(null)
          // Ricarica i dati
          const loadLocations = async () => {
            try {
              const locations = await parkService.getAllLocations();
              setAllLocations(locations);
            } catch (error) {
              setNetworkError(true)
              setError("Impossibile caricare i dati del parco.")
            } finally {
              setLoading(false)
            }
          }
          loadLocations()
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Caricamento dati del parco...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex items-center space-x-4 mb-2 sm:mb-0">
              <Button asChild variant="ghost">
                <Link href="/">← Torna alla Home</Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Planner Giornaliero
              </h1>
            </div>
            <Badge
              variant="outline"
              className="text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
            >
              {(plannerItems || []).length} Elementi Pianificati
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Controlli */}
          <div className="lg:col-span-1 space-y-6">
            {/* Selezione Data */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Seleziona Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {new Date(selectedDate).toLocaleDateString("it-IT", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </CardContent>
            </Card>

            {/* Filtri */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Cerca Strutture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cerca attrazioni, ristoranti..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      Tutte ({allLocations.length})
                    </SelectItem>
                    <SelectItem value="attraction">
                      Attrazioni (
                      {
                        allLocations.filter((l) => l.type === "attraction")
                          .length
                      }
                      )
                    </SelectItem>
                    <SelectItem value="show">
                      Spettacoli (
                      {allLocations.filter((l) => l.type === "show").length})
                    </SelectItem>
                    <SelectItem value="restaurant">
                      Ristoranti (
                      {
                        allLocations.filter((l) => l.type === "restaurant")
                          .length
                      }
                      )
                    </SelectItem>
                    <SelectItem value="shop">
                      Negozi (
                      {allLocations.filter((l) => l.type === "shop").length})
                    </SelectItem>
                    <SelectItem value="service">
                      Servizi (
                      {allLocations.filter((l) => l.type === "service").length})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Impostazioni Aggiunta */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Impostazioni Aggiunta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Orario (opzionale)
                  </label>
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priorità
                  </label>
                  <Select
                    value={priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setPriority(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">🔴 Alta</SelectItem>
                      <SelectItem value="medium">🟡 Media</SelectItem>
                      <SelectItem value="low">🟢 Bassa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Note (opzionale)
                  </label>
                  <Input
                    placeholder="Aggiungi note..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="browse" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="browse">
                  Esplora Strutture ({filteredLocations.length})
                </TabsTrigger>
                <TabsTrigger value="planner">
                  Il Mio Programma ({plannerItems.length})
                </TabsTrigger>
              </TabsList>

              {/* Tab Esplora - Grid di Card */}
              <TabsContent value="browse" className="space-y-6">
                {filteredLocations.length === 0 ? (
                  <Card className="text-center py-12 dark:bg-gray-800 dark:border-gray-700">
                    <CardContent>
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Nessuna struttura trovata
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Prova a modificare i filtri di ricerca
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredLocations.map((location) => (
                      <Card
                        key={location.id}
                        className="hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-gray-700 group"
                      >
                        {/* Image */}
                        <div className="relative">
                          <img
                              src={
                                location.image ||
                                "/placeholder.svg?height=160&width=300"
                              }
                              alt={location.name}
                              className="w-full h-40 object-cover rounded-t-lg"
                            />
                          <div className="absolute top-2 left-2">
                            <Badge className={getTypeColor(location.type)}>
                              <div className="flex items-center space-x-1">
                                {getTypeIcon(location.type)}
                                <span className="text-xs">
                                  {location.type === "attraction" &&
                                    "Attrazione"}
                                  {location.type === "show" && "Spettacolo"}
                                  {location.type === "restaurant" &&
                                    "Ristorante"}
                                  {location.type === "shop" && "Negozio"}
                                  {location.type === "service" && "Servizio"}
                                </span>
                              </div>
                            </Badge>
                          </div>
                          {/* Favorite button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>

                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Title */}
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                              {location.name}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {location.description}
                            </p>

                            {/* Info specifiche per tipo */}
                            <div className="flex items-center justify-between text-sm">
                              {location.type === "attraction" && (
                                <>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span>
                                      {location.waitTime} min
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span>{location.rating}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span>{location.capacity}</span>
                                  </div>
                                </>
                              )}

                              {location.type === "show" && (
                                <>
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs">
                                      {location.venue}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span>{location.duration}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Euro className="w-4 h-4 text-gray-500" />
                                    <span>€{location.price}</span>
                                  </div>
                                </>
                              )}

                              {location.type === "restaurant" && (
                                <>
                                  <div className="flex items-center space-x-1">
                                    <Utensils className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs">
                                      {location.cuisine}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Euro className="w-4 h-4 text-gray-500" />
                                    <span>{location.priceRange}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span>{location.rating}</span>
                                  </div>
                                </>
                              )}

                              {location.type === "shop" && (
                                <>
                                  <div className="flex items-center space-x-1">
                                    <ShoppingBag className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs">
                                      {location.category}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs">
                                      {location.openingHours}
                                    </span>
                                  </div>
                                </>
                              )}

                              {location.type === "service" && (
                                <>
                                  <div className="flex items-center space-x-1">
                                    <Car className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs">
                                      {location.category}
                                    </span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {location.available24h
                                      ? "24h"
                                      : "Orari limitati"}
                                  </Badge>
                                </>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2 pt-2">
                              {isLocationInPlanner(location.id) ? (
                                <Button
                                  disabled
                                  size="sm"
                                  className="flex-1 bg-green-100 text-green-700 hover:bg-green-100"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Aggiunto
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => addToPlanner(location)}
                                  size="sm"
                                  className="flex-1"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Aggiungi
                                </Button>
                              )}
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/map?highlight=${location.id}`}>
                                  <MapPin className="w-4 h-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab Planner - Grid di Card */}
              <TabsContent value="planner" className="space-y-6">
                {/* Header Planner */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                      <CardTitle>
                        Programma del{" "}
                        {new Date(selectedDate).toLocaleDateString("it-IT", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardTitle>
                      <div className="flex space-x-2">
                        {/* Pulsante di sincronizzazione rimosso */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportPlanner}
                        >
                          <Share className="w-4 h-4 mr-1" />
                          Condividi
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportPlanner}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Esporta
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {(plannerItems || []).length === 0 ? (
                  <Card className="text-center py-12 dark:bg-gray-800 dark:border-gray-700">
                    <CardContent>
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Nessuna attività pianificata
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Aggiungi attrazioni, spettacoli e ristoranti per creare
                        il tuo itinerario perfetto
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Grid delle attività pianificate */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sortedPlannerItems.map((item, index) => (
                      <Card
                        key={`planner-item-${item.id}-${index}-${Date.now()}`}
                        className={`transition-all duration-300 ${
                          item.completed
                            ? "opacity-75 bg-gray-50 dark:bg-gray-800/50"
                            : "dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg"
                        }`}
                      >
                          {/* Image se disponibile */}
                          {item.originalData?.image && (
                            <div className="relative">
                              <img
                                src={
                                  item.originalData.image || "/placeholder.svg"
                                }
                                alt={item.name}
                                className={`w-full h-32 object-cover rounded-t-lg ${
                                  item.completed ? "grayscale" : ""
                                }`}
                              />
                              <div className="absolute top-2 left-2">
                                <Badge className={getTypeColor(item.type)}>
                                  <div className="flex items-center space-x-1">
                                    {getTypeIcon(item.type)}
                                    <span className="text-xs">
                                      {item.type === "attraction" &&
                                        "Attrazione"}
                                      {item.type === "show" && "Spettacolo"}
                                      {item.type === "restaurant" &&
                                        "Ristorante"}
                                      {item.type === "shop" && "Negozio"}
                                      {item.type === "service" && "Servizio"}
                                    </span>
                                  </div>
                                </Badge>
                              </div>
                              <div className="absolute top-2 right-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${getPriorityColor(
                                    item.priority
                                  )}`}
                                />
                              </div>
                            </div>
                          )}

                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Header con checkbox e titolo */}
                              <div className="flex items-start space-x-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleCompleted(item.id)}
                                  className="p-0 h-auto"
                                >
                                  {item.completed ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-400" />
                                  )}
                                </Button>

                                <div className="flex-1">
                                  <h3
                                    className={`font-semibold text-lg ${
                                      item.completed
                                        ? "line-through text-gray-500"
                                        : "text-gray-900 dark:text-white"
                                    }`}
                                  >
                                    {item.name}
                                  </h3>

                                  {/* Priorità e tipo */}
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {getPriorityLabel(item.priority)}
                                    </Badge>
                                    {!item.originalData?.image && (
                                      <Badge
                                        className={getTypeColor(item.type)}
                                      >
                                        <div className="flex items-center space-x-1">
                                          {getTypeIcon(item.type)}
                                          <span className="text-xs">
                                            {item.type === "attraction" &&
                                              "Attrazione"}
                                            {item.type === "show" &&
                                              "Spettacolo"}
                                            {item.type === "restaurant" &&
                                              "Ristorante"}
                                            {item.type === "shop" && "Negozio"}
                                            {item.type === "service" &&
                                              "Servizio"}
                                          </span>
                                        </div>
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Orario */}
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <Input
                                  type="time"
                                  value={item.time || ""}
                                  onChange={(e) =>
                                    updateItemTime(item.id, e.target.value)
                                  }
                                  className="w-32 h-8 text-sm"
                                  placeholder="Orario"
                                />
                                <span className="text-sm text-gray-500">
                                  {item.time ? "" : "Orario da definire"}
                                </span>
                              </div>

                              {/* Note */}
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Edit3 className="w-4 h-4 text-gray-400" />
                                  <Input
                                    placeholder="Aggiungi note..."
                                    value={item.notes || ""}
                                    onChange={(e) =>
                                      updateItemNotes(item.id, e.target.value)
                                    }
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>

                              {/* Info aggiuntive dalla struttura originale */}
                              {item.originalData && (
                                <div className="text-xs text-gray-500 space-y-1">
                                  {item.type === "attraction" && (
                                    <div className="flex items-center justify-between">
                                      <span>
                                        ⏱️ Attesa: {item.originalData.waitTime}{" "}
                                        min
                                      </span>
                                      <span>
                                        ⭐ {item.originalData.rating}/5
                                      </span>
                                    </div>
                                  )}
                                  {item.type === "show" && (
                                    <div className="flex items-center justify-between">
                                      <span>📍 {item.originalData.venue}</span>
                                      <span>💰 €{item.originalData.price}</span>
                                    </div>
                                  )}
                                  {item.type === "restaurant" && (
                                    <div className="flex items-center justify-between">
                                      <span>
                                        🍽️ {item.originalData.cuisine}
                                      </span>
                                      <span>
                                        💰 {item.originalData.priceRange}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex space-x-2 pt-2 border-t">
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  <Link
                                    href={`/map?highlight=${
                                      item.originalData?.id || ""
                                    }`}
                                  >
                                    <MapPin className="w-4 h-4 mr-1" />
                                    Mappa
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFromPlanner(item.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Statistiche */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-4">
                          Statistiche del Programma
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                          <div className="space-y-1">
                            <div className="text-2xl font-bold text-blue-600">
                              {
                                plannerItems?.filter(
                                  (item) => item.type === "attraction" && !item.completed
                                ).length || 0
                              }
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Attrazioni
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-2xl font-bold text-purple-600">
                              {
                                plannerItems?.filter(
                                  (item) => item.type === "show" && !item.completed
                                ).length || 0
                              }
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Spettacoli
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-2xl font-bold text-green-600">
                              {
                                plannerItems?.filter(
                                  (item) => item.type === "restaurant" && !item.completed
                                ).length || 0
                              }
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Ristoranti
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-2xl font-bold text-yellow-600">
                              {
                                plannerItems?.filter(
                                  (item) => item.type === "shop" && !item.completed
                                ).length || 0
                              }
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Negozi
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-2xl font-bold text-gray-600">
                              {
                                plannerItems?.filter((item) => item.completed)
                                  .length || 0
                              }
                              /{(plannerItems || []).length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Completati
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span>Progresso giornata</span>
                            <span>
                              {Math.round(
                                ((plannerItems?.filter((item) => item.completed)
                                  .length || 0) /
                                  Math.max((plannerItems || []).length, 1)) *
                                  100
                              ) || 0}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  ((plannerItems?.filter((item) => item.completed)
                                    .length || 0) /
                                    Math.max((plannerItems || []).length, 1)) *
                                    100 || 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
