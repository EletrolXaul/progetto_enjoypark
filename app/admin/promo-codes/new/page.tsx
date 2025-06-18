'use client'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function NewPromoCode() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "fixed", // fixed o percentage
    discount: "",
    valid_until: "",
    usage_limit: "",
    is_active: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/admin/promo-codes",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          },
        }
      );

      toast({
        title: "Successo",
        description: "Codice promozionale creato con successo",
      });

      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Errore nella creazione del codice promo:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare il codice promozionale",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Nuovo Codice Promozionale</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Inserisci i dettagli del codice promozionale</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Codice</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="es. SUMMER2023"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo di sconto</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="fixed">Importo fisso (€)</option>
                  <option value="percentage">Percentuale (%)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount">
                  {formData.type === "fixed" ? "Importo sconto (€)" : "Percentuale sconto (%)"}
                </Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder={formData.type === "fixed" ? "10.00" : "15"}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valid_until">Valido fino a</Label>
                <Input
                  id="valid_until"
                  name="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="usage_limit">Limite utilizzi (opzionale)</Label>
                <Input
                  id="usage_limit"
                  name="usage_limit"
                  type="number"
                  value={formData.usage_limit}
                  onChange={handleChange}
                  placeholder="Lascia vuoto per utilizzi illimitati"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active as boolean}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_active">Attivo</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/admin/dashboard")}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creazione in corso..." : "Crea Codice Promo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}