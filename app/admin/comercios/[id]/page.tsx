"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
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

export default function EditComercioPage() {
  const params = useParams();
  const router = useRouter();
  const comercioId = params.id as string;

  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchComercio = async () => {
      const { data, error } = await supabase
        .from("comercios")
        .select("*, members(business_name, trade_name, member_number)")
        .eq("id", comercioId)
        .single();

      if (error || !data) {
        toast.error("Comercio no encontrado");
        router.push("/admin/comercios");
        return;
      }

      setComercio(data);
      setLoading(false);
    };

    fetchComercio();
  }, [comercioId, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!comercio) return;
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
    router.push("/admin/comercios");
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
              <Input id="fantasy_name" name="fantasy_name" placeholder="Mi Comercio" defaultValue={comercio.fantasy_name || ""} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="short_description">Descripción Corta</Label>
              <Input
                id="short_description"
                name="short_description"
                placeholder="Breve descripción del comercio"
                defaultValue={comercio.short_description || ""}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="display_address">Dirección a Mostrar</Label>
              <Input
                id="display_address"
                name="display_address"
                placeholder="Av. Principal 123, Local 5"
                defaultValue={comercio.display_address || ""}
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                name="facebook"
                placeholder="https://facebook.com/pagina"
                defaultValue={comercio.facebook || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                name="website"
                placeholder="https://ejemplo.com"
                defaultValue={comercio.website || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                placeholder="+598 99 123 456"
                defaultValue={comercio.whatsapp || ""}
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

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
          <Link href="/admin/comercios">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
