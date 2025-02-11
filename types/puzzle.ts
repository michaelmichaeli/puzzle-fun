export interface PieceData {
  id: number;
  imageSrc: string;
  x: number;  // Target position X where piece was cut from
  y: number;  // Target position Y where piece was cut from
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
