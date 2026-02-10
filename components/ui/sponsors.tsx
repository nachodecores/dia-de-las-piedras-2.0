import Image from "next/image"

export function Sponsors() {
  return (
    <section className="px-6 py-8 md:flex md:justify-center">
      <div className="rounded-lg border bg-card p-4 shadow-sm md:w-[30%]">
        <span className="text-sm text-muted-foreground">Organiza:</span>
        <div className="flex items-center justify-center">
          <Image
            src="/logoccialp.svg"
            alt="Logo CCIALP"
            width={160}
            height={60}
          />
        </div>
      </div>
    </section>
  )
}
