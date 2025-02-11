export const DISPLAY_WIDTH = 800;
export const DISPLAY_HEIGHT = 600;

// When comparing in original image coordinates, we need a larger threshold
export const PIECE_PLACEMENT_THRESHOLD = 50; // pixels in original image coordinates

export const COMPRESSION_QUALITY = 0.8;

export const MAX_PIECE_SIZE = 512; // Maximum pixel size for any piece dimension

export const calculateImageDimensions = (originalWidth: number, originalHeight: number) => {
  const aspectRatio = originalWidth / originalHeight;
  let width = DISPLAY_WIDTH;
  let height = DISPLAY_HEIGHT;

  if (width / height > aspectRatio) {
    // Image is relatively taller
    width = height * aspectRatio;
  } else {
    // Image is relatively wider
    height = width / aspectRatio;
  }

  const scaleFactors = {
    x: width / originalWidth,
    y: height / originalHeight
  };

  return { width, height, scaleFactors };
};
