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

app.append(title);
app.append(canvas);