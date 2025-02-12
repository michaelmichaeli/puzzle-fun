"use client";

import { Puzzle } from "@/types/puzzle";
import Link from "next/link";
import { Puzzle as PuzzleIcon, Clock, Info } from "lucide-react";
import { useSoundContext } from "../contexts/SoundContext";

export default function PuzzleCard({ puzzle }: { puzzle: Puzzle }) {
  const { playClick } = useSoundContext();

  const createdAt = new Date(puzzle.createdAt);
  const formattedDate = createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-[#4DB2EC]/10">
      <Link
        href={`/puzzle/play/${puzzle.id}`}
        onClick={() => playClick()}
        className="block"
      >
        <div className="aspect-video relative overflow-hidden">
          <img
            src={puzzle.imageUrl}
            alt={`Preview of puzzle: ${puzzle.title}`}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-comic font-bold text-[#4DB2EC] text-lg leading-tight line-clamp-2">
              {puzzle.title}
            </h3>
            <div className="bg-[#FFD800]/10 p-2 rounded-full">
              <PuzzleIcon className="w-5 h-5 text-[#FFD800]" />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-[#4DB2EC] font-comic">
            <Clock className="w-4 h-4" />
            <time dateTime={puzzle.createdAt}>{formattedDate}</time>
          </div>

          {puzzle.aiContent && (
            <div className="mt-3 flex items-start gap-2 text-sm">
              <Info className="w-4 h-4 mt-0.5 text-[#4DB2EC]" />
              <p className="text-[#4DB2EC] line-clamp-2 font-comic">
                {puzzle.aiContent.description}
              </p>
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
            <p className="text-sm font-comic font-bold text-[#4DB2EC]">
              Play Now!
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
