"use client";

import React, { useMemo } from "react";
import { PieceData, BoardMatrix } from "@/types/puzzle";

interface PuzzleGridProps {
  solution: BoardMatrix;
  pieces: PieceData[];
  currentPositions: { [id: number]: { x: number; y: number } };
}

export const PuzzleGrid: React.FC<PuzzleGridProps> = ({ 
  solution, 
  pieces
}) => {
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

  const gridStyle = useMemo(() => ({
    display: "flex",
    flexDirection: "column" as const,
    position: "absolute" as const,
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 0,
    width: gridDimensions.width,
    height: gridDimensions.height,
  }), [gridDimensions]);

  const rows = useMemo(() => {
    const result = [];
    for (let row = 0; row < solution.rows; row++) {
      const rowCells = [];
      for (let col = 0; col < solution.cols; col++) {
        const pieceId = solution.grid[row][col];
        const dims = pieceDimensions[`${row}-${col}`] || { width: 100, height: 100 };

        rowCells.push(
          <div
            key={`${row}-${col}`}
            className={`${pieceId} relative border-2 border-gray-600/50 bg-gray-800/30 shadow-inner rounded-sm`}
            style={{
              width: dims.width,
              height: dims.height
            }}
          >
            <span 
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm`}
            >
            </span>
          </div>
        );
      }
      result.push(
        <div 
          key={row} 
          className="flex justify-center items-center"
        >
          {rowCells}
        </div>
      );
    }
    return result;
  }, [solution.rows, solution.cols, solution.grid, pieceDimensions]);

  return (
    <div 
      style={gridStyle}
      className="pointer-events-none select-none touch-none"
    >
      {rows}
    </div>
  );
};
