'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isCreatePage = pathname === '/puzzle/create';

  return (
    <header className="w-full px-4 py-4 border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          {/* Replace with your actual logo */}
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
        </Link>
        
        <nav className="flex gap-4">
          {!isHomePage && (
            <Link 
              href="/"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
          )}
          {!isCreatePage && (
            <Link
              href="/puzzle/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create New Puzzle
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
