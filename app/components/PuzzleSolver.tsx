"use client";

import React, { useEffect, useState } from "react";
import { DraggablePiece } from "./DraggablePiece";
import { usePuzzleSolver } from "../hooks/usePuzzleSolver";
import { PieceData } from "@/types/puzzle";

interface PuzzleSolverProps {
  pieces: PieceData[];
}

export const PuzzleSolver: React.FC<PuzzleSolverProps> = ({ pieces }) => {
  const [, setBoardSize] = useState({ width: 0, height: 0 });
  const { positions, onPieceMove } = usePuzzleSolver({ pieces });

  // Initialize positions for pieces in a grid layout
  useEffect(() => {
    const container = document.getElementById("puzzle-board");
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    setBoardSize({ width, height });

    // Initialize positions if not set
    if (Object.keys(positions).length === 0) {
      const padding = 20; // Padding from edges
      const spacing = 10; // Space between pieces
      
      // Calculate total width and height of all pieces
      const totalPieceWidth = pieces.reduce((acc, piece) => acc + piece.width, 0);
      const avgPieceWidth = totalPieceWidth / pieces.length;
      const avgPieceHeight = pieces[0]?.height || 0;

      // Calculate how many pieces we can fit per row
      const piecesPerRow = Math.ceil(Math.sqrt(pieces.length));
      
      // Calculate the starting position to center the grid
      const gridWidth = (avgPieceWidth + spacing) * piecesPerRow - spacing;
      const gridHeight = (avgPieceHeight + spacing) * Math.ceil(pieces.length / piecesPerRow) - spacing;
      
      const startX = (width - gridWidth) / 2;
      const startY = (height - gridHeight) / 3; // Position grid in upper third

      pieces.forEach((piece, index) => {
        const row = Math.floor(index / piecesPerRow);
        const col = index % piecesPerRow;
        
        const x = startX + (col * (avgPieceWidth + spacing));
        const y = startY + (row * (avgPieceHeight + spacing));
        
        // Ensure pieces stay within boundaries
        const boundedX = Math.max(padding, Math.min(width - piece.width - padding, x));
        const boundedY = Math.max(padding, Math.min(height - piece.height - padding, y));
        
        onPieceMove(piece.id, boundedX, boundedY);
      });
    }
  }, [pieces, positions, onPieceMove]);

  return (
    <div 
      id="puzzle-board"
      className="relative w-full h-[calc(100vh-8rem)] bg-gray-900 border border-gray-800 rounded-lg"
    >
      {pieces.map(piece => (
        <DraggablePiece
          key={piece.id}
          piece={piece}
          onDrag={onPieceMove}
          position={positions[piece.id] || { x: 0, y: 0 }}
        />
      ))}
    </div>
  );
};
