"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Comercio = {
  id: string;
  member_id: string;
  slug: string;
  fantasy_name: string | null;
  logo_url: string | null;
  short_description: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  whatsapp: string | null;
  active: boolean;
  display_address: string | null;
  members: {
    business_name: string;
    trade_name: string;
    member_number: string;
  } | null;
};

type Discount = {
  id: string;
  comercio_id: string;
  title: string;
  description: string | null;
  active: boolean;
  featured: boolean;
};

export default function EditComercioPage() {
  const params = useParams();
  const router = useRouter();
  const comercioId = params.id as string;

  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newDiscount, setNewDiscount] = useState({ title: "", description: "" });
  const [addingDiscount, setAddingDiscount] = useState(false);

  const fetchData = async () => {
    const [comercioRes, discountsRes] = await Promise.all([
      supabase
        .from("comercios")
        .select("*, members(business_name, trade_name, member_number)")
        .eq("id", comercioId)
        .single(),
      supabase
        .from("discounts")
        .select("*")
        .eq("comercio_id", comercioId)
        .order("created_at", { ascending: false }),
    ]);

    if (comercioRes.error || !comercioRes.data) {
      toast.error("Comercio no encontrado");
      router.push("/admin/comercios");
      return;
    }

    setComercio(comercioRes.data);
    setDiscounts(discountsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [comercioId, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!comercio || saving) return;
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const slug = formData.get("slug") as string;

    if (!slug) {
      toast.error("Error", { description: "El slug es obligatorio" });
      setSaving(false);
      return;
    }

    const updatedComercio = {
      slug: slug.toLowerCase().replace(/\s+/g, "-"),
      fantasy_name: formData.get("fantasy_name") || null,
      logo_url: formData.get("logo_url") || null,
      short_description: formData.get("short_description") || null,
      instagram: formData.get("instagram") || null,
      facebook: formData.get("facebook") || null,
      website: formData.get("website") || null,
      whatsapp: formData.get("whatsapp") || null,
      active: formData.get("active") === "on",
      display_address: formData.get("display_address") || null,
    };

    const { error } = await supabase
      .from("comercios")
      .update(updatedComercio)
      .eq("id", comercioId);

    if (error) {
      toast.error("Error al actualizar comercio", { description: error.message });
      setSaving(false);
      return;
    }

    toast.success("Comercio actualizado correctamente");
    setSaving(false);
  };

  const handleAddDiscount = async () => {
    if (addingDiscount) return;
    if (!newDiscount.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    setAddingDiscount(true);
    const { error } = await supabase.from("discounts").insert({
      comercio_id: comercioId,
      title: newDiscount.title,
      description: newDiscount.description || null,
      active: true,
      featured: false,
    });

    if (error) {
      toast.error("Error al crear descuento", { description: error.message });
      setAddingDiscount(false);
      return;
    }

    toast.success("Descuento creado");
    setNewDiscount({ title: "", description: "" });
    setAddingDiscount(false);
    fetchData();
  };

  const handleToggleDiscount = async (discount: Discount, field: "active" | "featured") => {
    const { error } = await supabase
      .from("discounts")
      .update({ [field]: !discount[field] })
      .eq("id", discount.id);

    if (error) {
      toast.error("Error al actualizar descuento");
      return;
    }

    fetchData();
  };

  const handleDeleteDiscount = async (discountId: string) => {
    if (!confirm("¿Eliminar este descuento?")) return;

    const { error } = await supabase.from("discounts").delete().eq("id", discountId);

    if (error) {
      toast.error("Error al eliminar descuento");
      return;
    }

    toast.success("Descuento eliminado");
    fetchData();
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!comercio) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/comercios">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Comercio</h1>
          <p className="text-sm text-muted-foreground">
            Socio: {comercio.members?.trade_name || comercio.members?.business_name} ({comercio.members?.member_number})
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">Información del Comercio</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input id="slug" name="slug" required defaultValue={comercio.slug} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="fantasy_name">Nombre Fantasía</Label>
              <Input id="fantasy_name" name="fantasy_name" placeholder="Mi Comercio" defaultValue={comercio.fantasy_name || ""} className="placeholder:text-muted-foreground/50" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="short_description">Descripción Corta</Label>
              <Input
                id="short_description"
                name="short_description"
                placeholder="Breve descripción del comercio"
                defaultValue={comercio.short_description || ""}
                className="placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="display_address">Dirección a Mostrar</Label>
              <Input
                id="display_address"
                name="display_address"
                placeholder="Av. Principal 123, Local 5"
                defaultValue={comercio.display_address || ""}
                className="placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">Redes y Contacto</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                placeholder="https://instagram.com/usuario"
                defaultValue={comercio.instagram || ""}
                className="placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                name="facebook"
                placeholder="https://facebook.com/pagina"
                defaultValue={comercio.facebook || ""}
                className="placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                name="website"
                placeholder="https://ejemplo.com"
                defaultValue={comercio.website || ""}
                className="placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                placeholder="+598 99 123 456"
                defaultValue={comercio.whatsapp || ""}
                className="placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">Imagen</h3>
          <div className="space-y-2">
            <Label htmlFor="logo_url">URL del Logo</Label>
            <Input
              id="logo_url"
              name="logo_url"
              placeholder="https://ejemplo.com/logo.png"
              defaultValue={comercio.logo_url || ""}
              className="placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">Estado</h3>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="active" name="active" className="h-4 w-4" defaultChecked={comercio.active} />
            <Label htmlFor="active">Comercio Activo</Label>
          </div>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </form>

      <div className="border-t pt-6 space-y-4">
        <h3 className="font-medium text-lg">Descuentos</h3>

        <div className="space-y-3">
          {discounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay descuentos registrados</p>
          ) : (
            discounts.map((discount) => (
              <div
                key={discount.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  !discount.active ? "opacity-50 bg-muted/50" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{discount.title}</span>
                    {discount.featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                  </div>
                  {discount.description && (
                    <p className="text-sm text-muted-foreground">{discount.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={discount.featured ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleDiscount(discount, "featured")}
                    title={discount.featured ? "Quitar destacado" : "Destacar"}
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant={discount.active ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleDiscount(discount, "active")}
                  >
                    {discount.active ? "Activo" : "Inactivo"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDiscount(discount.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm">Agregar Descuento</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="discount_title" className="text-xs">Título *</Label>
              <Input
                id="discount_title"
                placeholder="20% de descuento"
                value={newDiscount.title}
                onChange={(e) => setNewDiscount({ ...newDiscount, title: e.target.value })}
                className="placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="discount_description" className="text-xs">Descripción</Label>
              <Input
                id="discount_description"
                placeholder="En todos los productos"
                value={newDiscount.description}
                onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
                className="placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAddDiscount}
            disabled={addingDiscount || !newDiscount.title.trim()}
          >
            <Plus className="h-3 w-3 mr-1" />
            {addingDiscount ? "Agregando..." : "Agregar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
