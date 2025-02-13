import { useState, useCallback } from "react";
import { PieceData, BoardMatrix } from "@/types/puzzle";

const SNAPTHRESHOLD = 40;

interface UsePuzzleSolverProps {
  pieces: PieceData[];
  solution: BoardMatrix;
}

export const usePuzzleSolver = ({ pieces, solution }: UsePuzzleSolverProps) => {
  const [positions, setPositions] = useState<{ [id: number]: { x: number; y: number } }>({});
  const [isGameCompleted, setIsGameCompleted] = useState(false);

  const shufflePieces = useCallback((containerWidth: number, containerHeight: number) => {
    const padding = 20;
    const spacing = 10;
    const avgPieceWidth = pieces[0]?.width || 0;
    const avgPieceHeight = pieces[0]?.height || 0;
    const piecesPerRow = Math.ceil(Math.sqrt(pieces.length));
    
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

  const findExpectedCell = useCallback((pieceId: number) => {
    let expectedRow = -1;
    let expectedCol = -1;

    for (let row = 0; row < solution.rows; row++) {
      const col = solution.grid[row].indexOf(pieceId);
      if (col !== -1) {
        expectedRow = row;
        expectedCol = col;
        break;
      }
    }

    return { row: expectedRow, col: expectedCol };
  }, [solution]);

  const getGridCellCoordinates = useCallback((row: number, col: number, targetPieceId: number) => {
    let totalWidth = 0;
    let totalHeight = 0;
    
    for (let c = 0; c < solution.cols; c++) {
      const colPiece = pieces.find(p => solution.grid[0][c] === p.id);
      if (colPiece) totalWidth += colPiece.width;
    }
    
    for (let r = 0; r < solution.rows; r++) {
      const rowPiece = pieces.find(p => solution.grid[r][0] === p.id);
      if (rowPiece) totalHeight += rowPiece.height;
    }

    const containerWidth = document.getElementById('puzzle-board')?.clientWidth || 1000;
    const containerHeight = document.getElementById('puzzle-board')?.clientHeight || 800;
    const startX = (containerWidth - totalWidth) / 2;
    const startY = (containerHeight - totalHeight) / 2;

    let x = startX;
    for (let c = 0; c < col; c++) {
      const colPiece = pieces.find(p => solution.grid[row][c] === p.id);
      if (colPiece) x += colPiece.width;
    }

    let y = startY;
    for (let r = 0; r < row; r++) {
      const rowPiece = pieces.find(p => solution.grid[r][col] === p.id);
      if (rowPiece) y += rowPiece.height;
    }

    const targetPiece = pieces.find(p => p.id === targetPieceId);
    if (targetPiece) {
      const currentCellPiece = pieces.find(p => solution.grid[row][col] === p.id);
      if (currentCellPiece) {
        x += (currentCellPiece.width - targetPiece.width) / 2;
        y += (currentCellPiece.height - targetPiece.height) / 2;
      }
    }

    return { x, y };
  }, [solution.grid, solution.cols, solution.rows, pieces]);


  const onPieceMove = useCallback((pieceId: number, x: number, y: number) => {
    const expectedCell = findExpectedCell(pieceId);
    if (expectedCell.row === -1 || expectedCell.col === -1) return;

    const expectedPos = getGridCellCoordinates(expectedCell.row, expectedCell.col, pieceId);
    const distance = Math.sqrt(
      Math.pow(x - expectedPos.x, 2) + 
      Math.pow(y - expectedPos.y, 2)
    );

    let finalPosition = { x, y };
    if (distance < SNAPTHRESHOLD) {
      const isCorrectCell = solution.grid[expectedCell.row][expectedCell.col] === pieceId;
      if (isCorrectCell) {
        finalPosition = expectedPos;
      }
    }

    setPositions(prev => ({
      ...prev,
      [pieceId]: finalPosition
    }));
  }, [pieces, findExpectedCell, getGridCellCoordinates, SNAPTHRESHOLD, solution.grid]);

  const getCurrentMatrix = useCallback((): BoardMatrix => {
    const matrix: number[][] = Array(solution.rows).fill(null)
      .map(() => Array(solution.cols).fill(null));

    pieces.forEach(piece => {
      const pos = positions[piece.id];
      if (!pos) return;

      const expectedCell = findExpectedCell(piece.id);
      if (expectedCell.row === -1 || expectedCell.col === -1) return;

      const expectedPos = getGridCellCoordinates(expectedCell.row, expectedCell.col, piece.id);
      const snapThreshold = SNAPTHRESHOLD;
      const distance = Math.sqrt(
        Math.pow(pos.x - expectedPos.x, 2) + 
        Math.pow(pos.y - expectedPos.y, 2)
      );

      if (distance < snapThreshold && solution.grid[expectedCell.row][expectedCell.col] === piece.id) {
        matrix[expectedCell.row][expectedCell.col] = piece.id;
      }
    });

    return {
      rows: solution.rows,
      cols: solution.cols,
      grid: matrix
    };
  }, [pieces, positions, solution.rows, solution.cols, getGridCellCoordinates, findExpectedCell, solution.grid]);

  const isSolved = useCallback(() => {
    if (isGameCompleted) return true;
    
    const currentMatrix = getCurrentMatrix();
    
    let isCorrect = true;
    for (let row = 0; row < solution.rows; row++) {
      for (let col = 0; col < solution.cols; col++) {
        const current = currentMatrix.grid[row][col];
        const expected = solution.grid[row][col];
        if (current !== expected) {
          isCorrect = false;
        }
      }
    }
    
    if (isCorrect) {
      setIsGameCompleted(true);
    }
    
    return isCorrect;
  }, [getCurrentMatrix, solution, pieces, isGameCompleted]);

  const getProgress = useCallback((): number => {
    const currentMatrix = getCurrentMatrix();
    let correctPieces = 0;
    let totalPieces = 0;

    for (let row = 0; row < solution.rows; row++) {
      for (let col = 0; col < solution.cols; col++) {
        const expected = solution.grid[row][col];
        if (expected !== null) {
          totalPieces++;
          if (currentMatrix.grid[row][col] === expected) {
            correctPieces++;
          }
        }
      }
    }

    return totalPieces > 0 ? correctPieces / totalPieces : 0;
  }, [getCurrentMatrix, solution]);

  const restart = useCallback(() => {
    const container = document.getElementById('puzzle-board');
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    shufflePieces(width, height);
    setIsGameCompleted(false);
  }, [shufflePieces]);

  return {
    positions,
    onPieceMove,
    isSolved,
    shufflePieces,
    getProgress,
    restart
  };
};
