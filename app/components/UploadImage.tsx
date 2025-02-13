"use client";

import { Image, Upload } from "lucide-react";
import { useRef, useState, DragEvent } from "react";
import { useSoundContext } from "../contexts/SoundContext";

interface UploadImageProps {
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

type FileHandler = (file: File) => void;

export default function UploadImage({ handleImageChange }: UploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playClick } = useSoundContext();
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    playClick();
    fileInputRef.current?.click();
  };

  const processFile: FileHandler = (file) => {
    if (!file) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    const fakeEvent = {
      target: {
        files: dataTransfer.files
      },
      preventDefault: () => {},
      stopPropagation: () => {},
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    handleImageChange(fakeEvent);
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
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  return (
    <div className="text-center space-y-6">
      <div
        role="button"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative w-full h-64 border-2 border-dashed rounded-xl 
          transition-all duration-300 p-8 flex flex-col items-center justify-center gap-4
          bg-gradient-to-b cursor-pointer
          ${isDragging 
            ? 'border-[#FFD800] from-[#FFF8E1] scale-[1.02]' 
            : 'border-[#4DB2EC] from-[#E3F2FD] hover:border-[#FFD800] hover:from-[#FFF8E1]'
          } to-white`}
      >
        <Upload className="w-12 h-12 text-[#4DB2EC] group-hover:text-[#FFD800] transition-colors" />
        <div className="text-center space-y-2">
          <p className="text-xl font-bold font-comic text-[#4DB2EC] group-hover:text-[#FFD800] transition-colors">
            Upload an Image
          </p>
          <p className="text-sm text-[#4DB2EC]/80 font-comic">
            Click or drag and drop to upload
          </p>
          <p className="text-xs text-[#4DB2EC]/70 font-comic">
            Supported formats: PNG, JPG, JPEG
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-[#E3F2FD] text-[#4DB2EC] text-sm font-comic rounded-b-xl">
          <div className="flex items-center justify-center gap-2">
            <Image className="w-4 h-4" />
            <span>Maximum file size: 5MB</span>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        aria-label="Upload image file"
      />
    </div>
  );
}
