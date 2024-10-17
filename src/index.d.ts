interface Point {
  x: number;
  y: number;
}

interface LineCommand {
  points: Point[];
  grow: (x: number, y: number) => void;
  execute: () => void;
}

