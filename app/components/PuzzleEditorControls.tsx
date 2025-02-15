"use client";

import { Lines, Piece } from "@/types/puzzle";
import { ButtonWithTooltip } from "./ButtonWithTooltip";

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
  const canReset =
    pieces.length > 0 ||
    lines.horizontal.length > 0 ||
    lines.vertical.length > 0;
  const canBreak =
    title.trim() &&
    lines.horizontal.length > 0 &&
    lines.vertical.length > 0 &&
    pieces.length === 0;

  const getMainActionTooltip = () => {
    if (!title.trim()) return "Please enter a title first";
    if (lines.horizontal.length === 0 || lines.vertical.length === 0)
      return "Draw both horizontal and vertical lines";
    return "Create and play your puzzle";
  };

  return (
    <div className="flex justify-between items-center gap-4">
      <ButtonWithTooltip
        onClick={handleResetLines}
        className={`px-6 py-3 rounded-full font-comic transition-all transform hover:scale-105 ${
          canReset
            ? "text-white shadow-md relative overflow-hidden bg-gradient-to-br from-secondary to-accent-pink"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
        disabled={!canReset}
        tooltipContent="Clear all drawn lines"
      >
        Reset Lines
      </ButtonWithTooltip>

      <ButtonWithTooltip
        onClick={handleBreakAndSave}
        className={`px-8 py-4 text-white rounded-full disabled:bg-gray-100 
          disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
          transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-comic font-bold relative overflow-hidden
          ${canBreak ? "bg-gradient-to-br from-secondary to-accent-pink" : ""}`}
        disabled={!canBreak}
        tooltipContent={getMainActionTooltip()}
      >
        {!title.trim()
          ? "Enter a title first"
          : lines.horizontal.length === 0 || lines.vertical.length === 0
            ? "Add both horizontal and vertical lines"
            : "Let's Play!"}
      </ButtonWithTooltip>
    </div>
  );
}
