import { useState, useCallback, useRef } from "react";
import { PieceData, BoardMatrix } from "@/types/puzzle";

interface UsePuzzleSolverProps {
  pieces: PieceData[];
  solution: BoardMatrix;
}

interface GridCell {
  x: number;
  y: number;
}

export const usePuzzleSolver = ({ pieces, solution }: UsePuzzleSolverProps) => {
  const [positions, setPositions] = useState<{ [id: number]: { x: number; y: number } }>({});
  const boardRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  const calculateGridCells = useCallback((): GridCell[][] => {
    const cellSize = pieces[0]?.width || 100;
    const cells: GridCell[][] = [];
    
    const startX = (boardRef.current.width - (cellSize * solution.cols)) / 2;
    const startY = (boardRef.current.height - (cellSize * solution.rows)) / 2;
    
    for (let row = 0; row < solution.rows; row++) {
      cells[row] = [];
      for (let col = 0; col < solution.cols; col++) {
        cells[row][col] = {
          x: startX + (col * cellSize),
          y: startY + (row * cellSize)
        };
      }
    }
    
    return cells;
  }, [pieces, solution.rows, solution.cols]);

  const findNearestCell = useCallback((x: number, y: number, pieceId: number): { x: number; y: number } | null => {
    const grid = calculateGridCells();
    const cellSize = pieces[0]?.width || 100;
    const snapThreshold = cellSize * 0.2; // 20% of cell size
    
    let nearestCell: { x: number; y: number } | null = null;
    let minDistance = Infinity;

    for (let row = 0; row < solution.rows; row++) {
      for (let col = 0; col < solution.cols; col++) {
        const cell = grid[row][col];
        const distance = Math.sqrt(Math.pow(x - cell.x, 2) + Math.pow(y - cell.y, 2));
        
        if (distance < minDistance && distance < snapThreshold) {
          // Only snap if this is the correct position for this piece
          if (solution.grid[row][col] === pieceId) {
            minDistance = distance;
            nearestCell = cell;
          }
        }
      }
    }
    
    return nearestCell;
  }, [calculateGridCells, pieces, solution.grid, solution.rows, solution.cols]);

  const shufflePieces = useCallback((containerWidth: number, containerHeight: number) => {
    const padding = 20;
    const spacing = 10;
    const avgPieceWidth = pieces[0]?.width || 0;
    const avgPieceHeight = pieces[0]?.height || 0;
    const piecesPerRow = Math.ceil(Math.sqrt(pieces.length));
    
    // Create a shuffled array of positions
    const indices = Array.from({ length: pieces.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    const gridWidth = (avgPieceWidth + spacing) * piecesPerRow - spacing;
    const gridHeight = (avgPieceHeight + spacing) * Math.ceil(pieces.length / piecesPerRow) - spacing;
    const startX = (containerWidth - gridWidth) / 2;
    const startY = (containerHeight - gridHeight) / 3;

    const newPositions: { [id: number]: { x: number; y: number } } = {};
    indices.forEach((shuffledIndex, originalIndex) => {
      const row = Math.floor(originalIndex / piecesPerRow);
      const col = originalIndex % piecesPerRow;
      const piece = pieces[shuffledIndex];
      
      const x = Math.max(padding, Math.min(containerWidth - piece.width - padding, 
        startX + (col * (avgPieceWidth + spacing))));
      const y = Math.max(padding, Math.min(containerHeight - piece.height - padding, 
        startY + (row * (avgPieceHeight + spacing))));
      
      newPositions[piece.id] = { x, y };
    });

    setPositions(newPositions);
  }, [pieces]);

  const onPieceMove = useCallback((pieceId: number, x: number, y: number, boardWidth: number, boardHeight: number) => {
    // Update board dimensions
    boardRef.current = { width: boardWidth, height: boardHeight };

    // Check for snapping
    const nearestCell = findNearestCell(x, y, pieceId);
    const finalPosition = nearestCell || { x, y };

    setPositions(prev => ({
      ...prev,
      [pieceId]: finalPosition
    }));
  }, [findNearestCell]);

  const getCurrentMatrix = useCallback((): BoardMatrix => {
    const cellSize = pieces[0]?.width || 100;
    const grid = calculateGridCells();
    const matrix: number[][] = Array(solution.rows).fill(null)
      .map(() => Array(solution.cols).fill(null));

    pieces.forEach(piece => {
      const piecePos = positions[piece.id];
      if (!piecePos) return;

      // Find the closest grid cell to this piece's position
      let bestRow = -1;
      let bestCol = -1;
      let bestDistance = Infinity;

      for (let row = 0; row < solution.rows; row++) {
        for (let col = 0; col < solution.cols; col++) {
          const cell = grid[row][col];
          const distance = Math.sqrt(
            Math.pow(piecePos.x - cell.x, 2) + 
            Math.pow(piecePos.y - cell.y, 2)
          );
          
          if (distance < bestDistance) {
            bestDistance = distance;
            bestRow = row;
            bestCol = col;
          }
        }
      }

      // Only assign the piece if it's close enough to a grid cell
      if (bestDistance < cellSize / 2 && bestRow >= 0 && bestCol >= 0) {
        matrix[bestRow][bestCol] = piece.id;
      }
    });

    return {
      rows: solution.rows,
      cols: solution.cols,
      grid: matrix
    };
  }, [pieces, positions, solution.rows, solution.cols, calculateGridCells]);

  const isSolved = useCallback(() => {
    const currentMatrix = getCurrentMatrix();
    
    for (let row = 0; row < solution.rows; row++) {
      for (let col = 0; col < solution.cols; col++) {
        if (currentMatrix.grid[row][col] !== solution.grid[row][col]) {
          return false;
        }
      }
    }
    
    return true;
  }, [getCurrentMatrix, solution]);

  return {
    positions,
    onPieceMove,
    isSolved,
    shufflePieces
  };
};
