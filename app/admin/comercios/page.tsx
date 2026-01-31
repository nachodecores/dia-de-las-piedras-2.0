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
import { Plus, Pencil, ExternalLink } from "lucide-react";
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

export default function ComerciosPage() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase
      .from("comercios")
      .select("*, members(business_name, trade_name, member_number)")
      .order("created_at", { ascending: false });
    setComercios(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Comercios Día de las Piedras</h1>
        <Link href="/admin/comercios/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Comercio
          </Button>
        </Link>
      </div>

      <Table className="border rounded-lg">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold w-10"></TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Nombre</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Slug</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Socio</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Nº Socio</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Descripción</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Dirección</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Instagram</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">WhatsApp</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Web</TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 font-semibold">Activo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comercios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                No hay comercios registrados
              </TableCell>
            </TableRow>
          ) : (
            comercios.map((comercio) => (
              <TableRow key={comercio.id} className="hover:bg-muted/30">
                <TableCell className="px-4 py-3">
                  <Link href={`/admin/comercios/${comercio.id}`}>
                    <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3 font-medium">{comercio.fantasy_name || "-"}</TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">{comercio.slug}</TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">
                  {comercio.members?.trade_name || comercio.members?.business_name}
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">{comercio.members?.member_number}</TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3 max-w-64 truncate">{comercio.short_description}</TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3 max-w-48 truncate">{comercio.display_address}</TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">
                  {comercio.instagram && (
                    <a href={comercio.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      @{comercio.instagram.split("/").pop()}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">{comercio.whatsapp}</TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">
                  {comercio.website && (
                    <a href={comercio.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      Ver
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">{comercio.active ? "✓" : "✗"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
