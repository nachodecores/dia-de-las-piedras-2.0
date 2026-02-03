"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()

  if (pathname.startsWith("/admin")) {
    return null
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 py-4 bg-white">
      <Image
        src="/logodialaspiedras.svg"
        alt="Logo Día Las Piedras"
        width={120}
        height={40}
        priority
      />
    </header>
  )
}
