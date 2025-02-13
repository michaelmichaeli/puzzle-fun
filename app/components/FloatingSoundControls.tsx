"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSoundContext } from "../contexts/SoundContext";

export function FloatingSoundControls() {
  const { isSoundEnabled, toggleSound, playClick } = useSoundContext();

  const handleVolumeToggle = () => {
    playClick();
    toggleSound();
  };

  return (
    <div className="lg:hidden fixed z-40 right-4 top-[5rem]">
      <button
        onClick={handleVolumeToggle}
        className="p-3 bg-white/90 hover:bg-white rounded-full shadow-lg text-[#4DB2EC] hover:text-[#3DA2DC] transition-all transform hover:scale-105"
        aria-label={isSoundEnabled ? "Mute sound" : "Unmute sound"}
      >
        {isSoundEnabled ? (
          <Volume2 className="w-6 h-6" />
        ) : (
          <VolumeX className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
