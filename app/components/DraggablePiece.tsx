import { useRef, useState } from "react";
import Image from "next/image";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { PieceData } from "@/types/puzzle";
import { PIECE_PLACEMENT_THRESHOLD } from "@/app/constants/dimensions";

interface DraggablePieceProps {
  piece: PieceData;
  width: number;
  height: number;
  initialPosition: {
    x: number;
    y: number;
  };
  onCorrectPlacement?: (pieceId: number) => void;
}

export default function DraggablePiece({ 
  piece, 
  width, 
  height, 
  initialPosition,
  onCorrectPlacement 
}: DraggablePieceProps) {
  const nodeRef = useRef(null);
  const [placed, setPlaced] = useState(false);

  const handleDragStop = (_e: DraggableEvent, data: DraggableData) => {
    const distance = Math.sqrt(
      Math.pow(data.x - piece.x, 2) + 
      Math.pow(data.y - piece.y, 2)
    );
    console.log("🚀 ~ handleDragStop ~ distance:", distance)

    if (distance <= PIECE_PLACEMENT_THRESHOLD && !placed) {
      setPlaced(true);
      onCorrectPlacement?.(piece.id);
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={initialPosition}
      onStop={handleDragStop}
      disabled={placed}
    >
      <div
        ref={nodeRef}
        style={{
          position: "absolute",
          cursor: placed ? "default" : "grab",
          width: width,
          height: height,
          opacity: placed ? 0.8 : 1,
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
