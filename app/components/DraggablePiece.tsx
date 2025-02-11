import { useRef } from "react";
import Image from "next/image";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { PieceData, PiecePosition } from "@/types/puzzle";

interface DraggablePieceProps {
  piece: PieceData;
  width: number;
  height: number;
  position: PiecePosition;
  isPlaced?: boolean;
  onDragStop: (e: DraggableEvent, data: DraggableData, piece: PieceData) => void;
}

export const DraggablePiece = ({ 
  piece, 
  width, 
  height,
  position,
  isPlaced = false,
  onDragStop
}: DraggablePieceProps) => {
  const nodeRef = useRef(null);

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    onDragStop(e, data, piece);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStop={handleDragStop}
      disabled={isPlaced}
    >
      <div
        ref={nodeRef}
        className={`absolute ${isPlaced ? 'cursor-default' : 'cursor-grab'} transition-opacity`}
        style={{
          width,
          height,
          opacity: isPlaced ? 0.8 : 1,
        }}
      >
        <Image
          src={piece.imageSrc}
          alt={`Piece ${piece.id}`}
          width={width}
          height={height}
          className="touch-none max-w-full max-h-full object-contain select-none"
          priority
          draggable={false}
        />
      </div>
    </Draggable>
  );
};

export default DraggablePiece;
