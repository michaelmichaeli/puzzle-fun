import { useState, useCallback } from "react";
import {
  BoardMatrix,
  PieceData,
  Positions,
  ContainerDimensions
} from "@/types/puzzle";
import { useSoundContext } from "@/app/contexts/SoundContext";
import {
  findExpectedCell,
  getGridCellCoordinates,
  calculateDistance
} from "@/app/utils/gridUtils";

const SNAPTHRESHOLD = 40;
const SPREAD_DISTANCE = 500;
const ANIMATION_DELAY = 500;

interface UsePuzzleSolverProps {
  pieces: PieceData[];
  solution: BoardMatrix;
}

export const usePuzzleSolver = ({ pieces, solution }: UsePuzzleSolverProps) => {
  const [positions, setPositions] = useState<Positions>({});
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { playSuccess, playComplete, playDrawLine } = useSoundContext();

  const getShuffledGridPositions = useCallback(
    (containerWidth: number, containerHeight: number): Positions => {
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
      const gridHeight =
        (avgPieceHeight + spacing) * Math.ceil(pieces.length / piecesPerRow) -
        spacing;
      const startX = (containerWidth - gridWidth) / 2;
      const startY = (containerHeight - gridHeight) / 3;

      const newPositions: Positions = {};
      indices.forEach((shuffledIndex, originalIndex) => {
        const row = Math.floor(originalIndex / piecesPerRow);
        const col = originalIndex % piecesPerRow;
        const piece = pieces[shuffledIndex];

        const x = Math.max(
          padding,
          Math.min(
            containerWidth - piece.width - padding,
            startX + col * (avgPieceWidth + spacing)
          )
        );
        const y = Math.max(
          padding,
          Math.min(
            containerHeight - piece.height - padding,
            startY + row * (avgPieceHeight + spacing)
          )
        );

        newPositions[piece.id] = { x, y };
      });

      return newPositions;
    },
    [pieces]
  );

  const spreadPiecesFromCenter = useCallback(
    (
      containerWidth: number,
      containerHeight: number,
      currentPositions: Positions
    ): Positions => {
      const padding = 40;

      const quadrants = [
        { minAngle: -Math.PI / 4, maxAngle: Math.PI / 4 }, // right
        { minAngle: Math.PI / 4, maxAngle: (3 * Math.PI) / 4 }, // up
        { minAngle: (3 * Math.PI) / 4, maxAngle: (-3 * Math.PI) / 4 }, // left
        { minAngle: (-3 * Math.PI) / 4, maxAngle: -Math.PI / 4 } // down
      ];

      let quadrantIndex = 0;
      const newPositions: Positions = {};

      pieces.forEach((piece) => {
        const currentPos = currentPositions[piece.id];
        if (!currentPos) return;

        const quadrant = quadrants[quadrantIndex];
        quadrantIndex = (quadrantIndex + 1) % quadrants.length;

        const angle =
          quadrant.minAngle +
          Math.random() * (quadrant.maxAngle - quadrant.minAngle);

        const x = Math.max(
          padding,
          Math.min(
            containerWidth - piece.width - padding,
            currentPos.x + Math.cos(angle) * SPREAD_DISTANCE
          )
        );
        const y = Math.max(
          padding,
          Math.min(
            containerHeight - piece.height - padding,
            currentPos.y + Math.sin(angle) * SPREAD_DISTANCE
          )
        );

        newPositions[piece.id] = { x, y };
      });

      return newPositions;
    },
    [pieces]
  );

  const shufflePieces = useCallback(
    (containerWidth: number, containerHeight: number) => {
      setIsAnimating(true);
      const shuffledPositions = getShuffledGridPositions(
        containerWidth,
        containerHeight
      );
      setPositions(shuffledPositions);
      setTimeout(() => {
        const spreadPositions = spreadPiecesFromCenter(
          containerWidth,
          containerHeight,
          shuffledPositions
        );
        setPositions(spreadPositions);
        setTimeout(() => {
          setIsAnimating(false);
        }, ANIMATION_DELAY);
      }, ANIMATION_DELAY);
    },
    [getShuffledGridPositions, spreadPiecesFromCenter]
  );

  const onPieceMove = useCallback(
    (pieceId: number, x: number, y: number) => {
      if (isAnimating) return;

      const expectedCell = findExpectedCell(pieceId, solution);
      if (expectedCell.row === -1 || expectedCell.col === -1) return;

      const container = document.getElementById("puzzle-board");
      if (!container) return;

      const containerDimensions: ContainerDimensions = {
        width: container.clientWidth,
        height: container.clientHeight
      };

      const expectedPos = getGridCellCoordinates(
        expectedCell.row,
        expectedCell.col,
        pieceId,
        solution,
        pieces,
        containerDimensions
      );

      const distance = calculateDistance({ x, y }, expectedPos);

      let finalPosition = { x, y };
      let isSnapped = false;
      if (distance < SNAPTHRESHOLD) {
        const isCorrectCell =
          solution.grid[expectedCell.row][expectedCell.col] === pieceId;
        if (isCorrectCell) {
          finalPosition = expectedPos;
          isSnapped = true;
        }
      }

      setPositions((prev) => {
        const prevPos = prev[pieceId];
        const wasSnapped =
          prevPos &&
          Math.abs(prevPos.x - expectedPos.x) < 1 &&
          Math.abs(prevPos.y - expectedPos.y) < 1;

        if (isSnapped && !wasSnapped) {
          playSuccess();
        }

        return {
          ...prev,
          [pieceId]: finalPosition
        };
      });
    },
    [isAnimating, pieces, playSuccess, solution]
  );

  const getCurrentMatrix = useCallback((): BoardMatrix => {
    const matrix: number[][] = Array(solution.rows)
      .fill(null)
      .map(() => Array(solution.cols).fill(null));

    pieces.forEach((piece) => {
      const pos = positions[piece.id];
      if (!pos) return;

      const expectedCell = findExpectedCell(piece.id, solution);
      if (expectedCell.row === -1 || expectedCell.col === -1) return;

      const container = document.getElementById("puzzle-board");
      if (!container) return;

      const containerDimensions: ContainerDimensions = {
        width: container.clientWidth,
        height: container.clientHeight
      };

      const expectedPos = getGridCellCoordinates(
        expectedCell.row,
        expectedCell.col,
        piece.id,
        solution,
        pieces,
        containerDimensions
      );

      const distance = calculateDistance(pos, expectedPos);

      if (
        distance < SNAPTHRESHOLD &&
        solution.grid[expectedCell.row][expectedCell.col] === piece.id
      ) {
        matrix[expectedCell.row][expectedCell.col] = piece.id;
      }
    });

    return {
      rows: solution.rows,
      cols: solution.cols,
      grid: matrix
    };
  }, [pieces, positions, solution]);

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

    if (isCorrect && !isGameCompleted) {
      setIsGameCompleted(true);
      playComplete();
    }

    return isCorrect;
  }, [getCurrentMatrix, isGameCompleted, playComplete, solution]);

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
    const container = document.getElementById("puzzle-board");
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    playDrawLine();
    shufflePieces(width, height);
    setIsGameCompleted(false);
  }, [playDrawLine, shufflePieces]);

  return {
    positions,
    onPieceMove,
    isSolved,
    shufflePieces,
    getProgress,
    restart,
    isAnimating
  };
};
