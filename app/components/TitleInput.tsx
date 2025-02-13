"use client";

import { RefreshCw } from "lucide-react";

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
    <div className="flex gap-4 items-center bg-white p-6 rounded-2xl shadow-md border-2 border-[#4DB2EC]/10">
      <label
        htmlFor="title"
        className="text-[#4DB2EC] font-bold font-comic whitespace-nowrap"
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
          className="w-full px-6 py-3 rounded-full bg-white text-[#4DB2EC] border-2 border-[#4DB2EC] focus:border-[#FFD800] outline-none font-comic shadow-sm"
        />
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="p-3 bg-[#FFD800] text-[#4DB2EC] rounded-full hover:bg-[#FFE800] 
            disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed 
            transition-all transform hover:scale-105 shadow-md"
          aria-label="Regenerate title and description"
        >
          <RefreshCw className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
