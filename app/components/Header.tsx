'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX, Home, Puzzle } from 'lucide-react';
import { useSoundContext } from '../contexts/SoundContext';

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isCreatePage = pathname === '/puzzle/create';
  const { isSoundEnabled, toggleSound, playClick } = useSoundContext();

  return (
    <header className="w-full px-4 py-4" style={{ background: 'var(--header-gradient)' }}>
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:rotate-12">
            <Puzzle className="w-8 h-8 text-primary" />
          </div>
          <span className="text-white text-2xl font-bold">PuzzleFun!</span>
        </Link>
        
        <nav className="flex items-center gap-4">
          {!isHomePage && (
            <Link 
              href="/"
              onClick={() => playClick()}
              className="flex items-center gap-2 px-4 py-2 text-white hover:text-yellow-200 transition-colors rounded-full"
              aria-label="Go to home page"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
          )}
          {!isCreatePage && (
            <Link
              href="/puzzle/create"
              onClick={() => playClick()}
              className="flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-full hover:bg-yellow-100 transition-all transform hover:scale-105 shadow-lg"
              aria-label="Create new puzzle"
            >
              <Puzzle className="w-5 h-5" />
              <span className="font-bold">Create Puzzle</span>
            </Link>
          )}
          <button
            onClick={() => {
              playClick();
              toggleSound();
            }}
            className="p-2 text-white hover:text-yellow-200 transition-colors rounded-full"
            aria-label={isSoundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <VolumeX className="w-6 h-6" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
