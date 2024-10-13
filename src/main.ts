import "./style.css";

const APP_NAME = "Paint World";
document.title = APP_NAME;
const app = document.querySelector<HTMLDivElement>("#app")!;

const CANVAS_HEIGHT = 256;
const CANVAS_WIDTH = 256;

const title = document.createElement('h1')
title.textContent = 'Paint World'

const canvas = document.createElement('canvas')
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.className = 'main-canvas';

const clear_button = document.createElement('button')
clear_button.textContent = 'clear';

app.append(title);
app.append(canvas);
app.append(clear_button)

// Simple Drawing Logic
const pen = {active: false, x: 0, y: 0}
const ctx = canvas.getContext('2d');
ctx!.fillStyle = 'white'

canvas.addEventListener('mousedown', (e) => pen_event_handler(e) )
canvas.addEventListener('mouseup', (e) => pen_event_handler(e) )
canvas.addEventListener('mousemove', (e) => draw(e, ctx as CanvasRenderingContext2D))

const pen_event_handler = (e: MouseEvent) => {
    pen.active = !pen.active
    pen.x = e.offsetX;
    pen.y = e.offsetY;
}

const draw = (e: MouseEvent, ctx: CanvasRenderingContext2D) => {
    if (!pen.active) return
    ctx.beginPath();
    ctx.moveTo(pen.x as number, pen.y as number);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    pen.x = e.offsetX;
    pen.y = e.offsetY;
}

const clear_canvas = () => {
    ctx?.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
}

clear_button.addEventListener('click', clear_canvas);