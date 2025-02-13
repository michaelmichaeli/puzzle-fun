"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Volume2, VolumeX, Home, Puzzle } from "lucide-react";
import { useSoundContext } from "../contexts/SoundContext";

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isCreatePage = pathname === "/puzzle/create";
  const { isSoundEnabled, toggleSound, playClick, volume, setVolume } =
    useSoundContext();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`w-full px-4 py-4 sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-[#4DB2EC]/80 backdrop-blur" : "bg-[#4DB2EC]"
      }`}
    >
      <div className="container mx-auto flex flex-wrap gap-y-4 md:flex-nowrap items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:rotate-12 overflow-hidden">
            <div
              className="relative w-full h-full flex items-center justify-center"
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, #4DB2EC 0%, #FFD800 50%, #FF69B4 100%)",
                }}
              />
              <Puzzle className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
            </div>
          </div>
          <span className="text-white text-2xl font-bold font-comic">
            PuzzleFun!
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {!isHomePage && (
            <Link
              href="/"
              onClick={() => playClick()}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-white hover:text-white/80 transition-colors rounded-full bg-white/10"
              aria-label="Go to home page"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
          )}
          {!isCreatePage && (
            <Link
              href="/puzzle/create"
              onClick={() => playClick()}
              className="flex items-center gap-2 px-6 py-3 bg-[#FFD800] text-[#4DB2EC] rounded-full hover:bg-[#FFE800] transition-all transform hover:scale-105 shadow-lg font-bold"
              aria-label="Create new puzzle"
            >
              <Puzzle className="w-5 h-5" />
              <span className="font-bold">Create Puzzle</span>
            </Link>
          )}
          <div className="hidden lg:flex items-center gap-2 px-2">
            {isSoundEnabled && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                  hover:[&::-webkit-slider-thumb]:bg-yellow-100 [&::-webkit-slider-thumb]:transition-colors 
                  [&::-webkit-slider-thumb]:shadow-md
                  [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full 
                  [&::-moz-range-thumb]:bg-white hover:[&::-moz-range-thumb]:bg-yellow-100 
                  [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:transition-colors 
                  [&::-moz-range-thumb]:shadow-md
                  hover:bg-white/30 focus:bg-white/30 transition-colors"
                aria-label="Sound volume"
              />
            )}
            <button
              onClick={() => {
                playClick();
                toggleSound();
              }}
              className="p-2 text-white hover:text-white/80 transition-colors rounded-full bg-white/10"
              aria-label={isSoundEnabled ? "Mute sound" : "Unmute sound"}
            >
              {isSoundEnabled ? (
                <Volume2 className="w-6 h-6" />
              ) : (
                <VolumeX className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
