"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Plus } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

type Convenio = {
  id: string;
  nombre: string;
  categoria: string | null;
  logo: string | null;
  activo: boolean;
  alcance: string | null;
  beneficios: string | null;
  contacto_nombre: string | null;
  contacto_email: string | null;
  contacto_telefono: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
};

export default function ConveniosPage() {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingConvenio, setEditingConvenio] = useState<Convenio | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase
      .from("convenios")
      .select("*")
      .order("nombre");
    setConvenios(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEdit = (convenio: Convenio) => {
    setEditingConvenio(convenio);
    setEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    const formData = new FormData(e.currentTarget);

    const newConvenio = {
      nombre: formData.get("nombre") || null,
      categoria: formData.get("categoria") || null,
      logo: formData.get("logo") || null,
      activo: formData.get("activo") === "on",
      alcance: formData.get("alcance") || null,
      beneficios: formData.get("beneficios") || null,
      contacto_nombre: formData.get("contacto_nombre") || null,
      contacto_email: formData.get("contacto_email") || null,
      contacto_telefono: formData.get("contacto_telefono") || null,
      fecha_inicio: formData.get("fecha_inicio") || null,
      fecha_fin: formData.get("fecha_fin") || null,
    };

    const { error } = await supabase.from("convenios").insert(newConvenio);

    if (error) {
      toast.error("Error al crear convenio", { description: error.message });
      setSaving(false);
      return;
    }

    toast.success("Convenio creado correctamente");
    setSaving(false);
    setCreateOpen(false);
    fetchData();
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingConvenio || saving) return;
    setSaving(true);

    const formData = new FormData(e.currentTarget);

    const updatedConvenio = {
      nombre: formData.get("nombre") || null,
      categoria: formData.get("categoria") || null,
      logo: formData.get("logo") || null,
      activo: formData.get("activo") === "on",
      alcance: formData.get("alcance") || null,
      beneficios: formData.get("beneficios") || null,
      contacto_nombre: formData.get("contacto_nombre") || null,
      contacto_email: formData.get("contacto_email") || null,
      contacto_telefono: formData.get("contacto_telefono") || null,
      fecha_inicio: formData.get("fecha_inicio") || null,
      fecha_fin: formData.get("fecha_fin") || null,
    };

    const { error } = await supabase
      .from("convenios")
      .update(updatedConvenio)
      .eq("id", editingConvenio.id);

    if (error) {
      toast.error("Error al actualizar convenio", { description: error.message });
      setSaving(false);
      return;
    }

    toast.success("Convenio actualizado correctamente");
    setSaving(false);
    setEditOpen(false);
    setEditingConvenio(null);
    fetchData();
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Convenios</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Convenio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Convenio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Información General</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create_nombre">Nombre</Label>
                    <Input id="create_nombre" name="nombre" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create_categoria">Categoría</Label>
                    <Input id="create_categoria" name="categoria" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="create_alcance">Alcance</Label>
                    <Input id="create_alcance" name="alcance" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="create_beneficios">Beneficios</Label>
                    <Input id="create_beneficios" name="beneficios" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="create_logo">Logo URL</Label>
                    <Input id="create_logo" name="logo" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Contacto</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create_contacto_nombre">Nombre</Label>
                    <Input id="create_contacto_nombre" name="contacto_nombre" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create_contacto_email">Email</Label>
                    <Input id="create_contacto_email" name="contacto_email" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create_contacto_telefono">Teléfono</Label>
                    <Input id="create_contacto_telefono" name="contacto_telefono" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Vigencia</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create_fecha_inicio">Fecha Inicio</Label>
                    <Input id="create_fecha_inicio" name="fecha_inicio" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create_fecha_fin">Fecha Fin</Label>
                    <Input id="create_fecha_fin" name="fecha_fin" type="date" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Estado</h3>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="create_activo" name="activo" className="h-4 w-4" defaultChecked />
                  <Label htmlFor="create_activo">Convenio Activo</Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Guardando..." : "Crear Convenio"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={(isOpen) => { setEditOpen(isOpen); if (!isOpen) setEditingConvenio(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Convenio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Información General</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" name="nombre" defaultValue={editingConvenio?.nombre || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Input id="categoria" name="categoria" defaultValue={editingConvenio?.categoria || ""} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="alcance">Alcance</Label>
                  <Input id="alcance" name="alcance" defaultValue={editingConvenio?.alcance || ""} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="beneficios">Beneficios</Label>
                  <Input id="beneficios" name="beneficios" defaultValue={editingConvenio?.beneficios || ""} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input id="logo" name="logo" defaultValue={editingConvenio?.logo || ""} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Contacto</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contacto_nombre">Nombre</Label>
                  <Input id="contacto_nombre" name="contacto_nombre" defaultValue={editingConvenio?.contacto_nombre || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto_email">Email</Label>
                  <Input id="contacto_email" name="contacto_email" type="email" defaultValue={editingConvenio?.contacto_email || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto_telefono">Teléfono</Label>
                  <Input id="contacto_telefono" name="contacto_telefono" defaultValue={editingConvenio?.contacto_telefono || ""} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Vigencia</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                  <Input id="fecha_inicio" name="fecha_inicio" type="date" defaultValue={editingConvenio?.fecha_inicio?.split("T")[0] || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_fin">Fecha Fin</Label>
                  <Input id="fecha_fin" name="fecha_fin" type="date" defaultValue={editingConvenio?.fecha_fin?.split("T")[0] || ""} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Estado</h3>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="activo" name="activo" className="h-4 w-4" defaultChecked={editingConvenio?.activo} />
                <Label htmlFor="activo">Convenio Activo</Label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Table className="border rounded-lg">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold w-10"></TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Nombre</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Categoría</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Alcance</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Beneficios</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Contacto</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Email</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Teléfono</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Inicio</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Fin</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Activo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {convenios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                No hay convenios registrados
              </TableCell>
            </TableRow>
          ) : (
            convenios.map((convenio) => (
              <TableRow 
                key={convenio.id} 
                className="hover:bg-muted/30 cursor-pointer"
                onClick={() => openEdit(convenio)}
              >
                <TableCell className="px-4 py-3 w-10">
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3 font-medium">{convenio.nombre}</TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">{convenio.categoria || "-"}</TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3 max-w-48 truncate">{convenio.alcance || "-"}</TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3 max-w-64 truncate">{convenio.beneficios || "-"}</TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">{convenio.contacto_nombre || "-"}</TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">{convenio.contacto_email || "-"}</TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">{convenio.contacto_telefono || "-"}</TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">
                  {convenio.fecha_inicio ? new Date(convenio.fecha_inicio).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">
                  {convenio.fecha_fin ? new Date(convenio.fecha_fin).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">{convenio.activo ? "✓" : "✗"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
