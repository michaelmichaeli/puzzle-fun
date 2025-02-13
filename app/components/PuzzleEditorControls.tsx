"use client";

import { Lines, Piece } from "@/types/puzzle";

interface PuzzleEditorControlsProps {
  title: string;
  pieces: Piece[];
  lines: Lines;
  handleBreakAndSave: () => Promise<void>;
  handleResetLines: () => void;
}

export function PuzzleEditorControls({
  title,
  pieces,
  lines,
  handleBreakAndSave,
  handleResetLines,
}: PuzzleEditorControlsProps) {
  const canReset = pieces.length > 0 || lines.horizontal.length > 0 || lines.vertical.length > 0;
  const canBreak = title.trim() && lines.horizontal.length > 0 && lines.vertical.length > 0 && pieces.length === 0;

  return (
    <div className="flex justify-between items-center gap-4">
      <button
        onClick={handleResetLines}
        className={`px-6 py-3 rounded-full font-comic transition-all transform hover:scale-105 ${
          canReset
            ? "bg-[#4DB2EC] text-white hover:bg-[#3DA2DC] shadow-md"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
        disabled={!canReset}
      >
        Reset Lines
      </button>

      <button
        onClick={handleBreakAndSave}
        className="px-8 py-4 bg-[#4DB2EC] text-white rounded-full hover:bg-[#3DA2DC] disabled:bg-gray-100 
          disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
          transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-comic font-bold"
        disabled={!canBreak}
      >
        {!title.trim()
          ? "Enter a title first"
          : pieces.length > 0
          ? "Reset lines to modify"
          : lines.horizontal.length === 0 || lines.vertical.length === 0
          ? "Add both horizontal and vertical lines"
          : "Let's Play!"}
      </button>
    </div>
  );
}
