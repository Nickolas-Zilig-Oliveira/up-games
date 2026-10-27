import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Hanken_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const display = Big_Shoulders({ subsets: ["latin"], weight: ["700", "800", "900"], variable: "--font-big-shoulders", adjustFontFallback: false });
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken" });

export const metadata: Metadata = {
  title: { default: "Up Games — Loja de games no Jardim Ranieri, SP", template: "%s · Up Games" },
  description:
    "Jogos de PS5, PS4, PS3, Xbox, consoles, controles, headsets e colecionáveis. Compra, venda e troca no Jardim Ranieri, São Paulo.",
};

// Loja usada no celular: sem zoom por pinça ou toque duplo, a tela fica no lugar.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1b1435",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
