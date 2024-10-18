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

type UndoRedoCommand = (undo: boolean) => void;
type MarkerCommand = (thin: boolean) => void;

type ActivePen = boolean;
