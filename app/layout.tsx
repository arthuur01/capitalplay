import type { Metadata } from "next";
import {Audiowide, Poiret_One, Outfit} from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/app/loading";
import ProgressBar from "@/components/ProgressBar";
import Navbar from "@/components/Navbar";
import { DotScreenShader } from "@/components/shader-background";


export const metadata: Metadata = {
  title: "CAPITALPLAY | Projeto Oficial",
  description: "Capital Play - UNA PROJETO",
  icons: {
    icon: "/tab_icon.png",
    shortcut: "/tab_icon.png",
    apple: "/tab_icon.png",
  },
};


const audiowide = Audiowide({
  weight: "400", // ou ['400', '700'] se quiser múltiplos pesos
  subsets: ["latin"],
  variable: "--font-audiowide", // opcional, útil se quiser integrar com Tailwind
});

const poiret_one = Poiret_One({
  weight: "400", // ou ['400', '700'] se quiser múltiplos pesos
  subsets: ["latin"],
  variable: "--font-poiret-one", // opcional, útil se quiser integrar com Tailwind
});

const outfit = Outfit({
  weight: "400", // ou ['400', '700'] se quiser múltiplos pesos
  subsets: ["latin"],
  variable: "--font-outfit", // opcional, útil se quiser integrar com Tailwind
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    
  return (
    <html lang="en">
      <body className={`${audiowide.variable} ${poiret_one.variable} ${outfit.variable}   antialiased`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
