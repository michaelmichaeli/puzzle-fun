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
    <div>
      <BackButton />
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h1>Puzzle {id}</h1>

      {puzzle && holedImage ? (
        <div style={{ position: "relative", width: IMAGE_WIDTH, height: IMAGE_HEIGHT, margin: "auto" }}>
          {/* Puzzle Board (Holed Image) */}
          <Stage width={IMAGE_WIDTH} height={IMAGE_HEIGHT} style={{ border: "2px solid black" }}>
            <Layer>
              <KonvaImage image={holedImage} x={0} y={0} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} />
            </Layer>
          </Stage>

          {/* Render Draggable Pieces */}
          {puzzle.pieces.map((piece) => {
            const pieceWidth = piece.widthRatio * IMAGE_WIDTH;
            const pieceHeight = piece.heightRatio * IMAGE_HEIGHT;
            const randomX = Math.random() * (IMAGE_WIDTH - pieceWidth);
            const randomY = Math.random() * (IMAGE_HEIGHT - pieceHeight + 100) + IMAGE_HEIGHT / 2;

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
