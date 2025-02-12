"use client";

import { useEffect, useState } from "react";
import { Puzzle, PieceData } from "@/types/puzzle";
import { PuzzleSolver } from "@/app/components/PuzzleSolver";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";

interface PlayPageProps {
  params: { id: string }; 
}

export default function PlayPage({ params }: PlayPageProps) {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedPuzzles = JSON.parse(localStorage.getItem("puzzles") || "[]");
    const selectedPuzzle = savedPuzzles.find((p: Puzzle) => p.id === decodeURIComponent(params.id));
    if (selectedPuzzle) {
      const loadPieceImages = async () => {
        const loadImage = (src: string): Promise<void> => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve();
          });
        };

        await Promise.all(selectedPuzzle.pieces.map((piece: PieceData) => loadImage(piece.imageSrc)));
        setPuzzle(selectedPuzzle);
      };

      loadPieceImages();
    } else {
      router.push("/");
    }
  }, [params.id, router]);

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center justify-center h-screen space-y-6">
          <LoadingSpinner size="lg" />
          <div className="text-xl font-medium animate-pulse">Loading puzzle...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 animate-fadeIn">
      <div className="flex justify-between items-start mb-8 animate-slideDown">
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
      
      <div className="relative rounded-lg overflow-hidden shadow-xl mt-4 animate-slideUp">
        {puzzle.pieces && puzzle.pieces.length > 0 && puzzle.solution ? (
          <PuzzleSolver pieces={puzzle.pieces} solution={puzzle.solution} />
        ) : (
          <div className="flex items-center justify-center h-full">
            No puzzle pieces found
          </div>
        )}
      </div>
    </div>
  );
}
