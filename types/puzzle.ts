export interface PieceData {
  id: number;
  imageSrc: string;
  x: number;
  y: number;
  width: number;
  height: number;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  shapePath: number[];
}

export interface Puzzle {
  id: string;
  imageUrl: string;
  createdAt: string;
  holedImage: string;
  pieces: PieceData[];
}
