"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import DataTable from "@/components/admin/DataTable";
import CrudModal from "./CrudModal";

interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare gli utenti",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Partial<User>) => {
    try {
      console.log('Sending user data:', userData); // Debug log
      await axios.post("http://127.0.0.1:8000/api/admin/users", userData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
          'Content-Type': 'application/json'
        },
      });
      loadUsers();
      setModalOpen(false);
      toast({
        title: "Successo",
        description: "Utente creato con successo",
      });
    } catch (error: any) {
      console.error('Error creating user:', error.response?.data); // Debug log
      toast({
        title: "Errore",
        description: error.response?.data?.message || "Impossibile creare l'utente",
        variant: "destructive",
      });
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/admin/users/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      loadUsers();
      setModalOpen(false);
      setEditingUser(null);
      toast({
        title: "Successo",
        description: "Utente aggiornato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'utente",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("enjoypark-token")}`,
        },
      });
      loadUsers();
      toast({
        title: "Successo",
        description: "Utente eliminato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'utente",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      render: (user: User) => user.name
    },
    {
      key: 'email',
      label: 'Email',
      render: (user: User) => user.email
    },
    {
      key: 'role',
      label: 'Ruolo',
      render: (user: User) => (
        user.is_admin ? 
          <Badge className="bg-purple-500">Admin</Badge> : 
          <Badge variant="secondary">Utente</Badge>
      )
    },
    
    {
      key: 'created_at',
      label: 'Data Registrazione',
      render: (user: User) => new Date(user.created_at).toLocaleDateString('it-IT')
    },
    {
      key: 'actions',
      label: 'Azioni',
      render: (user: User) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(user);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              deleteUser(user.id);
            }}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const userFormFields = [
    {
      name: 'name',
      label: 'Nome',
      type: 'text',
      required: true
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true
    },
    {
      name: 'is_admin',
      label: 'Amministratore',
      type: 'checkbox',
      required: false
    }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <>
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestione Utenti</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Utente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cerca utenti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DataTable
            data={filteredUsers}
            columns={columns}
            loading={loading}
            emptyMessage="Nessun utente trovato"
          />
        </CardContent>
      </Card>

      <CrudModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        title={modalMode === 'create' ? 'Nuovo Utente' : 'Modifica Utente'}
        fields={userFormFields}
        initialData={editingUser}
        onSubmit={(data: any) => {
          if (modalMode === 'create') {
            createUser(data);
          } else if (editingUser) {
            updateUser(editingUser.id, data);
          }
        }}
      />
    </>
  );
}