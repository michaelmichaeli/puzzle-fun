"use client";

import { useState, useRef } from "react";
import UploadImage from "@/app/components/UploadImage";
import PuzzleEditor from "@/app/components/PuzzleEditor";
import BackButton from "@/app/components/BackButton";
import { resizeImage } from "@/app/utils/imageUtils";

export default function CreatePuzzlePage() {
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const imageContainerRef = useRef<HTMLDivElement | null>(null);

	const handleImageChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (file) {
			setError(null);

			try {
				const reader = new FileReader();
				const originalSrc = await new Promise<string>((resolve, reject) => {
					reader.onload = (e) => resolve(e.target?.result as string);
					reader.onerror = reject;
					reader.readAsDataURL(file);
				});

				const resizedSrc = await resizeImage(originalSrc);
				setImageSrc(resizedSrc);
			} catch (error) {
				console.error("Error processing image:", error);
				setError("Failed to process image. Please try again.");
				setImageSrc(null);
			}
		}
	};

	return (
		<div className="min-h-screen bg-gray-900 text-white">
			<div className="p-4 mx-auto animate-fadeIn">
				<div className="mb-8 animate-slideDown">
					<BackButton />
					<h1 className="text-2xl font-bold mt-4">Create Puzzle</h1>
				</div>
				<div className="animate-slideUp">
					{error && (
						<div className="text-red-500 mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
							{error}
						</div>
					)}

					{imageSrc ? (
						<div
							ref={imageContainerRef}
							className="transition-all duration-300"
						>
							<PuzzleEditor imageUrl={imageSrc} />
						</div>
					) : (
						<UploadImage handleImageChange={handleImageChange} />
					)}
				</div>
			</div>
		</div>
	);
}
