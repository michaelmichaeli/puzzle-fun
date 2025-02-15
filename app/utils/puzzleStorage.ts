import { Puzzle } from "@/types/puzzle";

const STORAGE_KEY = "puzzles";

export const loadPuzzles = (): Puzzle[] => {
  try {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading puzzles:", error);
    return [];
  }
};

export const addPuzzle = (puzzle: Puzzle): void => {
  try {
    if (typeof window === "undefined") return;
    const puzzles = loadPuzzles();
    puzzles.push(puzzle);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(puzzles));
  } catch (error) {
    console.error("Error adding puzzle:", error);
  }
};

export const removePuzzle = (puzzleId: string): void => {
  try {
    if (typeof window === "undefined") return;
    const puzzles = loadPuzzles();
    const filtered = puzzles.filter((p) => p.id !== puzzleId);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing puzzle:", error);
  }
};
