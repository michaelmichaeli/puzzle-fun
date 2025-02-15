"use client";

import React from "react";
import { Piece } from "@/types/puzzle";
import { PlaySound } from "@/types/ui";

interface PuzzleEditorCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  handlePointerMove: (e: MouseEvent | TouchEvent) => void;
  handlePointerDown: (e: MouseEvent | TouchEvent) => boolean;
  pieces: Piece[];
  playDrawLine: PlaySound;
}

export function PuzzleEditorCanvas({
  canvasRef,
  handlePointerMove,
  handlePointerDown,
  pieces,
  playDrawLine
}: PuzzleEditorCanvasProps) {
  const handlePointerEvent = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const wasInvalid = handlePointerDown(e.nativeEvent);
    if (wasInvalid) {
      const wrapper = document.getElementById("canvas-wrapper");
      if (wrapper) {
        const prevClasses = wrapper.className;
        wrapper.className = `${prevClasses} animate-shake`;
        setTimeout(() => {
          wrapper.className = prevClasses;
        }, 200);
      }
    } else {
      playDrawLine();
    }
  };

  return (
    <div className="relative space-y-4">
      <div className="text-center text-white font-comic mb-4">
        {pieces.length === 0 ? (
          <>
            Click to add cutting lines •{" "}
            <span>Place lines to cut the image into pieces</span>
          </>
        ) : (
          <>
            Preview of puzzle pieces • <span>Click Reset Lines to modify</span>
          </>
        )}
      </div>
      <div
        id="puzzle-board"
        className="h-[70vh] p-6 bg-white rounded-2xl flex items-center justify-center relative group shadow-xl border-2 border-primary"
      >
        <div className="relative" id="canvas-wrapper">
          <canvas
            ref={canvasRef}
            onMouseMove={(e) => handlePointerMove(e.nativeEvent)}
            onClick={handlePointerEvent}
            onTouchStart={handlePointerEvent}
            onTouchMove={(e) => handlePointerMove(e.nativeEvent)}
            style={{
              touchAction: "none",
              cursor: "crosshair",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain"
            }}
          />
        </div>
      </div>
    </div>
  );
}
