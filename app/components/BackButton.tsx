"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSoundContext } from "../contexts/SoundContext";
import { ButtonWithTooltip } from "./ButtonWithTooltip";

export default function BackButton() {
  const router = useRouter();
  const { playClick } = useSoundContext();

  return (
    <ButtonWithTooltip
      onClick={() => {
        playClick();
        router.back();
      }}
      className="inline-flex items-center gap-2 px-6 py-3 text-blue-400 
        hover:text-blue-500 transition-all duration-200 font-comic font-bold 
        rounded-full bg-white shadow-md hover:shadow-lg transform 
        hover:scale-105 border-2 border-blue-400/10"
      tooltipContent="Return to previous page"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Back</span>
    </ButtonWithTooltip>
  );
}
