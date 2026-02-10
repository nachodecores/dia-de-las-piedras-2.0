import { jsPDF } from "jspdf";

export type TalonPdfData = {
  raffleName: string;
  comercioName: string;
  ticketNumber: number | string;
  participantName: string;
  dateStr: string;
};

function formatTicketNumber(ticketNumber: number | string): string {
  return typeof ticketNumber === "string" ? ticketNumber : String(ticketNumber).padStart(4, "0");
}

export function buildTalonPdf(data: TalonPdfData): jsPDF {
  // Talón horizontal, tamaño ticket (A6 landscape: 148 x 105 mm)
  const doc = new jsPDF({ format: "a6", unit: "mm", orientation: "landscape" });
  const w = doc.getPageWidth();
  const h = doc.getPageHeight();
  const centerX = w / 2;

  const stubWidth = 18;
  const margin = 8;
  const contentLeft = margin + stubWidth;
  const contentRight = w - margin - stubWidth;
  const contentW = contentRight - contentLeft;

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
