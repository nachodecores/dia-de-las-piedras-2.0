import { Hero } from "@/components/ui/hero"
import { Sponsors } from "@/components/ui/sponsors"
import { ReglamentoModal } from "@/components/reglamento-modal"

export default function Home() {
  return (
    <div>
      <Hero />
      <p className="text-center text-sm text-muted-foreground px-6 -mt-6 mb-2">
        ¡No olvides mencionar al Día de las Piedras para acceder a los descuentos!
      </p>
      <div className="flex justify-center px-6 pt-4 pb-6">
        <ReglamentoModal />
      </div>
      <Sponsors />
    </div>
  );
}
