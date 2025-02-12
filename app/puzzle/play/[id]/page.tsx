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

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading puzzle...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{puzzle.title}</h1>
          {puzzle.aiContent && (
            <div className="max-w-2xl space-y-2 text-gray-300">
              <p><span className="text-gray-500">Description:</span> {puzzle.aiContent.description}</p>
              <p><span className="text-gray-500">Context:</span> {puzzle.aiContent.context}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative rounded-lg overflow-hidden shadow-xl mt-4">
        {puzzle.pieces && puzzle.pieces.length > 0 ? (
          <PuzzleSolver pieces={puzzle.pieces} />
        ) : (
          <div className="flex items-center justify-center h-full">
            No puzzle pieces found
          </div>
        )}
      </div>
    </div>
  );
}
