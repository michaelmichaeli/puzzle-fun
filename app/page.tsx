"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Puzzle } from "@/types/puzzle";
import { loadPuzzles, removePuzzle } from "./utils/puzzleStorage";
import PuzzleCard from "./components/PuzzleCard";
import { Sparkles, Puzzle as PuzzleIcon, Star } from "lucide-react";
import { useSoundContext } from "./contexts/SoundContext";

export default function Home() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const { playClick } = useSoundContext();

  const handleDeletePuzzle = (id: string) => {
    removePuzzle(id);
    setPuzzles(loadPuzzles());
  };

  useEffect(() => {
    const loadStoredPuzzles = () => {
      setPuzzles(loadPuzzles());
    };

    loadStoredPuzzles();
    window.addEventListener("storage", loadStoredPuzzles);
    return () => window.removeEventListener("storage", loadStoredPuzzles);
  }, []);

  return (
    <div className="p-8 pb-20 gap-8">
      <section className="text-center mb-16">
        <div className="relative inline-block mb-8">
          <h1 className="text-5xl font-bold font-comic mb-4 text-white relative z-10">
            Welcome to PuzzleFun!
            <div className="absolute -right-12 -top-8">
              <Star className="w-12 h-12 text-secondary animate-spin-slow" />
            </div>
            <div className="absolute -left-10 top-6">
              <Sparkles className="w-8 h-8 text-accent-pink animate-scalePulse" />
            </div>
          </h1>
        </div>

        <p className="text-xl text-white mb-8 max-w-2xl mx-auto leading-relaxed font-comic">
          🎨 Create amazing puzzles from your favorite pictures!
          <br />
          Share with friends and have fun solving them together! 🎮
        </p>

        <Link
          href="/puzzle/create"
          onClick={() => playClick()}
          className="group inline-flex items-center gap-3 px-8 py-4 text-white text-lg font-bold font-comic rounded-full 
            transition-all transform hover:scale-105 duration-200 shadow-lg hover:shadow-xl relative overflow-hidden
            bg-gradient-to-br from-secondary to-accent-pink"
        >
          <PuzzleIcon className="w-6 h-6 transform group-hover:rotate-12 transition-transform" />
          Create Your Puzzle Adventure!
        </Link>
      </section>

      {puzzles?.length > 0 && (
        <section className="bg-white rounded-2xl p-8 shadow-xl border-2 border-primary/10">
          <header className="mb-8 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-primary font-comic flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-full">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              Your Puzzle Collection
            </h2>
          </header>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {puzzles.map((puzzle) => (
              <PuzzleCard
                key={puzzle.id}
                puzzle={puzzle}
                onDelete={handleDeletePuzzle}
              />
            ))}
          </div>
        </section>
      )}

      <div
        className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent -z-10"
        aria-hidden="true"
      />
    </div>
  );
}
