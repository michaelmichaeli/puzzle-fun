import { Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative w-full px-4 py-8 mt-auto bg-gradient-to-b from-white to-blue-50">
      {/* Wave Separator */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative w-full h-8"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-white"
          />
        </svg>
      </div>

      <div className="container mx-auto">
        <div className="flex flex-col items-center gap-6">
          {/* Social Links */}
          <div className="flex gap-4">
            <a
              href="https://github.com/michaelmichaeli"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 text-gray-600 hover:text-primary transition-colors rounded-full hover:bg-blue-50 transform hover:scale-110"
              aria-label="Visit my GitHub profile"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://linkedin.com/in/michaelmichaeli"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 text-gray-600 hover:text-primary transition-colors rounded-full hover:bg-blue-50 transform hover:scale-110"
              aria-label="Visit my LinkedIn profile"
            >
              <Linkedin className="w-6 h-6" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-gray-600 font-medium">
            &copy; {new Date().getFullYear()} PuzzleFun!{' '}
            <span className="text-primary">Made with ❤️</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
