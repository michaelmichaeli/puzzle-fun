"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { Puzzle } from "@/types/puzzle";
import DraggablePiece from "@/app/components/DraggablePiece";
import BackButton from "@/app/components/BackButton";
import { DISPLAY_WIDTH, DISPLAY_HEIGHT, calculateImageDimensions } from "@/app/constants/dimensions";

const PuzzlePlayPage = () => {
  const { id } = useParams(); // ✅ Get puzzle ID from URL
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [holedImage, setHoledImage] = useState<HTMLImageElement | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT });

  useEffect(() => {
    const savedPuzzles = JSON.parse(localStorage.getItem("puzzles") || "[]");
    const selectedPuzzle = savedPuzzles.find((p: Puzzle) => p.id === id);

    if (selectedPuzzle) {
      setPuzzle(selectedPuzzle);

      // ✅ Load holed image properly
      const img = new window.Image();
      img.src = selectedPuzzle.holedImage;
      img.onload = () => {
        const dimensions = calculateImageDimensions(img.width, img.height);
        setImageDimensions(dimensions);
        setHoledImage(img);
      };
    }
  }, [id]);

  return (
    <div style={{ 
      position: "relative", 
      minHeight: "100vh",
      width: "100%",
      overflow: "hidden" // Prevent scrollbars
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
        <div style={{
          position: "relative",
          width: "100%",
          height: imageDimensions.height + 100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{ 
            position: "relative",
            width: imageDimensions.width, 
            height: imageDimensions.height,
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
          }}>
          {/* Puzzle Board (Holed Image) */}
          <Stage 
            width={imageDimensions.width} 
            height={imageDimensions.height} 
            style={{ border: "2px solid black" }}
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
          </div>

          {/* Render Draggable Pieces relative to outer container */}
          {puzzle.pieces.map((piece) => {
            const pieceWidth = piece.widthRatio * imageDimensions.width;
            const pieceHeight = piece.heightRatio * imageDimensions.height;
            
            // Randomly choose left or right side
            const isLeftSide = Math.random() < 0.5;
            
            // Calculate X position with controlled spacing
            const sideOffset = imageDimensions.width * 0.3; // 30% of image width for side spacing
            const randomSpread = imageDimensions.width * 0.15; // 15% of image width for random spread
            
            const randomX = isLeftSide 
              ? -sideOffset + (Math.random() * randomSpread)
              : imageDimensions.width + (Math.random() * randomSpread);
            
            // Calculate Y position with better vertical distribution
            // Divide the height into sections to ensure more even distribution
            const section = Math.floor(Math.random() * 4); // 4 sections
            const sectionHeight = imageDimensions.height / 4;
            const randomY = (section * sectionHeight) + (Math.random() * sectionHeight - pieceHeight/2);

            return (
              <DraggablePiece
                key={piece.id}
                piece={piece}
                width={pieceWidth}
                height={pieceHeight}
                initialPosition={{ x: randomX, y: randomY }}
              />
            );
          })}
        </div>
      ) : (
        <h2>Loading puzzle...</h2>
      )}
      </div>
    </div>
  );
};

export default PuzzlePlayPage;
