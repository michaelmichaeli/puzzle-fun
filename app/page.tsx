"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Puzzle } from "@/types/puzzle";
import PuzzleCard from "./components/PuzzleCard";
import { Sparkles, Puzzle as PuzzleIcon } from 'lucide-react';
import { useSoundContext } from "./contexts/SoundContext";

export default function Home() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const { playClick } = useSoundContext();

  useEffect(() => {
    const loadPuzzles = () => {
      try {
        const storedPuzzles = localStorage.getItem("puzzles");
        if (storedPuzzles) {
          setPuzzles(JSON.parse(storedPuzzles));
        }
      } catch (error) {
        console.error("Failed to load puzzles:", error);
      }
    };
    loadPuzzles();
    window.addEventListener("storage", loadPuzzles);
    return () => window.removeEventListener("storage", loadPuzzles);
  }, []);

  return (
    <div className="p-8 pb-20 gap-8">
      <section className="text-center mb-16">
        <div className="relative inline-block mb-6">
          <h1 className="text-5xl font-bold mb-4 gradient-text relative z-10 animate-bounce">
            Welcome to PuzzleFun!
          </h1>
          <Sparkles 
            className="absolute -top-4 -right-4 w-8 h-8 text-accent-pink animate-pulse" 
            aria-hidden="true"
          />
        </div>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Create amazing puzzles from your favorite pictures! 🎨<br />
          Share with friends and have fun solving them together! 🎮
        </p>

        <Link
          href="/puzzle/create"
          onClick={() => playClick()}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-white text-lg font-bold rounded-full hover:bg-blue-500 transition-all transform hover:scale-105 duration-200 shadow-lg"
        >
          <PuzzleIcon className="w-6 h-6 transform group-hover:rotate-12 transition-transform" />
          Create Your Puzzle Adventure!
        </Link>
      </section>

      {puzzles?.length > 0 && (
        <section className="bg-blue-50 rounded-2xl p-8 shadow-inner">
          <header className="mb-8 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-accent-pink" />
              Your Puzzle Collection
            </h2>
          </header>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {puzzles.map((puzzle) => (
              <PuzzleCard key={puzzle.id} puzzle={puzzle} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
