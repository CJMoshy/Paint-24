interface Point {
  x: number;
  y: number;
}

interface LineCommand {
  thickness: number | undefined;
  points: Point[];
  grow: (x: number, y: number) => void;
  execute: () => void;
}

interface CursorCommand {
  active: boolean;
  x: number;
  y: number;
  sticker: boolean;
  execute: (ctx: CanvasRenderingContext2D) => void;
}

type UndoRedoCommand = (undo: boolean) => void;
type MarkerCommand = (thin: boolean) => void;
type MouseMoveCommand = (ctx: CanvasRenderingContext2D) => void;
