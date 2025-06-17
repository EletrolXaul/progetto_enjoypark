"use client";

import { ReactNode, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Aggiungi questo import

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  fields?: FormField[];
  initialData?: any;
  onSubmit?: (data: any) => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export default function CrudModal({
  isOpen,
  onClose,
  title,
  children,
  fields,
  initialData,
  onSubmit,
  submitLabel = "Salva",
  isLoading = false,
}: CrudModalProps) {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});  // Aggiungi stato per gli errori
  const { toast } = useToast();  // Aggiungi useToast

  // Aggiungi questo useEffect
  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]);

  const handleSubmit = () => {
    if (onSubmit) {
      // Reset degli errori
      setErrors({});
      
      // Validazione base
      const requiredFields = fields?.filter((field) => field.required) || [];
      const missingFields = requiredFields.filter(
        (field) => !formData[field.name] || formData[field.name] === ""
      );

      if (missingFields.length > 0) {
        // Crea un oggetto di errori
        const newErrors: Record<string, string> = {};
        missingFields.forEach((field) => {
          newErrors[field.name] = `Il campo ${field.label} è obbligatorio`;
        });
        
        setErrors(newErrors);
        
        // Mostra un toast con l'errore
        toast({
          title: "Errore di validazione",
          description: "Compila tutti i campi obbligatori",
          variant: "destructive",
        });
        
        console.error(
          "Missing required fields:",
          missingFields.map((f) => f.name)
        );
        return;
      }

      console.log("Submitting form data:", formData); // Debug log
      onSubmit(formData);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderField = (field: FormField, index: number) => {
    switch (field.type) {
      case "checkbox":
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={formData[field.name] || false}
              onCheckedChange={(checked) =>
                handleInputChange(field.name, checked)
              }
            />
            <Label htmlFor={field.name}>{field.label}</Label>
          </div>
        );
      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}{field.required && <span className="text-red-500">*</span>}
            </Label>
            {/* Rendering del campo in base al tipo */}
            <Input
              id={field.name}
              type={field.type}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
            />
            {/* Mostra il messaggio di errore se presente */}
            {errors[field.name] && (
              <p className="text-sm text-red-500">{errors[field.name]}</p>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto"> {/* Aggiungi queste classi */}
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {fields ? fields.map(renderField) : children}
        </div>
        {onSubmit && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Annulla
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Caricamento..." : submitLabel}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
