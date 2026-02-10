"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Comercio = {
  id: string;
  slug: string;
  fantasy_name: string | null;
  logo_url: string | null;
  short_description: string | null;
  display_address: string | null;
};

export default function ComerciosPublicPage() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComercios = async () => {
      const { data } = await supabase
        .from("comercios")
        .select("id, slug, fantasy_name, logo_url, short_description, display_address")
        .eq("active", true)
        .order("fantasy_name");
      setComercios(data || []);
      setLoading(false);
    };

    fetchComercios();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">Comercios Día de las Piedras</h1>
        <p className="text-center text-gray-600 mb-12">Descubrí los comercios adheridos</p>

        {comercios.length === 0 ? (
          <p className="text-center text-gray-500">No hay comercios disponibles</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comercios.map((comercio) => {
              const slug = comercio.slug?.trim();
              const href = slug ? `/comercio/${encodeURIComponent(slug)}` : "#";
              const isClickable = !!slug;

              const cardContent = (
                <>
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {comercio.logo_url ? (
                      <img
                        src={comercio.logo_url}
                        alt={comercio.fantasy_name || comercio.slug || ""}
                        className="max-h-full max-w-full object-contain p-4"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-gray-400">
                        {(comercio.fantasy_name || comercio.slug || "").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-lg">{comercio.fantasy_name || comercio.slug}</h2>
                    {comercio.short_description && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{comercio.short_description}</p>
                    )}
                    {comercio.display_address && (
                      <p className="text-gray-500 text-xs mt-2">{comercio.display_address}</p>
                    )}
                  </div>
                </>
              );

              if (!isClickable) {
                return (
                  <div
                    key={comercio.id}
                    className="bg-white rounded-lg shadow-sm border overflow-hidden opacity-75"
                  >
                    {cardContent}
                  </div>
                );
              }

              return (
                <Link
                  key={comercio.id}
                  href={href}
                  prefetch={false}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
