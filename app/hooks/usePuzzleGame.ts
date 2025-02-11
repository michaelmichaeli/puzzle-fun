import { useState, useEffect } from "react";
import { Puzzle, PieceData, PiecePositions } from "@/types/puzzle";
import { PIECE_PLACEMENT_THRESHOLD } from "@/app/constants/dimensions";
import type { DraggableData } from "react-draggable";

interface PiecePosition {
  x: number;
  y: number;
}

interface UsePuzzleGameProps {
  id: string;
  boardWidth: number;
  boardHeight: number;
}

interface UsePuzzleGameReturn {
  puzzle: Puzzle | null;
  holedImage: HTMLImageElement | null;
  placedPieces: Set<number>;
  piecePositions: PiecePositions;
  hasLoaded: boolean;
  handlePieceDragStop: (boardRect: DOMRect, data: DraggableData, piece: PieceData) => void;
}

export const usePuzzleGame = ({ 
  id,
  boardWidth,
  boardHeight 
}: UsePuzzleGameProps): UsePuzzleGameReturn => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [holedImage, setHoledImage] = useState<HTMLImageElement | null>(null);
  const [placedPieces, setPlacedPieces] = useState<Set<number>>(new Set());
  const [piecePositions, setPiecePositions] = useState<PiecePositions>({});
  const [hasLoaded, setHasLoaded] = useState(false);

  const generateRandomPosition = (pieceWidth: number, pieceHeight: number): PiecePosition => {
    const isLeftSide = Math.random() < 0.5;
    const sideOffset = boardWidth * 0.3;
    const randomSpread = boardWidth * 0.15;
    const section = Math.floor(Math.random() * 4);
    const sectionHeight = boardHeight / 4;
    
    return {
      x: isLeftSide 
        ? -sideOffset + (Math.random() * randomSpread)
        : boardWidth + (Math.random() * randomSpread),
      y: (section * sectionHeight) + (Math.random() * sectionHeight - pieceHeight/2)
    };
  };

  // This function regenerates positions when board dimensions change
  const updatePiecePositions = (puzzleData: Puzzle, existingPositions: PiecePositions) => {
    if (!puzzleData) return;

    const newPositions: PiecePositions = {};
    const scale = boardWidth / puzzleData.originalWidth;

    puzzleData.pieces.forEach(piece => {
      if (placedPieces.has(piece.id) && existingPositions[piece.id]) {
        // For placed pieces, adjust position based on new scale
        const originalX = piece.x + (piece.width / 2);
        const originalY = piece.y + (piece.height / 2);
        const pieceWidth = piece.widthRatio * boardWidth;
        const pieceHeight = piece.heightRatio * boardHeight;

        newPositions[piece.id] = {
          x: originalX * scale - pieceWidth / 2,
          y: originalY * scale - pieceHeight / 2
        };
      } else if (existingPositions[piece.id]) {
        // For unplaced pieces with existing positions, maintain relative position
        const oldPosition = existingPositions[piece.id];
        newPositions[piece.id] = oldPosition;
      } else {
        // For new pieces, generate random position
        const pieceWidth = piece.widthRatio * boardWidth;
        const pieceHeight = piece.heightRatio * boardHeight;
        newPositions[piece.id] = generateRandomPosition(pieceWidth, pieceHeight);
      }
    });

    setPiecePositions(newPositions);
  };

  useEffect(() => {
    const savedPuzzles = JSON.parse(localStorage.getItem("puzzles") || "[]");
    const selectedPuzzle = savedPuzzles.find((p: Puzzle) => p.id === id);

    if (selectedPuzzle) {
      setPuzzle(selectedPuzzle);

      const img = new window.Image();
      img.src = selectedPuzzle.holedImage;
      img.onload = () => {
        setHoledImage(img);
        const savedPositions = JSON.parse(localStorage.getItem(`piece_positions_${id}`) || "{}");
        updatePiecePositions(selectedPuzzle, savedPositions);
        setHasLoaded(true);
      };
    }
  }, [id]);

  useEffect(() => {
    if (puzzle && hasLoaded) {
      updatePiecePositions(puzzle, piecePositions);
    }
  }, [boardWidth, boardHeight]);

  useEffect(() => {
    if (hasLoaded && Object.keys(piecePositions).length > 0) {
      localStorage.setItem(`piece_positions_${id}`, JSON.stringify(piecePositions));
    }
  }, [piecePositions, id, hasLoaded]);

  const handlePieceDragStop = (boardRect: DOMRect, data: DraggableData, piece: PieceData) => {
    if (!puzzle || !holedImage || placedPieces.has(piece.id)) return;

    setPiecePositions(prev => ({
      ...prev,
      [piece.id]: { x: data.x, y: data.y }
    }));

    const node = data.node as HTMLElement;
    const nodeBounds = node.getBoundingClientRect();
    const scale = boardWidth / puzzle.originalWidth;
    const pieceWidth = piece.widthRatio * boardWidth;
    const pieceHeight = piece.heightRatio * boardHeight;

    const currentX = nodeBounds.left - boardRect.left + (pieceWidth / 2);
    const currentY = nodeBounds.top - boardRect.top + (pieceHeight / 2);

    const originalCurrentX = currentX / scale;
    const originalCurrentY = currentY / scale;

    const originalTargetX = piece.x + (piece.width / 2);
    const originalTargetY = piece.y + (piece.height / 2);

    const distance = Math.sqrt(
      Math.pow(originalCurrentX - originalTargetX, 2) + 
      Math.pow(originalCurrentY - originalTargetY, 2)
    );

    if (distance <= PIECE_PLACEMENT_THRESHOLD) {
      setPlacedPieces(prev => {
        const newSet = new Set(prev);
        newSet.add(piece.id);
        return newSet;
      });

      setPiecePositions(prev => ({
        ...prev,
        [piece.id]: { 
          x: originalTargetX * scale - pieceWidth / 2,
          y: originalTargetY * scale - pieceHeight / 2
        }
      }));
    }
  };

  return {
    puzzle,
    holedImage,
    placedPieces,
    piecePositions,
    hasLoaded,
    handlePieceDragStop
  };
};
