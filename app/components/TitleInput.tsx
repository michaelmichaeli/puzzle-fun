"use client";

import { RefreshCw } from "lucide-react";
import { ButtonWithTooltip } from "./ButtonWithTooltip";

interface TitleInputProps {
  title: string;
  onTitleChange: (value: string) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function TitleInput({
  title,
  onTitleChange,
  onRegenerate,
  isRegenerating,
}: TitleInputProps) {
  return (
    <div className="flex gap-4 items-center bg-white p-6 rounded-2xl shadow-md border-2 border-blue-400/10">
      <label
        htmlFor="title"
        className="text-blue-400 font-bold font-comic whitespace-nowrap"
      >
        Title:
      </label>
      <div className="flex-1 flex gap-2 items-center">
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter puzzle title"
          className="w-full px-6 py-3 rounded-full bg-white text-blue-400 border-2 border-blue-400 focus:border-yellow-400 outline-none font-comic shadow-sm"
        />
        <ButtonWithTooltip
          onClick={onRegenerate}
          disabled={isRegenerating}
          className={`p-3 rounded-full
            disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed 
            transition-all transform hover:scale-105 shadow-md relative overflow-hidden
            ${!isRegenerating ? "bg-gradient-to-br from-secondary to-accent-pink" : ""}`}
          tooltipContent="Generate new title"
        >
          <RefreshCw
            className={`w-5 h-5 text-white ${isRegenerating ? "animate-spin" : ""}`}
          />
        </ButtonWithTooltip>
      </div>
    </div>
  );
}
