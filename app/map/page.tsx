"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Search,
  Navigation,
  Clock,
  Star,
  Utensils,
  ShoppingBag,
  Car,
  Calendar,
  Users,
  Euro,
  CheckCircle,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/language-context";
import { useAuth } from "@/lib/contexts/auth-context";
import { usePlanner } from "@/lib/contexts/PlannerContext";

import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { parkService } from "@/lib/services/park-service";
import { ServerError } from "@/components/ui/server-error";

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

interface PlannerItemResponse {
  id?: string;
  item_id?: string;
  name: string;
  type: "attraction" | "show" | "restaurant" | "shop" | "service";
  time?: string | null;
  notes?: string | null;
  priority?: "low" | "medium" | "high";
  completed?: boolean;
  original_data?: any;
}

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Stati per lo zoom della mappa
  const [mapScale, setMapScale] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [lastMousePosition, setLastMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();

  // Nuovi stati per gestire i dati dal backend
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false); // AGGIUNTO: stato per errori di rete

  // Carica i dati dal backend
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        setNetworkError(false);
        const data = await parkService.getAllLocations();

        // Verifica che tutti gli elementi abbiano un tipo valido
        const validData = data.filter((item) => {
          if (!item.type) {
            console.warn("Elemento senza tipo:", item);
            return false;
          }
          return true;
        });

        console.log("Dati caricati completi:", validData.length);
        console.log("Tipi unici:", [
          ...new Set(validData.map((loc) => loc.type)),
        ]);
        console.log("Numero totale di strutture:", validData.length);

        setAllLocations(validData);
        setError(null);
      } catch (err) {
        console.error("Error loading locations:", err);
        setNetworkError(true);
        setError("Errore nel caricamento delle strutture");
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  // Se c'è un errore di rete, mostra il componente di errore
  if (networkError) {
    return (
      <ServerError
        title="Mappa Non Disponibile"
        message="Il sistema di navigazione del parco è temporaneamente offline. La mappa interattiva non può essere caricata."
        onRetry={() => {
          setLoading(true);
          setNetworkError(false);
          setError(null);
          // Ricarica i dati
          const loadLocations = async () => {
            try {
              const data = await parkService.getAllLocations();
              setAllLocations(data);
            } catch (err) {
              setNetworkError(true);
              setError("Errore nel caricamento delle strutture");
            } finally {
              setLoading(false);
            }
          };
          loadLocations();
        }}
      />
    );
  }

  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [highlightedLocation, setHighlightedLocation] = useState<string | null>(
    null
  );

  // Usa il context globale per il planner
  const { plannerItems, addToPlannerGlobal, removeFromPlannerGlobal, refreshPlanner } = usePlanner();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Funzioni per gestire zoom e pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Aggiungi classe per prevenire scroll della pagina
    document.body.classList.add("map-zooming");

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.8, Math.min(3, mapScale + delta)); // Cambiato min da 0.5 a 0.8

    // Zoom verso il punto del mouse
    const scaleChange = newScale / mapScale;
    const newX =
      mapPosition.x + ((mouseX - centerX) * (1 - scaleChange)) / newScale;
    const newY =
      mapPosition.y + ((mouseY - centerY) * (1 - scaleChange)) / newScale;

    setMapScale(newScale);
    setMapPosition({ x: newX, y: newY });

    // Rimuovi classe dopo un breve delay
    setTimeout(() => {
      document.body.classList.remove("map-zooming");
    }, 100);
  };

  // Riferimento al contenitore della mappa
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Aggiungi questo useEffect per gestire gli eventi touch con {passive: false}
  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (!mapContainer) return;

    // Funzioni handler che possono chiamare preventDefault
    const touchStartHandler = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Aggiungi classe al body per prevenire zoom del browser
      document.body.classList.add("map-active");

      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        setLastTouchDistance(distance);
      } else if (e.touches.length === 1) {
        setIsDragging(true);
      }
    };

    const touchMoveHandler = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.touches.length === 2) {
        // Zoom con pinch
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        if (lastTouchDistance > 0) {
          const scale = distance / lastTouchDistance;
          const newScale = Math.max(0.8, Math.min(3, mapScale * scale));
          setMapScale(newScale);
        }
        setLastTouchDistance(distance);
      } else if (e.touches.length === 1 && isDragging) {
        // Pan con un dito
        const touch = e.touches[0];
        const rect = mapContainer.getBoundingClientRect();
        const x = (touch.clientX - rect.left - rect.width / 2) / mapScale;
        const y = (touch.clientY - rect.top - rect.height / 2) / mapScale;
        setMapPosition({ x: -x, y: -y });
      }
    };

    const touchEndHandler = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Rimuovi classe dal body
      document.body.classList.remove("map-active");

      setIsDragging(false);
      setLastTouchDistance(0);
    };

    // Aggiungi il wheel handler qui
    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Aggiungi classe per prevenire scroll della pagina
      document.body.classList.add("map-zooming");

      // Verifica che currentTarget sia un HTMLElement e usa type assertion
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.8, Math.min(3, mapScale + delta)); // Cambiato min da 0.5 a 0.8

      // Zoom verso il punto del mouse
      const scaleChange = newScale / mapScale;
      const newX =
        mapPosition.x + ((mouseX - centerX) * (1 - scaleChange)) / newScale;
      const newY =
        mapPosition.y + ((mouseY - centerY) * (1 - scaleChange)) / newScale;

      setMapScale(newScale);
      setMapPosition({ x: newX, y: newY });

      // Rimuovi classe dopo un breve delay
      setTimeout(() => {
        document.body.classList.remove("map-zooming");
      }, 100);
    };

    // Aggiungi event listener con {passive: false}
    mapContainer.addEventListener("touchstart", touchStartHandler, {
      passive: false,
    });
    mapContainer.addEventListener("touchmove", touchMoveHandler, {
      passive: false,
    });
    mapContainer.addEventListener("touchend", touchEndHandler, {
      passive: false,
    });
    mapContainer.addEventListener("wheel", wheelHandler, { passive: false });

    // Cleanup
    return () => {
      mapContainer.removeEventListener("touchstart", touchStartHandler);
      mapContainer.removeEventListener("touchmove", touchMoveHandler);
      mapContainer.removeEventListener("touchend", touchEndHandler);
      mapContainer.removeEventListener("wheel", wheelHandler);
      // Assicurati di rimuovere la classe dal body quando il componente viene smontato
      document.body.classList.remove("map-active");
      document.body.classList.remove("map-zooming");
    };
  }, [
    lastTouchDistance,
    isDragging,
    mapScale,
    mapPosition,
    setMapPosition,
    setMapScale,
    setLastTouchDistance,
    setIsDragging,
  ]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Aggiungi classe al body per prevenire zoom del browser
    document.body.classList.add("map-active");

    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1) {
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.touches.length === 2) {
      // Zoom con pinch
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      if (lastTouchDistance > 0) {
        const scale = distance / lastTouchDistance;
        const newScale = Math.max(0.8, Math.min(3, mapScale * scale));
        setMapScale(newScale);
      }
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1 && isDragging) {
      // Pan con un dito
      const touch = e.touches[0];
      // Verifica che currentTarget sia un HTMLElement e usa type assertion
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const x = (touch.clientX - rect.left - rect.width / 2) / mapScale;
      const y = (touch.clientY - rect.top - rect.height / 2) / mapScale;
      setMapPosition({ x: -x, y: -y });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Rimuovi classe dal body
    document.body.classList.remove("map-active");

    setIsDragging(false);
    setLastTouchDistance(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setLastMousePosition({ x: e.clientX, y: e.clientY });

    // Aggiungi classe al body per prevenire selezione durante il trascinamento
    document.body.classList.add("map-active");
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && lastMousePosition) {
      e.preventDefault();
      const deltaX = e.clientX - lastMousePosition.x;
      const deltaY = e.clientY - lastMousePosition.y;

      // Applica un fattore di smorzamento per rendere il movimento più fluido
      // e tieni conto della scala attuale per un movimento coerente
      const dampingFactor = 1.0; // Puoi regolare questo valore (0.5-1.5) per un movimento più o meno reattivo

      setMapPosition((prev) => {
        const newPosition = {
          x: prev.x + (deltaX / mapScale) * dampingFactor,
          y: prev.y + (deltaY / mapScale) * dampingFactor,
        };

        // Utilizza la funzione constrainMapPosition per limitare il movimento
        return constrainMapPosition(mapScale, newPosition);
      });

      setLastMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLastMousePosition(null);

    // Rimuovi la classe dal body quando il trascinamento termina
    document.body.classList.remove("map-active");
  };

  const resetMapView = () => {
    setMapScale(1);
    setMapPosition({ x: 0, y: 0 });
  };

  // Modifica la funzione constrainMapPosition per un controllo più preciso
  const constrainMapPosition = (
    scale: number,
    position: { x: number; y: number }
  ) => {
    // Calcola il limite di movimento in base alla scala attuale
    // Più grande è la scala (zoom in), più ampio sarà il limite di movimento
    const maxOffset = Math.max(0, (scale - 1) * 300); // Aumentato da 200 a 300 per permettere più movimento

    return {
      x: Math.max(-maxOffset, Math.min(maxOffset, position.x)),
      y: Math.max(-maxOffset, Math.min(maxOffset, position.y)),
    };
  };

  // Carica il planner quando la pagina si monta
  useEffect(() => {
    if (user) {
      refreshPlanner();
    }
  }, [user, selectedDate, refreshPlanner]);

  // Forza il re-render quando plannerItems cambia
  useEffect(() => {
    // console.log("Planner items updated:", plannerItems.length, plannerItems);
  }, [plannerItems]);

  // Aggiungi questo useEffect per ricaricare il planner quando la pagina diventa visibile
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // La pagina è diventata visibile, ricarica il planner
        refreshPlanner();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, refreshPlanner]);

  // Effetto per evidenziare una struttura specifica
  useEffect(() => {
    if (highlightId && allLocations.length > 0) {
      setHighlightedLocation(highlightId);
      // Trova la struttura e aprila automaticamente
      const locationToHighlight = allLocations.find(
        (loc) => loc.id === highlightId
      );
      if (locationToHighlight) {
        setSelectedLocation(locationToHighlight);
        // Scroll verso la struttura evidenziata dopo un breve delay
        setTimeout(() => {
          const element = document.getElementById(`location-${highlightId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
    }
  }, [highlightId, allLocations]);

  // Aggiungi dopo gli altri useEffect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && highlightedLocation) {
        setHighlightedLocation(null);
        setSelectedLocation(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [highlightedLocation]);

  // Stato per i risultati filtrati
  const [filteredLocations, setFilteredLocations] = useState<any[]>([]);

  // Funzione di ricerca che utilizza parkService
  const searchLocations = async (term: string) => {
    try {
      return await parkService.searchLocations(term);
    } catch (error) {
      console.error("Errore nella ricerca:", error);
      toast({
        title: "Errore",
        description: "Impossibile completare la ricerca. Riprova più tardi.",
        variant: "destructive",
      });
      return [];
    }
  };

  // Effetto per gestire la ricerca e il filtro
  useEffect(() => {
    const performSearch = async () => {
      try {
        if (searchTerm) {
          const results = await searchLocations(searchTerm);
          console.log("Risultati ricerca:", results.length);
          setFilteredLocations(results);
        } else {
          let filtered;
          if (selectedCategory === "all") {
            filtered = allLocations;
            console.log("Mostrando tutte le location:", filtered.length);
          } else {
            // Verifica che i tipi siano definiti correttamente
            console.log("Tipi disponibili:", [
              ...new Set(allLocations.map((loc) => loc.type)),
            ]);
            console.log("Categoria selezionata:", selectedCategory);

            // Filtro più robusto con controllo di tipo
            filtered = allLocations.filter((location) => {
              const locationType = location.type;
              const match = locationType === selectedCategory;
              console.log(
                `Location: ${location.name}, tipo: ${locationType}, match: ${match}`
              );
              return match;
            });

            console.log(
              "Filtrati per categoria:",
              selectedCategory,
              filtered.length
            );
          }
          setFilteredLocations(filtered);
        }
      } catch (error) {
        console.error("Errore nel filtraggio:", error);
        setFilteredLocations(allLocations);
      }
    };

    performSearch();
  }, [searchTerm, selectedCategory, allLocations]);

  const categories = [
    { id: "all", name: "Tutti", icon: MapPin },
    { id: "attraction", name: "Attrazioni", icon: Star },
    { id: "restaurant", name: "Ristoranti", icon: Utensils },
    { id: "shop", name: "Negozi", icon: ShoppingBag },
    { id: "service", name: "Servizi", icon: Car },
    { id: "show", name: "Spettacoli", icon: Calendar },
  ];

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "attraction":
        return Star;
      case "restaurant":
        return Utensils;
      case "shop":
        return ShoppingBag;
      case "service":
        return Car;
      case "show":
        return Calendar;
      default:
        return MapPin;
    }
  };

  const getLocationColor = (type: string) => {
    switch (type) {
      case "attraction":
        return "bg-blue-500";
      case "restaurant":
        return "bg-green-500";
      case "shop":
        return "bg-purple-500";
      case "service":
        return "bg-orange-500";
      case "show":
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleLocationClick = (location: any) => {
    // Se clicco sulla stessa struttura evidenziata, la deseleziono
    if (highlightedLocation === location.id) {
      setHighlightedLocation(null);
      setSelectedLocation(null);
    } else {
      setSelectedLocation(location);
    }
  };

  const handleMapBackgroundClick = (e: React.MouseEvent) => {
    // Se clicco su un'area vuota della mappa, rimuovo l'evidenziazione
    if (e.target === e.currentTarget && highlightedLocation) {
      setHighlightedLocation(null);
      setSelectedLocation(null);
    }
  };

  // Funzione per aggiungere al planner
  const addToPlanner = async (location: any) => {
    // Controlla se l'elemento è già nel planner PRIMA di procedere
    if (isLocationInPlanner(location.id)) {
      toast({
        title: "Già nel planner",
        description: `${location.name} è già presente nel tuo programma`,
        variant: "destructive",
      });
      return;
    }
    
    // Controllo aggiuntivo per nome (backup)
    const isDuplicateByName = plannerItems.some(item => 
      item.name && location.name && 
      item.name.toLowerCase().trim() === location.name.toLowerCase().trim()
    );
    
    if (isDuplicateByName) {
      toast({
        title: "Già nel planner",
        description: `${location.name} è già presente nel tuo programma`,
        variant: "destructive",
      });
      return;
    }

    // Genera un ID unico per l'elemento
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const userSuffix = Math.random().toString(36).substr(2, 5);
    const uniqueId = `${location.type}-${location.id}-${timestamp}-${randomId}-${userSuffix}`;

    const newItem: PlannerItem = {
      id: uniqueId,
      name: location.name,
      type: location.type as
        | "attraction"
        | "show"
        | "restaurant"
        | "shop"
        | "service",
      time: "09:00",
      notes: "",
      priority: "medium", // Valore predefinito
      completed: false,
      originalData: location,
    };

    // Usa il context globale invece dello stato locale
    addToPlannerGlobal(newItem);

    // Se l'utente è loggato, salva sul server
    if (user) {
      try {
        // Prepara i dati per il server
        const validatedItems = [...plannerItems, newItem].map((item: PlannerItem) => ({
          item_id: item.id,
          name: item.name,
          type: item.type,
          time: item.time || null,
          notes: item.notes || null,
          priority: item.priority,
          completed: item.completed,
          original_data: item.originalData || null,
        }));

        // Invia al server
        await axios.post(
          "http://127.0.0.1:8000/api/planner/items",
          {
            date: selectedDate,
            items: validatedItems,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "enjoypark-token"
              )}`,
            },
          }
        );

        // Aggiungi refresh dopo il salvataggio riuscito
        await refreshPlanner();

        toast({
          title: "Aggiunto al planner!",
          description: `${location.name} è stato aggiunto al tuo programma`,
        });
      } catch (error) {
        console.error("Errore nel salvataggio:", error);
        // Rimuovi l'elemento se il salvataggio fallisce
        removeFromPlannerGlobal(uniqueId);
        toast({
          title: "Errore",
          description: "Impossibile salvare nel planner",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Accesso richiesto",
        description: "Effettua l'accesso per salvare il planner sul server",
        variant: "destructive",
      });
    }
  };

  // Funzione per controllare se è già nel planner
  const isLocationInPlanner = (locationId: string | number): boolean => {
    /* console.log('Checking item:', { locationId, plannerItems }); */
    
    return plannerItems.some((item) => {
      /* // Debug per ogni confronto
      console.log('Comparing with planner item:', {
        itemId: item.id,
        itemName: item.name,
        itemOriginalData: item.originalData,
        locationId
      }); */
      
      // 1. Confronto diretto per ID
      if (item.originalData?.id && item.originalData.id.toString() === locationId.toString()) {
        console.log('Match found by originalData.id');
        return true;
      }
      
      // 2. Confronto per ID ricostruito (se originalData manca)
      if (!item.originalData && item.id) {
        const parts = String(item.id).split('-');
        if (parts.length >= 2 && parts[1] === locationId.toString()) {
          console.log('Match found by reconstructed ID');
          return true;
        }
      }
      
      // 3. Confronto per nome (fallback più robusto)
      const currentLocation = allLocations.find(loc => loc.id.toString() === locationId.toString());
      if (currentLocation && item.name && currentLocation.name) {
        const itemName = item.name.toLowerCase().trim();
        const locationName = currentLocation.name.toLowerCase().trim();
        if (itemName === locationName) {
          // console.log('Match found by name:', { itemName, locationName });
          return true;
        }
      }
      
      return false;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 sm:py-0 sm:h-16 gap-2 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">{t("home.back")}</Link>
              </Button>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                <span className="hidden sm:inline">{t("map.title")}</span>
                <span className="sm:hidden">Mappa</span>
              </h1>
              {highlightedLocation && (
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 border-yellow-400 text-xs hidden sm:inline-flex"
                >
                  📍 Evidenziata
                </Badge>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              {/* Selettore data per il planner - compatto su mobile */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <span className="hidden sm:inline">Planner:</span>
                  <span className="sm:hidden">📅</span>
                </span>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-32 sm:w-40 h-7 sm:h-8 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2">
                {highlightedLocation && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setHighlightedLocation(null);
                      setSelectedLocation(null);
                    }}
                    className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">
                      Rimuovi evidenziazione
                    </span>
                    <span className="sm:hidden">❌</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">Caricamento strutture...</div>
        </div>
      )}

      {error && !networkError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ServerError
            variant="inline"
            title="Errore nel caricamento"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 lg:py-8">
          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 lg:gap-6">
            {/* Sidebar - nascosta su mobile, visibile come drawer */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              {/* Bottone filtri mobile fisso */}
              <div className="lg:hidden fixed bottom-4 right-4 z-50">
                <Button
                  onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                  size="lg"
                  className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="w-6 h-6" />
                </Button>
              </div>

              {/* Sidebar content - Modal su mobile */}
              {mobileSidebarOpen && (
                <div
                  className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <div
                    className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">
                        Filtri e Ricerca
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileSidebarOpen(false)}
                        className="p-1"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {/* Search */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Ricerca</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Cerca strutture..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 h-10"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Categories */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Categorie</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2">
                            {categories.map((category) => (
                              <Button
                                key={category.id}
                                variant={
                                  selectedCategory === category.id
                                    ? "default"
                                    : "outline"
                                }
                                className="h-12 text-sm"
                                onClick={() => {
                                  setSelectedCategory(category.id);
                                  setMobileSidebarOpen(false);
                                }}
                              >
                                <category.icon className="w-4 h-4 mr-2" />
                                <span className="truncate">
                                  {category.name}
                                </span>
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* Sidebar desktop */}
              <div className="hidden lg:block space-y-4">
                {/* Search */}
                <Card>
                  <CardHeader className="pb-2 lg:pb-3">
                    <CardTitle className="text-sm lg:text-base">
                      {t("map.search.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 lg:top-3 h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                      <Input
                        placeholder={t("map.search.placeholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 lg:pl-10 h-8 lg:h-9 text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card>
                  <CardHeader className="pb-2 lg:pb-3">
                    <CardTitle className="text-sm lg:text-base">
                      {t("map.categories")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:block lg:space-y-1 gap-1 lg:gap-0">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={
                            selectedCategory === category.id
                              ? "default"
                              : "ghost"
                          }
                          className="w-full justify-start h-8 lg:h-8 text-xs lg:text-sm"
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setMobileSidebarOpen(false); // Chiudi sidebar su mobile dopo selezione
                          }}
                        >
                          <category.icon className="w-3 h-3 mr-1 lg:mr-2" />
                          <span className="truncate">{category.name}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Planner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-xs">
                        <strong>Data:</strong>{" "}
                        {new Date(selectedDate).toLocaleDateString("it-IT")}
                      </div>
                      <div className="text-xs">
                        <strong>Elementi:</strong> {plannerItems.length}
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-xs"
                      >
                        <Link href="/planner">
                          <Calendar className="w-3 h-3 mr-1" />
                          Vai al Planner
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Legend */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {t("map.legend")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs">Attrazioni</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs">Ristoranti</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-xs">Negozi</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-xs">Servizi</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        <span className="text-xs">Spettacoli</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mappa e lista - priorità su mobile */}
            <div className="lg:col-span-4 order-1 lg:order-2">
              <div className="space-y-6 lg:space-y-8">
                {" "}
                {/* Aumentato lo spazio */}
                {/* Mappa Interattiva con altezza e larghezza responsive */}
                <Card className="h-[60vh] sm:h-[70vh] lg:h-[480px] w-full max-w-[95vw] sm:max-w-full">
                  {" "}
                  {/* Ridotta altezza su desktop */}
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg">
                        <span className="hidden sm:inline">
                          {t("map.interactive")}
                        </span>
                        <span className="sm:hidden">Mappa Interattiva</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {filteredLocations.length}{" "}
                          <span className="hidden sm:inline">
                            {t("map.locations.found")}
                          </span>
                        </Badge>
                        {/* Controlli zoom per mobile */}
                        <div className="flex items-center space-x-1 sm:hidden">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setMapScale(Math.min(3, mapScale + 0.2))
                            }
                            className="h-6 w-6 p-0"
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setMapScale(Math.max(0.8, mapScale - 0.2))
                            }
                            className="h-6 w-6 p-0"
                          >
                            -
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={resetMapView}
                            className="h-6 px-2 text-xs"
                          >
                            Reset
                          </Button>
                        </div>
                        {/* Reset button per desktop */}
                        <div className="hidden sm:flex">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetMapView}
                            className="h-7 px-2 text-xs"
                          >
                            Reset Vista
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="h-full p-0">
                    <div
                      ref={mapContainerRef}
                      className="relative w-full h-full rounded-lg overflow-hidden touch-none bg-gradient-to-br from-blue-50 to-green-50 map-container"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      style={{
                        userSelect: "none",
                        touchAction: "none",
                        WebkitTouchCallout: "none",
                        WebkitUserSelect: "none",
                      }}
                    >
                      {/* Theme Park Background */}
                      <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat cursor-grab transition-transform origin-center"
                        onClick={handleMapBackgroundClick}
                        style={{
                          backgroundImage: `
                        radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.4) 0%, transparent 60%),
                        radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.4) 0%, transparent 60%),
                        radial-gradient(circle at 40% 70%, rgba(168, 85, 247, 0.4) 0%, transparent 60%),
                        radial-gradient(circle at 70% 80%, rgba(251, 191, 36, 0.4) 0%, transparent 60%),
                        radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.2) 0%, transparent 80%),
                        linear-gradient(135deg, #e0f2fe 0%, #e8f5e8 25%, #fff3e0 50%, #fce4ec 75%, #f3e5f5 100%)
                      `,
                          transform: `scale(${Math.max(
                            0.8,
                            mapScale
                          )}) translate(${mapPosition.x}px, ${
                            mapPosition.y
                          }px)`,
                          cursor: isDragging ? "grabbing" : "grab",
                          minWidth: "100%",
                          minHeight: "100%",
                        }}
                      >
                        {/* Decorative elements */}
                        <div className="absolute top-4 left-4 text-2xl opacity-30">
                          🎠
                        </div>
                        <div className="absolute top-8 right-8 text-2xl opacity-30">
                          🎡
                        </div>
                        <div className="absolute bottom-8 left-8 text-2xl opacity-30">
                          🎢
                        </div>
                        <div className="absolute bottom-4 right-4 text-2xl opacity-30">
                          🎪
                        </div>

                        {/* Paths */}
                        <svg className="absolute inset-0 w-full h-full">
                          <defs>
                            <pattern
                              id="walkway"
                              patternUnits="userSpaceOnUse"
                              width="4"
                              height="4"
                            >
                              <rect
                                width="4"
                                height="4"
                                fill="rgba(156, 163, 175, 0.2)"
                              />
                              <circle
                                cx="2"
                                cy="2"
                                r="0.5"
                                fill="rgba(75, 85, 99, 0.3)"
                              />
                            </pattern>
                          </defs>
                          <path
                            d="M 50 50 Q 200 100 400 200 T 600 300"
                            stroke="url(#walkway)"
                            strokeWidth="8"
                            fill="none"
                            opacity="0.6"
                          />
                          <path
                            d="M 100 100 Q 300 150 500 200 Q 600 250 700 400"
                            stroke="url(#walkway)"
                            strokeWidth="6"
                            fill="none"
                            opacity="0.5"
                          />
                        </svg>
                      </div>

                      {/* Location Markers */}
                      <div
                        className="absolute inset-0 transition-transform origin-center"
                        style={{
                          transform: `scale(${mapScale}) translate(${mapPosition.x}px, ${mapPosition.y}px)`,
                        }}
                      >
                        {filteredLocations.map((location, index) => {
                          const IconComponent = getLocationIcon(location.type);
                          const isHighlighted =
                            highlightedLocation === location.id;
                          const isInPlanner = isLocationInPlanner(location.id);
                          return (
                            <div
                              key={
                                location.id
                                  ? `marker-${location.id}`
                                  : `marker-${index}`
                              }
                              id={`location-${location.id || index}`}
                              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group ${
                                isHighlighted ? "z-20" : "z-10"
                              }`}
                              style={{
                                left: `${location.location.x}%`,
                                top: `${location.location.y}%`,
                              }}
                              onClick={() => handleLocationClick(location)}
                            >
                              {/* Anello di evidenziazione */}
                              {isHighlighted && (
                                <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                              )}
                              {isHighlighted && (
                                <div className="absolute inset-0 w-10 h-10 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-full opacity-50"></div>
                              )}

                              <div
                                className={`w-8 h-8 ${getLocationColor(
                                  location.type
                                )} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border-2 ${
                                  isHighlighted
                                    ? "border-yellow-400 border-4 scale-125"
                                    : "border-white"
                                } ${
                                  isInPlanner ? "ring-2 ring-green-400" : ""
                                }`}
                              >
                                <IconComponent className="w-4 h-4 text-white" />
                                {isInPlanner && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>

                              {/* Tooltip */}
                              <div
                                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 ${
                                  isHighlighted
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"
                                } transition-opacity z-10`}
                              >
                                <div
                                  className={`bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap max-w-48 ${
                                    isHighlighted ? "bg-yellow-600" : ""
                                  }`}
                                >
                                  <div className="font-semibold">
                                    {location.name}
                                  </div>
                                  {location.type === "attraction" &&
                                    (location as any).waitTime !==
                                      undefined && (
                                      <div className="flex items-center space-x-1">
                                        <Clock className="w-3 h-3" />
                                        <span>
                                          {(location as any).waitTime} min
                                        </span>
                                      </div>
                                    )}
                                  {location.type === "attraction" &&
                                    (location as any).status ===
                                      "maintenance" && (
                                      <div className="text-red-300">
                                        Manutenzione
                                      </div>
                                    )}
                                  {isInPlanner && (
                                    <div className="text-green-300">
                                      ✓ Nel planner
                                    </div>
                                  )}
                                  {isHighlighted && (
                                    <div className="flex items-center justify-between">
                                      <div className="text-yellow-200 font-semibold">
                                        📍 Evidenziato
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setHighlightedLocation(null);
                                          setSelectedLocation(null);
                                        }}
                                        className="ml-2 text-yellow-200 hover:text-white transition-colors"
                                        title="Rimuovi evidenziazione"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div
                                  className={`absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent ${
                                    isHighlighted
                                      ? "border-t-yellow-600"
                                      : "border-t-black"
                                  }`}
                                ></div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Entrance */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                          <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg border-2 border-white">
                            {t("map.entrance")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Elenco Strutture - nascosto su mobile */}
              <div className="mt-8">
                {" "}
                {/* Aggiunto margine superiore */}
                <Card className="hidden lg:block">
                  <CardHeader>
                    <CardTitle className="text-lg lg:text-xl">
                      Elenco Strutture
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {filteredLocations.length} strutture trovate
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                      {filteredLocations.map((location, index) => {
                        const isInPlanner = isLocationInPlanner(location.id);
                        const isHighlighted =
                          highlightedLocation === location.id;

                        return (
                          <div
                            key={location.id || index}
                            className={`
                              border rounded-lg p-3 lg:p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                              ${
                                isHighlighted
                                  ? "ring-2 ring-blue-500 bg-blue-50"
                                  : ""
                              }
                              ${
                                isInPlanner
                                  ? "bg-green-50 border-green-200"
                                  : "hover:border-gray-300"
                              }
                            `}
                            onClick={() => setSelectedLocation(location)}
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`
                                w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-white text-sm lg:text-base
                                ${getLocationColor(location.type)}
                              `}
                              >
                                {(() => {
                                  const IconComponent = getLocationIcon(
                                    location.type
                                  );
                                  return (
                                    <IconComponent className="w-4 h-4 lg:w-5 lg:h-5" />
                                  );
                                })()}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <h3 className="font-medium text-sm lg:text-base truncate pr-2">
                                    {location.name}
                                  </h3>
                                  {location.type === "attraction" &&
                                    location.waitTime && (
                                      <div className="flex items-center space-x-1 text-xs text-gray-500 shrink-0">
                                        <Clock className="w-3 h-3" />
                                        <span>{location.waitTime}min</span>
                                      </div>
                                    )}
                                </div>

                                {location.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {location.description}
                                  </p>
                                )}

                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex space-x-1">
                                    {!isLocationInPlanner(location.id) ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 lg:h-6 px-2 text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addToPlanner(location);
                                        }}
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        <span className="hidden sm:inline">
                                          Planner
                                        </span>
                                        <span className="sm:hidden">+</span>
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 lg:h-6 px-2 text-xs bg-green-100 text-green-700 border-green-400"
                                        disabled
                                      >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        <span className="hidden sm:inline">
                                          Aggiunto
                                        </span>
                                        <span className="sm:hidden">✓</span>
                                      </Button>
                                    )}

                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 lg:h-6 px-2 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLocation(location);
                                      }}
                                    >
                                      <span className="hidden sm:inline">
                                        Dettagli
                                      </span>
                                      <span className="sm:hidden">Info</span>
                                    </Button>
                                  </div>

                                  {isInPlanner && (
                                    <span className="text-xs text-green-600 font-medium">
                                      ✓{" "}
                                      <span className="hidden sm:inline">
                                        Nel planner
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {filteredLocations.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm lg:text-base">
                          Nessuna struttura trovata per i filtri selezionati
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Detail Dialog */}
      <Dialog
        open={!!selectedLocation}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLocation(null);
            // Se il dialog si chiude e c'è un'evidenziazione, rimuovila
            if (highlightedLocation) {
              setHighlightedLocation(null);
            }
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] lg:max-h-[80vh] overflow-y-auto mx-4 lg:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedLocation && (
                <>
                  {(() => {
                    const IconComponent = getLocationIcon(
                      selectedLocation.type
                    );
                    return <IconComponent className="w-5 h-5" />;
                  })()}
                  <span>{selectedLocation.name}</span>
                  {isLocationInPlanner(selectedLocation.id) && (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-700 border-green-400"
                    >
                      ✓ Nel planner
                    </Badge>
                  )}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedLocation && (
            <div className="space-y-4">
              {/* Image */}
              <img
                src={
                  selectedLocation.image ||
                  "/placeholder.svg?height=200&width=400"
                }
                alt={selectedLocation.name}
                className="w-full h-48 object-cover rounded-lg"
              />

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400">
                {selectedLocation.description}
              </p>

              {/* Type-specific information */}
              {selectedLocation.type === "attraction" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Tempo di attesa:</strong>{" "}
                        {selectedLocation.waitTime} min
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Valutazione:</strong> {selectedLocation.rating}
                        /5
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Capacità:</strong> {selectedLocation.capacity}{" "}
                        persone
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Durata:</strong> {selectedLocation.duration}
                    </div>
                    <div className="text-sm">
                      <strong>Altezza minima:</strong>{" "}
                      {selectedLocation.minHeight} cm
                    </div>
                    <div className="text-sm">
                      <strong>Livello brivido:</strong>{" "}
                      {selectedLocation.thrillLevel}/5
                    </div>
                  </div>
                </div>
              )}

              {selectedLocation.type === "show" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Venue:</strong> {selectedLocation.venue}
                    </div>
                    <div className="text-sm">
                      <strong>Durata:</strong> {selectedLocation.duration}
                    </div>
                    <div className="text-sm">
                      <strong>Categoria:</strong> {selectedLocation.category}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Prezzo:</strong> €{selectedLocation.price}
                    </div>
                    <div className="text-sm">
                      <strong>Età:</strong> {selectedLocation.ageRestriction}
                    </div>
                    <div className="text-sm">
                      <strong>Posti disponibili:</strong>{" "}
                      {selectedLocation.availableSeats}
                    </div>
                  </div>
                </div>
              )}

              {selectedLocation.type === "restaurant" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Cucina:</strong> {selectedLocation.cuisine}
                    </div>
                    <div className="text-sm">
                      <strong>Fascia prezzo:</strong>{" "}
                      {selectedLocation.priceRange}
                    </div>
                    <div className="text-sm">
                      <strong>Valutazione:</strong> {selectedLocation.rating}/5
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Orari:</strong> {selectedLocation.openingHours}
                    </div>
                  </div>
                </div>
              )}

              {selectedLocation.type === "shop" && (
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Categoria:</strong> {selectedLocation.category}
                  </div>
                  <div className="text-sm">
                    <strong>Orari:</strong> {selectedLocation.openingHours}
                  </div>
                  <div className="text-sm">
                    <strong>Specialità:</strong>{" "}
                    {selectedLocation.specialties?.join(", ")}
                  </div>
                </div>
              )}

              {selectedLocation.type === "service" && (
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Categoria:</strong> {selectedLocation.category}
                  </div>
                  <div className="text-sm">
                    <strong>Disponibilità:</strong>{" "}
                    {selectedLocation.available24h ? "24h" : "Orari limitati"}
                  </div>
                  <div className="text-sm">
                    <strong>Servizi:</strong>{" "}
                    {selectedLocation.features?.join(", ")}
                  </div>
                </div>
              )}

              {/* Features/Characteristics */}
              {(selectedLocation.features || selectedLocation.specialties) && (
                <div>
                  <h4 className="font-semibold mb-2">Caratteristiche</h4>
                  <div className="flex flex-wrap gap-2">
                    {(
                      selectedLocation.features ||
                      selectedLocation.specialties ||
                      []
                    ).map((feature: string, index: number) => (
                      <Badge
                        key={`${selectedLocation.id}-feature-${index}`}
                        variant="outline"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t">
                {isLocationInPlanner(selectedLocation.id) ? (
                  <Button
                    disabled
                    className="w-full sm:flex-1 bg-green-100 text-green-700 hover:bg-green-100 border-green-400"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Già nel planner
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      console.log("Adding to planner:", selectedLocation.id, selectedLocation.name);
                      addToPlanner(selectedLocation);
                    }}
                    className="w-full sm:flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi al planner
                  </Button>
                )}

                <Button asChild variant="outline" className="w-full sm:flex-1">
                  <Link href="/planner">
                    <Calendar className="w-4 h-4 mr-2" />
                    Vai al planner
                  </Link>
                </Button>

                {selectedLocation.type === "attraction" && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:flex-1"
                  >
                    <Link href="/attractions">
                      <Star className="w-4 h-4 mr-2" />
                      Vedi Dettagli
                    </Link>
                  </Button>
                )}

                {selectedLocation.type === "show" && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:flex-1"
                  >
                    <Link href="/shows">
                      <Calendar className="w-4 h-4 mr-2" />
                      Prenota Spettacolo
                    </Link>
                  </Button>
                )}

                {(selectedLocation.type === "show" ||
                  selectedLocation.type === "attraction") && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:flex-1"
                  >
                    <Link href="/tickets">
                      <Euro className="w-4 h-4 mr-2" />
                      Acquista Biglietti
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
