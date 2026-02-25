import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isParticipationAllowed } from "@/lib/participation-date";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

function isValidPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  return d.length === 9 && d.startsWith("09");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, name, whatsapp } = body || {};
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedPhone = typeof whatsapp === "string" ? whatsapp.trim() : "";

    if (!code || trimmedName.length < 3 || !isValidPhone(trimmedPhone)) {
      return NextResponse.json(
        { error: "Datos inválidos." },
        { status: 400 }
      );
    }

    const { data: comercio, error: comercioError } = await supabase
      .from("comercios")
      .select("id")
      .eq("secret_code", code)
      .eq("active", true)
      .maybeSingle();

    if (comercioError || !comercio) {
      return NextResponse.json(
        { error: "Comercio no válido." },
        { status: 400 }
      );
    }

    const { data: raffle, error: raffleError } = await supabase
      .from("raffles")
      .select("id, raffle_date")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (raffleError || !raffle) {
      return NextResponse.json(
        { error: "No hay sorteo activo." },
        { status: 400 }
      );
    }

    if (!isParticipationAllowed(raffle.raffle_date)) {
      return NextResponse.json(
        {
          error:
            "La participación está habilitada solo el Día de las Piedras (fecha del evento).",
        },
        { status: 403 }
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("raffle_participants")
      .insert({
        raffle_id: raffle.id,
        comercio_id: comercio.id,
        name: trimmedName,
        whatsapp: trimmedPhone.replace(/\D/g, ""),
      })
      .select("ticket_number")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            error:
              "Este número ya participó en este sorteo desde este comercio. Visitá otro comercio adherido para sumar otra participación.",
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Error al registrar participación. Intenta nuevamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ticket_number: inserted.ticket_number,
    });
  } catch {
    return NextResponse.json(
      { error: "Error inesperado." },
      { status: 500 }
    );
  }
}
