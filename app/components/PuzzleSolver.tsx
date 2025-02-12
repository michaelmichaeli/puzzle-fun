"use client";

import React, { useEffect } from "react";
import { DraggablePiece } from "./DraggablePiece";
import { PuzzleGameStatus } from "./PuzzleGameStatus";
import { PuzzleGrid } from "./PuzzleGrid";
import { usePuzzleSolver } from "../hooks/usePuzzleSolver";
import { PieceData, BoardMatrix } from "@/types/puzzle";

const DEBUG = process.env.NODE_ENV === 'development';

interface PuzzleSolverProps {
  pieces: PieceData[];
  solution: BoardMatrix;
}

export const PuzzleSolver: React.FC<PuzzleSolverProps> = ({ pieces, solution }) => {
  const { positions, onPieceMove, isSolved, shufflePieces } = usePuzzleSolver({ pieces, solution });

  // Initialize and shuffle pieces
  useEffect(() => {
    const container = document.getElementById("puzzle-board");
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Shuffle pieces on initial load
    if (Object.keys(positions).length === 0) {
      shufflePieces(width, height);
    }
  }, [pieces, positions, shufflePieces]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <PuzzleGameStatus isSolved={isSolved()} />
        {DEBUG && (
          <div className="text-xs text-gray-400 flex flex-col">
            <span>Debug info:</span>
            <span>• Snapping threshold: ~25% of piece size</span>
            <span>• Grid cells show expected piece IDs</span>
            <span>• Colors: Green = correct, Red = wrong position</span>
          </div>
        )}
      </div>
      <div 
        id="puzzle-board"
        className="relative w-full h-[calc(100vh-8rem)] bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        <PuzzleGrid
          solution={solution}
          pieces={pieces}
          currentPositions={positions}
        />
        {pieces.map(piece => (
          <DraggablePiece
            key={piece.id}
            piece={piece}
            onDrag={(id, x, y) => onPieceMove(id, x, y)}
            position={positions[piece.id] || { x: 0, y: 0 }}
          />
        ))}
      </div>
    </div>
  );
};
