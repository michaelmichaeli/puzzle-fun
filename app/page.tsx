"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Puzzle } from "@/types/puzzle";
import PuzzleCard from "./components/PuzzleCard";

export default function Home() {
	const [puzzles, setPuzzles] = useState<Puzzle[]>([]);

	useEffect(() => {
		const loadPuzzles = () => {
			try {
				const storedPuzzles = localStorage.getItem("puzzles");
				if (storedPuzzles) {
					setPuzzles(JSON.parse(storedPuzzles));
				}
			} catch (error) {
				console.error("Failed to load puzzles:", error);
			}
		};
		loadPuzzles();
		window.addEventListener("storage", loadPuzzles);
		return () => window.removeEventListener("storage", loadPuzzles);
	}, []);

	return (
		<div className="p-8 pb-20 gap-8 font-[family-name:var(--font-geist-sans)]">
			<section className="text-center mb-16">
				<h1 className="text-4xl font-bold mb-4">Welcome to the Puzzle Game</h1>
				<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
					Create your own custom puzzles by uploading images and share them with
					friends. Challenge yourself with different difficulty levels and have
					fun solving puzzles!
				</p>
				<Link
					href="/puzzle/create"
					className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105 duration-200 shadow-lg"
				>
					Create Your New Puzzle Here
				</Link>
			</section>

			<section>
				{puzzles?.length ? (
					<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						<header className="mb-8 flex justify-between items-center">
							<h2 className="text-3xl font-bold">My Puzzles</h2>
						</header>
						{puzzles.map((puzzle) => (
							<PuzzleCard key={puzzle.id} puzzle={puzzle} />
						))}
					</div>
				) : null}
			</section>
		</div>
	);
}
