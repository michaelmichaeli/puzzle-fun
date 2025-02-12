import { useState, useCallback } from "react";
import { PieceData, BoardMatrix } from "@/types/puzzle";

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
    // Calculate total grid dimensions
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

    // Center the grid
    const containerWidth = document.getElementById('puzzle-board')?.clientWidth || 1000;
    const containerHeight = document.getElementById('puzzle-board')?.clientHeight || 800;
    const startX = (containerWidth - totalWidth) / 2;
    const startY = (containerHeight - totalHeight) / 2;

    // Calculate x position by summing widths of pieces in previous columns
    let x = startX;
    for (let c = 0; c < col; c++) {
      const colPiece = pieces.find(p => solution.grid[row][c] === p.id);
      if (colPiece) x += colPiece.width;
    }

    // Calculate y position by summing heights of pieces in previous rows
    let y = startY;
    for (let r = 0; r < row; r++) {
      const rowPiece = pieces.find(p => solution.grid[r][col] === p.id);
      if (rowPiece) y += rowPiece.height;
    }

    // Adjust for target piece dimensions
    const targetPiece = pieces.find(p => p.id === targetPieceId);
    if (targetPiece) {
      // Center the piece in its cell
      const currentCellPiece = pieces.find(p => solution.grid[row][col] === p.id);
      if (currentCellPiece) {
        x += (currentCellPiece.width - targetPiece.width) / 2;
        y += (currentCellPiece.height - targetPiece.height) / 2;
      }
    }

    return { x, y };
  }, [solution.grid, solution.cols, solution.rows, pieces]);

  // Calculate snap threshold based on piece size
  const getSnapThreshold = useCallback((pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return 30; // default
    return Math.min(piece.width, piece.height) * 0.25; // 25% of smallest dimension
  }, [pieces]);

  const onPieceMove = useCallback((pieceId: number, x: number, y: number) => {
    const expectedCell = findExpectedCell(pieceId);
    if (expectedCell.row === -1 || expectedCell.col === -1) return;

    const expectedPos = getGridCellCoordinates(expectedCell.row, expectedCell.col, pieceId);
    const snapThreshold = getSnapThreshold(pieceId);
    const distance = Math.sqrt(
      Math.pow(x - expectedPos.x, 2) + 
      Math.pow(y - expectedPos.y, 2)
    );

    const finalPosition = distance < snapThreshold ? expectedPos : { x, y };

    console.log(`Piece ${pieceId} movement:`, {
      currentPosition: { x, y },
      calculatedGridPos: { row: Math.floor(y / pieces[0].height), col: Math.floor(x / pieces[0].width) },
      expectedGridPos: { row: expectedCell.row, col: expectedCell.col },
      targetPosition: expectedPos,
      distance,
      snapThreshold,
      willSnap: distance < snapThreshold
    });

    setPositions(prev => ({
      ...prev,
      [pieceId]: finalPosition
    }));
  }, [pieces, findExpectedCell, getGridCellCoordinates, getSnapThreshold]);

  const getCurrentMatrix = useCallback((): BoardMatrix => {
    console.log('Current Positions:', positions);
    console.log('Pieces:', pieces);
    
    const matrix: number[][] = Array(solution.rows).fill(null)
      .map(() => Array(solution.cols).fill(null));

    pieces.forEach(piece => {
      const pos = positions[piece.id];
      if (!pos) return;

      // Find the closest grid cell
      let bestRow = -1;
      let bestCol = -1;
      let minDistance = Infinity;

      for (let row = 0; row < solution.rows; row++) {
        for (let col = 0; col < solution.cols; col++) {
          const cellPos = getGridCellCoordinates(row, col, piece.id);
          const distance = Math.sqrt(
            Math.pow(pos.x - cellPos.x, 2) + 
            Math.pow(pos.y - cellPos.y, 2)
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            bestRow = row;
            bestCol = col;
          }
        }
      }

      if (bestRow >= 0 && bestCol >= 0) {
        matrix[bestRow][bestCol] = piece.id;
      }
    });

    return {
      rows: solution.rows,
      cols: solution.cols,
      grid: matrix
    };
  }, [pieces, positions, solution.rows, solution.cols, getGridCellCoordinates]);

  const isSolved = useCallback(() => {
    if (isGameCompleted) return true;
    
    const currentMatrix = getCurrentMatrix();
    
    let isCorrect = true;
    for (let row = 0; row < solution.rows; row++) {
      for (let col = 0; col < solution.cols; col++) {
        const current = currentMatrix.grid[row][col];
        const expected = solution.grid[row][col];
        if (current !== expected) {
          console.log(`Mismatch at [${row},${col}]:`, {
            current,
            expected,
            piece: pieces.find(p => p.id === current)
          });
          isCorrect = false;
        }
      }
    }
    
    if (isCorrect) {
      console.log('Puzzle solved! 🎉');
      setIsGameCompleted(true);
    }
    
    return isCorrect;
  }, [getCurrentMatrix, solution, pieces, isGameCompleted]);

  return {
    positions,
    onPieceMove,
    isSolved,
    shufflePieces
  };
};
