"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definizione dei tipi
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

interface PlannerContextType {
  plannerItems: PlannerItem[];
  setPlannerItems: (items: PlannerItem[] | ((prev: PlannerItem[]) => PlannerItem[])) => void;
  addToPlannerGlobal: (item: PlannerItem) => void;
  removeFromPlannerGlobal: (itemId: string) => void;
  refreshPlanner: () => Promise<void>;
}

interface PlannerProviderProps {
  children: ReactNode;
}

const PlannerContext = createContext<PlannerContextType>({
  plannerItems: [],
  setPlannerItems: () => {},
  addToPlannerGlobal: () => {},
  removeFromPlannerGlobal: () => {},
  refreshPlanner: async () => {}
});

export const usePlanner = () => useContext(PlannerContext);

export const PlannerProvider: React.FC<PlannerProviderProps> = ({ children }) => {
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  
  const refreshPlanner = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('enjoypark-token');
      if (!token) return;
      
      const selectedDate = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`http://127.0.0.1:8000/api/planner/items?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dati caricati dal server:', data.data);
        
        // Rimuovi duplicati anche dai dati del server
        const uniqueItems = (data.data || []).filter((item: any, index: number, self: any[]) => {
          const firstIndex = self.findIndex((i: any) => 
            i.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
          );
          return index === firstIndex;
        });
        
        setPlannerItems(uniqueItems);
      }
    } catch (error) {
      console.error('Errore nel caricamento del planner:', error);
    }
  };
  
  const addToPlannerGlobal = (item: PlannerItem): void => {
    setPlannerItems(prev => [...prev, item]);
  };
  
  const removeFromPlannerGlobal = (itemId: string): void => {
    setPlannerItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  return (
    <PlannerContext.Provider value={{
      plannerItems,
      setPlannerItems,
      addToPlannerGlobal,
      removeFromPlannerGlobal,
      refreshPlanner
    }}>
      {children}
    </PlannerContext.Provider>
  );
};