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
  const dragRef = useRef<HTMLDivElement>(null);

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
      nodeRef={dragRef}
    >
      <div
        ref={dragRef}
        className={`absolute transition-transform duration-150 ease-out ${
          isPartOfGroup ? "z-20" : "z-10 hover:z-20"
        }`}
      >
        <div
          className={`relative transition-all duration-200 ${
            isPartOfGroup 
              ? "scale-[1.001] shadow-lg ring-2 ring-green-500" 
              : "hover:scale-[1.02] hover:shadow-xl"
          }`}
        >
          <canvas
            ref={canvasRef}
            width={piece.width}
            height={piece.height}
            className="cursor-grab active:cursor-grabbing touch-none"
            style={{
              width: piece.width,
              height: piece.height,
            }}
          />
        </div>
      </div>
    </Draggable>
  );
};
