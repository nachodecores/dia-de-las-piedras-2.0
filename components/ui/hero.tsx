import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-4 rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
        Cada segundo jueves del mes
      </span>
      <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl">
        Descuentos y sorteos
        <br />
        <span className="text-primary">comprando en Las Piedras</span>
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Aprovechá los beneficios exclusivos en los comercios adheridos de nuestra ciudad.
      </p>
      <Button asChild size="lg">
        <Link href="/comercios">Ver comercios</Link>
      </Button>
    </section>
  )
}
