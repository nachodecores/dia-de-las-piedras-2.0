"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Instagram, Facebook, Globe, MessageCircle, MapPin, Star } from "lucide-react";

type Discount = {
  id: string;
  title: string;
  description: string | null;
  featured: boolean;
};

type Comercio = {
  id: string;
  slug: string;
  fantasy_name: string | null;
  logo_url: string | null;
  short_description: string | null;
  display_address: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  whatsapp: string | null;
};

function ComercioContent() {
  const params = useParams();
  const slug = params.slug as string;

  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug || typeof slug !== "string") return;

    const fetchData = async () => {
      const { data: comercioData, error: comercioError } = await supabase
        .from("comercios")
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .single();

      if (comercioError || !comercioData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: discountsData } = await supabase
        .from("discounts")
        .select("id, title, description, featured")
        .eq("comercio_id", comercioData.id)
        .eq("active", true)
        .order("featured", { ascending: false });

      setComercio(comercioData);
      setDiscounts(discountsData || []);
      setLoading(false);
    };

    fetchData();
  }, [slug]);

  const pageBg = {
    background: "linear-gradient(135deg, #1F2A44 0%, #7f1d1d 50%, #1F2A44 100%)",
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={pageBg}
      >
        <p className="text-white">Cargando...</p>
      </div>
    );
  }

  if (notFound || !comercio) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={pageBg}
      >
        <p className="text-white/90">Comercio no encontrado</p>
        <Link href="/comercios" className="text-white underline hover:no-underline">
          Ver todos los comercios
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={pageBg}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/comercios"
          className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a comercios
        </Link>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {comercio.logo_url && (
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <img
                src={comercio.logo_url}
                alt={comercio.fantasy_name || comercio.slug}
                className="max-h-full max-w-full object-contain p-6"
              />
            </div>
          )}

          <div className="p-6">
            <h1 className="text-2xl font-bold">{comercio.fantasy_name || comercio.slug}</h1>

            {comercio.short_description && (
              <p className="text-gray-600 mt-2">{comercio.short_description}</p>
            )}

            {comercio.display_address && (
              <div className="flex items-center gap-2 text-gray-500 mt-4">
                <MapPin className="h-4 w-4" />
                <span>{comercio.display_address}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-6 justify-end">
              {comercio.instagram && (
                <a
                  href={comercio.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm hover:opacity-90"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline">Instagram</span>
                </a>
              )}
              {comercio.facebook && (
                <a
                  href={comercio.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-blue-600 text-white rounded-full text-sm hover:opacity-90"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline">Facebook</span>
                </a>
              )}
              {comercio.website && (
                <a
                  href={comercio.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-gray-800 text-white rounded-full text-sm hover:opacity-90"
                  aria-label="Sitio web"
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline">Sitio Web</span>
                </a>
              )}
              {comercio.whatsapp && (
                <a
                  href={`https://wa.me/${comercio.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-green-500 text-white rounded-full text-sm hover:opacity-90"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline">WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {discounts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-white/90">Descuentos ofrecidos</h2>
            <div className="space-y-3">
              {discounts.map((discount) => (
                <div
                  key={discount.id}
                  className={`p-4 rounded-lg border ${
                    discount.featured
                      ? "bg-amber-50 border-amber-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {discount.featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                    <span className="font-medium">{discount.title}</span>
                  </div>
                  {discount.description && (
                    <p className="text-gray-600 text-sm mt-1">{discount.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComercioPublicPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #1F2A44 0%, #7f1d1d 50%, #1F2A44 100%)" }}
        >
          <p className="text-white">Cargando...</p>
        </div>
      }
    >
      <ComercioContent />
    </Suspense>
  );
}
