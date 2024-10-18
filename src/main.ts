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

const set_thin_marker_button = document.createElement("button");
set_thin_marker_button.className = "thin-btn";
set_thin_marker_button.classList.add('current-marker')
set_thin_marker_button.textContent = "thin";

const set_thick_marker_button = document.createElement("button");
set_thick_marker_button.className = "thick-btn";
set_thick_marker_button.textContent = "thick";

app.append(title);
app.append(canvas);
app.append(clear_button);
app.append(undo_button);
app.append(redo_button);
app.append(set_thin_marker_button);
app.append(set_thick_marker_button);

/** DRAWING LOGIC */
const current_line: LineCommand = {
  thickness: undefined,
  points: [],
  grow: function (x, y) {
    this?.points.push({ x: x, y: y });
  },
  execute: function () {
    if (this.points.length === 0) return;
    const tmp = ctx?.lineWidth;
    ctx!.lineWidth = this.thickness as number;
    const [{ x, y }, ...rest] = this?.points;
    ctx?.beginPath();
    ctx?.moveTo(x, y);
    for (const { x, y } of rest) {
      ctx?.lineTo(x, y);
    }
    ctx?.stroke();
    ctx!.lineWidth = tmp as number;
  },
};

const lines: LineCommand[] = [];
const redo_stack: LineCommand[] = [];
let is_pen_active: ActivePen = false;
const ctx = canvas.getContext("2d");
const thin_line_width = 2;
const thick_line_width = 5;
ctx!.fillStyle = "white";
ctx!.lineWidth = thin_line_width;

const set_marker_width: MarkerCommand = (thin: boolean) => {
  thin ? ctx!.lineWidth = thin_line_width : ctx!.lineWidth = thick_line_width;
};

const start_line_handler = () => {
  current_line.thickness = ctx?.lineWidth;
  is_pen_active = true;
};

const finish_line_handler = () => {
  if (!is_pen_active) return;
  lines.push({ ...current_line });
  current_line.points = [];
  is_pen_active = false;
};

const log_point = (e: MouseEvent) => {
  if (!is_pen_active) return;
  current_line.grow(e.offsetX, e.offsetY);
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

const handle_undo_redo: UndoRedoCommand = (undo: boolean) => {
  if (undo && lines.length === 0) return;
  if (!undo && redo_stack.length === 0) return;
  if (undo) redo_stack.push(lines.pop() as LineCommand);
  else lines.push(redo_stack.pop() as LineCommand);
  canvas.dispatchEvent(new Event("drawing-changed"));
};

canvas.addEventListener("mousedown", start_line_handler);
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
set_thin_marker_button.addEventListener("click", () => {
  set_thick_marker_button.classList.remove("current-marker");
  set_thin_marker_button.classList.add("current-marker");
  set_marker_width(true);
});
set_thick_marker_button.addEventListener(
  "click",
  () => {
    set_thin_marker_button.classList.remove("current-marker");
    set_thick_marker_button.classList.add("current-marker");
    set_marker_width(false);
  },
);
