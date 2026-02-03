"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Store, Ticket } from "lucide-react"

export function NavbarFooter() {
  const pathname = usePathname()

  if (pathname.startsWith("/admin")) {
    return null
  }

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
      <div className="flex items-center justify-around py-2">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 px-4 py-3 rounded-full transition-all ${
            isActive("/") ? "bg-primary text-primary-foreground -mt-6" : ""
          }`}
        >
          <Home className="h-5 w-5" />
          <span className={`text-xs ${isActive("/") ? "font-semibold" : ""}`}>Inicio</span>
        </Link>
        <Link
          href="/comercios"
          className={`flex flex-col items-center gap-1 px-4 py-3 rounded-full transition-all ${
            isActive("/comercios") ? "bg-primary text-primary-foreground -mt-6" : ""
          }`}
        >
          <Store className="h-5 w-5" />
          <span className={`text-xs ${isActive("/comercios") ? "font-semibold" : ""}`}>Comercios</span>
        </Link>
        <Link
          href="/sorteos"
          className={`flex flex-col items-center gap-1 px-4 py-3 rounded-full transition-all ${
            isActive("/sorteos") ? "bg-primary text-primary-foreground -mt-6" : ""
          }`}
        >
          <Ticket className="h-5 w-5" />
          <span className={`text-xs ${isActive("/sorteos") ? "font-semibold" : ""}`}>Sorteos</span>
        </Link>
      </div>
    </nav>
  )
}
