"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

type Comercio = {
  id: string;
  fantasy_name: string | null;
  slug: string;
  secret_code: string;
  logo_url: string | null;
};

function CartelBlock({
  comercio,
  size,
  baseUrl,
}: {
  comercio: Comercio;
  size: "A5" | "A6";
  baseUrl: string;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const participationUrl = `${baseUrl.replace(/\/$/, "")}/participar?code=${encodeURIComponent(comercio.secret_code)}`;

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then((mod: { default: { toDataURL: (u: string, o?: { width?: number; margin?: number }) => Promise<string> } }) => {
      const qrSize = size === "A6" ? 220 : 320;
      mod.default.toDataURL(participationUrl, { width: qrSize, margin: 1 }).then((url) => {
        if (!cancelled) setQrDataUrl(url);
      });
    });
    return () => { cancelled = true; };
  }, [participationUrl, size]);

  const isA6 = size === "A6";
  const dimensions = isA6 ? { width: "105mm", height: "148mm" } : { width: "148mm", height: "210mm" };
  const logoW = isA6 ? 100 : 160;
  const logoH = isA6 ? 40 : 64;
  const qrSize = isA6 ? 220 : 320;

  return (
    <div
      className="cartel-sheet flex flex-col justify-evenly items-center bg-white"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        border: "1px solid #e5e7eb",
        padding: isA6 ? "16px" : "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        className="flex flex-col justify-evenly items-center w-full h-full"
        style={{
          border: "2px solid #d1d5db",
          borderRadius: "6px",
          padding: isA6 ? "12px" : "20px",
          background: "#fafafa",
        }}
      >
        <div className="flex justify-center shrink-0" style={{ marginBottom: "4px" }}>
          <Image
            src="/logodialaspiedras.svg"
            alt="Día de Las Piedras"
            width={logoW}
            height={logoH}
            className="object-contain"
          />
        </div>
        <div className="flex justify-center shrink-0">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR participación"
              width={qrSize}
              height={qrSize}
              className="rounded bg-white p-1 border border-gray-200"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          ) : (
            <div
              className="rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs"
              style={{ width: qrSize, height: qrSize }}
            >
              Cargando…
            </div>
          )}
        </div>
        <p
          className="text-center font-medium text-gray-700 shrink-0"
          style={{ fontSize: isA6 ? "14px" : "18px" }}
        >
          ¡Escaneá el QR y participá del sorteo!
        </p>
        <div className="flex justify-center shrink-0 mt-1 min-h-[40px]">
          {comercio.logo_url ? (
            <img
              src={comercio.logo_url}
              alt={comercio.fantasy_name || comercio.slug}
              className="max-h-[40px] max-w-[100px] object-contain"
            />
          ) : (
            <span
              className="text-center font-semibold text-gray-800 leading-tight"
              style={{ fontSize: isA6 ? "14px" : "16px" }}
            >
              {comercio.fantasy_name || comercio.slug}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PrintAllContent() {
  const searchParams = useSearchParams();
  const size = (searchParams.get("size") === "A6" ? "A6" : "A5") as "A5" | "A6";
  const isDev = process.env.NODE_ENV === "development";

  const [comercios, setComercios] = useState<Comercio[]>([]);
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  useEffect(() => {
    document.body.classList.add("print-all-route");
    return () => document.body.classList.remove("print-all-route");
  }, []);

  useEffect(() => {
    const fetchComercios = async () => {
      const { data } = await supabase
        .from("comercios")
        .select("id, fantasy_name, slug, secret_code, logo_url")
        .eq("active", true)
        .order("fantasy_name");
      setComercios(data ?? []);
    };
    fetchComercios();
  }, []);

  const perPage = size === "A6" ? 4 : 2;
  const pages = useMemo(() => {
    const p: Comercio[][] = [];
    for (let i = 0; i < comercios.length; i += perPage) {
      p.push(comercios.slice(i, i + perPage));
    }
    return p;
  }, [comercios, perPage]);

  if (!isDev) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p className="text-muted-foreground">Solo disponible en desarrollo.</p>
      </div>
    );
  }

  return (
    <>
      <div className="no-print p-4 bg-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Carteles {size} — {comercios.length} comercios, {pages.length} hoja(s) A4. Usá Ctrl+P para imprimir.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded font-medium"
        >
          Imprimir
        </button>
      </div>

      <div className="print-only bg-white" style={{ padding: 0, margin: 0 }}>
        {pages.length === 0 && (
          <p className="no-print p-4 text-gray-600">No hay comercios activos para mostrar.</p>
        )}
        {pages.map((chunk, pageIndex) => (
          <div
            key={pageIndex}
            className={`print-page ${size === "A5" ? "print-page-a5" : "print-page-a6"}`}
            style={{
              width: size === "A5" ? "297mm" : "210mm",
              height: size === "A5" ? "210mm" : "297mm",
              padding: 0,
              margin: 0,
              boxSizing: "border-box",
              display: "grid",
              gridTemplateColumns: size === "A5" ? "148mm 148mm" : "105mm 105mm",
              gridTemplateRows: size === "A5" ? "210mm" : "148mm 148mm",
              gap: 0,
              justifyContent: "center",
              alignContent: "center",
              pageBreakAfter: pageIndex < pages.length - 1 ? "always" : "auto",
              pageBreakInside: "avoid",
            }}
          >
            {chunk.map((comercio) => (
              <div key={comercio.id} className="flex justify-center items-center p-2">
                <CartelBlock comercio={comercio} size={size} baseUrl={baseUrl} />
              </div>
            ))}
            {size === "A6" && chunk.length < 4 && (
              Array.from({ length: 4 - chunk.length }).map((_, i) => (
                <div key={`empty-${pageIndex}-${i}`} />
              ))
            )}
            {size === "A5" && chunk.length < 2 && (
              <div key={`empty-${pageIndex}`} />
            )}
          </div>
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page { size: A4 ${size === "A5" ? "landscape" : ""}; }
            @media print {
              body, html { margin: 0 !important; padding: 0 !important; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              body.print-all-route header,
              body.print-all-route nav.fixed { display: none !important; visibility: hidden !important; }
              body.print-all-route main { padding: 0 !important; margin: 0 !important; }
              .no-print { display: none !important; }
              .print-only { padding: 0 !important; margin: 0 !important; }
              .print-page { page-break-inside: avoid; }
              .cartel-sheet { page-break-inside: avoid; }
            }
            @media screen {
              .print-page {
                margin-bottom: 16px;
                border: 1px solid #e5e7eb;
                padding: 12px !important;
              }
            }
          `,
        }}
      />
    </>
  );
}

export default function PrintAllCartelsPage() {
  return (
    <Suspense fallback={<div className="p-4">Cargando carteles…</div>}>
      <PrintAllContent />
    </Suspense>
  );
}
