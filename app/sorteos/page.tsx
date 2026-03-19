"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Gift, ImageIcon } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateOnly } from "@/lib/utils";

type PrizeWinner = {
  name: string;
  whatsapp: string;
};

type Prize = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  created_at?: string;
  raffle_participants?: PrizeWinner | PrizeWinner[] | null;
  winner_participant?: PrizeWinner | null;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return "••••••";
  const first3 = digits.slice(0, 3);
  const rest = digits.slice(3);
  const seed = rest.split("").reduce((a, c) => a + Number(c), 0);
  const indices = Array.from({ length: rest.length }, (_, i) => i);
  const chosen = indices
    .sort((a, b) => ((seed + a * 11) % 17) - ((seed + b * 11) % 17))
    .slice(0, 3);
  const revealed = rest
    .split("")
    .map((d, i) => (chosen.includes(i) ? d : "•"))
    .join("");
  return first3 + revealed;
}

type Raffle = {
  id: string;
  name: string;
  raffle_date: string | null;
  active: boolean;
  prizes: Prize[];
};

export default function SorteosPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [participarModalOpen, setParticiparModalOpen] = useState(false);
  const [prizeImageModal, setPrizeImageModal] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    const fetchRaffles = async () => {
      const { data } = await supabase
        .from("raffles")
        .select(
          "id, name, raffle_date, active, raffle_prizes(id, name, description, image_url, created_at, raffle_participants!winner_participant_id(name, whatsapp))"
        )
        .order("created_at", { ascending: false });

      const list = (data || []).map((r: { id: string; name: string; raffle_date: string | null; active: boolean; raffle_prizes?: Prize[] }) => {
        const prizes = (r.raffle_prizes || []).sort(
          (a, b) =>
            new Date((a as Prize).created_at || 0).getTime() -
            new Date((b as Prize).created_at || 0).getTime()
        );
        return {
          id: r.id,
          name: r.name,
          raffle_date: r.raffle_date,
          active: r.active,
          prizes,
        };
      });
      setRaffles(list);
      setLoading(false);
    };

    fetchRaffles();
  }, []);

  const pageBg = {
    background:
      "linear-gradient(135deg, #0f2e1e 0%, #0c4a6e 50%, #0f172a 100%)",
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 py-8"
        style={pageBg}
      >
        <p className="text-white">Cargando...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-6 py-8 max-w-lg mx-auto"
      style={pageBg}
    >
      <div className="flex items-center gap-2 mb-6">
        <Gift className="h-6 w-6 text-white" />
        <h1 className="text-2xl font-semibold text-white">Sorteos</h1>
      </div>

      {raffles.length === 0 ? (
        <p className="text-white/90">No hay sorteos.</p>
      ) : (
        <div className="space-y-4">
          {raffles.map((raffle) => (
            <div
              key={raffle.id}
              className={`rounded-lg border p-5 shadow-sm ${
                raffle.active
                  ? "bg-[#e8f5e9] border-[#21A85B]"
                  : "bg-gray-100 border-gray-300 opacity-85"
              }`}
            >
              <h2
                className={`text-xl font-bold ${
                  raffle.active ? "text-gray-900" : "text-gray-600"
                }`}
              >
                Sorteo de{" "}
                {raffle.raffle_date
                  ? formatDateOnly(raffle.raffle_date, { month: "long" })
                  : "este mes"}
              </h2>

              {raffle.prizes.length > 0 ? (
                <div className="mt-6">
                  <ol className="space-y-2">
                    {raffle.prizes.map((prize, index) => (
                      <li
                        key={prize.id}
                        className={`flex items-start gap-3 py-2 px-3 rounded-md ${
                          raffle.active
                            ? "bg-muted/50 border border-[#21A85B]"
                            : "bg-gray-200/80 border border-gray-300"
                        }`}
                      >
                        <span
                          className={`font-mono text-sm font-semibold shrink-0 ${
                            raffle.active ? "text-primary" : "text-gray-500"
                          }`}
                        >
                          #{index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm font-medium ${
                              raffle.active ? "text-[#21A85B]" : "text-gray-600"
                            }`}
                          >
                            {prize.name}
                          </div>
                          {prize.description && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {prize.description}
                            </p>
                          )}
                          {(() => {
                            const raw =
                              prize.winner_participant ??
                              (Array.isArray(prize.raffle_participants)
                                ? prize.raffle_participants[0]
                                : prize.raffle_participants);
                            const winner =
                              raw && typeof raw === "object" && "name" in raw ? raw : null;
                            return winner ? (
                              <p className="text-xs text-muted-foreground mt-1">
                                Ganador: {getInitials(winner.name ?? "")}{" "}
                                {winner.whatsapp ? maskPhone(String(winner.whatsapp)) : "—"}
                              </p>
                            ) : null;
                          })()}
                        </div>
                        {prize.image_url && (
                          <button
                            type="button"
                            onClick={() =>
                              setPrizeImageModal({ url: prize.image_url!, name: prize.name })
                            }
                            className={`shrink-0 p-1.5 rounded-md transition-colors ${
                              raffle.active
                                ? "text-[#21A85B] hover:bg-[#21A85B]/10"
                                : "text-gray-500 hover:bg-gray-300/50"
                            }`}
                            aria-label="Ver foto del premio"
                          >
                            <ImageIcon className="h-4 w-4" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-4">
                  Premios por definir.
                </p>
              )}

              {raffle.active && (
                <button
                  type="button"
                  onClick={() => setParticiparModalOpen(true)}
                  className="mt-6 block w-full rounded-lg bg-[#21A85B] px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-[#1a8649]"
                >
                  Participá del sorteo
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={participarModalOpen} onOpenChange={setParticiparModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Participar del sorteo</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Para participar del sorteo tenés que escanear el código presente en
            cualquiera de los{" "}
            <Link
              href="/comercios"
              className="font-medium text-primary underline underline-offset-2 hover:no-underline"
              onClick={() => setParticiparModalOpen(false)}
            >
              comercios adheridos
            </Link>
            .
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={!!prizeImageModal} onOpenChange={(open) => !open && setPrizeImageModal(null)}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border-0 bg-transparent shadow-none [&>[data-slot=dialog-close]]:text-white [&>[data-slot=dialog-close]]:hover:text-white">
          {prizeImageModal && (
            <>
              <VisuallyHidden>
                <DialogTitle>Foto del premio: {prizeImageModal.name}</DialogTitle>
              </VisuallyHidden>
              <img
                src={prizeImageModal.url}
                alt={prizeImageModal.name}
                className="w-full h-auto max-h-[85vh] object-contain block"
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
