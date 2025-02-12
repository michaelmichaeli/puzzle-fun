import Image from "next/image";
import Link from "next/link";
import { Puzzle } from "@/types/puzzle";

interface PuzzleCardProps {
	puzzle: Puzzle;
}

export default function PuzzleCard({ puzzle }: PuzzleCardProps) {
	return (
		<Link
			href={`/puzzle/play/${puzzle.id}`}
			className="group bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
		>
			<div className="aspect-video relative">
				<Image
					src={puzzle.imageUrl}
					alt={`Puzzle ${puzzle.id}`}
					fill
					style={{
						objectFit: "cover",
						width: "100%",
						height: "100%",
					}}
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>
			</div>
			<div className="p-4">
				<h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
					{puzzle.title}{" "}
				</h3>
				<div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
					<span>{puzzle.pieces.length} pieces</span>
					<time dateTime={puzzle.createdAt}>
						{new Date(puzzle.createdAt).toLocaleDateString()}
					</time>
				</div>
			</div>
		</Link>
	);
}
