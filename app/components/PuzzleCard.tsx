"use client";

import { Puzzle } from "@/types/puzzle";
import Link from "next/link";
import { Puzzle as PuzzleIcon, Clock, Trash2 } from "lucide-react";
import { useSoundContext } from "../contexts/SoundContext";
import Image from "next/image";
import { getTimeAgo } from "../utils/timeUtils";

export type PuzzleCardProps = {
  puzzle: Puzzle;
  onDelete?: (id: string) => void;
};

export default function PuzzleCard({ puzzle, onDelete }: PuzzleCardProps) {
  const { playClick } = useSoundContext();

  const createdAt = new Date(puzzle.createdAt);
  const timeAgo = getTimeAgo(createdAt);

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-blue-400/10">
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
            <h3 className="font-comic font-bold text-blue-400 text-lg leading-tight line-clamp-2">
              {puzzle.title}
            </h3>
            <div className="p-2 rounded-full flex items-center gap-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-pink-500" />
              <PuzzleIcon className="w-5 h-5 relative z-10 text-white" />
              <span className="font-comic text-sm relative z-10 text-white">
                {puzzle.pieces.length}
              </span>
            </div>
          </div>

          {puzzle.aiContent && (
            <div className="mt-3 flex items-start gap-2 text-sm">
              <p className="text-blue-400 line-clamp-2 font-comic">
                {puzzle.aiContent.description}
              </p>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 text-sm text-blue-400 font-comic">
            <Clock className="w-5 h-5" />
            <time dateTime={puzzle.createdAt}>{timeAgo}</time>
          </div>
        </div>

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="px-3 py-1 rounded-full shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-pink-500" />
            <p className="text-sm font-comic font-bold text-white relative z-10">
              Play Now!
            </p>
          </div>
        </div>
      </Link>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (
              window.confirm("Are you sure you want to delete this puzzle?")
            ) {
              onDelete(puzzle.id);
              playClick();
            }
          }}
          className="absolute top-3 left-3 p-2 rounded-full bg-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
          aria-label="Delete puzzle"
        >
          <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
        </button>
      )}
    </div>
  );
}
