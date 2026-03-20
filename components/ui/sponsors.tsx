import Image from "next/image"
import Link from "next/link"

export function Sponsors() {
  return (
    <section
      className="px-6 py-8 md:flex md:justify-center"
      style={{ background: "linear-gradient(135deg, #1F2A44 0%, #2d3a5c 50%, #1F2A44 100%)" }}
    >
      <Link
        href="https://ccialp-2-0.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border bg-card p-4 shadow-sm md:w-[30%] text-center hover:shadow-md transition-shadow"
      >
        <p className="text-sm text-muted-foreground">Organiza:</p>
        <div className="flex items-center justify-center mt-2">
          <Image
            src="/logoccialp.svg"
            alt="Logo CCIALP"
            width={160}
            height={60}
          />
        </div>
      </Link>
    </section>
  )
}
