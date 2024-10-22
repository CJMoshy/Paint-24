import "./style.css";

/** DOM SETUP */
const APP_NAME = "Paint '24";
document.title = APP_NAME;
const app = document.querySelector<HTMLDivElement>("#app")!;

const CANVAS_HEIGHT = 256;
const CANVAS_WIDTH = 256;

const title = document.createElement("h1");
title.textContent = "Paint '24";

const main_canvas = document.createElement("canvas");
main_canvas.width = CANVAS_WIDTH;
main_canvas.height = CANVAS_HEIGHT;
main_canvas.className = "main-canvas";

const clear_button = document.createElement("button");
clear_button.className = "clear-btn";
clear_button.textContent = "clear";

const export_button = document.createElement("button");
export_button.className = "export-button";
export_button.textContent = "export";

const bottom_container = document.createElement("div");
bottom_container.append(clear_button);
bottom_container.append(export_button);

const undo_button = document.createElement("button");
undo_button.className = "undo-btn";
undo_button.textContent = "undo";

const redo_button = document.createElement("button");
redo_button.className = "redo-btn";
redo_button.textContent = "redo";

const undo_redo_container = document.createElement("div");
undo_redo_container.className = "undo-redo-container";
undo_redo_container.append(undo_button);
undo_redo_container.append(redo_button);

const set_thin_marker_button = document.createElement("button");
set_thin_marker_button.className = "thin-btn";
set_thin_marker_button.classList.add("current-marker");
set_thin_marker_button.textContent = "thin";

const set_thick_marker_button = document.createElement("button");
set_thick_marker_button.className = "thick-btn";
set_thick_marker_button.textContent = "thick";

const marker_size_continer = document.createElement("div");
marker_size_continer.className = "marker-size-container";
marker_size_continer.textContent = "Marker Size";
marker_size_continer.append(set_thin_marker_button);
marker_size_continer.append(set_thick_marker_button);

const add_sticker_button = document.createElement("button");
add_sticker_button.textContent = "Add a sticker";

const sticker_button_1 = document.createElement("button");
sticker_button_1.className = "e-btn1";
sticker_button_1.textContent = "👽";

const sticker_button_2 = document.createElement("button");
sticker_button_2.className = "e-btn2";
sticker_button_2.textContent = "👻";

const sticker_button_3 = document.createElement("button");
sticker_button_3.className = "e-btn3";
sticker_button_3.textContent = "🎃";

const sticker_sidebar = document.createElement("div");
sticker_sidebar.className = "sticker-sidebar";
sticker_sidebar.textContent = "Stickers";
sticker_sidebar.append(add_sticker_button);
sticker_sidebar.append(sticker_button_1);
sticker_sidebar.append(sticker_button_2);
sticker_sidebar.append(sticker_button_3);

const canvas_container = document.createElement("div");
canvas_container.className = "canvas-container";

canvas_container.append(main_canvas);
canvas_container.append(bottom_container);
canvas_container.append(undo_redo_container);

const main_container = document.createElement("div");
main_container.className = "main-container";

main_container.append(marker_size_continer);
main_container.append(canvas_container);
main_container.append(sticker_sidebar);

app.append(title);
app.append(main_container);

/** DRAWING LOGIC */
const current_line: LineCommand = {
  thickness: undefined,
  points: [],
  grow: function (x, y) {
    this?.points.push({ x: x, y: y });
  },
  execute: function (ctx) {
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
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.font = "30px serif";
    ctx.fillText(this.id, this.cords.x, this.cords.y);
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
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
      ctx.fillStyle = "#000000";
      ctx.fillText(this.sticker.id, this.x, this.y);
    }
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
  },
};

const stickers = ["👽", "👻", "🎃"];
const commands: Command[] = [];
const redo_stack: Command[] = [];

const export_scale_factor = 4;
const thin_line_width = 1.5;
const thick_line_width = 4;
const main_ctx = main_canvas.getContext("2d");
main_ctx!.fillStyle = "white";
main_ctx!.lineWidth = thin_line_width;

const handle_export = () => {
  const { export_ctx, export_canvas } = get_export_ctx_and_canvas();
  draw(export_ctx as CanvasRenderingContext2D, export_canvas);
  const anchor = document.createElement("a");
  anchor.href = export_canvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
};

const get_export_ctx_and_canvas = () => {
  const export_canvas = document.createElement("canvas");
  export_canvas.width = 1024;
  export_canvas.height = 1024;
  const export_ctx = export_canvas.getContext("2d");
  export_ctx!.fillStyle = "white";
  export_ctx?.scale(export_scale_factor, export_scale_factor);
  export_ctx?.fillRect(0, 0, export_canvas.width, export_canvas.height);
  return { export_ctx, export_canvas };
};

const add_sticker: AddStickerCommand = () => {
  const new_sticker = prompt("Add a sticker here", "") as string;
  stickers.push(new_sticker);
  const new_sticker_button = document.createElement("button");
  new_sticker_button.addEventListener(
    "click",
    () => {
      sticker_clicked(stickers.length - 1, new_sticker_button);
    },
  );
  new_sticker_button.textContent = new_sticker;
  sticker_sidebar.append(new_sticker_button);
};

const sticker_clicked = (index: number, s: HTMLButtonElement) => {
  document.querySelector(".current-marker")?.classList.remove("current-marker");
  document.querySelector(".current-sticker")?.classList.remove(
    "current-sticker",
  );
  s.classList.add("current-sticker");
  pen.sticker.id = stickers[index];
  pen.sticker.cur = true;
};

const set_marker_width: MarkerCommand = (thin: boolean) => {
  thin
    ? main_ctx!.lineWidth = thin_line_width
    : main_ctx!.lineWidth = thick_line_width;
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
    current_line.thickness = main_ctx?.lineWidth;
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
  main_canvas.dispatchEvent(new Event("drawing-changed"));
};

const handle_mouse_move = (e: MouseEvent) => {
  if (!pen.active) {
    main_canvas.dispatchEvent(new Event("tool-moved"));
  }
  pen.x = e.offsetX;
  pen.y = e.offsetY;
  log_point(e);
};

const handle_thin_marker_toggle = () => {
  pen.sticker.cur = false;
  document.querySelector(".current-sticker")?.classList.remove(
    "current-sticker",
  );
  set_thick_marker_button.classList.remove("current-marker");
  set_thin_marker_button.classList.add("current-marker");
  set_marker_width(true);
};

const handle_thick_marker_toggle = () => {
  pen.sticker.cur = false;
  document.querySelector(".current-sticker")?.classList.remove(
    "current-sticker",
  );
  set_thin_marker_button.classList.remove("current-marker");
  set_thick_marker_button.classList.add("current-marker");
  set_marker_width(false);
};

const handle_undo_redo: UndoRedoCommand = (undo: boolean) => {
  if (undo && commands.length === 0) return;
  if (!undo && redo_stack.length === 0) return;
  if (undo) redo_stack.push(commands.pop() as LineCommand);
  else commands.push(redo_stack.pop() as LineCommand);
  main_canvas.dispatchEvent(new Event("drawing-changed"));
};

const log_point = (e: MouseEvent) => {
  if (!pen.active) return;
  current_line.grow(e.offsetX, e.offsetY);
  main_canvas.dispatchEvent(new Event("drawing-changed"));
};

const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  commands.forEach((e) => e.execute(ctx));
  current_line.execute(ctx);
  pen.execute(ctx);
};

const clear_canvas = () => {
  main_ctx?.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  current_line.points = [];
  commands.length = 0;
  redo_stack.length = 0;
};

/** REGISTER EVENTS TO THE CANVAS */
main_canvas.addEventListener("mousedown", mouse_clicked_on_canvas);
main_canvas.addEventListener("mouseup", finish_line_handler);
main_canvas.addEventListener("mouseleave", finish_line_handler);
main_canvas.addEventListener("mousemove", (e) => {
  handle_mouse_move(e);
});
main_canvas.addEventListener(
  "drawing-changed",
  () => draw(main_ctx as CanvasRenderingContext2D, main_canvas),
);
main_canvas.addEventListener(
  "tool-moved",
  () => draw(main_ctx as CanvasRenderingContext2D, main_canvas),
);

/** REGISTER EVENTS FOR BUTTONS */
export_button.addEventListener("click", handle_export);
clear_button.addEventListener("click", clear_canvas);
undo_button.addEventListener("click", () => handle_undo_redo(true));
redo_button.addEventListener("click", () => handle_undo_redo(false));
set_thin_marker_button.addEventListener("click", handle_thin_marker_toggle);
set_thick_marker_button.addEventListener("click", handle_thick_marker_toggle);
add_sticker_button.addEventListener("click", add_sticker);
sticker_button_1.addEventListener(
  "click",
  () => sticker_clicked(0, sticker_button_1),
);
sticker_button_2.addEventListener(
  "click",
  () => sticker_clicked(1, sticker_button_2),
);
sticker_button_3.addEventListener(
  "click",
  () => sticker_clicked(2, sticker_button_3),
);
