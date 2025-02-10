'use client';

import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image, Line } from "react-konva";

interface PuzzleEditorProps {
  imageUrl: string;
}

interface LineData {
  points: number[];
}

const PuzzleEditor: React.FC<PuzzleEditorProps> = ({ imageUrl }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [lines, setLines] = useState<LineData[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const imageRef = useRef<any>(null);

  // Load the image when the component mounts or imageUrl changes
  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.crossOrigin = "Anonymous"; // Ensure CORS compatibility
    img.onload = () => setImage(img);
  }, [imageUrl]);

  // Start drawing
  const handleMouseDown = (e: any) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines((prevLines) => [...prevLines, { points: [pos.x, pos.y] }]);
  };

  // Continue drawing
  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setLines((prevLines) => {
      const lastLine = prevLines[prevLines.length - 1];
      lastLine.points = [...lastLine.points, point.x, point.y];
      return [...prevLines.slice(0, -1), lastLine];
    });
  };

  // Stop drawing
  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <Stage
      width={500}
      height={500}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Layer>
        {image && (
          <Image
            ref={imageRef}
            image={image}
            x={50}
            y={50}
            width={400}
            height={400}
            clipFunc={(ctx) => {
              if (lines.length === 0) return;
              ctx.beginPath();
              lines.forEach((line) => {
                const points = line.points;
                if (points.length < 4) return;
                ctx.moveTo(points[0], points[1]);
                for (let i = 2; i < points.length; i += 2) {
                  ctx.lineTo(points[i], points[i + 1]);
                }
                ctx.closePath();
              });
              ctx.clip();
            }}
          />
        )}
        {/* Render drawn shapes */}
        {lines.map((line, i) => (
          <Line key={i} points={line.points} stroke="red" strokeWidth={2} />
        ))}
      </Layer>
    </Stage>
  );
};

export default PuzzleEditor;
