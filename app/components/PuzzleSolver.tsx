"use client";

import React, { useEffect } from "react";
import { DraggablePiece } from "./DraggablePiece";
import { PuzzleGameStatus } from "./PuzzleGameStatus";
import { usePuzzleSolver } from "../hooks/usePuzzleSolver";
import { PieceData, BoardMatrix } from "@/types/puzzle";

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
      <PuzzleGameStatus isSolved={isSolved()} />
      <div 
        id="puzzle-board"
        className="relative w-full h-[calc(100vh-8rem)] bg-gray-900 border border-gray-800 rounded-lg"
      >
        {pieces.map(piece => (
        <DraggablePiece
          key={piece.id}
          piece={piece}
          onDrag={(id, x, y, boardWidth, boardHeight) => onPieceMove(id, x, y, boardWidth, boardHeight)}
          position={positions[piece.id] || { x: 0, y: 0 }}
        />
        ))}
      </div>
    </div>
  );
};
