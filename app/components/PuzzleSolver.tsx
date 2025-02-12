"use client";

import React, { useEffect } from "react";
import { DraggablePiece } from "./DraggablePiece";
import { PuzzleGameStatus } from "./PuzzleGameStatus";
import { PuzzleGrid } from "./PuzzleGrid";
import { usePuzzleSolver } from "../hooks/usePuzzleSolver";
import { useSoundContext } from "../contexts/SoundContext";
import { PieceData, BoardMatrix } from "@/types/puzzle";
import Confetti from "./Confetti";

interface PuzzleSolverProps {
	pieces: PieceData[];
	solution: BoardMatrix;
}

export const PuzzleSolver: React.FC<PuzzleSolverProps> = ({
	pieces,
	solution,
}) => {
	const {
		positions,
		onPieceMove,
		isSolved,
		shufflePieces,
		getProgress,
		restart,
	} = usePuzzleSolver({ pieces, solution });
	const { playSuccess } = useSoundContext();

	useEffect(() => {
		const loadPieces = async () => {
			if (pieces.length === 0) return;

			try {
				await Promise.all(
					pieces.map((piece) => {
						return new Promise<void>((resolve) => {
							const img = new Image();
							img.src = piece.imageSrc;
							img.onload = () => {
								resolve();
							};
							img.onerror = () => resolve();
						});
					})
				);

				const container = document.getElementById("puzzle-board");
				if (container && Object.keys(positions).length === 0) {
					shufflePieces(container.clientWidth, container.clientHeight);
				}
			} finally {
			}
		};

		loadPieces();
	}, [pieces, positions, shufflePieces]);

	const handleRestart = async () => {
		const container = document.getElementById("puzzle-board");
		if (!container) return;
		restart();
	};

	const handlePieceMove = (id: number, x: number, y: number) => {
		const prevProgress = getProgress();
		onPieceMove(id, x, y);
		const newProgress = getProgress();

		if (newProgress > prevProgress + 0.001) {
			playSuccess();
		}
	};

	return (
		<div
			className="space-y-4 relative"
			role="application"
			aria-label="Puzzle Game Board"
		>
			<Confetti isActive={isSolved()} />

			<div className="space-y-2">
				<PuzzleGameStatus
					isSolved={isSolved()}
					progress={getProgress()}
					onRestart={handleRestart}
				/>
			</div>

			<div
				id="puzzle-board"
				className="relative w-full h-[calc(100vh-8rem)] bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-xl"
				style={{ touchAction: "none" }}
				role="region"
				aria-label="Puzzle play area"
			>
				<PuzzleGrid
					solution={solution}
					pieces={pieces}
					currentPositions={positions}
				/>
				{pieces.map((piece) => (
					<DraggablePiece
						key={piece.id}
						piece={piece}
						onDrag={(id, x, y) => handlePieceMove(Number(id), x, y)}
						position={positions[piece.id] || { x: 0, y: 0 }}
					/>
				))}
			</div>

			<div className="sr-only" aria-live="polite">
				{`Current progress: ${Math.floor(getProgress() * 100)}%`}
				{isSolved() && "Congratulations! You've completed the puzzle!"}
			</div>
		</div>
	);
};
