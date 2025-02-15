import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface ErrorDialogProps {
  fileSize: number;
  onClose: () => void;
}

export default function ErrorDialog({ fileSize, onClose }: ErrorDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const formattedSize = (fileSize / (1024 * 1024)).toFixed(1);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-labelledby="error-dialog-title"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 animate-fadeIn z-50 outline-none space-y-0"
    >
      <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <h3 
            id="error-dialog-title"
            className="text-xl font-bold text-red-600 font-comic"
          >
            File Too Large
          </h3>
          <button
            onClick={onClose}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 font-comic">
          <p>
            Your image is <span className="font-bold">{formattedSize}MB</span>, but
            the maximum allowed size is <span className="font-bold">5MB</span>.
          </p>
          <p className="text-gray-600">
            Try one of these solutions:
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Compress your image before uploading</li>
              <li>Choose a smaller image file</li>
              <li>Reduce the image dimensions</li>
            </ul>
          </p>
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Another Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
