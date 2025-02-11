import { useRef } from "react";
import Image from "next/image";
import Draggable from "react-draggable";
import { PieceData } from "@/types/puzzle";

interface DraggablePieceProps {
  piece: PieceData;
  width: number;
  height: number;
  initialPosition: {
    x: number;
    y: number;
  };
}

export default function DraggablePiece({ piece, width, height, initialPosition }: DraggablePieceProps) {
  const nodeRef = useRef(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={initialPosition}
    >
      <div
        ref={nodeRef}
        style={{
          position: "absolute",
          cursor: "grab",
          width: width,
          height: height,
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
