"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { Stage, Layer, Image, Line } from "react-konva";
import { calculateImageDimensions } from "@/app/constants/dimensions";
import { usePuzzleEditor } from "@/app/hooks/usePuzzleEditor";

interface PuzzleEditorProps {
  imageUrl: string;
}

const PuzzleEditor: React.FC<PuzzleEditorProps> = ({ imageUrl }) => {
  const router = useRouter();
  const stageRef = useRef(null);
  
  const {
    canvasImage,
    lines,
    pieces,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    savePuzzle,
  } = usePuzzleEditor({ imageUrl });

  const displayDimensions = canvasImage 
    ? calculateImageDimensions(canvasImage.width, canvasImage.height)
    : { width: 0, height: 0, scaleFactors: { x: 1, y: 1 } };

  const handleSavePuzzle = async () => {
    const puzzleData = await savePuzzle();
    if (!puzzleData) return;

    const puzzleId = `puzzle-${Date.now()}`;
    const puzzle = {
      id: puzzleId,
      createdAt: new Date().toISOString(),
      ...puzzleData,
    };

    const existingPuzzles = JSON.parse(localStorage.getItem("puzzles") || "[]");
    localStorage.setItem("puzzles", JSON.stringify([...existingPuzzles, puzzle]));

    router.push(`/puzzle/play/${puzzleId}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <Stage
        ref={stageRef}
        width={displayDimensions.width}
        height={displayDimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="border border-gray-300 rounded-lg overflow-hidden"
      >
        <Layer>
          {canvasImage && (
            <Image
              image={canvasImage}
              width={displayDimensions.width}
              height={displayDimensions.height}
            />
          )}
          {lines.map((line, i) => {
            const scale = displayDimensions.scaleFactors.x;
            const scaledPoints = line.points.map(point => point * scale);
            return (
              <Line 
                key={i} 
                points={scaledPoints} 
                stroke="red" 
                strokeWidth={2} 
              />
            );
          })}
        </Layer>
      </Stage>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Cut-Out Pieces:</h2>
        <div className="flex gap-4 flex-wrap">
          {pieces.map((piece) => (
            <img
              key={piece.id}
              src={piece.imageSrc}
              alt={`Piece ${piece.id}`}
              className="w-24 h-20 object-contain border border-gray-200 rounded-md"
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleSavePuzzle}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Save & Play
      </button>
    </div>
  );
};

export default PuzzleEditor;
