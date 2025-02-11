export interface PieceData {
  id: number;
  imageSrc: string;
  x: number;  // Original position X where piece was cut from
  y: number;  // Original position Y where piece was cut from
  xRatio: number;  // Position ratio relative to original image width
  yRatio: number;  // Position ratio relative to original image height
  width: number;
  height: number;
  widthRatio: number;  // For piece sizing
  heightRatio: number; // For piece sizing
  shapePath: number[];
}

export interface Puzzle {
  id: string;
  imageUrl: string;
  createdAt: string;
  holedImage: string;
  pieces: PieceData[];
}
