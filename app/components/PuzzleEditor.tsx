"use client";

import React, { useEffect, useState } from "react";
import { usePuzzleEditor } from "../hooks/usePuzzleEditor";
import { useRouter } from "next/navigation";
import type { Puzzle, AiGeneratedContent } from "@/types/puzzle";
import { ProgressIndicator } from "./ProgressIndicator";
import { LoadingSpinner } from "./LoadingSpinner";
import { useSoundContext } from "../contexts/SoundContext";

interface PuzzleEditorProps {
	imageUrl: string;
}

const PuzzleEditor: React.FC<PuzzleEditorProps> = ({ imageUrl }) => {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [aiContent, setAiContent] = useState<AiGeneratedContent>();
	const [error, setError] = useState<string | null>(null);
	const [imageLoadProgress, setImageLoadProgress] = useState(0);
	const [isAiContentLoading, setIsAiContentLoading] = useState(false);
	const [isSavingPuzzle, setIsSavingPuzzle] = useState(false);
	const { playClick, playDrawLine } = useSoundContext();

	const {
		canvasRef,
		pieces,
		handleMouseMove,
		handleClick,
		breakImage,
		resetLines,
		lines,
	} = usePuzzleEditor({ imageUrl });

	const generateAiContent = async (imageUrl: string) => {
		setError(null);
		setIsAiContentLoading(true);

		try {
			const response = await fetch("/api/generate-ai-content", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ imageUrl }),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || "Failed to generate AI content");
			}

			const data = await response.json();
			if (!data.title) {
				throw new Error("Invalid AI response: missing title");
			}

			setAiContent(data);
			setTitle(data.title);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An unknown error occurred";
			setError(errorMessage);
		} finally {
			setIsAiContentLoading(false);
		}
	};

	useEffect(() => {
		const img = new Image();
		img.src = imageUrl;

		img.onloadstart = () => setImageLoadProgress(0);
		img.onprogress = (e) => {
			if (e.lengthComputable) {
				const progress = (e.loaded / e.total) * 100;
				setImageLoadProgress(progress);
			}
		};
		img.onload = () => {
			setImageLoadProgress(100);
			generateAiContent(imageUrl);
		};
		img.onerror = () => {
			setError("Failed to load image");
			setImageLoadProgress(0);
		};
	}, [imageUrl]);

	const handleBreakAndSave = async () => {
		if (!title.trim()) {
			alert("Please enter a puzzle title");
			return;
		}

		playClick();
		setIsSavingPuzzle(true);
		try {
			breakImage();
		} catch (error) {
			console.error("Error breaking image:", error);
			setError("Failed to break image into pieces");
		}
	};

	const handleResetLines = () => {
		playClick();
		resetLines();
	};

	useEffect(() => {
		const savePuzzle = async () => {
			if (pieces.length === 0) return;

			// Generate unique ID: timestamp + random number
			const uniqueId = `${Date.now()}-${Math.random()
				.toString(36)
				.substr(2, 9)}`;
			const maxRow = Math.max(...pieces.map((p) => p.gridPosition.row)) + 1;
			const maxCol = Math.max(...pieces.map((p) => p.gridPosition.col)) + 1;

			const grid = Array(maxRow)
				.fill(null)
				.map(() => Array(maxCol).fill(null));
			pieces.forEach((piece) => {
				grid[piece.gridPosition.row][piece.gridPosition.col] = piece.id;
			});

			const puzzle: Puzzle = {
				id: uniqueId,
				title: title.trim(),
				imageUrl,
				createdAt: new Date().toISOString(),
				...(aiContent && { aiContent }),
				pieces: pieces.map((piece) => ({
					id: piece.id,
					imageSrc: piece.image.toDataURL(),
					x: piece.x,
					y: piece.y,
					width: piece.width,
					height: piece.height,
					widthRatio: piece.width / canvasRef.current!.width,
					heightRatio: piece.height / canvasRef.current!.height,
					connections: piece.connections,
					shapePath: [],
				})),
				originalWidth: canvasRef.current!.width,
				originalHeight: canvasRef.current!.height,
				connectedGroups: [],
				solution: {
					rows: maxRow,
					cols: maxCol,
					grid,
				},
			};

			try {
				const savedPuzzles = JSON.parse(
					localStorage.getItem("puzzles") || "[]"
				);
				savedPuzzles.push(puzzle);
				localStorage.setItem("puzzles", JSON.stringify(savedPuzzles));

				await new Promise((resolve) => setTimeout(resolve, 500));
				router.push(`/puzzle/play/${uniqueId}`);
			} catch (error) {
				console.error("Error saving puzzle:", error);
				setError("Failed to save puzzle");
			}
		};

		if (isSavingPuzzle) {
			savePuzzle();
		}
	}, [pieces, title, imageUrl, router, canvasRef, aiContent, isSavingPuzzle]);

	return (
		<div className="relative space-y-6 transition-all duration-300">
			{isSavingPuzzle && (
				<div
					className="fixed inset-0 flex items-center justify-center z-50"
					style={{ background: "rgba(77, 178, 236, 0.1)" }}
				>
					<div className="bg-white p-8 rounded-2xl shadow-xl text-center">
						<LoadingSpinner size="lg" />
						<p className="mt-4 text-[#4DB2EC] font-comic">
							Creating your puzzle pieces...
						</p>
					</div>
				</div>
			)}
			{error && (
				<div className="px-6 py-3 bg-red-50 text-red-600 rounded-full font-comic mb-4 shadow-sm border border-red-100">
					{error}
				</div>
			)}
			{isAiContentLoading ? (
				<div className="flex justify-center py-4">
					<LoadingSpinner size="md" />
				</div>
			) : (
				aiContent &&
				!error && (
					<div className="space-y-4 bg-white p-6 rounded-2xl shadow-md border-2 border-[#4DB2EC]/10">
						<p className="font-comic">
							<span className="text-[#4DB2EC] font-bold">Description: </span>
							{aiContent.description}
						</p>
						<p className="font-comic">
							<span className="text-[#4DB2EC] font-bold">Context: </span>
							{aiContent.context}
						</p>
					</div>
				)
			)}
			<div className="flex gap-4 items-center bg-white p-6 rounded-2xl shadow-md border-2 border-[#4DB2EC]/10">
				<label htmlFor="title" className="text-[#4DB2EC] font-bold font-comic">
					Title:
				</label>
				<input
					name="title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Enter puzzle title"
					className="flex-1 px-6 py-3 rounded-full bg-white text-[#4DB2EC] border-2 border-[#4DB2EC] focus:border-[#FFD800] outline-none font-comic shadow-sm"
				/>
			</div>
			<div className="relative space-y-4">
				<div className="flex justify-between items-start">
					<button
						onClick={handleResetLines}
						className={`px-6 py-3 rounded-full font-comic transition-all transform hover:scale-105 ${
							pieces.length > 0 ||
							lines.horizontal.length > 0 ||
							lines.vertical.length > 0
								? "bg-[#4DB2EC] text-white hover:bg-[#3DA2DC] shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
						}`}
						disabled={
							lines.horizontal.length === 0 &&
							lines.vertical.length === 0 &&
							pieces.length === 0
						}
					>
						Reset Lines
					</button>
				</div>
				{imageLoadProgress < 100 && (
					<ProgressIndicator
						progress={imageLoadProgress}
						message="Loading image"
						className="mb-4"
					/>
				)}
				<div className="text-center text-white font-comic mb-4">
					{pieces.length === 0 ? (
						<>
							Click to add cutting lines •{" "}
							<span>Place lines to cut the image into pieces</span>
						</>
					) : (
						<>
							Preview of puzzle pieces •{" "}
							<span>Click Reset Lines to modify</span>
						</>
					)}
				</div>
				<div
					id="puzzle-board"
					className="h-[70vh] p-6 bg-white rounded-2xl flex items-center justify-center relative group shadow-xl border-2 border-[#4DB2EC]"
				>
					<div className="relative" id="canvas-wrapper">
						<canvas
							ref={canvasRef}
							onMouseMove={(e) => handleMouseMove(e.nativeEvent)}
							onClick={() => {
								const wasInvalid = handleClick();
								if (wasInvalid) {
									const wrapper = document.getElementById("canvas-wrapper");
									if (wrapper) {
										const prevClasses = wrapper.className;
										wrapper.className = `${prevClasses} animate-shake`;
										setTimeout(() => {
											wrapper.className = prevClasses;
										}, 200);
									}
								} else {
									playDrawLine();
								}
							}}
							style={{
								cursor: "crosshair",
								maxWidth: "100%",
								maxHeight: "100%",
								objectFit: "contain",
							}}
						/>
					</div>
				</div>
			</div>
			<div className="flex justify-end gap-4">
				<button
					onClick={handleBreakAndSave}
          className="px-8 py-4 bg-[#4DB2EC] text-white rounded-full hover:bg-[#3DA2DC] disabled:bg-gray-100 
          disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
          transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-comic font-bold"
					disabled={
						!title.trim() ||
						pieces.length > 0 ||
						lines.horizontal.length === 0 ||
						lines.vertical.length === 0
					}
				>
					{!title.trim()
						? "Enter a title first"
						: pieces.length > 0
						? "Reset lines to modify"
						: lines.horizontal.length === 0 || lines.vertical.length === 0
						? "Add both horizontal and vertical lines"
						: "Let's Play!"}
				</button>
			</div>
		</div>
	);
};

export default PuzzleEditor;
