"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/auth-context";

// Importa i componenti CRUD
import AdminStats from "@/components/admin/AdminStats";
import UserManagement from "@/components/admin/UserManagement";
import OrderManagement from "@/components/admin/OrderManagement";
import TicketManagement from "@/components/admin/TicketManagement";
import ShowManagement from "@/components/admin/ShowManagement";
import AttractionManagement from "@/components/admin/AttractionManagement";
import PromoCodeManagement from "@/components/admin/PromoCodeManagement";
import VisitHistoryManagement from "@/components/admin/VisitHistoryManagement";
import CreditCardManagement from "@/components/admin/CreditCardManagement";
import RestaurantManagement from "@/components/admin/RestaurantManagement";
import ShopManagement from "@/components/admin/ShopManagement";
import ServiceManagement from "@/components/admin/ServiceManagement";
import TicketTypeManagement from "@/components/admin/TicketTypeManagement";
import { PlannerManagement } from "@/components/admin/PlannerManagement";



export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.isAdmin) {
      setLoading(false);
    }
  }, [user]);

  // Redirect se non admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Accesso riservato agli amministratori
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Torna alla Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Caricamento...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href="/">← Torna alla Home</Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/admin/qr-validator">
                  <QrCode className="w-4 h-4 mr-2" />
                  Validatore QR
                </Link>
              </Button>
              <Badge className="bg-purple-500">Admin</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiche */}
        <AdminStats />

        {/* Tabs per le diverse sezioni CRUD */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11">
            <TabsTrigger value="users">Utenti</TabsTrigger>
            <TabsTrigger value="orders">Ordini</TabsTrigger>
            <TabsTrigger value="tickets">Ticket</TabsTrigger>
            <TabsTrigger value="tickettypes">Tipi Ticket</TabsTrigger>
            <TabsTrigger value="attractions">Attrazioni</TabsTrigger>
            <TabsTrigger value="shows">Spettacoli</TabsTrigger>
            <TabsTrigger value="restaurants">Ristoranti</TabsTrigger>
            <TabsTrigger value="shops">Negozi</TabsTrigger>
            <TabsTrigger value="services">Servizi</TabsTrigger>
            <TabsTrigger value="promo">Codici Promo</TabsTrigger>
            <TabsTrigger value="visits">Cronologia</TabsTrigger>
            <TabsTrigger value="cards">Carte</TabsTrigger>
            <TabsTrigger value="planners">Pianificatori</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <TicketManagement />
          </TabsContent>

          <TabsContent value="tickettypes" className="space-y-6">
            <TicketTypeManagement />
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-6">
            <RestaurantManagement />
          </TabsContent>

          <TabsContent value="shops" className="space-y-6">
            <ShopManagement />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <ServiceManagement />
          </TabsContent>

          <TabsContent value="shows" className="space-y-6">
            <ShowManagement />
          </TabsContent>

          <TabsContent value="attractions" className="space-y-6">
            <AttractionManagement />
          </TabsContent>

          <TabsContent value="promo" className="space-y-6">
            <PromoCodeManagement />
          </TabsContent>

          <TabsContent value="visits" className="space-y-6">
            <VisitHistoryManagement />
          </TabsContent>

          <TabsContent value="cards" className="space-y-6">
            <CreditCardManagement />
          </TabsContent>

          <TabsContent value="planners" className="space-y-6">
            <PlannerManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}