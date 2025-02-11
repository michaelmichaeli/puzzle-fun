export interface PieceConnection {
  top?: number;    // ID of the piece that should connect above
  right?: number;  // ID of the piece that should connect to the right
  bottom?: number; // ID of the piece that should connect below
  left?: number;   // ID of the piece that should connect to the left
}

export interface ConnectedGroup {
  pieces: number[];  // IDs of all pieces in this group
  positions: {       // Relative positions within the group
    [pieceId: number]: {
      relativeX: number;  // Position relative to group's top-left corner
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

export interface Puzzle {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: string;
  pieces: PieceData[];
  originalWidth: number;
  originalHeight: number;
  connectedGroups: ConnectedGroup[];
}
