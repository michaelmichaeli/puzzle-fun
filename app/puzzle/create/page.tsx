"use client";

import { useState, useRef } from "react";
import UploadImage from "@/app/components/UploadImage";
import PuzzleEditor from "@/app/components/PuzzleEditor";
import BackButton from "@/app/components/BackButton";
import { resizeImage } from "@/app/utils/imageUtils";

export default function CreatePuzzlePage() {
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const imageContainerRef = useRef<HTMLDivElement | null>(null);

const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const originalSrc = e.target?.result as string;
      try {
        const resizedSrc = await resizeImage(originalSrc);
        setImageSrc(resizedSrc);
      } catch (error) {
        console.error('Error resizing image:', error);
        setImageSrc(originalSrc); // Fallback to original if resize fails
      }
    };
    reader.readAsDataURL(file);
  }
};

	return (
<div>
<BackButton />
<div className="p-4 mx-auto">
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
</div>
	);
}
