"use client";

import React, { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import type { PieceData } from "@/types/puzzle";
import DraggablePiece from "@/app/components/DraggablePiece";
import { PuzzleGameStatus } from "@/app/components/PuzzleGameStatus";
import BackButton from "@/app/components/BackButton";
import { DISPLAY_WIDTH, DISPLAY_HEIGHT, calculateImageDimensions } from "@/app/constants/dimensions";
import { usePuzzleGame } from "@/app/hooks/usePuzzleGame";
import type { DraggableEvent, DraggableData } from "react-draggable";

const PuzzlePlayPage = () => {
  const { id } = useParams();
  const boardRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ 
    width: DISPLAY_WIDTH, 
    height: DISPLAY_HEIGHT,
    scaleFactors: { x: 1, y: 1 }
  });

  const {
    puzzle,
    holedImage,
    placedPieces,
    piecePositions,
    hasLoaded,
    handlePieceDragStop
  } = usePuzzleGame({
    id: id as string,
    boardWidth: imageDimensions.width,
    boardHeight: imageDimensions.height
  });

  useEffect(() => {
    if (holedImage) {
      const dimensions = calculateImageDimensions(holedImage.width, holedImage.height);
      setImageDimensions(dimensions);
    }
  }, [holedImage]);

  const handlePieceDrag = (e: DraggableEvent, data: DraggableData, piece: PieceData) => {
    if (!boardRef.current) return;
    handlePieceDragStop(boardRef.current.getBoundingClientRect(), data, piece);
  };

  if (!hasLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h2 className="text-xl font-semibold">Loading puzzle...</h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <BackButton />
      <div className="text-center p-5 relative z-10">
        <h1 className="text-2xl font-bold mb-5">Puzzle {id}</h1>

        {puzzle && holedImage && (
          <>
            <PuzzleGameStatus 
              totalPieces={puzzle.pieces.length}
              placedPieces={placedPieces.size}
            />

            <div className="relative w-full h-[700px] flex justify-center items-center">
              <div 
                ref={boardRef}
                className="relative bg-gray-100 rounded-lg shadow-md"
                style={{ 
                  width: imageDimensions.width, 
                  height: imageDimensions.height,
                }}
              >
                <Stage 
                  width={imageDimensions.width} 
                  height={imageDimensions.height} 
                  className="absolute top-0 left-0 border-2 border-black"
                >
                  <Layer>
                    <KonvaImage 
                      image={holedImage} 
                      width={imageDimensions.width} 
                      height={imageDimensions.height} 
                    />
                  </Layer>
                </Stage>
              </div>

              {puzzle.pieces.map((piece) => {
                const pieceWidth = piece.widthRatio * imageDimensions.width;
                const pieceHeight = piece.heightRatio * imageDimensions.height;
                
                return (
                  <DraggablePiece
                    key={piece.id}
                    piece={piece}
                    width={pieceWidth}
                    height={pieceHeight}
                    position={piecePositions[piece.id]}
                    onDragStop={(e, data) => handlePieceDrag(e, data, piece)}
                    isPlaced={placedPieces.has(piece.id)}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PuzzlePlayPage;
