import { useState, useCallback } from "react";
import { PieceData, ConnectedGroup } from "@/types/puzzle";

const CONNECTION_THRESHOLD = 20; // pixels

interface UsePuzzleSolverProps {
  pieces: PieceData[];
}

export const usePuzzleSolver = ({ pieces }: UsePuzzleSolverProps) => {
  const [connectedGroups, setConnectedGroups] = useState<ConnectedGroup[]>([]);
  const [positions, setPositions] = useState<{ [id: number]: { x: number; y: number } }>({});

  // Find which group a piece belongs to
  const findGroupByPieceId = useCallback((pieceId: number) => {
    return connectedGroups.find(group => group.pieces.includes(pieceId));
  }, [connectedGroups]);

  // Calculate relative positions when pieces connect
  const calculateRelativePositions = useCallback((
    mainPieceId: number,
    connectedPieceId: number,
    mainPiecePos: { x: number; y: number },
    connectedPiecePos: { x: number; y: number }
  ) => {
    const relativeX = connectedPiecePos.x - mainPiecePos.x;
    const relativeY = connectedPiecePos.y - mainPiecePos.y;
    
    return {
      [mainPieceId]: { relativeX: 0, relativeY: 0 },
      [connectedPieceId]: { relativeX, relativeY }
    };
  }, []);

  // Check if two pieces should connect
  const shouldConnect = useCallback((piece1: PieceData, piece2: PieceData): boolean => {
    const pos1 = positions[piece1.id];
    const pos2 = positions[piece2.id];
    if (!pos1 || !pos2) return false;

    // Check if pieces are next to each other in the original grid
    const isConnectedInGrid = (
      piece1.connections.right === piece2.id ||
      piece1.connections.left === piece2.id ||
      piece1.connections.top === piece2.id ||
      piece1.connections.bottom === piece2.id
    );

    if (!isConnectedInGrid) return false;

    // Calculate distance between pieces
    const distance = Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) +
      Math.pow(pos2.y - pos1.y, 2)
    );

    return distance <= CONNECTION_THRESHOLD;
  }, [positions]);

  // Merge two groups into one
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

  // Handle piece movement
  const onPieceMove = useCallback((pieceId: number, x: number, y: number) => {
    // Update piece position
    setPositions(prev => ({
      ...prev,
      [pieceId]: { x, y }
    }));

    // Find the piece's current group
    const currentGroup = findGroupByPieceId(pieceId);
    
    // Move all pieces in the group relative to the dragged piece
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

    // Check for new connections
    pieces.forEach(otherPiece => {
      if (otherPiece.id === pieceId) return;

      if (shouldConnect(pieces[pieceId], otherPiece)) {
        const otherGroup = findGroupByPieceId(otherPiece.id);
        
        // Both pieces are unconnected
        if (!currentGroup && !otherGroup) {
          setConnectedGroups(prev => [...prev, {
            pieces: [pieceId, otherPiece.id],
            positions: calculateRelativePositions(pieceId, otherPiece.id, { x, y }, positions[otherPiece.id])
          }]);
        }
        // Current piece is unconnected but other piece is in a group
        else if (!currentGroup && otherGroup) {
          setConnectedGroups(prev => prev.map(group =>
            group === otherGroup
              ? {
                  pieces: [...group.pieces, pieceId],
                  positions: {
                    ...group.positions,
                    [pieceId]: calculateRelativePositions(
                      otherPiece.id,
                      pieceId,
                      positions[otherPiece.id],
                      { x, y }
                    )[pieceId]
                  }
                }
              : group
          ));
        }
        // Both pieces are in different groups
        else if (currentGroup && otherGroup && currentGroup !== otherGroup) {
          setConnectedGroups(prev => {
            const mergedGroup = mergeGroups(currentGroup, otherGroup, pieceId);
            return prev.filter(g => g !== currentGroup && g !== otherGroup).concat(mergedGroup);
          });
        }
      }
    });
  }, [pieces, positions, connectedGroups, findGroupByPieceId, shouldConnect, calculateRelativePositions, mergeGroups]);

  // Check if puzzle is solved
  const isSolved = useCallback(() => {
    if (connectedGroups.length !== 1) return false;
    
    const group = connectedGroups[0];
    if (group.pieces.length !== pieces.length) return false;

    // All pieces are in one group, puzzle is solved!
    return true;
  }, [connectedGroups, pieces]);

  return {
    positions,
    connectedGroups,
    onPieceMove,
    isSolved
  };
};
