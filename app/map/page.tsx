"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/language-context";

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
  originalData?: any;
}

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

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

  // Stato per il planner
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Carica il planner salvato
  useEffect(() => {
    const savedPlanner = localStorage.getItem(
      `enjoypark-planner-${selectedDate}`
    );
    if (savedPlanner) {
      setPlannerItems(JSON.parse(savedPlanner));
    } else {
      setPlannerItems([]);
    }
  }, [selectedDate]);

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
  const addToPlanner = (location: any) => {
    const newItem: PlannerItem = {
      id: `${location.id}-${Date.now()}`,
      name: location.name,
      type: location.type,
      time: "",
      notes: "",
      priority: "medium",
      completed: false,
      originalData: location,
    };

    const updatedItems = [...plannerItems, newItem];
    setPlannerItems(updatedItems);

    // Salva nel localStorage
    localStorage.setItem(
      `enjoypark-planner-${selectedDate}`,
      JSON.stringify(updatedItems)
    );

    toast({
      title: "Aggiunto al planner!",
      description: `${
        location.name
      } è stato aggiunto al tuo programma per ${new Date(
        selectedDate
      ).toLocaleDateString("it-IT")}`,
    });
  };

  // Funzione per controllare se è già nel planner
  const isLocationInPlanner = (locationId: string) => {
    return plannerItems.some((item) => item.originalData?.id === locationId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href="/">{t("home.back")}</Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("map.title")}
              </h1>
              {highlightedLocation && (
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 border-yellow-400"
                >
                  📍 Struttura evidenziata
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Selettore data per il planner */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Planner:
                </span>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-40 h-8 text-sm"
                />
              </div>
              {highlightedLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHighlightedLocation(null);
                    setSelectedLocation(null);
                  }}
                >
                  Rimuovi evidenziazione
                </Button>
              )}
              <Button variant="outline" className="flex items-center space-x-2">
                <Navigation className="w-4 h-4" />
                <span>{t("map.my.location")}</span>
              </Button>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("map.search.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t("map.search.placeholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("map.categories")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id ? "default" : "ghost"
                        }
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <category.icon className="w-4 h-4 mr-2" />
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Planner Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Planner Attivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Data:</strong>{" "}
                      {new Date(selectedDate).toLocaleDateString("it-IT")}
                    </div>
                    <div className="text-sm">
                      <strong>Elementi:</strong> {plannerItems.length}
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Link href="/planner">
                        <Calendar className="w-4 h-4 mr-2" />
                        Vai al Planner
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Legend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("map.legend")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Attrazioni</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Ristoranti</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Negozi</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Servizi</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <span className="text-sm">Spettacoli</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map */}
            <div className="lg:col-span-3">
              <Card className="h-[600px]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{t("map.interactive")}</span>
                    <Badge variant="outline">
                      {filteredLocations.length} {t("map.locations.found")}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    {/* Theme Park Background */}
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat cursor-pointer"
                      onClick={handleMapBackgroundClick}
                      style={{
                        backgroundImage: `
                        radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 40% 70%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, rgba(251, 191, 36, 0.3) 0%, transparent 50%),
                        linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 25%, #fef3c7 50%, #fce7f3 75%, #ede9fe 100%)
                      `,
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
                    {filteredLocations.map((location, index) => {
                      const IconComponent = getLocationIcon(location.type);
                      const isHighlighted = highlightedLocation === location.id;
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
                            } ${isInPlanner ? "ring-2 ring-green-400" : ""}`}
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
                                (location as any).waitTime !== undefined && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                      {(location as any).waitTime} min
                                    </span>
                                  </div>
                                )}
                              {location.type === "attraction" &&
                                (location as any).status === "maintenance" && (
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
                </CardContent>
              </Card>


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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
              <div className="flex space-x-4 pt-4 border-t">
                {isLocationInPlanner(selectedLocation.id) ? (
                  <Button
                    disabled
                    className="flex-1 bg-green-100 text-green-700 hover:bg-green-100"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Già nel planner
                  </Button>
                ) : (
                  <Button
                    onClick={() => addToPlanner(selectedLocation)}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi al planner
                  </Button>
                )}

                <Button asChild variant="outline" className="flex-1">
                  <Link href="/planner">
                    <Calendar className="w-4 h-4 mr-2" />
                    Vai al planner
                  </Link>
                </Button>

                {selectedLocation.type === "attraction" && (
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/attractions">
                      <Star className="w-4 h-4 mr-2" />
                      Vedi Dettagli
                    </Link>
                  </Button>
                )}

                {selectedLocation.type === "show" && (
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/shows">
                      <Calendar className="w-4 h-4 mr-2" />
                      Prenota Spettacolo
                    </Link>
                  </Button>
                )}

                {(selectedLocation.type === "show" ||
                  selectedLocation.type === "attraction") && (
                  <Button asChild variant="outline" className="flex-1">
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
