"use client";

import { useEffect, useState } from "react";
import { Puzzle, PieceData } from "@/types/puzzle";
import { PuzzleSolver } from "@/app/components/PuzzleSolver";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import { Info, Star } from "lucide-react";

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
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
        <LoadingSpinner size="lg" />
        <div className="text-xl font-comic text-[#4DB2EC] animate-pulse">
          Getting your puzzle ready...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-start mb-8 animate-slideDown">
          <div className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h1 className="text-5xl font-comic font-bold text-white">
                  {puzzle.title}
                </h1>
                <Star className="w-8 h-8 text-[#FFD800] animate-spin-slow" />
              </div>
              
              {puzzle.aiContent && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-[#4DB2EC]/10 max-w-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#FFD800]/10 rounded-full mt-1">
                      <Info className="w-4 h-4 text-[#FFD800]" />
                    </div>
                    <div className="space-y-2 font-comic">
                      <p className="text-[#4DB2EC]">
                        {puzzle.aiContent.description}
                      </p>
                      <p className="text-[#4DB2EC] text-sm">
                        {puzzle.aiContent.context}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative rounded-2xl overflow-hidden shadow-xl animate-slideUp bg-white border-2 border-[#4DB2EC]/10">
          {puzzle.pieces && puzzle.pieces.length > 0 && puzzle.solution ? (
            <PuzzleSolver pieces={puzzle.pieces} solution={puzzle.solution} />
          ) : (
            <div className="flex items-center justify-center h-64 text-[#4DB2EC] font-comic">
              No puzzle pieces found
            </div>
          )}
        </div>
      </div>

      <div 
        className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#4DB2EC]/5 to-transparent -z-10" 
        aria-hidden="true"
      />
    </div>
  );
}
