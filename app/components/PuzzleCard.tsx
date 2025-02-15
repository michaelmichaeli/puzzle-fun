"use client";

import { Puzzle } from "@/types/puzzle";
import Link from "next/link";
import { Puzzle as PuzzleIcon, Clock, Info } from "lucide-react";
import { useSoundContext } from "../contexts/SoundContext";
import Image from "next/image";

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
          <Image
            src={puzzle.imageUrl}
            alt={`Preview of puzzle: ${puzzle.title}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transform group-hover:scale-110 transition-transform duration-500"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-comic font-bold text-[#4DB2EC] text-lg leading-tight line-clamp-2">
              {puzzle.title}
            </h3>
            <div className="p-2 rounded-full flex items-center gap-1 relative overflow-hidden">
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #FFD800 0%, #FF69B4 100%)" }} />
              <PuzzleIcon className="w-5 h-5 relative z-10 text-white" />
              <span className="font-comic text-sm relative z-10 text-white">{puzzle.pieces.length}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-[#4DB2EC] font-comic">
            <Clock className="w-4 h-4" />
            <time dateTime={puzzle.createdAt}>{formattedDate}</time>
          </div>

          {puzzle.aiContent && (
            <div className="mt-3 flex items-start gap-2 text-sm">
              <Info className="w-5 h-5 mt-0.5 text-[#4DB2EC]" />
              <p className="text-[#4DB2EC] line-clamp-2 font-comic">
                {puzzle.aiContent.description}
              </p>
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="px-3 py-1 rounded-full shadow-lg relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #FFD800 0%, #FF69B4 100%)" }} />
            <p className="text-sm font-comic font-bold text-white relative z-10">
              Play Now!
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
