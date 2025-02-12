"use client";

import React, { useMemo } from "react";
import { PieceData, BoardMatrix } from "@/types/puzzle";

interface PuzzleGridProps {
  solution: BoardMatrix;
  pieces: PieceData[];
  currentPositions: { [id: number]: { x: number; y: number } };
}

export const PuzzleGrid: React.FC<PuzzleGridProps> = ({ solution, pieces, currentPositions }) => {
  const pieceDimensions = useMemo(() => {
    const dimensions: { [key: string]: { width: number; height: number } } = {};
    for (let row = 0; row < solution.rows; row++) {
      for (let col = 0; col < solution.cols; col++) {
        const pieceId = solution.grid[row][col];
        if (pieceId !== null) {
          const piece = pieces.find(p => p.id === pieceId);
          if (piece) {
            dimensions[`${row}-${col}`] = {
              width: piece.width,
              height: piece.height
            };
          }
        }
      }
    }
    return dimensions;
  }, [solution.grid, pieces, solution.rows, solution.cols]);

  const gridDimensions = useMemo(() => {
    let maxWidth = 0;
    let totalHeight = 0;
    let currentRowWidth = 0;
    let currentRowMaxHeight = 0;
    for (let row = 0; row < solution.rows; row++) {
      currentRowWidth = 0;
      currentRowMaxHeight = 0;
      for (let col = 0; col < solution.cols; col++) {
        const dims = pieceDimensions[`${row}-${col}`];
        if (dims) {
          currentRowWidth += dims.width;
          currentRowMaxHeight = Math.max(currentRowMaxHeight, dims.height);
        }
      }
      maxWidth = Math.max(maxWidth, currentRowWidth);
      totalHeight += currentRowMaxHeight;
    }

    return { width: maxWidth, height: totalHeight };
  }, [pieceDimensions, solution.rows, solution.cols]);

  const gridStyle = useMemo(() => {
    return {
      display: "flex",
      flexDirection: "column" as const,
      position: "absolute" as const,
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      padding: "8px",
      zIndex: 0,
      gap: "1px",
      width: gridDimensions.width,
      height: gridDimensions.height,
    };
  }, [gridDimensions]);

  const filledCells = useMemo(() => {
    const filled: { [key: string]: number } = {};
    Object.entries(currentPositions).forEach(([id, pos]) => {
      let nearestRow = -1;
      let nearestCol = -1;
      let minDistance = Infinity;

      for (let row = 0; row < solution.rows; row++) {
        for (let col = 0; col < solution.cols; col++) {
          const dims = pieceDimensions[`${row}-${col}`];
          if (dims) {
            const cellX = col * dims.width;
            const cellY = row * dims.height;
            const distance = Math.sqrt(
              Math.pow(pos.x - cellX, 2) + Math.pow(pos.y - cellY, 2)
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearestRow = row;
              nearestCol = col;
            }
          }
        }
      }

      if (nearestRow >= 0 && nearestCol >= 0) {
        filled[`${nearestRow}-${nearestCol}`] = parseInt(id);
      }
    });
    return filled;
  }, [currentPositions, pieceDimensions, solution.rows, solution.cols]);

  const rows = useMemo(() => {
    const result = [];
    for (let row = 0; row < solution.rows; row++) {
      const rowCells = [];
      for (let col = 0; col < solution.cols; col++) {
        const pieceId = solution.grid[row][col];
        const filledWithPieceId = filledCells[`${row}-${col}`];
        const correctPiece = filledWithPieceId === pieceId;
        const dims = pieceDimensions[`${row}-${col}`] || { width: 100, height: 100 };

        rowCells.push(
          <div
            key={`${row}-${col}`}
            className={`relative border transition-all duration-200 ${
              correctPiece ? 'border-green-500/50 bg-green-900/20' : 
              filledWithPieceId ? 'border-red-500/50 bg-red-900/20' : 
              'border-gray-700 bg-gray-800/20'
            }`}
            style={{
              width: dims.width,
              height: dims.height,
            }}
          >
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500 text-sm">
              {pieceId !== null ? pieceId : ""}
            </span>
          </div>
        );
      }
      result.push(
      <div key={row} className="flex gap-1 justify-center items-center">
          {rowCells}
        </div>
      );
    }
    return result;
  }, [solution.rows, solution.cols, solution.grid, pieceDimensions, filledCells]);

  return (
    <div 
      className="pointer-events-none select-none" 
      style={{
        ...gridStyle,
        zIndex: 5,
        pointerEvents: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}
    >
      {rows}
    </div>
  );
};
