import "./style.css";

/** DOM SETUP */
const APP_NAME = "Paint World";
document.title = APP_NAME;
const app = document.querySelector<HTMLDivElement>("#app")!;

const CANVAS_HEIGHT = 256;
const CANVAS_WIDTH = 256;

const title = document.createElement("h1");
title.textContent = "Paint";

const canvas = document.createElement("canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.className = "main-canvas";

const clear_button = document.createElement("button");
clear_button.className = "clear-btn";
clear_button.textContent = "clear";

const undo_button = document.createElement("button");
undo_button.className = "undo-btn";
undo_button.textContent = "undo";

const redo_button = document.createElement("button");
redo_button.className = "redo-btn";
redo_button.textContent = "redo";

app.append(title);
app.append(canvas);
app.append(clear_button);
app.append(undo_button);
app.append(redo_button);

/** DRAWING LOGIC */
const current_line: LineCommand = {
  points: [],
  grow: function (x, y) {
    this?.points.push({ x: x, y: y });
  },
  execute: function () {
    if (this.points.length === 0) return;
    const [{ x, y }, ...rest] = this?.points;
    ctx?.beginPath();
    ctx?.moveTo(x, y);
    for (const { x, y } of rest) {
      ctx?.lineTo(x, y);
    }
    ctx?.stroke();
  },
};

const lines: LineCommand[] = [];
const redo_stack: LineCommand[] = [];
const pen = { active: false, x: 0, y: 0 };
const ctx = canvas.getContext("2d");
ctx!.fillStyle = "white";

const start_line_handler = (e: MouseEvent) => {
  pen.active = true;
  pen.x = e.offsetX;
  pen.y = e.offsetY;
};

const finish_line_handler = () => {
  if (!pen.active) return;
  lines.push({ ...current_line });
  current_line.points = [];
  pen.active = false;
};

const log_point = (e: MouseEvent) => {
  if (!pen.active) return;
  current_line.grow(pen.x, pen.y);
  pen.x = e.offsetX;
  pen.y = e.offsetY;
  canvas.dispatchEvent(new Event("drawing-changed"));
};

const draw = (ctx: CanvasRenderingContext2D) => {
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  current_line.execute();
  lines.forEach((e) => e.execute());
};

const clear_canvas = () => {
  ctx?.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  current_line.points = [];
  lines.length = 0;
  redo_stack.length = 0;
};

const handle_undo_redo = (undo: boolean) => {
  if (undo && lines.length === 0) return;
  if (!undo && redo_stack.length === 0) return;
  if (undo) {
    redo_stack.push(lines.pop() as LineCommand);
  } else {
    lines.push(redo_stack.pop() as LineCommand);
  }
  canvas.dispatchEvent(new Event("drawing-changed"));
};

canvas.addEventListener("mousedown", (e) => start_line_handler(e));
canvas.addEventListener("mouseup", finish_line_handler);
canvas.addEventListener("mouseleave", finish_line_handler);
canvas.addEventListener("mousemove", (e) => log_point(e));
canvas.addEventListener(
  "drawing-changed",
  () => draw(ctx as CanvasRenderingContext2D),
);
clear_button.addEventListener("click", clear_canvas);
undo_button.addEventListener("click", () => handle_undo_redo(true));
redo_button.addEventListener("click", () => handle_undo_redo(false));
