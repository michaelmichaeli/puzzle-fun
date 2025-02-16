"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePuzzleEditor } from "../hooks/usePuzzleEditor";
import { addPuzzle } from "../utils/puzzleStorage";
import { useRouter } from "next/navigation";
import { AIStatusBox } from "./AIStatusBox";
import { PuzzleEditorCanvas } from "./PuzzleEditorCanvas";
import { PuzzleEditorControls } from "./PuzzleEditorControls";
import { TitleInput } from "./TitleInput";
import { ProgressIndicator } from "./ProgressIndicator";
import { LoadingSpinner } from "./LoadingSpinner";
import { useSoundContext } from "../contexts/SoundContext";
import type { Puzzle, AiGeneratedContent } from "@/types/puzzle";

interface PuzzleEditorProps {
  imageUrl: string;
}

export default function PuzzleEditor({ imageUrl }: PuzzleEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [aiContent, setAiContent] = useState<AiGeneratedContent>();
  const [error, setError] = useState<string | null>(null);
  const [imageLoadProgress, setImageLoadProgress] = useState(0);
  const [isAiContentLoading, setIsAiContentLoading] = useState(false);
  const [isSavingPuzzle, setIsSavingPuzzle] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const { playClick, playDrawLine } = useSoundContext();

  const {
    canvasRef,
    pieces,
    handlePointerMove,
    handlePointerDown,
    breakImage,
    resetLines,
    lines
  } = usePuzzleEditor({ imageUrl });

  const generateAiContent = useCallback(async () => {
    setError(null);
    setIsAiContentLoading(true);

    try {
      const response = await fetch("/api/generate-ai-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate AI content");
      }

      const data = await response.json();
      if (!data.title) {
        throw new Error("Invalid AI response: missing title");
      }

      setAiContent(data);
      setTitle(data.title);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsAiContentLoading(false);
    }
  }, [imageUrl, setTitle]);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;

    img.onloadstart = () => setImageLoadProgress(0);
    img.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        setImageLoadProgress(progress);
      }
    };
    img.onload = () => {
      setImageLoadProgress(100);
      generateAiContent();
    };
    img.onerror = () => {
      setError("Failed to load image");
      setImageLoadProgress(0);
    };
  }, [imageUrl, generateAiContent]);

  const handleBreakAndSave = async () => {
    if (!title.trim()) {
      alert("Please enter a puzzle title");
      return;
    }

    playClick();
    setShowLoadingModal(true);
    setIsSavingPuzzle(true);
    try {
      breakImage();
    } catch (error) {
      console.error("Error breaking image:", error);
      setError("Failed to break image into pieces");
      setShowLoadingModal(false);
      setIsSavingPuzzle(false);
    }
  };

  const handleResetLines = () => {
    playClick();
    resetLines();
  };

  const handleRegenerateContent = () => {
    playClick();
    generateAiContent();
  };

  const savePuzzle = useCallback(async () => {
    if (!pieces.length) return;

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maxRow = Math.max(...pieces.map((p) => p.gridPosition.row)) + 1;
    const maxCol = Math.max(...pieces.map((p) => p.gridPosition.col)) + 1;

    const grid = Array(maxRow)
      .fill(null)
      .map(() => Array(maxCol).fill(null));
    pieces.forEach((piece) => {
      grid[piece.gridPosition.row][piece.gridPosition.col] = piece.id;
    });

    const puzzle: Puzzle = {
      id: uniqueId,
      title: title.trim(),
      imageUrl,
      createdAt: new Date().toISOString(),
      ...(aiContent && { aiContent }),
      pieces: pieces.map((piece) => ({
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
      connectedGroups: [],
      solution: {
        rows: maxRow,
        cols: maxCol,
        grid
      }
    };

    addPuzzle(puzzle);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await router.push(`/puzzle/play/${uniqueId}`);
    return uniqueId;
  }, [pieces, title, imageUrl, aiContent, canvasRef, router]);

  useEffect(() => {
    if (!isSavingPuzzle) return;

    let isUnmounted = false;
    let navigationTimeout: NodeJS.Timeout;

    const saveAndNavigate = async () => {
      try {
        const puzzleId = await savePuzzle();
        if (!isUnmounted && puzzleId) {
          navigationTimeout = setTimeout(() => {
            if (!isUnmounted) {
              window.location.href = `/puzzle/play/${puzzleId}`;
            }
          }, 3000);
        }
      } catch (error) {
        console.error("Error in save process:", error);
        if (!isUnmounted) {
          setError("Failed to save puzzle");
          setShowLoadingModal(false);
          setIsSavingPuzzle(false);
        }
      }
    };

    const timer = setTimeout(() => {
      if (!isUnmounted) {
        saveAndNavigate();
      }
    }, 2000);

    return () => {
      isUnmounted = true;
      clearTimeout(timer);
      if (navigationTimeout) {
        clearTimeout(navigationTimeout);
      }
    };
  }, [isSavingPuzzle, savePuzzle, setError]);

  return (
    <div className="relative space-y-6 transition-all duration-300">
      {showLoadingModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(77, 178, 236, 0.1)" }}
        >
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-primary font-comic">
              {isSavingPuzzle
                ? "Saving and preparing your puzzle..."
                : "Creating your puzzle pieces..."}
            </p>
          </div>
        </div>
      )}

      <AIStatusBox
        isLoading={isAiContentLoading}
        error={error}
        aiContent={aiContent}
        onRegenerate={handleRegenerateContent}
      />

      <TitleInput
        title={title}
        onTitleChange={setTitle}
        onRegenerate={handleRegenerateContent}
        isRegenerating={isAiContentLoading}
      />

      <div className="relative space-y-4">
        {imageLoadProgress < 100 && (
          <ProgressIndicator
            progress={imageLoadProgress}
            message="Loading image"
            className="mb-4"
          />
        )}

        <PuzzleEditorCanvas
          canvasRef={canvasRef}
          handlePointerMove={handlePointerMove}
          handlePointerDown={handlePointerDown}
          pieces={pieces}
          playDrawLine={playDrawLine}
        />

        <PuzzleEditorControls
          title={title}
          pieces={pieces}
          lines={lines}
          handleBreakAndSave={handleBreakAndSave}
          handleResetLines={handleResetLines}
        />
      </div>
    </div>
  );
}
