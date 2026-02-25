"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Users, Gift, Trophy, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { formatDateOnly } from "@/lib/utils";

type Prize = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  created_at?: string;
};

type Raffle = {
  id: string;
  name: string;
  raffle_date: string | null;
  active: boolean;
  participant_count?: number;
  prizes: Prize[];
};

export default function SorteosPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRaffleName, setNewRaffleName] = useState("");
  const [newRaffleDate, setNewRaffleDate] = useState("");
  const [addingRaffle, setAddingRaffle] = useState(false);
  const [newPrizeNames, setNewPrizeNames] = useState<Record<string, string>>({});
  const [newPrizeDescriptions, setNewPrizeDescriptions] = useState<Record<string, string>>({});
  const [newPrizeImageUrls, setNewPrizeImageUrls] = useState<Record<string, string>>({});
  const [addingPrize, setAddingPrize] = useState<string | null>(null);
  const [editingPrizeId, setEditingPrizeId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; description: string; image_url: string }>({
    name: "",
    description: "",
    image_url: "",
  });

  const fetchRaffles = async () => {
    const { data } = await supabase
      .from("raffles")
      .select("*, raffle_participants(id), raffle_prizes(id, name, description, image_url, created_at)")
      .order("created_at", { ascending: false });

    const rafflesWithData = (data || []).map((r: any) => ({
      ...r,
      participant_count: r.raffle_participants?.length || 0,
      prizes: (r.raffle_prizes || []).sort(
        (a: Prize, b: Prize) =>
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      ),
      raffle_participants: undefined,
      raffle_prizes: undefined,
    }));
    setRaffles(rafflesWithData);
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
      raffle_date: newRaffleDate || null,
      active: true,
    });

    if (error) {
      toast.error("Error al crear sorteo", { description: error.message });
      setAddingRaffle(false);
      return;
    }

    toast.success("Sorteo creado");
    setNewRaffleName("");
    setNewRaffleDate("");
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

  const handleAddPrize = async (raffleId: string) => {
    const prizeName = newPrizeNames[raffleId]?.trim();
    if (!prizeName || addingPrize === raffleId) return;

    const prizeDescription = newPrizeDescriptions[raffleId]?.trim() || null;
    const prizeImageUrl = newPrizeImageUrls[raffleId]?.trim() || null;

    setAddingPrize(raffleId);
    const raffle = raffles.find((r) => r.id === raffleId);

    const { error } = await supabase.from("raffle_prizes").insert({
      raffle_id: raffleId,
      name: prizeName,
      description: prizeDescription,
      image_url: prizeImageUrl,
    });

    if (error) {
      toast.error("Error al agregar premio", { description: error.message });
      setAddingPrize(null);
      return;
    }

    toast.success("Premio agregado");
    setNewPrizeNames((prev) => ({ ...prev, [raffleId]: "" }));
    setNewPrizeDescriptions((prev) => ({ ...prev, [raffleId]: "" }));
    setNewPrizeImageUrls((prev) => ({ ...prev, [raffleId]: "" }));
    setAddingPrize(null);
    fetchRaffles();
  };

  const handleDeletePrize = async (prizeId: string) => {
    const { error } = await supabase.from("raffle_prizes").delete().eq("id", prizeId);

    if (error) {
      toast.error("Error al eliminar premio");
      return;
    }

    toast.success("Premio eliminado");
    if (editingPrizeId === prizeId) setEditingPrizeId(null);
    fetchRaffles();
  };

  const handleStartEditPrize = (prize: Prize) => {
    setEditingPrizeId(prize.id);
    setEditForm({
      name: prize.name,
      description: prize.description || "",
      image_url: prize.image_url || "",
    });
  };

  const handleCancelEditPrize = () => {
    setEditingPrizeId(null);
  };

  const handleSavePrize = async (prizeId: string) => {
    const name = editForm.name.trim();
    if (!name) {
      toast.error("El nombre es obligatorio");
      return;
    }

    const { error } = await supabase
      .from("raffle_prizes")
      .update({
        name,
        description: editForm.description.trim() || null,
        image_url: editForm.image_url.trim() || null,
      })
      .eq("id", prizeId);

    if (error) {
      toast.error("Error al actualizar premio", { description: error.message });
      return;
    }

    toast.success("Premio actualizado");
    setEditingPrizeId(null);
    fetchRaffles();
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
            className="flex-1"
          />
          <Input
            type="date"
            value={newRaffleDate}
            onChange={(e) => setNewRaffleDate(e.target.value)}
            className="w-40"
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
                  {raffle.raffle_date && (
                    <span className="text-xs text-muted-foreground">
                      {formatDateOnly(raffle.raffle_date)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                    <Users className="h-3 w-3" />
                    {raffle.participant_count} participantes
                  </span>
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

              {/* Sección de Premios */}
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Trophy className="h-4 w-4" />
                  Premios
                </div>
                {raffle.prizes.length > 0 && (
                  <div className="space-y-1">
                    {raffle.prizes.map((prize, index) => (
                      <div
                        key={prize.id}
                        className="flex flex-col gap-2 py-2 px-3 bg-muted/30 rounded text-sm"
                      >
                        {editingPrizeId === prize.id ? (
                          <>
                            <div className="flex flex-wrap gap-2">
                              <Input
                                placeholder="Nombre"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                                }
                                className="flex-1 h-8 min-w-[120px]"
                              />
                              <Input
                                placeholder="Descripción"
                                value={editForm.description}
                                onChange={(e) =>
                                  setEditForm((prev) => ({ ...prev, description: e.target.value }))
                                }
                                className="flex-1 h-8 min-w-[120px] text-xs"
                              />
                              <Input
                                placeholder="URL imagen"
                                value={editForm.image_url}
                                onChange={(e) =>
                                  setEditForm((prev) => ({ ...prev, image_url: e.target.value }))
                                }
                                className="flex-1 h-8 min-w-[120px] text-xs"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="default"
                                size="sm"
                                className="h-7"
                                onClick={() => handleSavePrize(prize.id)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Guardar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7"
                                onClick={handleCancelEditPrize}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>
                              <span className="font-mono text-xs text-muted-foreground mr-2">
                                #{index + 1}
                              </span>
                              {prize.name}
                              {prize.description && (
                                <span className="text-muted-foreground ml-2">
                                  — {prize.description}
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleStartEditPrize(prize)}
                                aria-label="Editar premio"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleDeletePrize(prize.id)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Input
                    placeholder="Nombre del premio"
                    value={newPrizeNames[raffle.id] || ""}
                    onChange={(e) =>
                      setNewPrizeNames((prev) => ({ ...prev, [raffle.id]: e.target.value }))
                    }
                    className="flex-1 h-8 text-sm min-w-[180px]"
                  />
                  <Input
                    placeholder="Descripción (opcional)"
                    value={newPrizeDescriptions[raffle.id] || ""}
                    onChange={(e) =>
                      setNewPrizeDescriptions((prev) => ({
                        ...prev,
                        [raffle.id]: e.target.value,
                      }))
                    }
                    className="flex-1 h-8 text-xs min-w-[180px]"
                  />
                  <Input
                    placeholder="URL imagen (opcional)"
                    value={newPrizeImageUrls[raffle.id] || ""}
                    onChange={(e) =>
                      setNewPrizeImageUrls((prev) => ({
                        ...prev,
                        [raffle.id]: e.target.value,
                      }))
                    }
                    className="flex-1 h-8 text-xs min-w-[180px]"
                  />
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={() => handleAddPrize(raffle.id)}
                    disabled={addingPrize === raffle.id || !newPrizeNames[raffle.id]?.trim()}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
