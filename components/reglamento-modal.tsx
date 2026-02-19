"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const REGLAMENTO = `1. Organizador
El sorteo es organizado por el Centro Comercial, Industrial y Agrario de Las Piedras.

2. Vigencia
La participación es válida únicamente durante el día del evento anunciado.

3. Cómo participar
Podrán participar personas mayores de 18 años que:
• realicen una compra en un comercio adherido, y
• escaneen el QR dispuesto en el local, completando el formulario correspondiente.
Cada consumidor podrá participar una única vez por cada comercio adherido durante cada edición del evento.

4. Sorteo
El sorteo se realizará dentro de la semana posterior a cada edición del Día de Las Piedras.
El ganador será contactado al teléfono registrado.
En caso de no obtener respuesta en un plazo razonable, el Organizador podrá realizar un nuevo sorteo.
El premio no es canjeable por dinero ni transferible.

5. Publicación del ganador
Para fines de transparencia, se publicarán las iniciales del nombre y apellido del ganador, junto con su número de teléfono parcialmente oculto.
No se publicarán fotografías ni datos completos.

6. Uso indebido
El Organizador podrá anular participaciones duplicadas, falsas o que no cumplan con las condiciones establecidas.

7. Aceptación
La participación implica la aceptación del presente reglamento.`;

export function ReglamentoModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Ver reglamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Reglamento – Día de Las Piedras</DialogTitle>
        </DialogHeader>
        <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
          {REGLAMENTO}
        </div>
      </DialogContent>
    </Dialog>
  );
}
