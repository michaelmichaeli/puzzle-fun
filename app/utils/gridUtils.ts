import type {
  BoardMatrix,
  PieceData,
  GridCell,
  Position,
  BoardDimensions,
  ContainerDimensions
} from "@/types/puzzle";

export const findExpectedCell = (
  pieceId: number,
  solution: BoardMatrix
): GridCell => {
  for (let row = 0; row < solution.rows; row++) {
    const col = solution.grid[row].indexOf(pieceId);
    if (col !== -1) {
      return { row, col };
    }
  }
  return { row: -1, col: -1 };
};

export const calculateBoardDimensions = (
  solution: BoardMatrix,
  pieces: PieceData[],
  containerWidth: number,
  containerHeight: number
): BoardDimensions => {
  let totalWidth = 0;
  let totalHeight = 0;

  for (let c = 0; c < solution.cols; c++) {
    const colPiece = pieces.find((p) => solution.grid[0][c] === p.id);
    if (colPiece) totalWidth += colPiece.width;
  }

  for (let r = 0; r < solution.rows; r++) {
    const rowPiece = pieces.find((p) => solution.grid[r][0] === p.id);
    if (rowPiece) totalHeight += rowPiece.height;
  }

  return {
    totalWidth,
    totalHeight,
    startX: (containerWidth - totalWidth) / 2,
    startY: (containerHeight - totalHeight) / 2
  };
};

export const getGridCellCoordinates = (
  row: number,
  col: number,
  targetPieceId: number,
  solution: BoardMatrix,
  pieces: PieceData[],
  container: ContainerDimensions
): Position => {
  const { startX, startY } = calculateBoardDimensions(
    solution,
    pieces,
    container.width,
    container.height
  );

  let x = startX;
  for (let c = 0; c < col; c++) {
    const colPiece = pieces.find((p) => solution.grid[row][c] === p.id);
    if (colPiece) x += colPiece.width;
  }

  let y = startY;
  for (let r = 0; r < row; r++) {
    const rowPiece = pieces.find((p) => solution.grid[r][col] === p.id);
    if (rowPiece) y += rowPiece.height;
  }

  const targetPiece = pieces.find((p) => p.id === targetPieceId);
  if (targetPiece) {
    const currentCellPiece = pieces.find(
      (p) => solution.grid[row][col] === p.id
    );
    if (currentCellPiece) {
      x += (currentCellPiece.width - targetPiece.width) / 2;
      y += (currentCellPiece.height - targetPiece.height) / 2;
    }
  }

  return { x, y };
};

export const calculateDistance = (pos1: Position, pos2: Position): number => {
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
};
