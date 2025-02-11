import { useState, useCallback } from "react";
import { PieceData, ConnectedGroup } from "@/types/puzzle";

const CONNECTION_THRESHOLD = 15;
const ALIGNMENT_THRESHOLD = 8;

const playConnectionSound = () => {
  const audio = new Audio("data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+NAwAAAAAAAAAAAAFhpbmcAAAAPAAAAAwAAA/YAVlZWVlZWVlZWVlZWVlZWVlZWVlZra2tra2tra2tra2tra2tra2tra4CAgICAgICAgICAgICAgICAgICAgJWVlZWVlZWVlZWVlZWVlZWVlZWVlf///////////////////////////////////////////8XAAAAA//NAxAANgwqQAUYYAP+nRF1MzE7OTk4Sjs5PT05SPs5PTk5OUfjk5OUg7OT85Oj84/nJ+lH46P0o/Sj9H6UeJR4//KPEcUeJR//Eo7/4lHiUf//Eo7/KO/iP//Eo7/8o7/Eo7/w==");
  audio.volume = 0.2;
  audio.play();
};

interface UsePuzzleSolverProps {
  pieces: PieceData[];
}

export const usePuzzleSolver = ({ pieces }: UsePuzzleSolverProps) => {
  const [connectedGroups, setConnectedGroups] = useState<ConnectedGroup[]>([]);
  const [positions, setPositions] = useState<{ [id: number]: { x: number; y: number } }>({});

  const findGroupByPieceId = useCallback((pieceId: number) => {
    return connectedGroups.find(group => group.pieces.includes(pieceId));
  }, [connectedGroups]);

  const checkAlignment = useCallback((
    piece1: PieceData,
    piece2: PieceData,
    side: 'right' | 'left' | 'top' | 'bottom'
  ): boolean => {
    const pos1 = positions[piece1.id];
    const pos2 = positions[piece2.id];
    if (!pos1 || !pos2) return false;

    switch (side) {
      case 'right': {
        const p1Right = pos1.x + piece1.width;
        const p2Left = pos2.x;
        return (
          Math.abs(pos1.y - pos2.y) < ALIGNMENT_THRESHOLD && // Vertical alignment
          Math.abs(p1Right - p2Left) < CONNECTION_THRESHOLD // Horizontal proximity
        );
      }
      case 'left': {
        const p1Left = pos1.x;
        const p2Right = pos2.x + piece2.width;
        return (
          Math.abs(pos1.y - pos2.y) < ALIGNMENT_THRESHOLD && // Vertical alignment
          Math.abs(p1Left - p2Right) < CONNECTION_THRESHOLD // Horizontal proximity
        );
      }
      case 'bottom': {
        const p1Bottom = pos1.y + piece1.height;
        const p2Top = pos2.y;
        return (
          Math.abs(pos1.x - pos2.x) < ALIGNMENT_THRESHOLD && // Horizontal alignment
          Math.abs(p1Bottom - p2Top) < CONNECTION_THRESHOLD // Vertical proximity
        );
      }
      case 'top': {
        const p1Top = pos1.y;
        const p2Bottom = pos2.y + piece2.height;
        return (
          Math.abs(pos1.x - pos2.x) < ALIGNMENT_THRESHOLD && // Horizontal alignment
          Math.abs(p1Top - p2Bottom) < CONNECTION_THRESHOLD // Vertical proximity
        );
      }
    }
  }, [positions]);

  const getSnapPosition = useCallback((
    piece1: PieceData,
    piece2: PieceData,
    side: 'right' | 'left' | 'top' | 'bottom'
  ): { x: number; y: number } => {
    const pos1 = positions[piece1.id];

    switch (side) {
      case 'right':
        return {
          x: pos1.x + piece1.width,
          y: pos1.y
        };
      case 'left':
        return {
          x: pos1.x - piece2.width,
          y: pos1.y
        };
      case 'bottom':
        return {
          x: pos1.x,
          y: pos1.y + piece1.height
        };
      case 'top':
        return {
          x: pos1.x,
          y: pos1.y - piece2.height
        };
    }
  }, [positions]);

  const shouldConnect = useCallback((piece1: PieceData, piece2: PieceData): [boolean, 'right' | 'left' | 'top' | 'bottom' | null] => {
    // Check each possible connection
    if (piece1.connections.right === piece2.id && checkAlignment(piece1, piece2, 'right')) {
      return [true, 'right'];
    }
    if (piece1.connections.left === piece2.id && checkAlignment(piece1, piece2, 'left')) {
      return [true, 'left'];
    }
    if (piece1.connections.bottom === piece2.id && checkAlignment(piece1, piece2, 'bottom')) {
      return [true, 'bottom'];
    }
    if (piece1.connections.top === piece2.id && checkAlignment(piece1, piece2, 'top')) {
      return [true, 'top'];
    }
    return [false, null];
  }, [checkAlignment]);

  const mergeGroups = useCallback((group1: ConnectedGroup, group2: ConnectedGroup, mainPieceId: number) => {
    const mainPiecePos = positions[mainPieceId];
    const newPositions = { ...group1.positions };

    group2.pieces.forEach(pieceId => {
      const piecePos = positions[pieceId];
      if (piecePos) {
        newPositions[pieceId] = {
          relativeX: piecePos.x - mainPiecePos.x,
          relativeY: piecePos.y - mainPiecePos.y
        };
      }
    });

    return {
      pieces: [...group1.pieces, ...group2.pieces],
      positions: newPositions
    };
  }, [positions]);

  const onPieceMove = useCallback((pieceId: number, x: number, y: number) => {
  setPositions(prev => ({
      ...prev,
      [pieceId]: { x, y }
    }));

    const currentGroup = findGroupByPieceId(pieceId);
    
    if (currentGroup) {
      const deltaX = x - positions[pieceId].x;
      const deltaY = y - positions[pieceId].y;

      setPositions(prev => {
        const newPositions = { ...prev };
        currentGroup.pieces.forEach(groupPieceId => {
          if (groupPieceId !== pieceId) {
            const pos = prev[groupPieceId];
            newPositions[groupPieceId] = {
              x: pos.x + deltaX,
              y: pos.y + deltaY
            };
          }
        });
        return newPositions;
      });
    }

    const currentPiece = pieces.find(p => p.id === pieceId);
    if (!currentPiece) return;

    pieces.forEach(otherPiece => {
      if (otherPiece.id === pieceId) return;

      const [shouldConnectPieces, connectionSide] = shouldConnect(currentPiece, otherPiece);
      if (shouldConnectPieces && connectionSide) {
        playConnectionSound();
        const otherGroup = findGroupByPieceId(otherPiece.id);
        const snapPosition = getSnapPosition(currentPiece, otherPiece, connectionSide);

        setPositions(prev => {
          const newPositions = { ...prev };
          if (currentGroup) {
            const deltaX = snapPosition.x - positions[pieceId].x;
            const deltaY = snapPosition.y - positions[pieceId].y;
            currentGroup.pieces.forEach(groupPieceId => {
              const pos = prev[groupPieceId];
              newPositions[groupPieceId] = {
                x: pos.x + deltaX,
                y: pos.y + deltaY
              };
            });
          } else {
            newPositions[pieceId] = snapPosition;
          }
          return newPositions;
        });
        
        if (!currentGroup && !otherGroup) {
          setConnectedGroups(prev => [...prev, {
            pieces: [pieceId, otherPiece.id],
            positions: {
              [pieceId]: { relativeX: 0, relativeY: 0 },
              [otherPiece.id]: {
                relativeX: positions[otherPiece.id].x - snapPosition.x,
                relativeY: positions[otherPiece.id].y - snapPosition.y
              }
            }
          }]);
        }
        else if (!currentGroup && otherGroup) {
          setConnectedGroups(prev => prev.map(group =>
            group === otherGroup
              ? {
                  pieces: [...group.pieces, pieceId],
                  positions: {
                    ...group.positions,
                    [pieceId]: {
                      relativeX: snapPosition.x - positions[otherPiece.id].x,
                      relativeY: snapPosition.y - positions[otherPiece.id].y
                    }
                  }
                }
              : group
          ));
        }
        else if (currentGroup && otherGroup && currentGroup !== otherGroup) {
          setConnectedGroups(prev => {
            const mergedGroup = mergeGroups(currentGroup, otherGroup, pieceId);
            return prev.filter(g => g !== currentGroup && g !== otherGroup).concat(mergedGroup);
          });
        }
      }
    });
  }, [pieces, positions, connectedGroups, findGroupByPieceId, shouldConnect, getSnapPosition, mergeGroups]);

  const isSolved = useCallback(() => {
    if (connectedGroups.length !== 1) return false;
    
    const group = connectedGroups[0];
    if (group.pieces.length !== pieces.length) return false;

    return true;
  }, [connectedGroups, pieces]);

  return {
    positions,
    connectedGroups,
    onPieceMove,
    isSolved
  };
};
