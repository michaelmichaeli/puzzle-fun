"use client";

import React, { MouseEvent } from "react";
import { usePuzzleEditor } from "../hooks/usePuzzleEditor";

interface PuzzleEditorProps {
  imageUrl: string;
}

const PuzzleEditor: React.FC<PuzzleEditorProps> = ({ imageUrl }) => {
  const {
    canvasRef,
    pieces,
    handleMouseMove,
    handleClick,
    breakImage
  } = usePuzzleEditor({ imageUrl });

  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    handleMouseMove(e.nativeEvent);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        onMouseMove={onMouseMove}
        onClick={handleClick}
        style={{ cursor: 'crosshair' }}
      />
      <button 
        onClick={breakImage}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Break Image
      </button>
      <div className="absolute top-0 left-0">
        {pieces.map(piece => (
          <canvas
            key={piece.id}
            style={{
              position: 'absolute',
              left: piece.x,
              top: piece.y,
              width: piece.width,
              height: piece.height,
              border: '1px solid white',
            }}
            width={piece.width}
            height={piece.height}
            ref={el => {
              if (el) {
                const ctx = el.getContext('2d');
                if (ctx) ctx.drawImage(piece.image, 0, 0);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PuzzleEditor;
