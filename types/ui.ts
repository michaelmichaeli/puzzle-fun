import { AiGeneratedContent } from "./puzzle";

export type PlaySound = () => Promise<void> | void;

export interface AIStatusBoxProps {
  isLoading: boolean;
  error: string | null;
  aiContent?: AiGeneratedContent;
  onRegenerate: () => void;
}

export interface PuzzleEditorHandlers {
  handleClick: () => boolean;
  handleMouseMove: (e: MouseEvent) => void;
  handleBreakAndSave: () => Promise<void>;
  handleResetLines: () => void;
  handleRegenerateContent: () => void;
}
