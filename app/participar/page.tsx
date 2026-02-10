"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Gift, Check, Home, Download } from "lucide-react";
import { buildTalonPdf, getTalonPdfFilename } from "@/lib/talon-pdf";

type Raffle = {
  id: string;
  name: string;
};

function ParticiparContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code")?.trim() ?? null;

  const [status, setStatus] = useState<"loading" | "invalid" | "no-raffle" | "ready">("loading");
  const [comercioName, setComercioName] = useState<string | null>(null);
  const [comercioSlug, setComercioSlug] = useState<string | null>(null);
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [comercioId, setComercioId] = useState<string | null>(null);

  const [participantName, setParticipantName] = useState("");
  const [participantWhatsapp, setParticipantWhatsapp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<number | string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) {
      setStatus("invalid");
      return;
    }

    const resolve = async () => {
      const { data: comercioData, error: comercioError } = await supabase
        .from("comercios")
        .select("id, fantasy_name, slug")
        .eq("secret_code", code)
        .eq("active", true)
        .maybeSingle();

      if (comercioError || !comercioData) {
        setStatus("invalid");
        return;
      }

      setComercioId(comercioData.id);
      setComercioName(comercioData.fantasy_name || comercioData.slug);
      setComercioSlug(comercioData.slug ?? null);

      const { data: raffleData } = await supabase
        .from("raffles")
        .select("id, name")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!raffleData) {
        setStatus("no-raffle");
        return;
      }

      setRaffle(raffleData);
      setStatus("ready");
    };

    resolve();
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!raffle || !comercioId || submitting) return;

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
        raffle_id: raffle.id,
        comercio_id: comercioId,
        name: participantName.trim(),
        whatsapp: participantWhatsapp.trim(),
      })
      .select("ticket_number")
      .single();

    if (insertError) {
      const isDuplicate =
        insertError.code === "23505" ||
        (insertError as { code?: string }).code === "23505";
      setError(
        isDuplicate
          ? "Este número ya participó en este sorteo desde este comercio. Visitá otro comercio adherido para sumar otra participación."
          : "Error al registrar participación. Intenta nuevamente."
      );
      setSubmitting(false);
      return;
    }

    setTicketNumber(insertedData.ticket_number);
    setSubmitted(true);
    setSubmitting(false);
  };

  const handleDownloadTalon = () => {
    if (!raffle || !comercioName || ticketNumber == null) return;
    const dateStr = new Date().toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const doc = buildTalonPdf({
      raffleName: raffle.name,
      comercioName,
      ticketNumber,
      participantName: participantName.trim(),
      dateStr,
    });
    doc.save(getTalonPdfFilename(ticketNumber));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <p className="text-gray-600 text-center">Enlace no válido o expirado.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
        >
          <Home className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (status === "no-raffle") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <p className="text-gray-600 text-center">No hay sorteo activo en este momento.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
        >
          <Home className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        {comercioName && (
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Participás desde <span className="font-medium text-foreground">{comercioName}</span>
          </p>
        )}

        {raffle && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="h-6 w-6" />
              <h1 className="text-xl font-bold">{raffle.name}</h1>
            </div>

            {submitted ? (
              <div className="bg-white/20 rounded-lg p-6 text-center">
                <Check className="h-12 w-12 mx-auto mb-3" />
                <p className="text-lg font-semibold">¡Participación registrada!</p>
                {ticketNumber != null && (
                  <p className="text-3xl font-bold mt-2">
                    #{typeof ticketNumber === "string" ? ticketNumber : String(ticketNumber).padStart(4, "0")}
                  </p>
                )}
                <p className="text-sm opacity-90 mt-1">Buena suerte en el sorteo</p>
                <button
                  type="button"
                  onClick={handleDownloadTalon}
                  className="mt-4 inline-flex items-center gap-2 bg-white text-purple-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Descargar talón
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm opacity-90">Completa tus datos para participar</p>

                <div className="space-y-1">
                  <label htmlFor="participar-name" className="text-sm font-medium">
                    Nombre completo
                  </label>
                  <input
                    id="participar-name"
                    type="text"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-gray-900"
                    placeholder="Tu nombre"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="participar-whatsapp" className="text-sm font-medium">
                    WhatsApp
                  </label>
                  <input
                    id="participar-whatsapp"
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

        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            Volver a la página principal
          </Link>
          {comercioSlug && (
            <Link
              href={`/comercio/${encodeURIComponent(comercioSlug)}`}
              className="text-sm text-muted-foreground hover:underline"
            >
              Ver detalles del comercio
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ParticiparPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      }
    >
      <ParticiparContent />
    </Suspense>
  );
}
