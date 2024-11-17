import "./style.css";

/** DOM SETUP */
const main_canvas = document.getElementById(
  "main-canvas",
)! as HTMLCanvasElement;

/** DRAWING LOGIC */
const current_line: LineCommand = {
  thickness: 0,
  color: "black",
  points: [],
  grow: function (x, y) {
    this.points.push({ x, y });
  },
  execute: function (ctx) {
    if (this.points.length === 0) return;
    ctx.save();
    ctx.lineWidth = this.thickness;
    ctx.strokeStyle = this.color;
    const [{ x, y }, ...rest] = this.points;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (const { x, y } of rest) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
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
    current: false,
    id: "",
  },
  execute: function (ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    if (!this.sticker.current) {
      ctx.arc(this.x, this.y, ctx.lineWidth, 0, 2 * Math.PI);
    } else {
      ctx.font = "30px serif";
      ctx.fillStyle = "#000000";
      ctx.fillText(this.sticker.id, this.x, this.y);
    }
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
  },
};

const stickers: Sticker[] = ["👽", "👻", "🎃"];
const commands: Command[] = [];
const redo_stack: Command[] = [];

const export_scale_factor = 4;
const main_ctx = main_canvas.getContext("2d")!;
main_ctx.fillStyle = "white";
main_ctx.lineWidth = 1.5;

/**
 * @function
 * saves the sticker array to local storage
 * creates new allocation if not alreay in local storage
 * @param sticker stickers are strings lol
 */
const save_to_local_storage = (sticker: Sticker) => {
  const saved = localStorage.getItem("stickers");
  if (!saved) {
    const saved_stickers = [sticker];
    localStorage.setItem("stickers", JSON.stringify(saved_stickers));
  } else {
    const parsed = JSON.parse(saved);
    parsed.push(sticker);
    localStorage.setItem("stickers", JSON.stringify(parsed));
  }
};

/**
 * @function
 * helper function for the expoert method that creates the new canvas
 * and associated rendering context.
 */
const get_export_ctx_and_canvas = () => {
  const export_canvas = document.createElement("canvas");
  export_canvas.width = 1024;
  export_canvas.height = 1024;
  const export_ctx = export_canvas.getContext("2d")!;
  export_ctx.fillStyle = "white";
  export_ctx.scale(export_scale_factor, export_scale_factor);
  export_ctx.fillRect(0, 0, export_canvas.width, export_canvas.height);
  return { export_ctx, export_canvas };
};

/**
 * @function
 * helper for clicking on a sticker that deals with CSS classes.
 * More importantly, it sets the drawing tool to the sticker
 * @param s
 */
const sticker_clicked = (s: HTMLButtonElement) => {

  const current_sticker = document.querySelector<HTMLButtonElement>(".current-sticker")
  if(current_sticker){
    current_sticker.classList.remove('current-sticker')
  }
  s.classList.add("current-sticker");
  pen.sticker.id = stickers[stickers.findIndex((e) => e === s.textContent)];
  pen.sticker.current = true;
};

/**
 * @function
 * @param number
 * @command set marker width wrapper fn
 */
const set_marker_width: MarkerCommand = (width: number) => {
  main_ctx!.lineWidth = width;
};

/**
 * @function
 * helper to 'place' the sticker
 * pushes current sticker to commands array
 * to be drawn in the next cycle
 */
const place_sticker = () => {
  current_sticker.cords.x = pen.x;
  current_sticker.cords.y = pen.y;
  current_sticker.id = pen.sticker.id;
  commands.push({ ...current_sticker });
  current_sticker.cords = { x: 0, y: 0 };
  current_sticker.id = "";
};

/**
 * @function
 * helper for finishing a line
 * saves lines or removes tooltip for
 * drawing tool from canvas
 */
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

/**
 * @function
 * log the current point the pen is at if in drawing state
 * @param e MouseEvent
 */
const log_point = (e: MouseEvent) => {
  if (!pen.active) return;
  current_line.grow(e.offsetX, e.offsetY);
  main_canvas.dispatchEvent(new Event("drawing-changed"));
};

/**
 * @function
 * this is the main rendering function for the application.
 * it delegates work to any active commands and
 * @param ctx rendering context from canvas
 * @param canvas html canvas element
 */
const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  commands.forEach((e) => e.execute(ctx));
  current_line.execute(ctx);
  pen.execute(ctx);
};

/** REGISTER EVENTS TO THE CANVAS */
main_canvas.addEventListener("mousedown", () => {
  if (pen.sticker.current) place_sticker();
  else {
    current_line.thickness = main_ctx?.lineWidth;
    pen.active = true;
  }
});
main_canvas.addEventListener("mouseup", finish_line_handler);
main_canvas.addEventListener("mouseleave", finish_line_handler);
main_canvas.addEventListener("mousemove", (e: MouseEvent) => {
  if (!pen.active) {
    main_canvas.dispatchEvent(new Event("tool-moved"));
  }
  pen.x = e.offsetX;
  pen.y = e.offsetY;
  log_point(e);
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
document.getElementById("export")!.addEventListener("click", () => {
  const { export_ctx, export_canvas } = get_export_ctx_and_canvas();
  draw(export_ctx, export_canvas);
  const anchor = document.createElement("a");
  anchor.href = export_canvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});
document.getElementById("clear")!.addEventListener("click", () => {
  main_ctx.fillRect(0, 0, 256, 256);
  current_line.points = [];
  commands.length = 0;
  redo_stack.length = 0;
});
document.getElementById("undo")!.addEventListener("click", () => {
  if (commands.length === 0) return;
  redo_stack.push(commands.pop()!);
  main_canvas.dispatchEvent(new Event("drawing-changed"));
});
document.getElementById("redo")!.addEventListener("click", () => {
  if (redo_stack.length === 0) return;
  commands.push(redo_stack.pop()!);
  main_canvas.dispatchEvent(new Event("drawing-changed"));
});

document.getElementById("marker-slider")!.addEventListener("input", () => {
  const val = document.getElementById("marker-slider") as HTMLInputElement;
  const parsed = parseInt(val.value) / 25; // largest size allowed is 4
  set_marker_width(parsed);
  document.querySelector(".slider-txt")!.textContent =
    `Custom Size -> ${parsed}`;
});
document.getElementById("color-slider")!.addEventListener("input", () => {
  const val = document.getElementById("color-slider") as HTMLInputElement;
  const hue = Number(val.value);
  current_line.color = `hsl(${hue}, 100%, 50%)`;
  const color_preview = document.querySelector(
    ".sampler-div",
  ) as HTMLDivElement;
  color_preview.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
});
document.getElementById("reset-color-btn")!.addEventListener("click", () => {
  const color_preview = document.querySelector(
    ".sampler-div",
  ) as HTMLDivElement;
  color_preview.style.backgroundColor = "black";
  current_line.color = "black";
});
document.getElementById("add-sticker")!.addEventListener("click", () => {
  const new_sticker = prompt("Add a sticker here", "")!;
  if (new_sticker === "") {
    return;
  }

  stickers.push(new_sticker);
  save_to_local_storage(new_sticker);
  const new_sticker_button = document.createElement("button");
  new_sticker_button.id = new_sticker;
  new_sticker_button.addEventListener(
    "click",
    () => {
      sticker_clicked(new_sticker_button);
    },
  );
  new_sticker_button.textContent = new_sticker;
  document.getElementById('sticker-container')!.append(new_sticker_button);
});

/** LOAD STICKERS FROM STORAGE */
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("stickers");
  if (saved) {
    const parsed = JSON.parse(saved);
    for (const p of parsed) {
      stickers.push(p);
    }
  }

  for (const s of stickers) {
    const sticker = document.createElement("button");
    sticker.textContent = s;
    sticker.id = s;
    sticker.addEventListener("click", () => sticker_clicked(sticker));
    document.getElementById("sticker-container")!.append(sticker);
  }
});
