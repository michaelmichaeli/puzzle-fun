"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { Puzzle, PiecePositions } from "@/types/puzzle";
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
  const [piecePositions, setPiecePositions] = useState<PiecePositions>({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentPieceCenter, setCurrentPieceCenter] = useState<{x: number, y: number} | null>(null);

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

        // Load saved piece positions if they exist
        const savedPositions = JSON.parse(localStorage.getItem(`piece_positions_${id}`) || "{}");
        setPiecePositions(savedPositions);
        setHasLoaded(true);
      };
    }
  }, [id]);

  // Save positions whenever they change
  useEffect(() => {
    if (hasLoaded && Object.keys(piecePositions).length > 0) {
      localStorage.setItem(`piece_positions_${id}`, JSON.stringify(piecePositions));
    }
  }, [piecePositions, id, hasLoaded]);

  const handlePieceDragStop = (e: DraggableEvent, data: DraggableData, piece: Puzzle["pieces"][0]) => {
    if (!puzzle || !holedImage || placedPieces.has(piece.id)) return;

    // Update the piece's position based on the drag
    setPiecePositions(prev => ({
      ...prev,
      [piece.id]: { x: data.x, y: data.y }
    }));

    // Get absolute positions for position checking
    const node = data.node as HTMLElement;
    const pieceRect = node.getBoundingClientRect();
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    // Calculate scaled piece dimensions
    const scale = imageDimensions.width / puzzle.originalWidth;
    const pieceWidth = piece.widthRatio * imageDimensions.width;
    const pieceHeight = piece.heightRatio * imageDimensions.height;

    // Get center position relative to board
    const currentX = pieceRect.left - boardRect.left + (pieceWidth / 2);
    const currentY = pieceRect.top - boardRect.top + (pieceHeight / 2);

    // Convert screen coordinates to original image coordinates
    const originalCurrentX = currentX / scale;
    const originalCurrentY = currentY / scale;

    // Get target center coordinates in original image space
    const originalTargetX = piece.x + (piece.width / 2);
    const originalTargetY = piece.y + (piece.height / 2);

    // Compare in original image coordinates
    const distance = Math.sqrt(
      Math.pow(originalCurrentX - originalTargetX, 2) + 
      Math.pow(originalCurrentY - originalTargetY, 2)
    );

    // Scale threshold by the same factor
    const scaledThreshold = PIECE_PLACEMENT_THRESHOLD / scale;

    if (distance <= scaledThreshold) {
      setPlacedPieces(prev => {
        const newSet = new Set(prev);
        newSet.add(piece.id);
        return newSet;
      });

      // Set to exact target position when placed
      setPiecePositions(prev => ({
        ...prev,
        [piece.id]: { 
          x: originalTargetX * scale - pieceWidth / 2,
          y: originalTargetY * scale - pieceHeight / 2
        }
      }));

      setCurrentPieceCenter(null); // Clear debug marker when piece is placed
    }
  };

  if (!hasLoaded) return <h2>Loading puzzle...</h2>;

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
            </div>

            {puzzle.pieces.map((piece) => {
              const pieceWidth = piece.widthRatio * imageDimensions.width;
              const pieceHeight = piece.heightRatio * imageDimensions.height;
              
              // Get saved position or generate random one
              const position = piecePositions[piece.id] || (() => {
                const isLeftSide = Math.random() < 0.5;
                const sideOffset = imageDimensions.width * 0.3;
                const randomSpread = imageDimensions.width * 0.15;
                const section = Math.floor(Math.random() * 4);
                const sectionHeight = imageDimensions.height / 4;
                
                const randomPosition = {
                  x: isLeftSide 
                    ? -sideOffset + (Math.random() * randomSpread)
                    : imageDimensions.width + (Math.random() * randomSpread),
                  y: (section * sectionHeight) + (Math.random() * sectionHeight - pieceHeight/2)
                };

                // Save initial random position
                setPiecePositions(prev => ({
                  ...prev,
                  [piece.id]: randomPosition
                }));

                return randomPosition;
              })();

              return (
                <DraggablePiece
                  key={piece.id}
                  piece={piece}
                  width={pieceWidth}
                  height={pieceHeight}
                  position={position}
                  onDragStop={handlePieceDragStop}
                  isPlaced={placedPieces.has(piece.id)}
                />
              );
            })}
          </div>
        </>
      ) : null}
      </div>
    </div>
  );
};

export default PuzzlePlayPage;
