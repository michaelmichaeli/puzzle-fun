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
    <div className="min-h-screen">
      <div className="p-4 mx-auto animate-fadeIn max-w-7xl">
        <div className="mb-8 animate-slideDown space-y-4">
          <BackButton />
          <h1 className="text-white text-3xl font-bold font-comic">
            Create Your Puzzle!
          </h1>
          <p className="text-white font-comic">
            Upload an image and create a fun puzzle to share with friends!
          </p>
        </div>

        <div className="animate-slideUp">
          {error && (
            <div className="px-6 py-3 bg-red-50 text-red-600 rounded-full font-comic mb-6 shadow-sm border border-red-100">
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
            <div className="bg-white rounded-2xl shadow-lg border-2 border-primary/10 p-8">
              <UploadImage handleImageChange={handleImageChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
