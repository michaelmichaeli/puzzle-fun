export interface PieceData {
  id: number;
  imageSrc: string;
  x: number;  // Original position X where piece was cut from
  y: number;  // Original position Y where piece was cut from
  width: number;
  height: number;
  widthRatio: number;  // For piece sizing only
  heightRatio: number; // For piece sizing only
  shapePath: number[];
}

export interface PiecePosition {
  x: number;
  y: number;
}

export interface PiecePositions {
  [pieceId: number]: PiecePosition;
}

export interface Puzzle {
  id: string;
  imageUrl: string;
  createdAt: string;
  holedImage: string;
  pieces: PieceData[];
  originalWidth: number;  // Store original image dimensions for correct scaling
  originalHeight: number;
}
