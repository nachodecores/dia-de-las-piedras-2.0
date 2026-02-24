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
  const doc = new jsPDF({ format: "a6", unit: "mm", orientation: "landscape" });
  const w = 148;
  const h = 105;
  const margin = 12;
  const contentLeft = margin;
  const contentWidth = w - 2 * margin;

  const ticketStr = formatTicketNumber(data.ticketNumber);

  // Título
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Día de las Piedras – Comprobante de participación", contentLeft, margin + 10);

  // Número de participación
  doc.setFontSize(20);
  doc.text(`#${ticketStr}`, contentLeft, margin + 22);

  // Datos
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lineH = 7;
  let y = margin + 36;
  doc.text(`Sorteo: ${data.raffleName}`, contentLeft, y);
  y += lineH;
  doc.text(`Comercio: ${data.comercioName}`, contentLeft, y);
  y += lineH;
  doc.text(`Participante: ${data.participantName}`, contentLeft, y);
  y += lineH;
  doc.text(`Fecha: ${data.dateStr}`, contentLeft, y);

  // Pie
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Conservá este comprobante. Buena suerte.", w / 2, h - margin, { align: "center" });
  doc.setTextColor(0, 0, 0);

  return doc;
}

export function getTalonPdfFilename(ticketNumber: number | string): string {
  const ticketStr = formatTicketNumber(ticketNumber);
  return `talon-participacion-${ticketStr}.pdf`;
}
