interface PuzzleGameStatusProps {
  totalPieces: number;
  placedPieces: number;
}

export const PuzzleGameStatus: React.FC<PuzzleGameStatusProps> = ({
  totalPieces,
  placedPieces,
}) => (
  <div className="w-full mb-5 text-center">
    {placedPieces === totalPieces ? (
      <h2 className="text-2xl font-bold text-green-600">
        🎉 Puzzle Complete! 🎉
      </h2>
    ) : (
      <h2 className="text-xl font-semibold text-gray-700">
        Pieces placed correctly: {placedPieces} / {totalPieces}
      </h2>
    )}
  </div>
);
