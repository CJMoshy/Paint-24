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
set_thin_marker_button.classList.add("current-marker");
set_thin_marker_button.textContent = "thin";

const set_thick_marker_button = document.createElement("button");
set_thick_marker_button.className = "thick-btn";
set_thick_marker_button.textContent = "thick";

const emoji_button_1 = document.createElement("button");
emoji_button_1.className = "e-btn1";
emoji_button_1.textContent = "👽";

const emoji_button_2 = document.createElement("button");
emoji_button_2.className = "e-btn2";
emoji_button_2.textContent = "👻";

const emoji_button_3 = document.createElement("button");
emoji_button_3.className = "e-btn3";
emoji_button_3.textContent = "🎃";

app.append(title);
app.append(canvas);
app.append(clear_button);
app.append(undo_button);
app.append(redo_button);
app.append(set_thin_marker_button);
app.append(set_thick_marker_button);
app.append(emoji_button_1);
app.append(emoji_button_2);
app.append(emoji_button_3);

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

const current_sticker: StickerCommand = {
  cords: { x: 0, y: 0 },
  id: "",
  execute: function (ctx) {
    ctx.beginPath();
    ctx.font = "30px serif";
    ctx.fillText(this.id, this.cords.x, this.cords.y);
    ctx.stroke();
  },
};

const pen: CursorCommand = {
  active: false,
  x: 0,
  y: 0,
  sticker: {
    cur: false,
    id: "",
  },
  execute: function (ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    if (!this.sticker.cur) {
      ctx.arc(this?.x, this?.y, ctx.lineWidth, 0, 2 * Math.PI);
    } else {
      ctx.font = "30px serif";
      ctx.fillText(this.sticker.id, this.x, this.y);
    }
    ctx.stroke();
  },
};

const stickers = ["👽", "👻", "🎃"];
const commands: Command[] = [];
const redo_stack: Command[] = [];

const ctx = canvas.getContext("2d");
const thin_line_width = 1.5;
const thick_line_width = 4;
ctx!.fillStyle = "white";
ctx!.lineWidth = thin_line_width;

const sticker_clicked = (index: number) => {
  pen.sticker.id = stickers[index];
  pen.sticker.cur = true;
};

const set_marker_width: MarkerCommand = (thin: boolean) => {
  thin ? ctx!.lineWidth = thin_line_width : ctx!.lineWidth = thick_line_width;
};

const place_sticker = () => {
  current_sticker.cords.x = pen.x;
  current_sticker.cords.y = pen.y;
  current_sticker.id = pen.sticker.id;
  commands.push({ ...current_sticker });
  current_sticker.cords = { x: 0, y: 0 };
  current_sticker.id = "";
};

const mouse_clicked_on_canvas = () => {
  if (pen.sticker.cur) place_sticker();
  else {
    current_line.thickness = ctx?.lineWidth;
    pen.active = true;
  }
};

const finish_line_handler = () => {
  if (!pen.active) {
    pen.x = NaN;
    pen.y = NaN;
  } else {
    commands.push({ ...current_line });
    current_line.points = [];
    pen.active = false;
  }
  canvas.dispatchEvent(new Event("drawing-changed"));
};

const handle_mouse_move = (e: MouseEvent) => {
  if (!pen.active) {
    canvas.dispatchEvent(new Event("tool-moved"));
  }
  pen.x = e.offsetX;
  pen.y = e.offsetY;
  log_point(e);
};

const handle_thin_marker_toggle = () => {
  pen.sticker.cur = false;
  set_thick_marker_button.classList.remove("current-marker");
  set_thin_marker_button.classList.add("current-marker");
  set_marker_width(true);
};

const handle_thick_marker_toggle = () => {
  pen.sticker.cur = false;
  set_thin_marker_button.classList.remove("current-marker");
  set_thick_marker_button.classList.add("current-marker");
  set_marker_width(false);
};

const handle_undo_redo: UndoRedoCommand = (undo: boolean) => {
  if (undo && commands.length === 0) return;
  if (!undo && redo_stack.length === 0) return;
  if (undo) redo_stack.push(commands.pop() as LineCommand);
  else commands.push(redo_stack.pop() as LineCommand);
  canvas.dispatchEvent(new Event("drawing-changed"));
};

const log_point = (e: MouseEvent) => {
  if (!pen.active) return;
  current_line.grow(e.offsetX, e.offsetY);
  canvas.dispatchEvent(new Event("drawing-changed"));
};

const draw = (ctx: CanvasRenderingContext2D) => {
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  commands.forEach((e) => e.execute(ctx));
  current_line.execute(ctx);
  pen.execute(ctx);
};

const clear_canvas = () => {
  ctx?.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  current_line.points = [];
  commands.length = 0;
  redo_stack.length = 0;
};

/** REGISTER EVENTS TO THE CANVAS */
canvas.addEventListener("mousedown", mouse_clicked_on_canvas);
canvas.addEventListener("mouseup", finish_line_handler);
canvas.addEventListener("mouseleave", finish_line_handler);
canvas.addEventListener("mousemove", (e) => {
  handle_mouse_move(e);
});
canvas.addEventListener(
  "drawing-changed",
  () => draw(ctx as CanvasRenderingContext2D),
);
canvas.addEventListener(
  "tool-moved",
  () => draw(ctx as CanvasRenderingContext2D),
);

/** REGISTER EVENTS FOR BUTTONS */
clear_button.addEventListener("click", clear_canvas);
undo_button.addEventListener("click", () => handle_undo_redo(true));
redo_button.addEventListener("click", () => handle_undo_redo(false));
set_thin_marker_button.addEventListener("click", handle_thin_marker_toggle);
set_thick_marker_button.addEventListener("click", handle_thick_marker_toggle);
emoji_button_1.addEventListener("click", () => sticker_clicked(0));
emoji_button_2.addEventListener("click", () => sticker_clicked(1));
emoji_button_3.addEventListener("click", () => sticker_clicked(2));
