"use client";

import React, { MouseEvent, useState, useEffect } from "react";
import { usePuzzleEditor } from "../hooks/usePuzzleEditor";
import { useRouter } from "next/navigation";
import { Puzzle, AiGeneratedContent } from "@/types/puzzle";

interface PuzzleEditorProps {
  imageUrl: string;
}

const PuzzleEditor: React.FC<PuzzleEditorProps> = ({ imageUrl }) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isGeneratingAiContent, setIsGeneratingAiContent] = useState(false);
  const [aiContent, setAiContent] = useState<AiGeneratedContent>();

  const generateAiContent = async (imageUrl: string) => {
    setIsGeneratingAiContent(true);
    try {
      const response = await fetch("/api/generate-ai-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl })
      });
      
      if (!response.ok) throw new Error("Failed to generate AI content");
      
      const data = await response.json();
      setAiContent(data);
      setTitle(data.title);
    } catch (error) {
      console.error("Error generating AI content:", error);
    } finally {
      setIsGeneratingAiContent(false);
    }
  };

  useEffect(() => {
    generateAiContent(imageUrl);
  }, [imageUrl]);
  const {
    canvasRef,
    pieces,
    handleMouseMove,
    handleClick,
    breakImage
  } = usePuzzleEditor({ imageUrl });

  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    handleMouseMove(e.nativeEvent);
  };

  const handleBreakAndSave = () => {
    if (!title.trim()) {
      alert("Please enter a puzzle title");
      return;
    }

    // Generate pieces first
    breakImage();
  };

  // Effect to handle saving and navigation after pieces are generated
  useEffect(() => {
    if (pieces.length > 0) {
      const puzzleId = crypto.randomUUID();
      const puzzle: Puzzle = {
        id: puzzleId,
        title: title.trim(),
        imageUrl,
        createdAt: new Date().toISOString(),
        ...(aiContent && { aiContent }),
        pieces: pieces.map(piece => ({
          id: piece.id,
          imageSrc: piece.image.toDataURL(),
          x: piece.x,
          y: piece.y,
          width: piece.width,
          height: piece.height,
          widthRatio: piece.width / canvasRef.current!.width,
          heightRatio: piece.height / canvasRef.current!.height,
          connections: piece.connections,
          shapePath: []
        })),
        originalWidth: canvasRef.current!.width,
        originalHeight: canvasRef.current!.height,
        connectedGroups: []
      };

      // Save to local storage
      const savedPuzzles = JSON.parse(localStorage.getItem("puzzles") || "[]");
      savedPuzzles.push(puzzle);
      localStorage.setItem("puzzles", JSON.stringify(savedPuzzles));

      // Navigate to play page
      router.push(`/puzzle/play/${puzzleId}`);
    }
  }, [pieces, title, imageUrl, router, canvasRef]);

  return (
    <div className="relative space-y-4">
      {isGeneratingAiContent && (
        <div className="text-blue-500">Generating AI descriptions...</div>
      )}
      {aiContent && (
        <div className="space-y-2 text-gray-300">
          <p><span className="text-gray-500">Description:</span> {aiContent.description}</p>
          <p><span className="text-gray-500">Context:</span> {aiContent.context}</p>
        </div>
      )}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter puzzle title"
          className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 outline-none"
        />
        <button 
          onClick={handleBreakAndSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={!title.trim()}
        >
          Break & Save Image
        </button>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseMove={onMouseMove}
          onClick={handleClick}
          style={{ cursor: 'crosshair' }}
        />
        <div className="absolute top-0 left-0">
          {pieces.map(piece => (
            <canvas
              key={piece.id}
              style={{
                position: 'absolute',
                left: piece.x,
                top: piece.y,
                width: piece.width,
                height: piece.height,
                border: '1px solid white',
              }}
              width={piece.width}
              height={piece.height}
              ref={el => {
                if (el) {
                  const ctx = el.getContext('2d');
                  if (ctx) ctx.drawImage(piece.image, 0, 0);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PuzzleEditor;
