"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { PieceData } from "@/types/puzzle";

interface DraggablePieceProps {
  piece: PieceData;
  onDrag: (id: number, x: number, y: number) => void;
  position: { x: number; y: number };
  isNearTarget?: boolean;
  animate?: boolean;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({
  piece,
  onDrag,
  position,
  isNearTarget = false,
  animate = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDrag = useCallback(
    (_: DraggableEvent, data: DraggableData) => {
      onDrag(piece.id, data.x, data.y);
    },
    [piece.id, onDrag],
  );

  const handleStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <Draggable
      position={position}
      onDrag={handleDrag}
      onStart={handleStart}
      onStop={handleStop}
      bounds="parent"
      nodeRef={dragRef}
      defaultClassName="touch-none"
    >
      <div
        ref={dragRef}
        className={`absolute touch-none select-none
          ${isDragging ? "z-50 cursor-grabbing" : "z-10 cursor-grab"}
          ${animate ? "transition-transform duration-500 ease-in-out" : ""}`}
        style={{
          touchAction: "none",
        }}
      >
        <div
          className={`relative transition-shadow duration-200 rounded-sm
            ${
              isNearTarget
                ? "shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                : isDragging
                  ? "shadow-[0_0_20px_rgba(0,0,0,0.4)]"
                  : ""
            }`}
        >
          <canvas
            ref={canvasRef}
            width={piece.width}
            height={piece.height}
            className="touch-none"
            style={{
              width: piece.width,
              height: piece.height,
              WebkitTouchCallout: "none",
            }}
          />
        </div>
      </div>
    </Draggable>
  );
};
