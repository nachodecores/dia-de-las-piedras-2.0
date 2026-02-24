"use client";

import { buildTalonPdf, getTalonPdfFilename, loadTalonBackgroundDataUrl } from "@/lib/talon-pdf";
import { FileDown } from "lucide-react";

const MOCK_DATA = {
  raffleName: "Sorteo Marzo 2026",
  comercioName: "Ferox SRL",
  ticketNumber: "0001",
  participantName: "Juan Pérez",
  participantPhone: "09 123 456",
  dateStr: new Date().toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }),
};

export default function DevTalonPage() {
  const isDev = process.env.NODE_ENV === "development";

  const handlePreview = async () => {
    const backgroundDataUrl = await loadTalonBackgroundDataUrl().catch(() => "");
    const doc = buildTalonPdf(MOCK_DATA, backgroundDataUrl ? { backgroundDataUrl } : undefined);
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    const backgroundDataUrl = await loadTalonBackgroundDataUrl().catch(() => "");
    const doc = buildTalonPdf(MOCK_DATA, backgroundDataUrl ? { backgroundDataUrl } : undefined);
    doc.save(getTalonPdfFilename(MOCK_DATA.ticketNumber));
  };

  if (!isDev) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p className="text-muted-foreground">Esta página solo está disponible en desarrollo.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vista previa del talón</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Solo para desarrollo. Datos de prueba.
          </p>
        </div>

        <div className="bg-white border rounded-lg p-4 text-sm text-muted-foreground space-y-1">
          <p><strong className="text-foreground">Sorteo:</strong> {MOCK_DATA.raffleName}</p>
          <p><strong className="text-foreground">Comercio:</strong> {MOCK_DATA.comercioName}</p>
          <p><strong className="text-foreground">Número:</strong> #{MOCK_DATA.ticketNumber}</p>
          <p><strong className="text-foreground">Participante:</strong> {MOCK_DATA.participantName}</p>
          <p><strong className="text-foreground">Fecha:</strong> {MOCK_DATA.dateStr}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePreview}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 font-medium"
          >
            <FileDown className="h-4 w-4" />
            Ver talón (abre en nueva pestaña)
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 border border-input bg-background px-4 py-2 rounded-lg hover:bg-muted font-medium"
          >
            Descargar talón
          </button>
        </div>
      </div>
    </div>
  );
}
