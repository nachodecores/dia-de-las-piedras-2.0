"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Copy, Users, Gift } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Raffle = {
  id: string;
  name: string;
  secret_code: string;
  active: boolean;
  participant_count?: number;
};

export default function SorteosPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRaffleName, setNewRaffleName] = useState("");
  const [addingRaffle, setAddingRaffle] = useState(false);

  const fetchRaffles = async () => {
    const { data } = await supabase
      .from("raffles")
      .select("*, raffle_participants(id)")
      .order("created_at", { ascending: false });

    const rafflesWithCount = (data || []).map((r: any) => ({
      ...r,
      participant_count: r.raffle_participants?.length || 0,
      raffle_participants: undefined,
    }));
    setRaffles(rafflesWithCount);
    setLoading(false);
  };

  useEffect(() => {
    fetchRaffles();
  }, []);

  const handleAddRaffle = async () => {
    if (addingRaffle) return;
    if (!newRaffleName.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setAddingRaffle(true);
    const { error } = await supabase.from("raffles").insert({
      name: newRaffleName,
      active: true,
    });

    if (error) {
      toast.error("Error al crear sorteo", { description: error.message });
      setAddingRaffle(false);
      return;
    }

    toast.success("Sorteo creado");
    setNewRaffleName("");
    setAddingRaffle(false);
    fetchRaffles();
  };

  const handleToggleRaffle = async (raffle: Raffle) => {
    const { error } = await supabase
      .from("raffles")
      .update({ active: !raffle.active })
      .eq("id", raffle.id);

    if (error) {
      toast.error("Error al actualizar sorteo");
      return;
    }

    fetchRaffles();
  };

  const handleDeleteRaffle = async (raffleId: string) => {
    if (!confirm("¿Eliminar este sorteo y todos sus participantes?")) return;

    const { error } = await supabase.from("raffles").delete().eq("id", raffleId);

    if (error) {
      toast.error("Error al eliminar sorteo");
      return;
    }

    toast.success("Sorteo eliminado");
    fetchRaffles();
  };

  const copyRaffleCode = (raffle: Raffle) => {
    navigator.clipboard.writeText(`?code=${raffle.secret_code}`);
    toast.success("Código copiado al portapapeles");
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Gift className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Sorteos</h1>
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="font-medium">Crear Sorteo</h3>
        <div className="flex gap-3">
          <Input
            placeholder="Nombre del sorteo"
            value={newRaffleName}
            onChange={(e) => setNewRaffleName(e.target.value)}
          />
          <Button
            onClick={handleAddRaffle}
            disabled={addingRaffle || !newRaffleName.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            {addingRaffle ? "..." : "Crear"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {raffles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay sorteos</p>
        ) : (
          raffles.map((raffle) => (
            <div
              key={raffle.id}
              className={`p-4 border rounded-lg space-y-3 ${!raffle.active ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{raffle.name}</span>
                  <Link
                    href={`/admin/sorteos/${raffle.id}`}
                    className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20"
                  >
                    <Users className="h-3 w-3" />
                    {raffle.participant_count} participantes
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={raffle.active ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleRaffle(raffle)}
                  >
                    {raffle.active ? "Activo" : "Inactivo"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRaffle(raffle.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-muted p-2 rounded font-mono select-all">
                  ?code={raffle.secret_code}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyRaffleCode(raffle)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Agregar a cualquier URL de comercio, ej: /comercio/mi-tienda<strong>?code=...</strong>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
