export const DISPLAY_WIDTH = 800;
export const DISPLAY_HEIGHT = 600;
export const PIECE_PLACEMENT_THRESHOLD = 50;
export const COMPRESSION_QUALITY = 0.8;
export const MAX_PIECE_SIZE = 512;

export interface ScaleFactors {
  x: number;
  y: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
  scaleFactors: ScaleFactors;
}

export const calculateImageDimensions = (
  originalWidth: number, 
  originalHeight: number
): ImageDimensions => {
  const aspectRatio = originalWidth / originalHeight;
  let width = DISPLAY_WIDTH;
  let height = DISPLAY_HEIGHT;

  if (width / height > aspectRatio) {
    width = height * aspectRatio;
  } else {
    height = width / aspectRatio;
  }

  const scaleFactors: ScaleFactors = {
    x: width / originalWidth,
    y: height / originalHeight
  };

  return { width, height, scaleFactors };
};
