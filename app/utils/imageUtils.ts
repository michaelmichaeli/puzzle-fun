import { BoundingBox } from "@/types/puzzle";

export const compressImage = (
  source: HTMLCanvasElement | HTMLImageElement,
  quality: number
): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  canvas.width = source.width;
  canvas.height = source.height;
  ctx.drawImage(source, 0, 0, source.width, source.height);

  return canvas.toDataURL("image/jpeg", quality);
};

export const compressImageUrl = async (
  imageUrl: string,
  quality: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return reject("Canvas context not available");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => reject("Failed to load image");
  });
};

export const scaleDownCanvas = (
  canvas: HTMLCanvasElement,
  maxSize: number
): HTMLCanvasElement => {
  const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height, 1);

  if (scale >= 1) return canvas;

  const scaledCanvas = document.createElement("canvas");
  scaledCanvas.width = canvas.width * scale;
  scaledCanvas.height = canvas.height * scale;

  const ctx = scaledCanvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      scaledCanvas.width,
      scaledCanvas.height
    );
  }

  return scaledCanvas;
};

export const getBoundingBox = (points: number[]): BoundingBox => {
  const xVals = points.filter((_, i) => i % 2 === 0);
  const yVals = points.filter((_, i) => i % 2 !== 0);

  return {
    x: Math.min(...xVals),
    y: Math.min(...yVals),
    width: Math.max(...xVals) - Math.min(...xVals),
    height: Math.max(...yVals) - Math.min(...yVals)
  };
};

export const resizeImage = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return reject("Canvas context not available");

      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 600;

      let { width, height } = img;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const widthRatio = MAX_WIDTH / width;
        const heightRatio = MAX_HEIGHT / height;
        const scale = Math.min(widthRatio, heightRatio);

        width *= scale;
        height *= scale;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };

    img.onerror = () => reject("Failed to load image");
  });
};
