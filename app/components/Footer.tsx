"use client";

import { Github, Linkedin } from "lucide-react";
import Link from "next/link";
import { useSoundContext } from "../contexts/SoundContext";

export default function Footer() {
  const { playClick } = useSoundContext();

  return (
    <footer className="w-full mt-12">
      <div className="relative">
        <div className="absolute inset-0 bg-[#4DB2EC]/10" />
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <h3 className="font-comic text-[#4DB2EC] font-bold">
                PuzzleFun!
              </h3>
              <p className="text-[#4DB2EC]/70">
                Create and solve amazing puzzles together
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href="https://linkedin.com/in/michaelmichaeli"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playClick()}
                className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 hover:rotate-6"
                aria-label="Visit my LinkedIn profile"
              >
                <Linkedin className="w-5 h-5 text-[#4DB2EC]" />
              </Link>
              <Link
                href="https://github.com/michaelmichaeli"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playClick()}
                className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 hover:-rotate-6"
                aria-label="Visit my GitHub profile"
              >
                <Github className="w-5 h-5 text-[#4DB2EC]" />
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-[#4DB2EC]/60 text-sm">
            Made with ❤️ for fun and learning
            <span className="font-comic block mt-1">
              © {new Date().getFullYear()} PuzzleFun!
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
