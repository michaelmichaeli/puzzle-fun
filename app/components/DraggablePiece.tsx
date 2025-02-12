"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { PieceData } from "@/types/puzzle";

interface DraggablePieceProps {
  piece: PieceData;
  onDrag: (id: number, x: number, y: number) => void;
  position: { x: number; y: number };
  isNearTarget?: boolean;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({
  piece,
  onDrag,
  position,
  isNearTarget = false
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

  const handleDrag = useCallback((_: DraggableEvent, data: DraggableData) => {
    onDrag(piece.id, data.x, data.y);
  }, [piece.id, onDrag]);

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
        className="touch-none"
        style={{
          position: 'absolute',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none',
          zIndex: isDragging ? 50 : 10,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: 'box-shadow 0.2s ease-in-out'
        }}
      >
        <div 
          className="relative transition-shadow duration-200 rounded-sm"
          style={{
            boxShadow: isNearTarget 
              ? '0 0 15px rgba(34,197,94,0.4)'
              : isDragging 
                ? '0 0 20px rgba(0,0,0,0.4)' 
                : 'none'
          }}
        >
          <canvas
            ref={canvasRef}
            width={piece.width}
            height={piece.height}
            style={{
              width: piece.width,
              height: piece.height,
              touchAction: 'none',
              WebkitTouchCallout: 'none'
            }}
          />
        </div>
      </div>
    </Draggable>
  );
};
