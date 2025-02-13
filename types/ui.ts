export type PlaySound = () => Promise<void> | void;

export interface PuzzleEditorHandlers {
  handleClick: () => boolean;
  handleMouseMove: (e: MouseEvent) => void;
  handleBreakAndSave: () => Promise<void>;
  handleResetLines: () => void;
  handleRegenerateContent: () => void;
}
