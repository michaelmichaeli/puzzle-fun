"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Stage, Layer, Image, Line } from "react-konva";

interface PuzzleEditorProps {
	imageUrl: string;
}

interface LineData {
	points: number[];
}

interface PieceData {
	id: number;
	imageSrc: string;
	x: number;
	y: number;
	width: number;
	height: number;
	xRatio: number;
	yRatio: number;
	widthRatio: number;
	heightRatio: number;
	shapePath: number[];
}

interface PuzzleData {
	id: string;
	imageUrl: string;
	createdAt: string;
	holedImage: string; // ✅ Compressed holed image
	pieces: PieceData[];
}

const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 600;

const PuzzleEditor: React.FC<PuzzleEditorProps> = ({ imageUrl }) => {
	const [image, setImage] = useState<HTMLImageElement | null>(null);
	const [canvasImage, setCanvasImage] = useState<HTMLImageElement | null>(null);
	const [lines, setLines] = useState<LineData[]>([]);
	const [isDrawing, setIsDrawing] = useState<boolean>(false);
	const [cutShapes, setCutShapes] = useState<LineData[]>([]);
	const [pieces, setPieces] = useState<PieceData[]>([]);
	const stageRef = useRef<any>(null);
	const pieceIdRef = useRef<number>(0);
	const router = useRouter();

	useEffect(() => {
		const img = new window.Image();
		img.src = imageUrl;
		img.crossOrigin = "Anonymous";
		img.onload = () => {
			setImage(img);
			setCanvasImage(img);
		};
	}, [imageUrl]);

	const handleMouseDown = (e: any) => {
		setIsDrawing(true);
		const pos = e.target.getStage().getPointerPosition();
		setLines([...lines, { points: [pos.x, pos.y] }]);
	};

	const handleMouseMove = (e: any) => {
		if (!isDrawing) return;
		const stage = e.target.getStage();
		const point = stage.getPointerPosition();
		setLines((prevLines) => {
			const lastLine = prevLines[prevLines.length - 1];
			lastLine.points = [...lastLine.points, point.x, point.y];
			return [...prevLines.slice(0, -1), lastLine];
		});
	};

	const handleMouseUp = () => {
		setIsDrawing(false);
		if (image) {
			setCutShapes([...cutShapes, ...lines]);
			applyCut([...cutShapes, ...lines]);
		}
	};

	const applyCut = (allCuts: LineData[]) => {
		if (!image) return;

		const canvas = document.createElement("canvas");
		canvas.width = IMAGE_WIDTH;
		canvas.height = IMAGE_HEIGHT;
		const ctx = canvas.getContext("2d");

		if (!ctx) return;

		ctx.drawImage(image, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
		ctx.globalCompositeOperation = "destination-out";
		ctx.fillStyle = "rgba(0,0,0,1)";

		allCuts.forEach((line) => {
			ctx.beginPath();
			const points = line.points;
			if (points.length < 4) return;
			ctx.moveTo(points[0], points[1]);
			for (let i = 2; i < points.length; i += 2) {
				ctx.lineTo(points[i], points[i + 1]);
			}
			ctx.closePath();
			ctx.fill();
		});

		const newImage = new window.Image();
		newImage.src = compressImage(canvas, 0.6); // ✅ Compress before saving
		newImage.onload = () => {
			setCanvasImage(newImage);
			setLines([]);
		};

		savePiece(lines);
	};

	const savePiece = (lines: LineData[]) => {
		if (!image) return;

		const bounds = getBoundingBox(lines.flatMap((l) => l.points));

		// ✅ Create a canvas for this specific piece
		const pieceCanvas = document.createElement("canvas");
		pieceCanvas.width = bounds.width;
		pieceCanvas.height = bounds.height;

		const pieceCtx = pieceCanvas.getContext("2d");
		if (!pieceCtx) return;

		// ✅ Ensure the background is transparent
		pieceCtx.clearRect(0, 0, bounds.width, bounds.height);

		// ✅ Draw only the selected part of the original image inside the shape
		pieceCtx.drawImage(
			image,
			bounds.x,
			bounds.y,
			bounds.width,
			bounds.height, // ✅ Crop the correct part from the original image
			0,
			0,
			bounds.width,
			bounds.height // ✅ Make sure it fills the entire new piece canvas
		);

		// ✅ Apply a precise mask to extract only the selected piece
		pieceCtx.globalCompositeOperation = "destination-in";
		pieceCtx.fillStyle = "rgba(0,0,0,1)";

		lines.forEach((line) => {
			pieceCtx.beginPath();
			// ✅ Adjust shape points so they align within the cropped area
			const adjustedPoints = line.points.map((point, index) =>
				index % 2 === 0 ? point - bounds.x : point - bounds.y
			);
			if (adjustedPoints.length < 4) return;
			pieceCtx.moveTo(adjustedPoints[0], adjustedPoints[1]);
			for (let i = 2; i < adjustedPoints.length; i += 2) {
				pieceCtx.lineTo(adjustedPoints[i], adjustedPoints[i + 1]);
			}
			pieceCtx.closePath();
			pieceCtx.fill();
		});

		// ✅ Convert the correctly cropped piece to an image
		const pieceImage = new window.Image();
		pieceImage.src = pieceCanvas.toDataURL("image/png"); // ✅ Save as PNG to preserve transparency

		const newPiece: PieceData = {
			id: pieceIdRef.current++,
			imageSrc: pieceImage.src, // ✅ Correctly extracted cut-out piece
			x: bounds.x,
			y: bounds.y,
			width: bounds.width,
			height: bounds.height,
			xRatio: bounds.x / IMAGE_WIDTH,
			yRatio: bounds.y / IMAGE_HEIGHT,
			widthRatio: bounds.width / IMAGE_WIDTH,
			heightRatio: bounds.height / IMAGE_HEIGHT,
			shapePath: lines.flatMap((l) => l.points),
		};

		setPieces((prev) => [...prev, newPiece]);
	};

	const compressImage = (image: HTMLImageElement, quality: number): string => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		if (!ctx) return "";

		canvas.width = image.width;
		canvas.height = image.height;
		ctx.drawImage(image, 0, 0, image.width, image.height);

		return canvas.toDataURL("image/jpeg", quality);
	};

	const compressImageUrl = (
		imageUrl: string,
		quality: number
	): Promise<string> => {
		return new Promise((resolve, reject) => {
			const img = new window.Image(); // ✅ Use `window.Image` to avoid conflicts
			img.crossOrigin = "Anonymous"; // Avoid CORS issues
			img.src = imageUrl;

			img.onload = () => {
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");

				if (!ctx) return reject("Canvas context not available");

				// Resize the canvas to match the image
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0, img.width, img.height);

				// Convert to JPEG and compress
				resolve(canvas.toDataURL("image/jpeg", quality));
			};

			img.onerror = () => reject("Failed to load image");
		});
	};

	const getBoundingBox = (points: number[]) => {
		let xVals = points.filter((_, i) => i % 2 === 0);
		let yVals = points.filter((_, i) => i % 2 !== 0);
		return {
			x: Math.min(...xVals),
			y: Math.min(...yVals),
			width: Math.max(...xVals) - Math.min(...xVals),
			height: Math.max(...yVals) - Math.min(...yVals),
		};
	};

	const savePuzzle = async () => {
		if (!image || !canvasImage) return;

		const puzzleId = `puzzle-${Date.now()}`;

		// ✅ Compress original imageUrl
		const compressedOriginalImage = await compressImageUrl(imageUrl, 0.6);

		// ✅ Compress the holed image
		const compressedHoledImage = compressImage(canvasImage, 0.6);

		const puzzle: PuzzleData = {
			id: puzzleId,
			imageUrl: compressedOriginalImage, // ✅ Store compressed original image
			createdAt: new Date().toISOString(),
			holedImage: compressedHoledImage, // ✅ Store compressed holed image
			pieces,
		};

		const existingPuzzles = JSON.parse(localStorage.getItem("puzzles") || "[]");
		existingPuzzles.push(puzzle);
		localStorage.setItem("puzzles", JSON.stringify(existingPuzzles));

		alert("Puzzle saved!");
		router.push(`/puzzle/play/${puzzleId}`);
	};

	return (
		<div>
			<Stage
				ref={stageRef}
				width={IMAGE_WIDTH}
				height={IMAGE_HEIGHT}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
			>
				<Layer>
					{canvasImage && (
						<Image
							image={canvasImage}
							width={IMAGE_WIDTH}
							height={IMAGE_HEIGHT}
						/>
					)}
					{lines.map((line, i) => (
						<Line key={i} points={line.points} stroke="red" strokeWidth={2} />
					))}
				</Layer>
			</Stage>

			<h2>Cut-Out Pieces:</h2>
			<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
				{pieces.map((piece) => (
					<img
						key={piece.id}
						src={piece.imageSrc}
						alt={`Piece ${piece.id}`}
						width={100}
						height={75}
					/>
				))}
			</div>

			<button
				onClick={savePuzzle}
				style={{
					marginTop: "20px",
					padding: "10px",
					fontSize: "16px",
					cursor: "pointer",
				}}
			>
				Save & Play
			</button>
		</div>
	);
};

export default PuzzleEditor;
