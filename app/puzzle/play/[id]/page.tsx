"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { PieceData, Puzzle } from "@/types/puzzle";
import DraggablePiece from "@/app/components/DraggablePiece";
import BackButton from "@/app/components/BackButton";
import { DISPLAY_WIDTH, DISPLAY_HEIGHT, calculateImageDimensions, PIECE_PLACEMENT_THRESHOLD } from "@/app/constants/dimensions";
import { DraggableEvent, DraggableData } from "react-draggable";

const PuzzlePlayPage = () => {
  const { id } = useParams();
  const boardRef = useRef<HTMLDivElement>(null);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [holedImage, setHoledImage] = useState<HTMLImageElement | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT });
  const [placedPieces, setPlacedPieces] = useState<Set<number>>(new Set());

  useEffect(() => {
    const savedPuzzles = JSON.parse(localStorage.getItem("puzzles") || "[]");
    const selectedPuzzle = savedPuzzles.find((p: Puzzle) => p.id === id);

    if (selectedPuzzle) {
      setPuzzle(selectedPuzzle);

      const img = new window.Image();
      img.src = selectedPuzzle.holedImage;
      img.onload = () => {
        const dimensions = calculateImageDimensions(img.width, img.height);
        setImageDimensions(dimensions);
        setHoledImage(img);
      };
    }
  }, [id]);

  const handlePieceDragStop = (event: DraggableEvent, data: DraggableData, piece: PieceData) => {
    if (placedPieces.has(piece.id)) return;

    if (!holedImage) return;

    // Get the dragged element's bounding rect for its absolute position
    const node = data.node as HTMLElement;
    const pieceRect = node.getBoundingClientRect();
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    // Calculate center point of the piece relative to the board
    const pieceWidth = piece.widthRatio * imageDimensions.width;
    const pieceHeight = piece.heightRatio * imageDimensions.height;
    const currentX = pieceRect.left - boardRect.left + (pieceWidth / 2);
    const currentY = pieceRect.top - boardRect.top + (pieceHeight / 2);
    console.log("🚀 ~ handlePieceDragStop ~ piece center position:", currentX, currentY);

    // Get target position based on ratios
    const targetX = piece.xRatio * imageDimensions.width;
    const targetY = piece.yRatio * imageDimensions.height;
    console.log("🚀 ~ handlePieceDragStop ~ target position:", targetX, targetY);

    const distance = Math.sqrt(
      Math.pow(currentX - targetX, 2) + 
      Math.pow(currentY - targetY, 2)
    );
    console.log("🚀 ~ handlePieceDragStop ~ distance:", distance)

    if (distance <= PIECE_PLACEMENT_THRESHOLD) {
      setPlacedPieces(prev => {
        const newSet = new Set(prev);
        newSet.add(piece.id);
        return newSet;
      });
    }
  };

  return (
    <div style={{ 
      position: "relative", 
      minHeight: "100vh",
      width: "100%",
      overflow: "hidden"
    }}>
      <BackButton />
      <div style={{ 
        textAlign: "center", 
        padding: "20px",
        position: "relative",
        zIndex: 1
      }}>
        <h1>Puzzle {id}</h1>

      {puzzle && holedImage ? (
        <>
          <div style={{
            position: "relative",
            width: "100%",
            marginBottom: "20px"
          }}>
            {placedPieces.size === puzzle.pieces.length ? (
              <h2 style={{ color: "green" }}>🎉 Puzzle Complete! 🎉</h2>
            ) : (
              <h2>Pieces placed correctly: {placedPieces.size} / {puzzle.pieces.length}</h2>
            )}
          </div>

          <div style={{
            position: "relative",
            width: "100%",
            height: imageDimensions.height + 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <div 
              ref={boardRef}
              style={{ 
                position: "relative",
                width: imageDimensions.width, 
                height: imageDimensions.height,
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
              }}
            >

              <Stage 
                width={imageDimensions.width} 
                height={imageDimensions.height} 
                style={{ 
                  border: "2px solid black",
                  position: "absolute",
                  top: 0,
                  left: 0
                }}
              >
                <Layer>
                  <KonvaImage 
                    image={holedImage} 
                    x={0} 
                    y={0} 
                    width={imageDimensions.width} 
                    height={imageDimensions.height} 
                  />
                  </Layer>

              </Stage>
                  {puzzle.pieces.map((piece) => {
                const targetX = piece.xRatio * imageDimensions.width;
                const targetY = piece.yRatio * imageDimensions.height;
                const rawX = piece.x * (imageDimensions.width / holedImage.width);
                const rawY = piece.y * (imageDimensions.height / holedImage.height);
                return (
                  <>
                    {/* Target position (ratio-based) */}
                    <div
                      key={`target-${piece.id}`}
                      style={{
                        position: "absolute",
                        left: targetX - 1,
                        top: targetY - 1,
                        width: "20px",
                        height: "20px",
                        backgroundColor: "red",
                        zIndex: 10,
                        borderRadius: "50%"
                      }}
                    />
                    {/* Original position (pixel-based, scaled) */}
                    <div
                      key={`raw-${piece.id}`}
                      style={{
                        position: "absolute",
                        left: rawX - 1,
                        top: rawY - 1,
                        width: "20px",
                        height: "20px",
                        backgroundColor: "blue",
                        zIndex: 10,
                        borderRadius: "50%"
                      }}
                    />
                  </>
                );
              })}
            </div>

            {puzzle.pieces.map((piece) => {
              const pieceWidth = piece.widthRatio * imageDimensions.width;
              const pieceHeight = piece.heightRatio * imageDimensions.height;
              
              // Randomly choose left or right side
              const isLeftSide = Math.random() < 0.5;
              
              // Calculate X position with controlled spacing
              const sideOffset = imageDimensions.width * 0.3;
              const randomSpread = imageDimensions.width * 0.15;
              
              const randomX = isLeftSide 
                ? -sideOffset + (Math.random() * randomSpread)
                : imageDimensions.width + (Math.random() * randomSpread);
              
              // Calculate Y position with better vertical distribution
              const section = Math.floor(Math.random() * 4);
              const sectionHeight = imageDimensions.height / 4;
              const randomY = (section * sectionHeight) + (Math.random() * sectionHeight - pieceHeight/2);

              return (
                <DraggablePiece
                  key={piece.id}
                  piece={piece}
                  width={pieceWidth}
                  height={pieceHeight}
                  initialPosition={{ x: randomX, y: randomY }}
                  onDragStop={handlePieceDragStop}
                  isPlaced={placedPieces.has(piece.id)}
                />
              );
            })}
              
              

          </div>
        </>
      ) : (
        <h2>Loading puzzle...</h2>
      )}
      </div>
    </div>
  );
};

export default PuzzlePlayPage;
