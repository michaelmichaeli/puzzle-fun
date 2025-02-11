"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { Puzzle } from "@/types/puzzle";
import DraggablePiece from "@/app/components/DraggablePiece";
import BackButton from "@/app/components/BackButton";
import { DISPLAY_WIDTH, DISPLAY_HEIGHT, calculateImageDimensions } from "@/app/constants/dimensions";

const PuzzlePlayPage = () => {
  const { id } = useParams();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [holedImage, setHoledImage] = useState<HTMLImageElement | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT });
  const [correctPlacements, setCorrectPlacements] = useState<number>(0);
  console.log("🚀 ~ PuzzlePlayPage ~ correctPlacements:", correctPlacements)

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

  const handleCorrectPlacement = (pieceId: number) => {
    setCorrectPlacements(prev => prev + 1);
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
            {correctPlacements === puzzle.pieces.length ? (
              <h2 style={{ color: "green" }}>🎉 Puzzle Complete! 🎉</h2>
            ) : (
              <h2>Pieces placed correctly: {correctPlacements} / {puzzle.pieces.length}</h2>
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
            <div style={{ 
              position: "relative",
              width: imageDimensions.width, 
              height: imageDimensions.height,
              backgroundColor: "#f0f0f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
            }}>
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

            {puzzle.pieces.map((piece) => {
              const pieceWidth = piece.widthRatio * imageDimensions.width;
              const pieceHeight = piece.heightRatio * imageDimensions.height;
              
              // Scale the target position to match current dimensions
              const scaledX = piece.x * (imageDimensions.width / holedImage.width);
              const scaledY = piece.y * (imageDimensions.height / holedImage.height);
              
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

              // Create a new piece with scaled target position
              const scaledPiece = {
                ...piece,
                x: scaledX,
                y: scaledY,
              };

              return (
                <DraggablePiece
                  key={piece.id}
                  piece={scaledPiece}
                  width={pieceWidth}
                  height={pieceHeight}
                  initialPosition={{ x: randomX, y: randomY }}
                  onCorrectPlacement={handleCorrectPlacement}
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
