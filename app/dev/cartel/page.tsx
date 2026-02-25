"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Printer } from "lucide-react";

type Comercio = {
  id: string;
  fantasy_name: string | null;
  slug: string;
  secret_code: string;
};

export default function DevCartelPage() {
  const isDev = process.env.NODE_ENV === "development";
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [posterSize, setPosterSize] = useState<"A5" | "A6">("A5");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const dimensions =
    posterSize === "A6" ? { width: "105mm", height: "148mm" } : { width: "148mm", height: "210mm" };

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
      mod.default.toDataURL(participationUrl, { width: 400, margin: 1 }).then((url) => {
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

        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
            Tamaño del cartel
          </label>
          <select
            id="size"
            value={posterSize}
            onChange={(e) => setPosterSize(e.target.value as "A5" | "A6")}
            className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="A5">A5 (148 × 210 mm)</option>
            <option value="A6">A6 (105 × 148 mm)</option>
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
          className="mx-auto mt-8 max-w-full print:mt-0 print:shadow-none print:border print:border-gray-300"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "32px",
            background: "white",
          }}
        >
          <div
            className="font-sans flex flex-col justify-evenly items-center"
            style={{
              border: "2px solid #d1d5db",
              borderRadius: "8px",
              padding: "28px",
              background: "#fafafa",
              minHeight: "100%",
            }}
          >
            <div
              className="flex w-full items-center justify-between gap-4 shrink-0"
              style={{ marginBottom: "8px" }}
            >
              <Image
                src="/logodialaspiedras.svg"
                alt="Día de Las Piedras"
                width={100}
                height={40}
                priority
                className="shrink-0 object-contain"
              />
              <span
                className="text-right text-lg font-semibold text-gray-800 leading-tight"
                style={{ flex: 1 }}
              >
                {selectedComercio.fantasy_name || selectedComercio.slug}
              </span>
            </div>

            <div className="flex justify-center shrink-0">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR participación"
                  width={400}
                  height={400}
                  className="rounded-md bg-white p-2 border border-gray-200"
                />
              ) : (
                <div
                  className="w-[400px] h-[400px] rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-sm"
                >
                  Cargando QR…
                </div>
              )}
            </div>

            <p className="text-center text-lg font-medium text-gray-700 shrink-0">
              Escaneá y participá del sorteo
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
                width: ${dimensions.width};
                max-width: ${dimensions.width};
                height: ${dimensions.height};
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
