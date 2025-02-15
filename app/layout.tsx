import type { Metadata } from "next";
import { Quicksand, Comic_Neue } from 'next/font/google';
import Header from "./components/Header";
import Footer from "./components/Footer";
import { FloatingSoundControls } from "./components/FloatingSoundControls";
import { SoundProvider } from "./contexts/SoundContext";
import SkipLink from "./components/SkipLink";
import * as TooltipProvider from '@radix-ui/react-tooltip';
import "./globals.css";

const quicksand = Quicksand({ 
  subsets: ['latin'],
  variable: '--font-quicksand',
});

const comicNeue = Comic_Neue({ 
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-comic',
  display: 'swap'
});

export const metadata: Metadata = {
  title: "PuzzleFun! - Create and Play Puzzles",
  description: "Create your own custom puzzles, play and have fun!",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${quicksand.variable} ${comicNeue.variable} antialiased min-h-screen flex flex-col relative`}
        style={{
          background: 'linear-gradient(180deg, #4DB2EC 0%, #4DB2EC 15%, #FFFFFF 100%)'
        }}
      >
        <TooltipProvider.Provider delayDuration={200} skipDelayDuration={100}>
          <SoundProvider>
            <SkipLink targetId="main-content" />
          <Header />
          <FloatingSoundControls />
          <main id="main-content" className="flex-grow container mx-auto px-4 py-4">
            {children}
          </main>
          <Footer />
          </SoundProvider>
        </TooltipProvider.Provider>
      </body>
    </html>
  );
}
