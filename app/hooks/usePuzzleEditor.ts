import { useState, useRef, useEffect } from "react";
import type Konva from "konva";
import { COMPRESSION_QUALITY, MAX_PIECE_SIZE } from "@/app/constants/dimensions";
import { compressImage, compressImageUrl, scaleDownCanvas, getBoundingBox } from "@/app/utils/imageUtils";
import type { PieceData } from "@/types/puzzle";

interface LineData {
  points: number[];
}

interface UsePuzzleEditorProps {
  imageUrl: string;
}

export const usePuzzleEditor = ({ imageUrl }: UsePuzzleEditorProps) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [canvasImage, setCanvasImage] = useState<HTMLImageElement | null>(null);
  const [lines, setLines] = useState<LineData[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [cutShapes, setCutShapes] = useState<LineData[]>([]);
  const [pieces, setPieces] = useState<PieceData[]>([]);
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

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    setIsDrawing(true);
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos || !stage) return;

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

    const points = lines.flatMap(l => l.points);
    const bounds = getBoundingBox(points);

    const pieceCanvas = document.createElement("canvas");
    pieceCanvas.width = bounds.width;
    pieceCanvas.height = bounds.height;

    const pieceCtx = pieceCanvas.getContext("2d");
    if (!pieceCtx) return;

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

    const finalCanvas = scaleDownCanvas(pieceCanvas, MAX_PIECE_SIZE);
    const pieceImage = new window.Image();
    pieceImage.src = finalCanvas.toDataURL("image/png", COMPRESSION_QUALITY);

    const newPiece: PieceData = {
      id: pieceIdRef.current++,
      imageSrc: pieceImage.src,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      widthRatio: bounds.width / image.width,
      heightRatio: bounds.height / image.height,
      shapePath: points,
    };

    setPieces((prev) => [...prev, newPiece]);
  };

  const savePuzzle = async () => {
    if (!image || !canvasImage) return null;

    const compressedOriginalImage = await compressImageUrl(imageUrl, COMPRESSION_QUALITY);
    const compressedHoledImage = compressImage(canvasImage, COMPRESSION_QUALITY);

    return {
      imageUrl: compressedOriginalImage,
      holedImage: compressedHoledImage,
      pieces,
      originalWidth: image.width,
      originalHeight: image.height,
    };
  };

  return {
    canvasImage,
    lines,
    pieces,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    savePuzzle,
  };
};
