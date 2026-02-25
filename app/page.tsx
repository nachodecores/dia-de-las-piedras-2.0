import Image from "next/image"
import Link from "next/link"
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

      <div className="flex flex-col items-center gap-3 px-6 py-8">
        <p className="text-2xl font-medium" style={{ color: "#1F2A44" }}>
          ¡Escribinos!
        </p>
        <div className="flex items-center justify-center gap-6">
          <Link
            href="https://wa.me/59893948122"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
            aria-label="WhatsApp del Centro Comercial"
          >
            <Image
              src="/iconowhapp.svg"
              alt="WhatsApp"
              width={40}
              height={40}
            />
          </Link>
          <Link
            href="https://www.instagram.com/ccomercial.lp/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
            aria-label="Instagram del Centro Comercial"
          >
            <Image
              src="/iconoinsta.svg"
              alt="Instagram"
              width={40}
              height={40}
            />
          </Link>
        </div>
      </div>

      <div className="flex justify-center px-6 pt-4 pb-6">
        <ReglamentoModal />
      </div>
      <Sponsors />
    </div>
  );
}
