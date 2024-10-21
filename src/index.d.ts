interface Point {
  x: number;
  y: number;
}

interface Command {
  execute: (ctx: CanvasRenderingContext2D) => void;
}

interface LineCommand extends Command {
  thickness: number | undefined;
  points: Point[];
  grow: (x: number, y: number) => void;
}

interface CursorCommand extends Command {
  active: boolean;
  x: number;
  y: number;
  sticker: {
    cur: boolean;
    id: string;
  };
}

interface StickerCommand extends Command {
  cords: Point;
  id: string;
}

type UndoRedoCommand = (undo: boolean) => void;
type MarkerCommand = (thin: boolean) => void;
type MouseMoveCommand = (ctx: CanvasRenderingContext2D) => void;
