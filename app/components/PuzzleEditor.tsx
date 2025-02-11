"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Stage, Layer, Image, Line } from "react-konva";
import type Konva from "konva";
import { DISPLAY_WIDTH, DISPLAY_HEIGHT, COMPRESSION_QUALITY, MAX_PIECE_SIZE, calculateImageDimensions } from "@/app/constants/dimensions";

interface PuzzleEditorProps {
  imageUrl: string;
}

interface LineData {
  points: number[];
}

interface PieceData {
  id: number;
  imageSrc: string;
  x: number;  // Original position X where piece was cut from (in original image coordinates)
  y: number;  // Original position Y where piece was cut from (in original image coordinates)
  width: number;
  height: number;
  widthRatio: number;  // For piece sizing only
  heightRatio: number; // For piece sizing only
  shapePath: number[];
}

interface PuzzleData {
  id: string;
  imageUrl: string;
  createdAt: string;
  holedImage: string;
  pieces: PieceData[];
  originalWidth: number;
  originalHeight: number;
}

const PuzzleEditor: React.FC<PuzzleEditorProps> = ({ imageUrl }) => {
  const router = useRouter();
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [canvasImage, setCanvasImage] = useState<HTMLImageElement | null>(null);
  const [lines, setLines] = useState<LineData[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [cutShapes, setCutShapes] = useState<LineData[]>([]);
  const [pieces, setPieces] = useState<PieceData[]>([]);
  const stageRef = useRef<Konva.Stage>(null);
  const pieceIdRef = useRef<number>(0);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      setImage(img);
      setCanvasImage(img);
    };
  }, [imageUrl]);

  // We don't scale points anymore, store original coordinates
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    setIsDrawing(true);
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos || !stage) return;

    // Convert to original image coordinates
    const scale = stage.width() / (image?.width || 1);
    const originalX = pos.x / scale;
    const originalY = pos.y / scale;
    
    setLines([...lines, { points: [originalX, originalY] }]);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point || !stage) return;

    // Convert to original image coordinates
    const scale = stage.width() / (image?.width || 1);
    const originalX = point.x / scale;
    const originalY = point.y / scale;
    
    setLines((prevLines) => {
      const lastLine = prevLines[prevLines.length - 1];
      lastLine.points = [...lastLine.points, originalX, originalY];
      return [...prevLines.slice(0, -1), lastLine];
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (image) {
      setCutShapes([...cutShapes, ...lines]);
      applyCut([...cutShapes, ...lines]);
    }
  };

  const applyCut = (allCuts: LineData[]) => {
    if (!image) return;

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(image, 0, 0, image.width, image.height);
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)";

    // The points are already in original coordinates
    allCuts.forEach((line) => {
      ctx.beginPath();
      if (line.points.length < 4) return;
      
      ctx.moveTo(line.points[0], line.points[1]);
      for (let i = 2; i < line.points.length; i += 2) {
        ctx.lineTo(line.points[i], line.points[i + 1]);
      }
      ctx.closePath();
      ctx.fill();
    });

    const newImage = new window.Image();
    newImage.src = canvas.toDataURL("image/jpeg", COMPRESSION_QUALITY);
    newImage.onload = () => {
      setCanvasImage(newImage);
      setLines([]);
    };

    savePiece(lines);
  };

  const savePiece = (lines: LineData[]) => {
    if (!image) return;

    const points = lines.flatMap(l => l.points); // Points are already in original coordinates
    const bounds = getBoundingBox(points);

    const pieceCanvas = document.createElement("canvas");
    pieceCanvas.width = bounds.width;
    pieceCanvas.height = bounds.height;

    const pieceCtx = pieceCanvas.getContext("2d");
    if (!pieceCtx) return;

    pieceCtx.clearRect(0, 0, bounds.width, bounds.height);

    pieceCtx.drawImage(
      image,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      0,
      0,
      bounds.width,
      bounds.height
    );

    pieceCtx.globalCompositeOperation = "destination-in";
    pieceCtx.fillStyle = "rgba(0,0,0,1)";

    lines.forEach((line) => {
      pieceCtx.beginPath();
      const adjustedPoints = line.points.map((point, index) =>
        index % 2 === 0 ? point - bounds.x : point - bounds.y
      );
      
      if (adjustedPoints.length < 4) return;
      pieceCtx.moveTo(adjustedPoints[0], adjustedPoints[1]);
      for (let i = 2; i < adjustedPoints.length; i += 2) {
        pieceCtx.lineTo(adjustedPoints[i], adjustedPoints[i + 1]);
      }
      pieceCtx.closePath();
      pieceCtx.fill();
    });

    // Scale down large pieces
    const finalCanvas = scaleDownCanvas(pieceCanvas, MAX_PIECE_SIZE);

    const pieceImage = new window.Image();
    // Need PNG here to preserve transparency
    pieceImage.src = finalCanvas.toDataURL("image/png", COMPRESSION_QUALITY);

    // Store original coordinates
    const newPiece: PieceData = {
      id: pieceIdRef.current++,
      imageSrc: pieceImage.src,
      x: bounds.x,  // Original x in image coordinates
      y: bounds.y,  // Original y in image coordinates
      width: bounds.width,
      height: bounds.height,
      widthRatio: bounds.width / image.width,
      heightRatio: bounds.height / image.height,
      shapePath: points,  // Original points
    };

    setPieces((prev) => [...prev, newPiece]);
  };

  const scaleDownCanvas = (canvas: HTMLCanvasElement, maxSize: number): HTMLCanvasElement => {
    const scale = Math.min(
      maxSize / canvas.width,
      maxSize / canvas.height,
      1 // Don't scale up, only down
    );

    if (scale >= 1) return canvas;

    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = canvas.width * scale;
    scaledCanvas.height = canvas.height * scale;
    
    const ctx = scaledCanvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(
        canvas,
        0,
        0,
        canvas.width,
        canvas.height,
        0,
        0,
        scaledCanvas.width,
        scaledCanvas.height
      );
    }

    return scaledCanvas;
  };

  const compressImage = (source: HTMLCanvasElement | HTMLImageElement, quality: number): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return "";

    canvas.width = source.width;
    canvas.height = source.height;
    ctx.drawImage(source, 0, 0, source.width, source.height);

    return canvas.toDataURL("image/jpeg", quality);
  };

  const compressImageUrl = (
    imageUrl: string,
    quality: number
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return reject("Canvas context not available");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.onerror = () => reject("Failed to load image");
    });
  };

  const getBoundingBox = (points: number[]) => {
    const xVals = points.filter((_, i) => i % 2 === 0);
    const yVals = points.filter((_, i) => i % 2 !== 0);
    
    const bounds = {
      x: Math.min(...xVals),
      y: Math.min(...yVals),
      width: Math.max(...xVals) - Math.min(...xVals),
      height: Math.max(...yVals) - Math.min(...yVals),
    };

    return bounds;
  };

  const savePuzzle = async () => {
    if (!image || !canvasImage) return;

    const puzzleId = `puzzle-${Date.now()}`;

    const compressedOriginalImage = await compressImageUrl(imageUrl, COMPRESSION_QUALITY);
    const compressedHoledImage = compressImage(canvasImage, COMPRESSION_QUALITY);

    const puzzle: PuzzleData = {
      id: puzzleId,
      imageUrl: compressedOriginalImage,
      createdAt: new Date().toISOString(),
      holedImage: compressedHoledImage,
      pieces,
      originalWidth: image.width,
      originalHeight: image.height
    };

    const existingPuzzles = JSON.parse(localStorage.getItem("puzzles") || "[]");
    existingPuzzles.push(puzzle);
    localStorage.setItem("puzzles", JSON.stringify(existingPuzzles));

    alert("Puzzle saved!");
    router.push(`/puzzle/play/${puzzleId}`);
  };

  const displayDimensions = image 
    ? calculateImageDimensions(image.width, image.height)
    : { width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT };

  return (
    <div>
      <Stage
        ref={stageRef}
        width={displayDimensions.width}
        height={displayDimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
            // Convert points back to display scale for drawing
            const scale = displayDimensions.width / (image?.width || 1);
            const scaledPoints = line.points.map((point, index) => point * scale);
            return (
              <Line key={i} points={scaledPoints} stroke="red" strokeWidth={2} />
            );
          })}
        </Layer>
      </Stage>

      <h2>Cut-Out Pieces:</h2>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {pieces.map((piece) => (
          <img
            key={piece.id}
            src={piece.imageSrc}
            alt={`Piece ${piece.id}`}
            width={100}
            height={75}
          />
        ))}
      </div>

      <button
        onClick={savePuzzle}
        style={{
          marginTop: "20px",
          padding: "10px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Save & Play
      </button>
    </div>
  );
};

export default PuzzleEditor;
