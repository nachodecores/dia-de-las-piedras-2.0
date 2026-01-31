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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Store, Pencil } from "lucide-react";
import { toast } from "sonner";

type Comercio = {
  id: string;
  slug: string;
  logo_url: string;
  short_description: string;
  instagram: string;
  facebook: string;
  website: string;
  whatsapp: string;
  active: boolean;
  display_address: string;
};

type Member = {
  id: string;
  member_number: string;
  business_name: string;
  trade_name: string;
  legal_form: string;
  tax_id: string;
  description: string;
  member_type: string;
  payment_method: string;
  payment_frequency: string;
  monthly_fee: number;
  fee_up_to_date: boolean;
  street: string;
  street_number: string;
  address_notes: string;
  apartment: string;
  city: string;
  first_name: string;
  last_name: string;
  national_id: string;
  mobile_phone: string;
  phone: string;
  email: string;
  cpy_client: boolean;
  piedras_day_member: boolean;
  segment_id: string;
  segments: { name: string } | null;
  comercios: Comercio[] | null;
};

type Segment = {
  id: string;
  name: string;
};

export default function SociosPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isPiedrasMember, setIsPiedrasMember] = useState(false);

  const fetchData = async () => {
    const [membersRes, segmentsRes] = await Promise.all([
      supabase
        .from("members")
        .select("*, segments(name), comercios(*)")
        .order("created_at", { ascending: false }),
      supabase.from("segments").select("id, name").order("name"),
    ]);
    setMembers(membersRes.data || []);
    setSegments(segmentsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const isPiedras = formData.get("piedras_day_member") === "on";

    const newMember = {
      business_name: formData.get("business_name") || null,
      trade_name: formData.get("trade_name") || null,
      legal_form: formData.get("legal_form") || null,
      tax_id: formData.get("tax_id") || null,
      description: formData.get("description") || null,
      segment_id: formData.get("segment_id") || null,
      member_type: formData.get("member_type") || null,
      payment_method: formData.get("payment_method") || null,
      payment_frequency: formData.get("payment_frequency") || null,
      monthly_fee: formData.get("monthly_fee") ? parseFloat(formData.get("monthly_fee") as string) : null,
      fee_up_to_date: formData.get("fee_up_to_date") === "on",
      street: formData.get("street") || null,
      street_number: formData.get("street_number") || null,
      address_notes: formData.get("address_notes") || null,
      apartment: formData.get("apartment") || null,
      city: formData.get("city") || null,
      first_name: formData.get("first_name") || null,
      last_name: formData.get("last_name") || null,
      national_id: formData.get("national_id") || null,
      mobile_phone: formData.get("mobile_phone") || null,
      phone: formData.get("phone") || null,
      email: formData.get("email") || null,
      cpy_client: formData.get("cpy_client") === "on",
      piedras_day_member: isPiedras,
    };

    const { data: memberData, error: memberError } = await supabase
      .from("members")
      .insert(newMember)
      .select()
      .single();

    if (memberError) {
      toast.error("Error al crear socio", { description: memberError.message });
      return;
    }

    if (isPiedras && memberData) {
      const comercioData = {
        member_id: memberData.id,
        slug: formData.get("comercio_slug") || null,
        logo_url: formData.get("comercio_logo_url") || null,
        short_description: formData.get("comercio_short_description") || null,
        instagram: formData.get("comercio_instagram") || null,
        facebook: formData.get("comercio_facebook") || null,
        website: formData.get("comercio_website") || null,
        whatsapp: formData.get("comercio_whatsapp") || null,
        active: formData.get("comercio_active") === "on",
        display_address: formData.get("comercio_display_address") || null,
      };

      const { error: comercioError } = await supabase
        .from("comercios")
        .insert(comercioData);

      if (comercioError) {
        toast.error("Error al crear comercio", { description: comercioError.message });
        return;
      }
    }

    toast.success("Socio creado correctamente");
    setCreateOpen(false);
    setIsPiedrasMember(false);
    fetchData();
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMember) return;

    const formData = new FormData(e.currentTarget);
    const isPiedras = formData.get("piedras_day_member") === "on";

    const updatedMember = {
      business_name: formData.get("business_name") || null,
      trade_name: formData.get("trade_name") || null,
      legal_form: formData.get("legal_form") || null,
      tax_id: formData.get("tax_id") || null,
      description: formData.get("description") || null,
      segment_id: formData.get("segment_id") || null,
      member_type: formData.get("member_type") || null,
      payment_method: formData.get("payment_method") || null,
      payment_frequency: formData.get("payment_frequency") || null,
      monthly_fee: formData.get("monthly_fee") ? parseFloat(formData.get("monthly_fee") as string) : null,
      fee_up_to_date: formData.get("fee_up_to_date") === "on",
      street: formData.get("street") || null,
      street_number: formData.get("street_number") || null,
      address_notes: formData.get("address_notes") || null,
      apartment: formData.get("apartment") || null,
      city: formData.get("city") || null,
      first_name: formData.get("first_name") || null,
      last_name: formData.get("last_name") || null,
      national_id: formData.get("national_id") || null,
      mobile_phone: formData.get("mobile_phone") || null,
      phone: formData.get("phone") || null,
      email: formData.get("email") || null,
      cpy_client: formData.get("cpy_client") === "on",
      piedras_day_member: isPiedras,
    };

    const { error: memberError } = await supabase
      .from("members")
      .update(updatedMember)
      .eq("id", editingMember.id);

    if (memberError) {
      toast.error("Error al actualizar socio", { description: memberError.message });
      return;
    }

    const existingComercio = editingMember.comercios?.[0];

    if (isPiedras) {
      const comercioData = {
        member_id: editingMember.id,
        slug: formData.get("comercio_slug") || null,
        logo_url: formData.get("comercio_logo_url") || null,
        short_description: formData.get("comercio_short_description") || null,
        instagram: formData.get("comercio_instagram") || null,
        facebook: formData.get("comercio_facebook") || null,
        website: formData.get("comercio_website") || null,
        whatsapp: formData.get("comercio_whatsapp") || null,
        active: formData.get("comercio_active") === "on",
        display_address: formData.get("comercio_display_address") || null,
      };

      if (existingComercio) {
        const { error: comercioError } = await supabase
          .from("comercios")
          .update(comercioData)
          .eq("id", existingComercio.id);

        if (comercioError) {
          toast.error("Error al actualizar comercio", { description: comercioError.message });
          return;
        }
      } else {
        const { error: comercioError } = await supabase
          .from("comercios")
          .insert(comercioData);

        if (comercioError) {
          toast.error("Error al crear comercio", { description: comercioError.message });
          return;
        }
      }
    } else if (existingComercio) {
      await supabase.from("comercios").delete().eq("id", existingComercio.id);
    }

    toast.success("Socio actualizado correctamente");
    setEditOpen(false);
    setEditingMember(null);
    setIsPiedrasMember(false);
    fetchData();
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setIsPiedrasMember(member.piedras_day_member);
    setEditOpen(true);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  const MemberForm = ({ onSubmit, member, isEdit }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; member?: Member | null; isEdit?: boolean }) => {
    const comercio = member?.comercios?.[0];

    return (
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">Información General</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Razón Social</Label>
              <Input id="business_name" name="business_name" defaultValue={member?.business_name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trade_name">Nombre Fantasía</Label>
              <Input id="trade_name" name="trade_name" defaultValue={member?.trade_name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal_form">Forma Jurídica</Label>
              <Input id="legal_form" name="legal_form" defaultValue={member?.legal_form || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_id">RUT</Label>
              <Input id="tax_id" name="tax_id" defaultValue={member?.tax_id || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="segment_id">Segmento Principal</Label>
              <select
                id="segment_id"
                name="segment_id"
                defaultValue={member?.segment_id || ""}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Seleccionar...</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="member_type">Tipo de Socio</Label>
              <Input id="member_type" name="member_type" defaultValue={member?.member_type || ""} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" name="description" defaultValue={member?.description || ""} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">Pago</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Forma de Pago</Label>
              <Input id="payment_method" name="payment_method" defaultValue={member?.payment_method || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_frequency">Frecuencia de Pago</Label>
              <Input id="payment_frequency" name="payment_frequency" defaultValue={member?.payment_frequency || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly_fee">Cuota Mensual</Label>
              <Input id="monthly_fee" name="monthly_fee" type="number" step="0.01" defaultValue={member?.monthly_fee || ""} />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input type="checkbox" id="fee_up_to_date" name="fee_up_to_date" className="h-4 w-4" defaultChecked={member?.fee_up_to_date} />
              <Label htmlFor="fee_up_to_date">Al Día con Cuota</Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">Dirección</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">Calle</Label>
              <Input id="street" name="street" defaultValue={member?.street || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street_number">Número</Label>
              <Input id="street_number" name="street_number" defaultValue={member?.street_number || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apartment">Depto</Label>
              <Input id="apartment" name="apartment" defaultValue={member?.apartment || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" name="city" defaultValue={member?.city || ""} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="address_notes">Observaciones Dirección</Label>
              <Input id="address_notes" name="address_notes" defaultValue={member?.address_notes || ""} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">Contacto</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input id="first_name" name="first_name" defaultValue={member?.first_name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input id="last_name" name="last_name" defaultValue={member?.last_name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="national_id">Cédula</Label>
              <Input id="national_id" name="national_id" defaultValue={member?.national_id || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile_phone">Celular</Label>
              <Input id="mobile_phone" name="mobile_phone" defaultValue={member?.mobile_phone || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" defaultValue={member?.phone || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={member?.email || ""} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">Otros</h3>
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="cpy_client" name="cpy_client" className="h-4 w-4" defaultChecked={member?.cpy_client} />
              <Label htmlFor="cpy_client">Cliente CPY</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="piedras_day_member"
                name="piedras_day_member"
                className="h-4 w-4"
                checked={isPiedrasMember}
                onChange={(e) => setIsPiedrasMember(e.target.checked)}
              />
              <Label htmlFor="piedras_day_member">Adherido Día Piedras</Label>
            </div>
          </div>
        </div>

        {isPiedrasMember && (
          <div className="space-y-4 border-t pt-4 bg-amber-50 -mx-6 px-6 py-4 border-amber-200">
            <h3 className="font-medium text-sm text-amber-800 flex items-center gap-2">
              <Store className="h-4 w-4" />
              Datos del Comercio (Día Piedras)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="comercio_slug">Slug (URL)</Label>
                <Input id="comercio_slug" name="comercio_slug" placeholder="mi-comercio" defaultValue={comercio?.slug || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comercio_logo_url">Logo URL</Label>
                <Input id="comercio_logo_url" name="comercio_logo_url" type="url" defaultValue={comercio?.logo_url || ""} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="comercio_short_description">Descripción Corta</Label>
                <Input id="comercio_short_description" name="comercio_short_description" defaultValue={comercio?.short_description || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comercio_instagram">Instagram</Label>
                <Input id="comercio_instagram" name="comercio_instagram" placeholder="https://instagram.com/..." defaultValue={comercio?.instagram || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comercio_facebook">Facebook</Label>
                <Input id="comercio_facebook" name="comercio_facebook" placeholder="https://facebook.com/..." defaultValue={comercio?.facebook || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comercio_website">Sitio Web</Label>
                <Input id="comercio_website" name="comercio_website" type="url" defaultValue={comercio?.website || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comercio_whatsapp">WhatsApp</Label>
                <Input id="comercio_whatsapp" name="comercio_whatsapp" placeholder="+598..." defaultValue={comercio?.whatsapp || ""} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="comercio_display_address">Dirección a Mostrar</Label>
                <Input id="comercio_display_address" name="comercio_display_address" defaultValue={comercio?.display_address || ""} />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="comercio_active" name="comercio_active" className="h-4 w-4" defaultChecked={comercio?.active ?? true} />
                <Label htmlFor="comercio_active">Activo</Label>
              </div>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full">
          {isEdit ? "Guardar Cambios" : "Crear Socio"}
        </Button>
      </form>
    );
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Socios</h1>
        <Dialog open={createOpen} onOpenChange={(isOpen) => { setCreateOpen(isOpen); if (!isOpen) setIsPiedrasMember(false); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Socio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Socio</DialogTitle>
            </DialogHeader>
            <MemberForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={(isOpen) => { setEditOpen(isOpen); if (!isOpen) { setEditingMember(null); setIsPiedrasMember(false); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Editar Socio
              {editingMember?.comercios?.[0] && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Store className="h-3 w-3" />
                  Comercio
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <MemberForm onSubmit={handleEdit} member={editingMember} isEdit />
        </DialogContent>
      </Dialog>

      <Table className="border rounded-lg">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold w-10"></TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Nº Socio</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold border-l">Razón Social</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Nombre Fantasía</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Forma Jurídica</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">RUT</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Descripción</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold border-l">Segmento</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Tipo Socio</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold border-l">Forma Pago</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Frecuencia</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Cuota</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Al Día</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold border-l">Calle</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Nº</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Depto</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Ciudad</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Obs. Dirección</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold border-l">Nombre</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Apellido</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Cédula</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Celular</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Teléfono</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Email</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold border-l">CPY</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold border-l bg-amber-100/50">Día Piedras</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold bg-amber-100/50">Comercio Slug</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold bg-amber-100/50">Comercio Activo</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold bg-amber-100/50">Dirección Comercio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={29} className="text-center text-muted-foreground py-8">
                No hay socios registrados
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => {
              const hasComercio = member.comercios && member.comercios.length > 0;
              return (
                <TableRow
                  key={member.id}
                  className={`hover:bg-muted/30 cursor-pointer ${hasComercio ? "bg-amber-50/50" : ""}`}
                  onClick={() => openEdit(member)}
                >
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                      {hasComercio && <Store className="h-4 w-4 text-amber-600" />}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3 font-medium">{member.member_number}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3 border-l">{member.business_name}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.trade_name}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.legal_form}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.tax_id}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3 max-w-48 truncate">{member.description}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3 border-l">{member.segments?.name}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.member_type}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3 border-l">{member.payment_method}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.payment_frequency}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.monthly_fee}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.fee_up_to_date ? "✓" : "✗"}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3 border-l">{member.street}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.street_number}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.apartment}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.city}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3 max-w-48 truncate">{member.address_notes}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3 border-l">{member.first_name}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.last_name}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.national_id}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.mobile_phone}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.phone}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">{member.email}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3 border-l">{member.cpy_client ? "✓" : "✗"}</TableCell>
                  <TableCell className={`whitespace-nowrap px-4 py-3 border-l ${member.piedras_day_member ? "bg-amber-100" : ""}`}>
                    {member.piedras_day_member ? (
                      <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        <Store className="h-3 w-3" />
                        Sí
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell className={`whitespace-nowrap px-4 py-3 font-medium text-amber-700 ${hasComercio ? "bg-amber-50" : ""}`}>{member.comercios?.[0]?.slug}</TableCell>
                  <TableCell className={`whitespace-nowrap px-4 py-3 ${hasComercio ? "bg-amber-50" : ""}`}>
                    {member.comercios?.[0]?.active === true && <span className="text-green-600 font-medium">Activo</span>}
                    {member.comercios?.[0]?.active === false && <span className="text-red-600 font-medium">Inactivo</span>}
                  </TableCell>
                  <TableCell className={`whitespace-nowrap px-4 py-3 max-w-48 truncate ${hasComercio ? "bg-amber-50" : ""}`}>{member.comercios?.[0]?.display_address}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
