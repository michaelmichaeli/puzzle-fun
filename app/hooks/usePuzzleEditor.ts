import { useState, useEffect, useRef, useCallback } from "react";

interface Point {
  x: number;
  y: number;
}

interface Lines {
  horizontal: number[];
  vertical: number[];
}

interface Piece {
  id: number;
  image: HTMLCanvasElement;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UsePuzzleEditorProps {
  imageUrl: string;
}

export const usePuzzleEditor = ({ imageUrl }: UsePuzzleEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
  const [lines, setLines] = useState<Lines>({ horizontal: [], vertical: [] });
  const [pieces, setPieces] = useState<Piece[]>([]);
  console.log("🚀 ~ usePuzzleEditor ~ pieces:", pieces)

  const drawLines = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!image) return;

    // Clear the canvas and redraw the image
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(image, 0, 0);

    // Draw existing lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    // Draw horizontal lines
    lines.horizontal.forEach(y => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    });

    // Draw vertical lines
    lines.vertical.forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    });

    // Draw hover guidelines if hovering
    if (hoverPoint) {
      ctx.strokeStyle = '#00ff00';
      ctx.setLineDash([5, 5]);

      // Horizontal guideline
      ctx.beginPath();
      ctx.moveTo(0, hoverPoint.y);
      ctx.lineTo(ctx.canvas.width, hoverPoint.y);
      ctx.stroke();

      // Vertical guideline
      ctx.beginPath();
      ctx.moveTo(hoverPoint.x, 0);
      ctx.lineTo(hoverPoint.x, ctx.canvas.height);
      ctx.stroke();

      ctx.setLineDash([]);
    }
  }, [image, lines, hoverPoint]);

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        setImage(img);
        if (canvasRef.current) {
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            drawLines(ctx);
          }
        }
      };
    }
  }, [imageUrl]);

  // Handle drawing whenever relevant state changes
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      drawLines(ctx);
    }
  }, [drawLines, image, lines, hoverPoint]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setHoverPoint({ x, y });
  }, []);

  const handleClick = useCallback(() => {
    if (!hoverPoint || !image) return;

    setLines(prev => ({
      horizontal: [...prev.horizontal, hoverPoint.y].sort((a, b) => a - b),
      vertical: [...prev.vertical, hoverPoint.x].sort((a, b) => a - b),
    }));
  }, [hoverPoint, image]);

  const breakImage = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const { horizontal, vertical } = lines;
    const newPieces: Piece[] = [];
    let id = 0;

    // Add image boundaries
    const allVertical = [0, ...vertical, image.width];
    const allHorizontal = [0, ...horizontal, image.height];

    // Create pieces from grid
    for (let i = 0; i < allVertical.length - 1; i++) {
      for (let j = 0; j < allHorizontal.length - 1; j++) {
        const x = allVertical[i];
        const y = allHorizontal[j];
        const width = allVertical[i + 1] - x;
        const height = allHorizontal[j + 1] - y;

        // Create a canvas for this piece
        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = width;
        pieceCanvas.height = height;
        const pieceCtx = pieceCanvas.getContext('2d');

        if (pieceCtx) {
          // Draw the portion of the image for this piece
          pieceCtx.drawImage(
            image,
            x, y, width, height,
            0, 0, width, height
          );

          newPieces.push({
            id: id++,
            image: pieceCanvas,
            x,
            y,
            width,
            height,
          });
        }
      }
    }

    setPieces(newPieces);
  }, [image, lines]);

  return {
    canvasRef,
    image,
    pieces,
    handleMouseMove,
    handleClick,
    breakImage,
  };
};
