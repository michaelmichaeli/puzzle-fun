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
    }
  }
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

export interface PiecePosition {
  x: number;
  y: number;
}

export interface PiecePositions {
  [pieceId: number]: PiecePosition;
}

export interface AiGeneratedContent {
  title: string;
  description: string;
  context: string;
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
}
