/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { Image, Upload } from "lucide-react";
import { useRef, useState, DragEvent } from "react";
import { useSoundContext } from "../contexts/SoundContext";
import { ImageProcessor } from "../utils/ImageProcessor";
import ErrorDialog from "./ErrorDialog";

interface UploadImageProps {
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

type FileHandler = (file: File) => void;

export default function UploadImage({ handleImageChange }: UploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playClick } = useSoundContext();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oversizedFile, setOversizedFile] = useState<{ size: number } | null>(null);

  const handleClick = () => {
    playClick();
    fileInputRef.current?.click();
  };

  const processFile: FileHandler = async (file) => {
    if (!file) return;

    if (file.size > ImageProcessor.MAX_FILE_SIZE) {
      setOversizedFile({ size: file.size });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const processedImage = await ImageProcessor.process(file);
      const dataTransfer = new DataTransfer();
      const response = await fetch(processedImage.dataUrl);
      const blob = await response.blob();
      const processedFile = new File([blob], file.name, { type: "image/jpeg" });
      
      dataTransfer.items.add(processedFile);

      const fakeEvent = {
        target: {
          files: dataTransfer.files,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      handleImageChange(fakeEvent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="text-center space-y-6">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative w-full h-64 border-2 border-dashed rounded-xl 
          transition-all duration-300 p-8 flex flex-col items-center justify-center gap-4
          bg-gradient-to-b cursor-pointer ${
            isDragging
              ? "border-yellow-400 from-yellow-50 scale-[1.02]"
              : "border-blue-400 from-blue-50 hover:border-yellow-400 hover:from-yellow-50"
          } to-white
          ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
      >
        <Upload className="w-12 h-12 text-blue-400 group-hover:text-yellow-400 transition-colors" />
        <div className="text-center space-y-2">
          <p className="text-xl font-bold font-comic text-blue-400 group-hover:text-yellow-400 transition-colors">
            {isProcessing ? "Processing..." : "Upload an Image"}
          </p>
          <p className="text-sm text-blue-400/80 font-comic">
            Click or drag and drop to upload
          </p>
          <p className="text-xs text-blue-400/70 font-comic">
            Supported formats: PNG, JPG, JPEG
          </p>
        </div>

        {error && (
          <div className="absolute top-0 left-0 right-0 px-4 py-3 bg-red-50 text-red-600 text-sm font-comic rounded-t-xl">
            {error}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-blue-50 text-blue-400 text-sm font-comic rounded-b-xl">
          <div className="flex items-center justify-center gap-2">
            <Image className="w-4 h-4" aria-hidden="true" />
            <span>Maximum file size: 5MB</span>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload image file"
      />

      {oversizedFile && (
        <ErrorDialog
          fileSize={oversizedFile.size}
          onClose={() => setOversizedFile(null)}
        />
      )}
    </div>
  );
}
