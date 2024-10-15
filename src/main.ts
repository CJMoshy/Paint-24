import "./style.css";

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
undo_button.className = "clear-btn";
undo_button.textContent = "undo";

const redo_button = document.createElement("button");
redo_button.className = "clear-btn";
redo_button.textContent = "redo";

app.append(title);
app.append(canvas);
app.append(clear_button);
app.append(undo_button);
app.append(redo_button);

// Simple Drawing Logic
let line: Line = [];
const lines: Line[] = [];
const redo_stack: Line[] = [];
const pen = { active: false, x: 0, y: 0 };
const ctx = canvas.getContext("2d");
ctx!.fillStyle = "white";

canvas.addEventListener("mousedown", (e) => start_line_handler(e));
canvas.addEventListener("mouseup", () => finish_line_handler());
canvas.addEventListener("mouseleave", () => finish_line_handler());
canvas.addEventListener("mousemove", (e) => log_point(e));
canvas.addEventListener(
  "drawing-changed",
  () => draw(ctx as CanvasRenderingContext2D),
);

const start_line_handler = (e: MouseEvent) => {
  pen.active = true;
  pen.x = e.offsetX;
  pen.y = e.offsetY;
};

const finish_line_handler = () => {
  if (!pen.active) return;
  lines.push(line);
  line = [];
  pen.active = false;
};

const log_point = (e: MouseEvent) => {
  if (!pen.active) return;
  line.push({ x: pen.x, y: pen.y });
  pen.x = e.offsetX;
  pen.y = e.offsetY;
  canvas.dispatchEvent(new Event("drawing-changed"));
};

const draw = (ctx: CanvasRenderingContext2D) => {
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let x = 0; x < line.length - 1; x++) {
    ctx.beginPath();
    ctx.moveTo(line[x].x, line[x].y);
    ctx.lineTo(line[x + 1].x, line[x + 1].y);
    ctx.stroke();
  }
  for (const l of lines) {
    for (let x = 0; x < l.length - 1; x++) {
      ctx.beginPath();
      ctx.moveTo(l[x].x, l[x].y);
      ctx.lineTo(l[x + 1].x, l[x + 1].y);
      ctx.stroke();
    }
  }
};

const clear_canvas = () => {
  ctx?.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  line.length = 0;
  lines.length = 0;
  redo_stack.length = 0;
};

const handle_undo_redo = (undo: boolean) => {
  console.log("click", lines);
  if (undo && lines.length === 0) return;
  if (!undo && redo_stack.length === 0) return;
  if (undo) {
    redo_stack.push(lines.pop() as Line);
  } else {
    lines.push(redo_stack.pop() as Line);
  }
  canvas.dispatchEvent(new Event("drawing-changed"));
};

clear_button.addEventListener("click", clear_canvas);
undo_button.addEventListener("click", () => handle_undo_redo(true));
redo_button.addEventListener("click", () => handle_undo_redo(false));
