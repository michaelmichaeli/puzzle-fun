"use client";

import React, { useEffect, useState } from "react";
import { DraggablePiece } from "./DraggablePiece";
import { usePuzzleSolver } from "../hooks/usePuzzleSolver";
import { PieceData } from "@/types/puzzle";

interface PuzzleSolverProps {
  pieces: PieceData[];
  onSolved: () => void;
}

export const PuzzleSolver: React.FC<PuzzleSolverProps> = ({ pieces, onSolved }) => {
  const [, setBoardSize] = useState({ width: 0, height: 0 });
  const { positions, connectedGroups, onPieceMove, isSolved } = usePuzzleSolver({ pieces });

  // Initialize random positions for pieces
  useEffect(() => {
    const container = document.getElementById("puzzle-board");
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    setBoardSize({ width, height });

    // Initialize positions if not set
    if (Object.keys(positions).length === 0) {
      const newPositions: { [id: number]: { x: number; y: number } } = {};
      pieces.forEach(piece => {
        // Generate random position, keeping pieces within board boundaries
        const x = Math.random() * (width - piece.width);
        const y = Math.random() * (height - piece.height);
        onPieceMove(piece.id, x, y);
        newPositions[piece.id] = { x, y };
      });
    }
  }, [pieces, positions, onPieceMove]);

  // Check if puzzle is solved
  useEffect(() => {
    if (isSolved()) {
      onSolved();
    }
  }, [isSolved, onSolved]);

  // Find which group a piece belongs to
  const isPieceInGroup = (pieceId: number) => {
    return connectedGroups.some(group => group.pieces.includes(pieceId));
  };

  return (
    <div 
      id="puzzle-board"
      className="relative w-full h-screen bg-gray-900"
    >
      {pieces.map(piece => (
        <DraggablePiece
          key={piece.id}
          piece={piece}
          onDrag={onPieceMove}
          position={positions[piece.id] || { x: 0, y: 0 }}
          isPartOfGroup={isPieceInGroup(piece.id)}
        />
      ))}
    </div>
  );
};
