"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, Ticket, TrendingUp } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from '../../lib/config';

interface AdminStatsData {
  totalUsers: number;
  totalOrders: number;
  totalTickets: number;
  totalRevenue: number;
  todayOrders: number;
  activeShows: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<AdminStatsData>({
    totalUsers: 0,
    totalOrders: 0,
    totalTickets: 0,
    totalRevenue: 0,
    todayOrders: 0,
    activeShows: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      
      // Ensure totalRevenue is a number
      const statsData = {
        ...response.data,
        totalRevenue: Number(response.data.totalRevenue) || 0
      };
      
      setStats(statsData);
    } catch (error) {
      console.error("Errore nel caricamento delle statistiche:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Utenti Totali",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Ordini Totali",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-green-600"
    },
    {
      title: "Biglietti Venduti",
      value: stats.totalTickets,
      icon: Ticket,
      color: "text-purple-600"
    },
    {
      title: "Ricavi Totali",
      value: `€${(Number(stats.totalRevenue) || 0).toFixed(2)}`, // Safe conversion
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}