export interface Point {
  x: number;
  y: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface GridCell {
  row: number;
  col: number;
}

export interface Lines {
  horizontal: number[];
  vertical: number[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Piece {
  id: number;
  image: HTMLCanvasElement;
  x: number;
  y: number;
  width: number;
  height: number;
  connections: PieceConnection;
  gridPosition: GridCell;
}

export interface ContainerDimensions {
  width: number;
  height: number;
}

export interface BoardDimensions {
  totalWidth: number;
  totalHeight: number;
  startX: number;
  startY: number;
}

export interface UsePuzzleEditorProps {
  imageUrl: string;
}

export interface PieceConnection {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface ConnectedGroup {
  pieces: number[];
  positions: {
    [pieceId: number]: {
      relativeX: number;
      relativeY: number;
    };
  };
}

export interface PieceData {
  id: number;
  imageSrc: string;
  x: number;
  y: number;
  width: number;
  height: number;
  widthRatio: number;
  heightRatio: number;
  shapePath: number[];
  connections: PieceConnection;
}

export interface Positions {
  [id: number]: Position;
}

export interface AiGeneratedContent {
  title: string;
  description: string;
  context: string;
}

export interface BoardMatrix {
  rows: number;
  cols: number;
  grid: Array<Array<number | null>>;
}

export interface Puzzle {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: string;
  pieces: PieceData[];
  originalWidth: number;
  originalHeight: number;
  connectedGroups: ConnectedGroup[];
  aiContent?: AiGeneratedContent;
  solution: BoardMatrix;
}
