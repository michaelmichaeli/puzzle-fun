import Image from "next/image";
import Link from "next/link";
import { Puzzle as PuzzleIcon, Calendar } from 'lucide-react';
import { Puzzle } from "@/types/puzzle";
import { useSoundContext } from "../contexts/SoundContext";

interface PuzzleCardProps {
  puzzle: Puzzle;
}

export default function PuzzleCard({ puzzle }: PuzzleCardProps) {
  const { playClick } = useSoundContext();

  return (
    <Link
      href={`/puzzle/play/${puzzle.id}`}
      onClick={() => playClick()}
      className="group block card transform hover:-translate-y-2 transition-all duration-300"
      aria-label={`Play puzzle: ${puzzle.title}`}
    >
      <div className="relative">
        {/* Image Container with rounded corners */}
        <div className="aspect-video relative rounded-t-lg overflow-hidden">
          <Image
            src={puzzle.imageUrl}
            alt={`Preview of puzzle: ${puzzle.title}`}
            fill
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Playful overlay on hover */}
          <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </div>

        {/* Content section with gradient background */}
        <div className="p-4 bg-white rounded-b-lg">
          <h3 className="text-xl font-bold mb-2 text-primary group-hover:gradient-text transition-colors">
            {puzzle.title}
          </h3>
          
          <div className="flex justify-between items-center text-sm text-gray-600">
            {/* Pieces count with icon */}
            <div className="flex items-center gap-1" aria-label={`${puzzle.pieces.length} puzzle pieces`}>
              <PuzzleIcon className="w-4 h-4 text-accent-pink" />
              <span>{puzzle.pieces.length} pieces</span>
            </div>
            
            {/* Date with icon */}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-accent-green" />
              <time dateTime={puzzle.createdAt}>
                {new Date(puzzle.createdAt).toLocaleDateString()}
              </time>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
