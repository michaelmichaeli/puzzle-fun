import { useState, useEffect, useRef, useCallback } from "react";
import {
  PieceConnection,
  Point,
  Lines,
  Piece,
  UsePuzzleEditorProps
} from "@/types/puzzle";

export const usePuzzleEditor = ({ imageUrl }: UsePuzzleEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
  const [lines, setLines] = useState<Lines>({ horizontal: [], vertical: [] });
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [scale, setScale] = useState(1);
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const drawLines = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!image || !originalDimensions) return;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;

      lines.horizontal.forEach((y) => {
        const scaledY = y * scale;
        ctx.beginPath();
        ctx.moveTo(0, scaledY);
        ctx.lineTo(ctx.canvas.width, scaledY);
        ctx.stroke();
      });

      lines.vertical.forEach((x) => {
        const scaledX = x * scale;
        ctx.beginPath();
        ctx.moveTo(scaledX, 0);
        ctx.lineTo(scaledX, ctx.canvas.height);
        ctx.stroke();
      });

      if (hoverPoint) {
        const x = (hoverPoint.x / ctx.canvas.width) * originalDimensions.width;
        const y =
          (hoverPoint.y / ctx.canvas.height) * originalDimensions.height;

        const threshold = originalDimensions.width * 0.03;
        const edgeThreshold = threshold;
        const isTooCloseToEdge =
          x < edgeThreshold ||
          x > originalDimensions.width - edgeThreshold ||
          y < edgeThreshold ||
          y > originalDimensions.height - edgeThreshold;

        const nearestVertical = lines.vertical.reduce((nearest, vx) => {
          const dist = Math.abs(vx - x);
          return dist < Math.abs(nearest - x) ? vx : nearest;
        }, x);

        const nearestHorizontal = lines.horizontal.reduce((nearest, vy) => {
          const dist = Math.abs(vy - y);
          return dist < Math.abs(nearest - y) ? vy : nearest;
        }, y);

        const existingVertical = Math.abs(nearestVertical - x) < threshold;
        const existingHorizontal = Math.abs(nearestHorizontal - y) < threshold;

        if (isTooCloseToEdge || existingVertical || existingHorizontal) {
          ctx.strokeStyle = "rgb(239 68 68)";
          ctx.fillStyle = "rgba(239, 68, 68, 0.1)";
          ctx.setLineDash([5, 5]);

          if (existingVertical) {
            const nearX = nearestVertical * scale;
            ctx.fillRect(
              nearX - (threshold * scale) / 2,
              0,
              threshold * scale,
              ctx.canvas.height
            );
          }
          if (existingHorizontal) {
            const nearY = nearestHorizontal * scale;
            ctx.fillRect(
              0,
              nearY - (threshold * scale) / 2,
              ctx.canvas.width,
              threshold * scale
            );
          }

          if (isTooCloseToEdge) {
            ctx.fillRect(0, 0, ctx.canvas.width, edgeThreshold * scale);
            ctx.fillRect(
              0,
              ctx.canvas.height - edgeThreshold * scale,
              ctx.canvas.width,
              edgeThreshold * scale
            );
            ctx.fillRect(0, 0, edgeThreshold * scale, ctx.canvas.height);
            ctx.fillRect(
              ctx.canvas.width - edgeThreshold * scale,
              0,
              edgeThreshold * scale,
              ctx.canvas.height
            );
          }

          ctx.beginPath();
          ctx.moveTo(0, hoverPoint.y);
          ctx.lineTo(ctx.canvas.width, hoverPoint.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(hoverPoint.x, 0);
          ctx.lineTo(hoverPoint.x, ctx.canvas.height);
          ctx.stroke();

          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = "rgb(34 197 94)";
          ctx.setLineDash([5, 5]);

          ctx.beginPath();
          ctx.moveTo(0, hoverPoint.y);
          ctx.lineTo(ctx.canvas.width, hoverPoint.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(hoverPoint.x, 0);
          ctx.lineTo(hoverPoint.x, ctx.canvas.height);
          ctx.stroke();

          ctx.setLineDash([]);
        }
      }
    },
    [image, lines, hoverPoint, scale, originalDimensions]
  );

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        setImage(img);
        setOriginalDimensions({ width: img.width, height: img.height });

        if (canvasRef.current) {
          const container = document.getElementById("puzzle-board");
          if (container) {
            const containerWidth = container.clientWidth - 32;
            const containerHeight = container.clientHeight - 32;
            const newScale = Math.min(
              containerWidth / img.width,
              containerHeight / img.height
            );
            setScale(newScale);

            canvasRef.current.width = img.width * newScale;
            canvasRef.current.height = img.height * newScale;
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              ctx.drawImage(
                img,
                0,
                0,
                img.width * newScale,
                img.height * newScale
              );
              drawLines(ctx);
            }
          }
        }
      };
    }
  }, [imageUrl, drawLines]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && image) {
      drawLines(ctx);
    }
  }, [drawLines, image, lines, hoverPoint, scale]);

  const handlePointerMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !image || !originalDimensions) return;

      const rect = canvas.getBoundingClientRect();
      let clientX: number;
      let clientY: number;

      if (event instanceof MouseEvent) {
        clientX = event.clientX;
        clientY = event.clientY;
      } else {
        const touch = event.touches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      }

      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);

      if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        setHoverPoint({ x, y });
      } else {
        setHoverPoint(null);
      }
    },
    [image, originalDimensions]
  );

  const handlePointerDown = useCallback(
    (_event: MouseEvent | TouchEvent) => {
      if (!hoverPoint || !image || !originalDimensions || !canvasRef.current)
        return false;

      const x =
        (hoverPoint.x / canvasRef.current.width) * originalDimensions.width;
      const y =
        (hoverPoint.y / canvasRef.current.height) * originalDimensions.height;

      const threshold = originalDimensions.width * 0.03;
      const existingVertical = lines.vertical.find(
        (vx) => Math.abs(vx - x) < threshold
      );
      const existingHorizontal = lines.horizontal.find(
        (vy) => Math.abs(vy - y) < threshold
      );

      const edgeThreshold = threshold;
      const isTooCloseToEdge =
        x < edgeThreshold ||
        x > originalDimensions.width - edgeThreshold ||
        y < edgeThreshold ||
        y > originalDimensions.height - edgeThreshold;

      const isValid =
        !isTooCloseToEdge && (!existingVertical || !existingHorizontal);
      if (isValid) {
        setLines((prev) => ({
          horizontal: existingHorizontal
            ? prev.horizontal
            : [...prev.horizontal, y].sort((a, b) => a - b),
          vertical: existingVertical
            ? prev.vertical
            : [...prev.vertical, x].sort((a, b) => a - b)
        }));
      }
      return !isValid;
    },
    [hoverPoint, image, originalDimensions, lines]
  );

  const calculateConnections = (
    row: number,
    col: number,
    totalRows: number,
    totalCols: number
  ): PieceConnection => {
    return {
      top: row > 0 ? (row - 1) * totalCols + col : undefined,
      right: col < totalCols - 1 ? row * totalCols + (col + 1) : undefined,
      bottom: row < totalRows - 1 ? (row + 1) * totalCols + col : undefined,
      left: col > 0 ? row * totalCols + (col - 1) : undefined
    };
  };

  const breakImage = useCallback(() => {
    if (!image || !canvasRef.current || !originalDimensions) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = originalDimensions.width;
    tempCanvas.height = originalDimensions.height;
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) return;
    tempCtx.drawImage(image, 0, 0);

    const { horizontal, vertical } = lines;
    const newPieces: Piece[] = [];
    let id = 0;

    const allVertical = [
      0,
      ...vertical.filter((x) => x >= 0 && x <= originalDimensions.width),
      originalDimensions.width
    ];
    const allHorizontal = [
      0,
      ...horizontal.filter((y) => y >= 0 && y <= originalDimensions.height),
      originalDimensions.height
    ];

    const totalRows = allHorizontal.length - 1;
    const totalCols = allVertical.length - 1;

    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < totalCols; col++) {
        const x = allVertical[col];
        const y = allHorizontal[row];
        const width = allVertical[col + 1] - x;
        const height = allHorizontal[row + 1] - y;

        const pieceCanvas = document.createElement("canvas");
        pieceCanvas.width = width;
        pieceCanvas.height = height;
        const pieceCtx = pieceCanvas.getContext("2d");

        if (pieceCtx) {
          pieceCtx.drawImage(
            tempCanvas,
            x,
            y,
            width,
            height,
            0,
            0,
            width,
            height
          );

          const connections = calculateConnections(
            row,
            col,
            totalRows,
            totalCols
          );

          newPieces.push({
            id,
            image: pieceCanvas,
            x,
            y,
            width,
            height,
            connections,
            gridPosition: { row, col }
          });
          id++;
        }
      }
    }

    setPieces(newPieces);
  }, [image, lines, originalDimensions]);

  const resetLines = useCallback(() => {
    setLines({ horizontal: [], vertical: [] });
    setPieces([]);
  }, []);

  return {
    canvasRef,
    image,
    pieces,
    lines,
    handlePointerMove,
    handlePointerDown,
    breakImage,
    resetLines
  };
};
