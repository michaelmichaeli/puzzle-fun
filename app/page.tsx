"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Puzzle } from "@/types/puzzle";
import PuzzleCard from "./components/PuzzleCard";

export default function Home() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);

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

    // Listen for storage changes in other tabs/windows
    window.addEventListener("storage", loadPuzzles);
    return () => window.removeEventListener("storage", loadPuzzles);
  }, []);

  return (
    <div className="min-h-screen p-8 pb-20 gap-8 font-[family-name:var(--font-geist-sans)]">
      {/* Welcome Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Puzzle Game</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create your own custom puzzles by uploading images and share them with friends. 
          Challenge yourself with different difficulty levels and have fun solving puzzles!
        </p>
        <Link
          href="/puzzle/create"
          className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105 duration-200 shadow-lg"
        >
          Create Your First Puzzle
        </Link>
      </section>

      {/* My Puzzles Section */}
      <section>
        <header className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold">My Puzzles</h2>
        </header>


        {puzzles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No puzzles found. Create your first puzzle!
          </p>
          <Link
            href="/puzzle/create"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {puzzles.map((puzzle) => (
            <PuzzleCard key={puzzle.id} puzzle={puzzle} />
          ))}
        </div>
        )}
      </section>
    </div>
  );
}
