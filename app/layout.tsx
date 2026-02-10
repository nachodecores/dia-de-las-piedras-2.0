import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/header";
import { NavbarFooter } from "@/components/ui/navbar-footer";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Día de Las Piedras",
  description: "Descuentos y sorteos comprando en Las Piedras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${montserrat.variable} ${geistMono.variable} font-sans antialiased`}
        >
          <Header />
          <main className="pt-16 pb-16">
            {children}
          </main>
          <NavbarFooter />
        </body>
      </html>
    </ClerkProvider>
  );
}
