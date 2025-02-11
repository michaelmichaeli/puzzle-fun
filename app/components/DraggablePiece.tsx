"use client";
import React, { useRef, useEffect } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { PieceData } from "@/types/puzzle";

interface DraggablePieceProps {
  piece: PieceData;
  onDrag: (id: number, x: number, y: number) => void;
  position: { x: number; y: number };
  isPartOfGroup: boolean;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({
  piece,
  onDrag,
  position,
  isPartOfGroup
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !piece.imageSrc) return;

    const img = new Image();
    img.src = piece.imageSrc;
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, piece.width, piece.height);
      }
    };
  }, [piece]);

  const handleDrag = (_: DraggableEvent, data: DraggableData) => {
    onDrag(piece.id, data.x, data.y);
  };

  return (
    <Draggable
      position={position}
      onDrag={handleDrag}
      bounds="parent"
    >
      <canvas
        ref={canvasRef}
        width={piece.width}
        height={piece.height}
        className={`absolute cursor-grab hover:z-10 ${
          isPartOfGroup ? "shadow-lg" : ""
        }`}
        style={{
          width: piece.width,
          height: piece.height,
          border: isPartOfGroup ? "2px solid #4CAF50" : "1px solid rgba(255,255,255,0.2)",
          transition: "border 0.3s ease"
        }}
      />
    </Draggable>
  );
};
