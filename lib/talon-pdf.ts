import { jsPDF } from "jspdf";

export type TalonPdfData = {
  raffleName: string;
  comercioName: string;
  ticketNumber: number | string;
  participantName: string;
  /** Teléfono del participante (para el talón con diseño Figma). */
  participantPhone?: string;
  dateStr: string;
};

export type TalonPdfOptions = {
  /** Data URL del PNG de fondo (diseño Figma 420×180). Si se pasa, se usa tamaño y textos del nuevo diseño. */
  backgroundDataUrl?: string;
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatTicketNumber(ticketNumber: number | string): string {
  return typeof ticketNumber === "string" ? ticketNumber : String(ticketNumber).padStart(4, "0");
}

/** Extrae el nombre del mes desde dateStr tipo "DD/MM/YYYY, HH:MM". */
function getMonthNameFromDateStr(dateStr: string): string {
  const match = dateStr.match(/\d{1,2}\/(\d{1,2})\/\d{4}/);
  if (!match) return "";
  const monthIndex = parseInt(match[1], 10) - 1;
  return MONTH_NAMES[monthIndex] ?? "";
}

/** Carga la imagen de fondo del talón (solo en navegador). Exportá desde Figma 420×180 y guardala en public/talon-background.png */
export async function loadTalonBackgroundDataUrl(): Promise<string> {
  if (typeof window === "undefined") return "";
  const res = await fetch("/talon-background.png");
  if (!res.ok) return "";
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function buildTalonPdf(data: TalonPdfData, options?: TalonPdfOptions): jsPDF {
  const backgroundDataUrl = options?.backgroundDataUrl;

  if (backgroundDataUrl) {
    // Nuevo diseño: tamaño Figma 420×180 → 148mm × 63.43mm (mismo ratio)
    const w = 148;
    const h = 148 * (180 / 420);
    const doc = new jsPDF({ format: [w, h], unit: "mm" });
    doc.addImage(backgroundDataUrl, "PNG", 0, 0, w, h);

    const ticketStr = formatTicketNumber(data.ticketNumber);
    const monthName = getMonthNameFromDateStr(data.dateStr) || data.raffleName;

    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Sorteo de ${monthName}`, 12, 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Participante: ${data.participantName}`, 12, 16);
    doc.text(`Teléfono: ${data.participantPhone ?? ""}`, 12, 22);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 42, 68); // #1F2A44
    doc.text(`#${ticketStr}`, w - 12, h / 2, { align: "center", angle: -90 });

    return doc;
  }

  // Talón clásico (sin imagen de fondo)
  const doc = new jsPDF({ format: "a6", unit: "mm", orientation: "landscape" });
  const w = 148;
  const h = 105;
  const centerX = w / 2;

  const stubWidth = 18;
  const margin = 8;
  const contentLeft = margin + stubWidth;
  const contentRight = w - margin - stubWidth;

  const ticketStr = formatTicketNumber(data.ticketNumber);
  const gray = 180;
  const dark = 40;

  // —— Marco exterior (borde del ticket)
  doc.setDrawColor(dark, dark, dark);
  doc.setLineWidth(0.4);
  doc.rect(margin, margin, w - 2 * margin, h - 2 * margin);

  // —— Líneas de perforación (verticales, punteadas) izquierda y derecha
  doc.setLineDashPattern([2, 2], 0);
  doc.setDrawColor(gray, gray, gray);
  doc.line(contentLeft, margin + 2, contentLeft, h - margin - 2);
  doc.line(contentRight, margin + 2, contentRight, h - margin - 2);
  doc.setLineDashPattern([], 0);

  // —— Número en los laterales (stubs)
  doc.setFontSize(9);
  doc.setTextColor(gray, gray, gray);
  doc.text(`#${ticketStr}`, margin + stubWidth / 2, h / 2, { align: "center", angle: 90 });
  doc.text(`#${ticketStr}`, contentRight + stubWidth / 2, h / 2, { align: "center", angle: -90 });
  doc.setTextColor(0, 0, 0);

  // —— Zona central: título y marca
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Día de las Piedras", centerX, margin + 14, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Comprobante de participación", centerX, margin + 21, { align: "center" });

  // —— Estrellas decorativas (tipo ticket)
  doc.setFontSize(10);
  doc.text("★ ★ ★", centerX, margin + 28, { align: "center" });

  // —— Número de participación grande
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(`#${ticketStr}`, centerX, margin + 44, { align: "center" });
  doc.setFont("helvetica", "normal");

  // —— Datos en bloque
  doc.setFontSize(10);
  const blockY = margin + 54;
  const lineH = 6;
  doc.text(`Sorteo: ${data.raffleName}`, contentLeft + 4, blockY);
  doc.text(`Comercio: ${data.comercioName}`, contentLeft + 4, blockY + lineH);
  doc.text(`Participante: ${data.participantName}`, contentLeft + 4, blockY + lineH * 2);
  doc.text(`Fecha: ${data.dateStr}`, contentLeft + 4, blockY + lineH * 3);

  // —— Línea de cierre y pie
  doc.setDrawColor(gray, gray, gray);
  doc.line(contentLeft + 4, blockY + lineH * 3 + 6, contentRight - 4, blockY + lineH * 3 + 6);
  doc.setFontSize(8);
  doc.setTextColor(gray, gray, gray);
  doc.text("Conservá este comprobante. Buena suerte.", centerX, h - margin - 6, { align: "center" });
  doc.setTextColor(0, 0, 0);

  return doc;
}

export function getTalonPdfFilename(ticketNumber: number | string): string {
  const ticketStr = formatTicketNumber(ticketNumber);
  return `talon-participacion-${ticketStr}.pdf`;
}
