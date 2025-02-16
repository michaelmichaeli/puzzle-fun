import type { Metadata } from "next";
import { Quicksand, Comic_Neue } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { FloatingSoundControls } from "./components/FloatingSoundControls";
import { SoundProvider } from "./contexts/SoundContext";
import SkipLink from "./components/SkipLink";
import { CloudsBackground } from "./components/CloudsBackground";
import * as TooltipProvider from "@radix-ui/react-tooltip";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand"
});

const comicNeue = Comic_Neue({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-comic",
  display: "swap"
});

export const metadata: Metadata = {
  title: "PuzzleFun! - Create and Play Puzzles",
  description: "Create your own custom puzzles, play and have fun!",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${quicksand.variable} ${comicNeue.variable} antialiased min-h-screen flex flex-col relative bg-gradient-to-b from-blue-400 via-blue-400/95 to-white`}
      >
        <TooltipProvider.Provider delayDuration={200} skipDelayDuration={100}>
          <CloudsBackground />
          <SoundProvider>
            <SkipLink targetId="main-content" />
            <Header />
            <FloatingSoundControls />
            <main
              id="main-content"
              className="flex-grow py-4 md:px-4 md:container md:mx-auto"
            >
              {children}
            </main>
            <Footer />
          </SoundProvider>
        </TooltipProvider.Provider>
      </body>
    </html>
  );
}
