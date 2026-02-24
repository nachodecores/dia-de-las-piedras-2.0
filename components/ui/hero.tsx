"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const SLIDES: {
  image?: string;
  imageUrl?: string;
  title: string;
  subtitle: string;
  description: string;
}[] = [
  {
    // imageUrl: "/hero-slide-1.jpg", // descomentá y añadí la imagen en public/
    image: "linear-gradient(135deg, #1F2A44 0%, #2d3a5c 50%, #1F2A44 100%)",
    title: "Descuentos y sorteos",
    subtitle: "comprando en Las Piedras",
    description: "Aprovechá los beneficios exclusivos en los comercios adheridos.",
  },
  {
    // imageUrl: "/hero-slide-2.jpg",
    image: "linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)",
    title: "Cada segundo jueves del mes descuentos y sorteos",
    subtitle: "Día de las Piedras",
    description: "Sumate a la iniciativa y participá del sorteo mensual.",
  },
];

export function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[55vh] min-h-[520px] w-full overflow-hidden pb-2 md:min-h-[480px] mb-8 md:mb-10">
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          className="absolute inset-0 flex flex-col items-center justify-center bg-cover bg-center px-6 py-12 text-center transition-opacity duration-700 ease-in-out"
          style={{
            background: slide.imageUrl
              ? `linear-gradient(to bottom, rgba(0,0,0,.4), rgba(0,0,0,.35)), url(${slide.imageUrl})`
              : slide.image,
            backgroundSize: slide.imageUrl ? "cover" : undefined,
            backgroundPosition: slide.imageUrl ? "center" : undefined,
            opacity: index === current ? 1 : 0,
            zIndex: index === current ? 10 : 0,
          }}
        >
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white drop-shadow-sm md:text-4xl">
            {index === 1 ? (
              slide.title
            ) : (
              <>
                {slide.title}
                <br />
                <span className="text-white/95">{slide.subtitle}</span>
              </>
            )}
          </h1>
          {index === 1 && (
            <Link
              href="/sorteos"
              className="mb-4 inline-flex rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              premios de este mes
            </Link>
          )}
          <p className="mb-8 max-w-md text-white/90 drop-shadow-sm">
            {index === 0 ? (
              <>
                Aprovechá los beneficios exclusivos en{" "}
                <Link
                  href="/comercios"
                  className="font-medium text-white underline decoration-white/70 underline-offset-2 hover:decoration-white"
                >
                  comercios adheridos
                </Link>
                .
              </>
            ) : (
              slide.description
            )}
          </p>
        </div>
      ))}

      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Ir a slide ${index + 1}`}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
