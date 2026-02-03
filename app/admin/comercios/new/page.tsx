"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Member = {
  id: string;
  business_name: string;
  trade_name: string;
  member_number: string;
};

function NewComercioForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedMemberId = searchParams.get("member_id");

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchMember, setSearchMember] = useState("");

  const filteredMembers = members.filter((m) =>
    m.trade_name?.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.business_name?.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.member_number?.includes(searchMember)
  );

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("members")
        .select("id, business_name, trade_name, member_number, comercios(id)")
        .order("trade_name");

      const availableMembers = (data || []).filter(
        (m) => !m.comercios || (Array.isArray(m.comercios) && m.comercios.length === 0)
      );
      setMembers(availableMembers);
      setLoading(false);
    };

    fetchMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const memberId = formData.get("member_id") as string;
    const slug = formData.get("slug") as string;

    if (!memberId || !slug) {
      toast.error("Error", { description: "Socio y slug son obligatorios" });
      setSaving(false);
      return;
    }

    const newComercio = {
      member_id: memberId,
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

    const { error } = await supabase.from("comercios").insert(newComercio);

    if (error) {
      toast.error("Error al crear comercio", { description: error.message });
      setSaving(false);
      return;
    }

    toast.success("Comercio creado correctamente");
    router.push("/admin/comercios");
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground">Información del Comercio</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="member_id">Socio *</Label>
            <Input
              placeholder="Buscar socio..."
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              className="mb-2"
            />
            <select
              id="member_id"
              name="member_id"
              defaultValue={preselectedMemberId || ""}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Seleccionar socio...</option>
              {filteredMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.trade_name 
                    ? `${member.trade_name} - ${member.business_name}` 
                    : member.business_name} ({member.member_number})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL) *</Label>
            <Input id="slug" name="slug" required placeholder="mi-comercio" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="fantasy_name">Nombre Fantasía</Label>
            <Input id="fantasy_name" name="fantasy_name" placeholder="Mi Comercio" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="short_description">Descripción Corta</Label>
            <Input id="short_description" name="short_description" placeholder="Breve descripción del comercio" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="display_address">Dirección a Mostrar</Label>
            <Input id="display_address" name="display_address" placeholder="Av. Principal 123, Local 5" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground">Redes y Contacto</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" name="instagram" placeholder="https://instagram.com/usuario" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" name="facebook" placeholder="https://facebook.com/pagina" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Sitio Web</Label>
            <Input id="website" name="website" placeholder="https://ejemplo.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" placeholder="+598 99 123 456" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground">Imagen</h3>
        <div className="space-y-2">
          <Label htmlFor="logo_url">URL del Logo</Label>
          <Input id="logo_url" name="logo_url" placeholder="https://ejemplo.com/logo.png" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground">Estado</h3>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="active" name="active" className="h-4 w-4" defaultChecked />
          <Label htmlFor="active">Comercio Activo</Label>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Crear Comercio"}
        </Button>
        <Link href="/admin/comercios">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  );
}

export default function NewComercioPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/comercios">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Nuevo Comercio</h1>
      </div>

      <Suspense fallback={<div>Cargando...</div>}>
        <NewComercioForm />
      </Suspense>
    </div>
  );
}
