"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Instagram, Facebook, Globe, MessageCircle, MapPin, Star, Gift, Check } from "lucide-react";

type Discount = {
  id: string;
  title: string;
  description: string | null;
  featured: boolean;
};

type Raffle = {
  id: string;
  name: string;
  secret_code: string;
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
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Raffle participation state
  const [activeRaffle, setActiveRaffle] = useState<Raffle | null>(null);
  const [showRaffleForm, setShowRaffleForm] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [participantWhatsapp, setParticipantWhatsapp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check for code param and remove it immediately from URL
    const code = searchParams.get("code");
    if (code) {
      // Remove code from URL without reload
      window.history.replaceState({}, "", `/comercio/${slug}`);
    }

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

      // Fetch discounts
      const { data: discountsData } = await supabase
        .from("discounts")
        .select("id, title, description, featured")
        .eq("comercio_id", comercioData.id)
        .eq("active", true)
        .order("featured", { ascending: false });

      setComercio(comercioData);
      setDiscounts(discountsData || []);

      // If there's a code, validate it against active global raffles
      if (code) {
        const { data: raffleData } = await supabase
          .from("raffles")
          .select("id, name, secret_code")
          .eq("secret_code", code)
          .eq("active", true)
          .single();

        if (raffleData) {
          setActiveRaffle(raffleData);
          setShowRaffleForm(true);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [slug, searchParams]);

  const handleSubmitParticipation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRaffle || submitting) return;

    setError("");
    setSubmitting(true);

    if (!participantName.trim() || !participantWhatsapp.trim()) {
      setError("Por favor completa todos los campos");
      setSubmitting(false);
      return;
    }

    const { data: insertedData, error: insertError } = await supabase
      .from("raffle_participants")
      .insert({
        raffle_id: activeRaffle.id,
        comercio_id: comercio?.id,
        name: participantName.trim(),
        whatsapp: participantWhatsapp.trim(),
      })
      .select("ticket_number")
      .single();

    if (insertError) {
      setError("Error al registrar participación. Intenta nuevamente.");
      setSubmitting(false);
      return;
    }

    setTicketNumber(insertedData.ticket_number);
    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (notFound || !comercio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Comercio no encontrado</p>
        <Link href="/comercios" className="text-blue-600 hover:underline">
          Ver todos los comercios
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/comercios"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a comercios
        </Link>

        {/* Raffle Participation Form */}
        {showRaffleForm && activeRaffle && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="h-6 w-6" />
              <h2 className="text-xl font-bold">{activeRaffle.name}</h2>
            </div>

            {submitted ? (
              <div className="bg-white/20 rounded-lg p-6 text-center">
                <Check className="h-12 w-12 mx-auto mb-3" />
                <p className="text-lg font-semibold">¡Participación registrada!</p>
                {ticketNumber && (
                  <p className="text-3xl font-bold mt-2">#{ticketNumber}</p>
                )}
                <p className="text-sm opacity-90 mt-1">Buena suerte en el sorteo</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitParticipation} className="space-y-4">
                <p className="text-sm opacity-90">Completa tus datos para participar</p>

                <div className="space-y-1">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nombre completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-gray-900"
                    placeholder="Tu nombre"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="whatsapp" className="text-sm font-medium">
                    WhatsApp
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={participantWhatsapp}
                    onChange={(e) => setParticipantWhatsapp(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-gray-900"
                    placeholder="+598 99 123 456"
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm bg-red-500/20 p-2 rounded">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-purple-600 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Registrando..." : "Participar"}
                </button>
              </form>
            )}
          </div>
        )}

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

            <div className="flex flex-wrap gap-3 mt-6">
              {comercio.instagram && (
                <a
                  href={comercio.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm hover:opacity-90"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              )}
              {comercio.facebook && (
                <a
                  href={comercio.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:opacity-90"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </a>
              )}
              {comercio.website && (
                <a
                  href={comercio.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-full text-sm hover:opacity-90"
                >
                  <Globe className="h-4 w-4" />
                  Sitio Web
                </a>
              )}
              {comercio.whatsapp && (
                <a
                  href={`https://wa.me/${comercio.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {discounts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Descuentos</h2>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Cargando...</p></div>}>
      <ComercioContent />
    </Suspense>
  );
}
