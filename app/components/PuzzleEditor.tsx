"use client";

import React, { useEffect, useState } from "react";
import { usePuzzleEditor } from "../hooks/usePuzzleEditor";
import { useRouter } from "next/navigation";
import type { Puzzle, AiGeneratedContent } from "@/types/puzzle";
import { ProgressIndicator } from "./ProgressIndicator";

interface PuzzleEditorProps {
	imageUrl: string;
}

const PuzzleEditor: React.FC<PuzzleEditorProps> = ({ imageUrl }) => {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [aiContent, setAiContent] = useState<AiGeneratedContent>();
	const [error, setError] = useState<string | null>(null);
	const [imageLoadProgress, setImageLoadProgress] = useState(0);

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

		try {
			breakImage();
		} catch (error) {
			console.error("Error breaking image:", error);
			setError("Failed to break image into pieces");
		}
	};

	useEffect(() => {
		const savePuzzle = async () => {
			if (pieces.length === 0) return;

			const puzzleId = crypto.randomUUID();

			const maxRow = Math.max(...pieces.map((p) => p.gridPosition.row)) + 1;
			const maxCol = Math.max(...pieces.map((p) => p.gridPosition.col)) + 1;

			const grid = Array(maxRow)
				.fill(null)
				.map(() => Array(maxCol).fill(null));
			pieces.forEach((piece) => {
				grid[piece.gridPosition.row][piece.gridPosition.col] = piece.id;
			});

			const puzzle: Puzzle = {
				id: puzzleId,
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
				router.push(`/puzzle/play/${puzzleId}`);
			} catch (error) {
				console.error("Error saving puzzle:", error);
				setError("Failed to save puzzle");
			}
		};

		savePuzzle();
	}, [pieces, title, imageUrl, router, canvasRef, aiContent]);

	return (
		<div className="relative space-y-4 transition-opacity duration-300">
			{error && <div className="text-red-500 mb-2">{error}</div>}
			{aiContent && !error && (
				<div className="space-y-2 text-gray-300">
					<p>
						<span className="text-gray-500">Description:</span>{" "}
						{aiContent.description}
					</p>
					<p>
						<span className="text-gray-500">Context:</span> {aiContent.context}
					</p>
				</div>
			)}
			<div className="flex gap-4 items-center">
				<label htmlFor="title">Title:</label>
				<input
					name="title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Enter puzzle title"
					className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 outline-none"
				/>
			</div>
			<div className="relative space-y-2">
				<div className="flex justify-between items-start">
					<div className="space-y-2">
						<button
							onClick={resetLines}
							className={`px-3 py-1 text-sm rounded transition-colors ${
								pieces.length > 0
									? "bg-gray-800 text-gray-300 hover:bg-gray-700"
									: lines.horizontal.length > 0 || lines.vertical.length > 0
									? "bg-gray-700 text-gray-300 hover:bg-gray-600"
									: "bg-gray-800 text-gray-600 cursor-not-allowed"
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
				</div>
				{imageLoadProgress < 100 && (
					<ProgressIndicator
						progress={imageLoadProgress}
						message="Loading image"
						className="mb-4"
					/>
				)}
				<div className="absolute top-0 left-0 right-0 p-2 text-center text-sm text-gray-400 transition-opacity group-hover:opacity-100 opacity-50 pointer-events-none">
					{pieces.length === 0 ? (
						<>
							Click to add cutting lines •{" "}
							<span className="text-gray-500">
								Place lines to cut the image into pieces
							</span>
						</>
					) : (
						<>
							Preview of puzzle pieces •{" "}
							<span className="text-gray-500">Click Reset Lines to modify</span>
						</>
					)}
				</div>
				<div
					id="puzzle-board"
					className="h-[70vh] p-4 bg-gray-800/30 rounded-lg flex items-center justify-center relative group"
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
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
					disabled={
						!title.trim() ||
						pieces.length > 0 ||
						lines.horizontal.length === 0 ||
						lines.vertical.length === 0
					}
					title={
						!title.trim()
							? "Enter a title first"
							: pieces.length > 0
							? "Reset lines to modify"
							: lines.horizontal.length === 0 || lines.vertical.length === 0
							? "Add both horizontal and vertical lines"
							: "Break image into pieces"
					}
				>
					Break Image
				</button>
			</div>
		</div>
	);
};

export default PuzzleEditor;
