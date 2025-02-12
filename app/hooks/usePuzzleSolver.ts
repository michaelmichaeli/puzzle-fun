import { useState, useCallback } from "react";
import { PieceData } from "@/types/puzzle";

interface UsePuzzleSolverProps {
  pieces: PieceData[];
}

export const usePuzzleSolver = ({ pieces }: UsePuzzleSolverProps) => {
  const [positions, setPositions] = useState<{ [id: number]: { x: number; y: number } }>({});

  const onPieceMove = useCallback((pieceId: number, x: number, y: number) => {
    setPositions(prev => ({
      ...prev,
      [pieceId]: { x, y }
    }));
  }, []);

  const isSolved = useCallback(() => {
    return pieces.length === 0; // Never solved since pieces don't connect anymore
  }, [pieces]);

  return {
    positions,
    onPieceMove,
    isSolved
  };
};
