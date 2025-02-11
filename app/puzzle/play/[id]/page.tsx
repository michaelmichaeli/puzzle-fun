"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { Puzzle } from "@/types/puzzle";
import DraggablePiece from "@/app/components/DraggablePiece";
import BackButton from "@/app/components/BackButton";

const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 600;

const PuzzlePlayPage = () => {
  const { id } = useParams(); // ✅ Get puzzle ID from URL
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [holedImage, setHoledImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const savedPuzzles = JSON.parse(localStorage.getItem("puzzles") || "[]");
    const selectedPuzzle = savedPuzzles.find((p: Puzzle) => p.id === id);

    if (selectedPuzzle) {
      setPuzzle(selectedPuzzle);

      // ✅ Load holed image properly
      const img = new window.Image();
      img.src = selectedPuzzle.holedImage;
      img.onload = () => setHoledImage(img);
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
          height: IMAGE_HEIGHT + 100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{ 
            position: "relative",
            width: IMAGE_WIDTH, 
            height: IMAGE_HEIGHT,
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
          }}>
          {/* Puzzle Board (Holed Image) */}
          <Stage width={IMAGE_WIDTH} height={IMAGE_HEIGHT} style={{ border: "2px solid black" }}>
            <Layer>
              <KonvaImage image={holedImage} x={0} y={0} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} />
            </Layer>
          </Stage>
          </div>

          {/* Render Draggable Pieces relative to outer container */}
          {puzzle.pieces.map((piece) => {
            const pieceWidth = piece.widthRatio * IMAGE_WIDTH;
            const pieceHeight = piece.heightRatio * IMAGE_HEIGHT;
            
            // Randomly choose left or right side
            const isLeftSide = Math.random() < 0.5;
            
            // Calculate X position with controlled spacing
            const sideOffset = 250; // Distance from puzzle edge
            const randomSpread = 150; // Random spread within the side area
            
            const randomX = isLeftSide 
              ? -sideOffset + (Math.random() * randomSpread)
              : IMAGE_WIDTH + (Math.random() * randomSpread);
            
            // Calculate Y position with better vertical distribution
            // Divide the height into sections to ensure more even distribution
            const section = Math.floor(Math.random() * 4); // 4 sections
            const sectionHeight = IMAGE_HEIGHT / 4;
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
