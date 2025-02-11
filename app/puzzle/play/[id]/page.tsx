"use client";

import { useEffect, useState } from "react";
import { Puzzle, PieceData } from "@/types/puzzle";
import { PuzzleSolver } from "@/app/components/PuzzleSolver";
import { useRouter } from "next/navigation";

interface PlayPageProps {
  params: { id: string };
}

export default function PlayPage({ params }: PlayPageProps) {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load puzzle data from local storage
    const savedPuzzles = JSON.parse(localStorage.getItem("puzzles") || "[]");
    const selectedPuzzle = savedPuzzles.find((p: Puzzle) => p.id === params.id);
    if (selectedPuzzle) {
      // Pre-load all piece images
      const loadPieceImages = async () => {
        const loadImage = (src: string): Promise<void> => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve();
          });
        };

        // Load all piece images concurrently
        await Promise.all(selectedPuzzle.pieces.map((piece: PieceData) => loadImage(piece.imageSrc)));
        setPuzzle(selectedPuzzle);
      };

      loadPieceImages();
    } else {
      // Puzzle not found, redirect to home
      router.push("/");
    }
  }, [params.id, router]);

  const handlePuzzleSolved = () => {
    setIsSolved(true);
    // You could save the completion status, show a celebration animation, etc.
  };

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading puzzle...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">{puzzle.title}</h1>
          {isSolved && (
            <div className="text-green-500 font-bold animate-bounce">
              🎉 Puzzle Solved! Congratulations! 🎉
            </div>
          )}
        </div>
        
        <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
          {puzzle.pieces && puzzle.pieces.length > 0 ? (
            <PuzzleSolver
              pieces={puzzle.pieces}
              onSolved={handlePuzzleSolved}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              No puzzle pieces found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
