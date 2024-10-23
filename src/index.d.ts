interface Point {
  x: number;
  y: number;
}

interface Command {
  execute: (ctx: CanvasRenderingContext2D) => void;
}

interface LineCommand extends Command {
  thickness: number | undefined;
  color: string;
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

type Sticker = string;
interface StickerCommand extends Command {
  cords: Point;
  id: Sticker;
}

type UndoRedoCommand = (undo: boolean) => void;
type MarkerCommand = (width: number) => void;
type MouseMoveCommand = (ctx: CanvasRenderingContext2D) => void;
type AddStickerCommand = () => void;
