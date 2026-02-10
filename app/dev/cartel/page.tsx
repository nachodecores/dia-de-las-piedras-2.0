"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Printer } from "lucide-react";

type Comercio = {
  id: string;
  fantasy_name: string | null;
  slug: string;
  secret_code: string;
};

const CARTEL_TEXT =
  "Conocé los descuentos disponibles en este local y participá del sorteo del mes.";

export default function DevCartelPage() {
  const isDev = process.env.NODE_ENV === "development";
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchComercios = async () => {
      const { data } = await supabase
        .from("comercios")
        .select("id, fantasy_name, slug, secret_code")
        .eq("active", true)
        .order("fantasy_name");
      setComercios(data ?? []);
      if (data?.length && !selectedId) setSelectedId(data[0].id);
    };
    fetchComercios();
  }, []);

  const selectedComercio = comercios.find((c) => c.id === selectedId);
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const participationUrl =
    baseUrl && selectedComercio
      ? `${baseUrl.replace(/\/$/, "")}/participar?code=${encodeURIComponent(selectedComercio.secret_code)}`
      : "";

  useEffect(() => {
    if (!participationUrl) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    import("qrcode").then((mod: { default: { toDataURL: (url: string, opts?: { width?: number; margin?: number }) => Promise<string> } }) => {
      mod.default.toDataURL(participationUrl, { width: 220, margin: 1 }).then((url) => {
        if (!cancelled) setQrDataUrl(url);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [participationUrl]);

  const handlePrint = () => {
    window.print();
  };

  if (!isDev) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p className="text-muted-foreground">Esta página solo está disponible en desarrollo.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 print:bg-white">
      <div className="max-w-lg mx-auto space-y-6 non-print">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Diseño de cartel por comercio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Solo para desarrollo. Elegí un comercio y usá Imprimir para ver el resultado.
          </p>
        </div>

        <div>
          <label htmlFor="comercio" className="block text-sm font-medium text-gray-700 mb-1">
            Comercio
          </label>
          <select
            id="comercio"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {comercios.length === 0 && (
              <option value="">Sin comercios activos</option>
            )}
            {comercios.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fantasy_name || c.slug}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 font-medium"
        >
          <Printer className="h-4 w-4" />
          Imprimir cartel
        </button>
      </div>

      {/* Cartel (vista previa + contenido a imprimir) */}
      {selectedComercio && (
        <div
          id="cartel-print"
          className="mx-auto mt-8 w-[210mm] max-w-full print:mt-0 print:shadow-none print:border print:border-gray-300"
          style={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "32px",
            background: "white",
          }}
        >
          <div
            style={{
              border: "2px solid #d1d5db",
              borderRadius: "8px",
              padding: "28px",
              background: "#fafafa",
            }}
          >
            <h2
              className="text-2xl font-bold text-center text-gray-900 mb-6"
              style={{ fontFamily: "sans-serif" }}
            >
              {selectedComercio.fantasy_name || selectedComercio.slug}
            </h2>

            <p
              className="text-center text-gray-700 mb-8 text-lg leading-snug max-w-md mx-auto"
              style={{ fontFamily: "sans-serif" }}
            >
              {CARTEL_TEXT}
            </p>

            <div className="flex justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR participación"
                  width={220}
                  height={220}
                  className="rounded-md bg-white p-2 border border-gray-200"
                />
              ) : (
                <div
                  className="w-[220px] h-[220px] rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-sm"
                >
                  Cargando QR…
                </div>
              )}
            </div>

            <p className="text-center text-xs text-gray-500 mt-6" style={{ fontFamily: "sans-serif" }}>
              Escaneá el QR para participar
            </p>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * { visibility: hidden; }
              #cartel-print, #cartel-print * { visibility: visible; }
              #cartel-print {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                max-width: 210mm;
                margin: 0;
                box-shadow: none;
                border-radius: 0;
              }
              .non-print { display: none !important; }
            }
          `,
        }}
      />
    </div>
  );
}
