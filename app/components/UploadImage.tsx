"use client";

import { Image, Upload } from "lucide-react";
import { useRef } from "react";
import { useSoundContext } from "../contexts/SoundContext";

interface UploadImageProps {
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UploadImage({ handleImageChange }: UploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playClick } = useSoundContext();

  const handleClick = () => {
    playClick();
    fileInputRef.current?.click();
  };

  return (
    <div className="text-center space-y-6">
      <button
        onClick={handleClick}
        className="group relative w-full h-64 border-2 border-dashed border-[#4DB2EC] rounded-xl 
          hover:border-[#FFD800] transition-colors duration-300 p-8 flex flex-col items-center justify-center gap-4
          bg-gradient-to-b from-[#E3F2FD] to-white hover:from-[#FFF8E1] to-white"
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
      </button>

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
