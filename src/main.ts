import "./style.css";

const APP_NAME = "Paint World";
document.title = APP_NAME;
const app = document.querySelector<HTMLDivElement>("#app")!;

const CANVAS_HEIGHT = 256;
const CANVAS_WIDTH = 256;

const title = document.createElement("h1");
title.textContent = "Paint World";

const canvas = document.createElement("canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.className = "main-canvas";

const clear_button = document.createElement("button");
clear_button.className = "clear-btn";
clear_button.textContent = "clear";

app.append(title);
app.append(canvas);
app.append(clear_button);

// Simple Drawing Logic
let line: Point[] = [];
const lines: Point[][] = [];
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
};

clear_button.addEventListener("click", clear_canvas);
