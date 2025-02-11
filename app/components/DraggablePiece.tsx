import { useRef } from "react";
import Image from "next/image";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { PieceData } from "@/types/puzzle";

interface DraggablePieceProps {
  piece: PieceData;
  width: number;
  height: number;
  initialPosition: {
    x: number;
    y: number;
  };
  isPlaced?: boolean;
  onDragStop: (e: DraggableEvent, data: DraggableData, piece: PieceData) => void;
}

export default function DraggablePiece({ 
  piece, 
  width, 
  height, 
  initialPosition,
  isPlaced = false,
  onDragStop
}: DraggablePieceProps) {
  const nodeRef = useRef(null);

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    onDragStop(e, data, piece);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={initialPosition}
      onStop={handleDragStop}
      disabled={isPlaced}
    >
      <div
        ref={nodeRef}
        style={{
          position: "absolute",
          cursor: isPlaced ? "default" : "grab",
          width: width,
          height: height,
          opacity: isPlaced ? 0.8 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        <Image
          src={piece.imageSrc}
          alt={`Piece ${piece.id}`}
          width={width}
          height={height}
          style={{ 
            touchAction: "none", // Prevents touch scrolling while dragging
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain"
          }}
          draggable={false} // Prevents default HTML5 drag behavior
        />
      </div>
    </Draggable>
  );
}
