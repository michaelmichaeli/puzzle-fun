export const DISPLAY_WIDTH = 800;
export const DISPLAY_HEIGHT = 600;
export const COMPRESSION_QUALITY = 0.3;
export const MAX_PIECE_SIZE = 300;
export const PIECE_PLACEMENT_THRESHOLD = 30; // Distance in pixels for correct piece placement

export function calculateImageDimensions(originalWidth: number, originalHeight: number) {
  const targetAspectRatio = DISPLAY_WIDTH / DISPLAY_HEIGHT;
  const originalAspectRatio = originalWidth / originalHeight;
  
  let width = DISPLAY_WIDTH;
  let height = DISPLAY_HEIGHT;
  
  // Preserve aspect ratio while fitting within display dimensions
  if (originalAspectRatio > targetAspectRatio) {
    // Image is wider than display area
    height = width / originalAspectRatio;
  } else {
    // Image is taller than display area
    width = height * originalAspectRatio;
  }

  const scaleFactors = {
    x: width / originalWidth,
    y: height / originalHeight
  };

  return {
    width,
    height,
    scaleFactors
  };
}
