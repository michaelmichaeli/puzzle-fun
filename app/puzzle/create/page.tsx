"use client";

import UploadImage from "../../components/UploadImage";
import PuzzleEditor from "../../components/PuzzleEditor";
import { useState, useRef } from "react";

export default function CreatePuzzlePage() {
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const imageContainerRef = useRef<HTMLDivElement | null>(null);

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setImageSrc(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="p-4 max-w-md mx-auto">
			<h1 className="text-2xl mb-4">Create Puzzle</h1>
			{imageSrc ? (
				<div
					ref={imageContainerRef}
					style={{ position: "relative" }}
				>
					<PuzzleEditor imageUrl={imageSrc} />
				</div>
			) : (
				<UploadImage handleImageChange={handleImageChange} />
			)}
		</div>
	);
}
