"use client";

import React, { useEffect } from "react";
import { DraggablePiece } from "./DraggablePiece";
import { PuzzleGameStatus } from "./PuzzleGameStatus";
import { PuzzleGrid } from "./PuzzleGrid";
import { usePuzzleSolver } from "../hooks/usePuzzleSolver";
import { PieceData, BoardMatrix } from "@/types/puzzle";

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

	useEffect(() => {
		const loadPieces = async () => {
			if (pieces.length === 0) return;

			try {
				// Load all piece images
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

	return (
		<div className="space-y-4 relative">
			<div className="space-y-2">
				<PuzzleGameStatus
					isSolved={isSolved()}
					progress={getProgress()}
					onRestart={handleRestart}
				/>
			</div>
			<div
				id="puzzle-board"
				className="relative w-full h-[calc(100vh-8rem)] bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
				style={{ touchAction: "none" }}
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
						onDrag={(id, x, y) => onPieceMove(id, x, y)}
						position={positions[piece.id] || { x: 0, y: 0 }}
					/>
				))}
			</div>
		</div>
	);
};
