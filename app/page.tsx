import { Hero } from "@/components/ui/hero"
import { Sponsors } from "@/components/ui/sponsors"
import { ReglamentoModal } from "@/components/reglamento-modal"

export default function Home() {
  return (
    <div>
      <Hero />
      <div className="flex justify-center px-6 -mt-4 mb-4">
        <ReglamentoModal />
      </div>
      <Sponsors />
    </div>
  );
}
