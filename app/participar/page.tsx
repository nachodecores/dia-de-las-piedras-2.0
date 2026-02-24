"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Gift, Check, Home, Download } from "lucide-react";
import { buildTalonPdf, getTalonPdfFilename, loadTalonBackgroundDataUrl } from "@/lib/talon-pdf";

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
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const normalizePhone = (raw: string) => raw.replace(/\s/g, "").replace(/^\+598/, "").replace(/\D/g, "");
  const isValidPhone = (raw: string) => {
    const digits = normalizePhone(raw);
    return digits.length >= 8 && digits.length <= 9;
  };

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
    setNameError("");
    setPhoneError("");

    const name = participantName.trim();
    const phone = participantWhatsapp.trim();

    let valid = true;
    if (name.length < 3) {
      setNameError("Ingresá al menos 3 caracteres");
      valid = false;
    }
    if (!isValidPhone(participantWhatsapp)) {
      setPhoneError("Ingresá un teléfono válido");
      valid = false;
    }
    if (!valid) return;

    setSubmitting(true);

    const { data: insertedData, error: insertError } = await supabase
      .from("raffle_participants")
      .insert({
        raffle_id: raffle.id,
        comercio_id: comercioId,
        name,
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

  const handleDownloadTalon = async () => {
    if (!raffle || !comercioName || ticketNumber == null) return;
    const dateStr = new Date().toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const backgroundDataUrl = await loadTalonBackgroundDataUrl().catch(() => "");
    const doc = buildTalonPdf(
      {
        raffleName: raffle.name,
        comercioName,
        ticketNumber,
        participantName: participantName.trim(),
        participantPhone: participantWhatsapp.trim(),
        dateStr,
      },
      backgroundDataUrl ? { backgroundDataUrl } : undefined
    );
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
        {raffle && (
          <div className="rounded-lg shadow-lg overflow-hidden bg-white">
            <header className="bg-gradient-to-r from-emerald-600 to-blue-600 px-6 py-5 text-white">
              <h1 className="text-xl font-bold">{raffle.name}</h1>
              <p className="text-sm opacity-90 mt-1">
                Completá tus datos y ya estás participando (10 segundos)
              </p>
              {comercioSlug && (
                <Link
                  href={`/comercio/${encodeURIComponent(comercioSlug)}`}
                  className="inline-block mt-3 text-sm text-white/90 underline underline-offset-2 hover:text-white"
                >
                  Ver detalles del comercio
                </Link>
              )}
            </header>

            <div className="p-6 text-gray-900">
              {submitted ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-100">
                  <Check className="h-12 w-12 mx-auto mb-3 text-emerald-600" />
                  <p className="text-lg font-semibold">Listo, ya estás participando</p>
                  {ticketNumber != null && (
                    <p className="text-3xl font-bold mt-2 text-gray-900">
                      #{typeof ticketNumber === "string" ? ticketNumber : String(ticketNumber).padStart(4, "0")}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">Buena suerte en el sorteo</p>
                  <button
                    type="button"
                    onClick={handleDownloadTalon}
                    className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Descargar talón
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-sm text-gray-600">Completa tus datos para participar</p>

                  <div className="space-y-1">
                    <label htmlFor="participar-name" className="text-sm font-medium text-gray-900">
                      Nombre y Apellido
                    </label>
                    <input
                      id="participar-name"
                      type="text"
                      value={participantName}
                      onChange={(e) => {
                        setParticipantName(e.target.value);
                        if (nameError) setNameError("");
                      }}
                      className="w-full px-4 py-2 rounded-lg text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                      placeholder="Ej: Ana Pérez"
                      autoComplete="name"
                      required
                      minLength={3}
                    />
                    {nameError && (
                      <p className="text-xs text-red-600 mt-1" role="alert">
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="participar-whatsapp" className="text-sm font-medium text-gray-900">
                      Teléfono
                    </label>
                    <input
                      id="participar-whatsapp"
                      type="tel"
                      value={participantWhatsapp}
                      onChange={(e) => {
                        setParticipantWhatsapp(e.target.value);
                        if (phoneError) setPhoneError("");
                      }}
                      className="w-full px-4 py-2 rounded-lg text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                      placeholder="Ej: 09 123 456"
                      autoComplete="tel"
                      required
                      inputMode="numeric"
                    />
                    {phoneError && (
                      <p className="text-xs text-red-600 mt-1" role="alert">
                        {phoneError}
                      </p>
                    )}
                  </div>

                  {error && (
                    <p className="text-sm bg-red-50 text-red-700 p-2 rounded border border-red-100">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-400 text-gray-900 font-bold py-3.5 rounded-lg shadow-md hover:bg-amber-300 hover:shadow-lg transition-all disabled:opacity-50 text-base"
                  >
                    {submitting ? "Participando…" : "Participar del sorteo"}
                  </button>
                  <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
                    Usamos tu teléfono solo para avisarte si ganás. No enviamos spam.
                    <br />
                    Tus datos no se comparten con terceros.
                  </p>
                </form>
              )}
            </div>
          </div>
        )}
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
