"use client";

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSoundContext } from '../contexts/SoundContext';

export default function BackButton() {
  const router = useRouter();
  const { playClick } = useSoundContext();

  return (
    <button
      onClick={() => {
        playClick();
        router.back();
      }}
      className="inline-flex items-center gap-2 px-6 py-3 text-[#4DB2EC] 
        hover:text-[#3DA2DC] transition-all duration-200 font-comic font-bold 
        rounded-full bg-white shadow-md hover:shadow-lg transform 
        hover:scale-105 border-2 border-[#4DB2EC]/10"
      aria-label="Go back to previous page"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Back</span>
    </button>
  );
}
