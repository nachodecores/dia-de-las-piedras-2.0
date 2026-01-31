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
import { Plus } from "lucide-react";
import { toast } from "sonner";

type Member = {
  id: string;
  member_number: string;
  business_name: string;
  trade_name: string;
  legal_form: string;
  tax_id: string;
  member_type: string;
  payment_method: string;
  monthly_fee: number;
  fee_up_to_date: boolean;
  street: string;
  street_number: string;
  city: string;
  first_name: string;
  last_name: string;
  mobile_phone: string;
  email: string;
  segments: { name: string } | null;
};

type Segment = {
  id: string;
  name: string;
};

export default function SociosPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    const [membersRes, segmentsRes] = await Promise.all([
      supabase
        .from("members")
        .select("*, segments(name)")
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
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
      piedras_day_member: formData.get("piedras_day_member") === "on",
    };

    const { error } = await supabase.from("members").insert(newMember);
    if (error) {
      toast.error("Error al crear socio", { description: error.message });
    } else {
      toast.success("Socio creado correctamente");
      setOpen(false);
      fetchData();
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Socios</h1>
        <Dialog open={open} onOpenChange={setOpen}>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Información General</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Razón Social</Label>
                    <Input id="business_name" name="business_name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trade_name">Nombre Fantasía</Label>
                    <Input id="trade_name" name="trade_name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legal_form">Forma Jurídica</Label>
                    <Input id="legal_form" name="legal_form" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_id">RUT</Label>
                    <Input id="tax_id" name="tax_id" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="segment_id">Segmento Principal</Label>
                    <select
                      id="segment_id"
                      name="segment_id"
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
                    <Input id="member_type" name="member_type" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input id="description" name="description" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Pago</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Forma de Pago</Label>
                    <Input id="payment_method" name="payment_method" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_frequency">Frecuencia de Pago</Label>
                    <Input id="payment_frequency" name="payment_frequency" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly_fee">Cuota Mensual</Label>
                    <Input id="monthly_fee" name="monthly_fee" type="number" step="0.01" />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input type="checkbox" id="fee_up_to_date" name="fee_up_to_date" className="h-4 w-4" />
                    <Label htmlFor="fee_up_to_date">Al Día con Cuota</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Dirección</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Calle</Label>
                    <Input id="street" name="street" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street_number">Número</Label>
                    <Input id="street_number" name="street_number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartment">Depto</Label>
                    <Input id="apartment" name="apartment" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input id="city" name="city" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address_notes">Observaciones Dirección</Label>
                    <Input id="address_notes" name="address_notes" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Contacto</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre</Label>
                    <Input id="first_name" name="first_name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Apellido</Label>
                    <Input id="last_name" name="last_name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="national_id">Cédula</Label>
                    <Input id="national_id" name="national_id" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile_phone">Celular</Label>
                    <Input id="mobile_phone" name="mobile_phone" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" name="phone" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Otros</h3>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="cpy_client" name="cpy_client" className="h-4 w-4" />
                    <Label htmlFor="cpy_client">Cliente CPY</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="piedras_day_member" name="piedras_day_member" className="h-4 w-4" />
                    <Label htmlFor="piedras_day_member">Adherido Día Piedras</Label>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">Crear Socio</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Nº Socio</TableHead>
              <TableHead className="whitespace-nowrap">Razón Social</TableHead>
              <TableHead className="whitespace-nowrap">Nombre Fantasía</TableHead>
              <TableHead className="whitespace-nowrap">RUT</TableHead>
              <TableHead className="whitespace-nowrap">Segmento</TableHead>
              <TableHead className="whitespace-nowrap">Tipo</TableHead>
              <TableHead className="whitespace-nowrap">Contacto</TableHead>
              <TableHead className="whitespace-nowrap">Celular</TableHead>
              <TableHead className="whitespace-nowrap">Email</TableHead>
              <TableHead className="whitespace-nowrap">Dirección</TableHead>
              <TableHead className="whitespace-nowrap">Cuota</TableHead>
              <TableHead className="whitespace-nowrap">Al Día</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-muted-foreground">
                  No hay socios registrados
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="whitespace-nowrap">{member.member_number}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.business_name}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.trade_name}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.tax_id}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.segments?.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.member_type}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.first_name} {member.last_name}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.mobile_phone}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.email}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.street} {member.street_number}, {member.city}</TableCell>
                  <TableCell className="whitespace-nowrap">${member.monthly_fee}</TableCell>
                  <TableCell className="whitespace-nowrap">{member.fee_up_to_date ? "Sí" : "No"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
