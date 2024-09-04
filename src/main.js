import AudioManager from './AudioManager.js';
import {drawRectangle, drawCircle} from './utils/shapes.js';
import Compressor from './Compressor.js';
import Sprite from './Sprite.js';

//Main Frame Game 
const audioManager = new AudioManager();
const gamecanvas = document.getElementById('game');
const gcanvas = gamecanvas.getContext('2d');
gcanvas.canvas.width = 512;
gcanvas.canvas.height = 256;
const color_C3C7CB = '#C3C7CB';

//Draw Methods
const canvas1 = document.getElementById('draw');
const ctx1 = canvas1.getContext('2d');
const size = 256;
const brushSize = 30; 
canvas1.width = size;
canvas1.height = size;
let matrix = Array(size).fill(null).map(() => Array(size).fill(0));
let painting = false;
canvas1.addEventListener('mousedown', () => painting = true);
canvas1.addEventListener('mouseup', () => painting = false);
canvas1.addEventListener('mousemove', draw);

//Sprite Drawing
const Player = new Image();
Player.src = './public/compressed2.png';
const Sword = new Image();
Sword.src = './public/compresseds1.png';
let Psprite, Ssprite;
Sword.onload = () =>{ 
    Psprite = new Sprite(50, 180, Player, gcanvas, 0.5); 
    Ssprite = new Sprite(85, 180, Sword, gcanvas, 1, Math.PI/1.60); 
}

//Main Game Draw scene
function drawStartScreen() {
    const [x, y, w, h] = [190, 100, 120, 50];drawRectangle(gcanvas, 0,0, 512, 256, 'white')
    gcanvas.fillStyle = color_C3C7CB; gcanvas.fillRect(x, y, w, h);
    gcanvas.fillStyle = '#FFF'; gcanvas.fillRect(x, y, w, 2); gcanvas.fillRect(x, y, 2, h);
    gcanvas.fillStyle = '#000'; gcanvas.fillRect(x + w - 2, y, 2, h); gcanvas.fillRect(x, y + h - 2, w, 2);
    gcanvas.font = '16px Arial'; gcanvas.textAlign = 'center'; gcanvas.fillStyle = '#000'; gcanvas.fillText('Play', x + w / 2, y + h / 2 + 5);
    DrawBorder(color_C3C7CB);

}

//Draw borders to box
function DrawBorder(color){
    for (let rect of [
        [0, gcanvas.canvas.height - 30, gcanvas.canvas.width, 50, color],
        [0, -20, gcanvas.canvas.width, 50, color],
        [0, 0, 20, gcanvas.canvas.height, color],
        [gcanvas.canvas.width - 20, 0, 20, gcanvas.canvas.height, color]
    ])drawRectangle(gcanvas, ...rect);
}

function startGameLoop() {
    gcanvas.save();
    gcanvas.clearRect(0, 0, gcanvas.canvas.width, gcanvas.canvas.height);
    drawRectangle(gcanvas, 0, 0, 512, 256, color_C3C7CB);
    drawCircle(gcanvas, 470, 52, 15);
    DrawBorder();
    Psprite.draw();
    Ssprite.draw();
    Psprite.moveTo(0.2,0);
    Ssprite.moveTo(0.2,0);
    gcanvas.restore();
}

// Game loop function
function gameLoop() {
    startGameLoop();
    requestAnimationFrame(gameLoop);
}

function onClick() {
    audioManager.playMelody('melody1',true, 0.3/2);
    gameLoop()
    gamecanvas.removeEventListener('click', onClick);
}
gamecanvas.addEventListener('click', onClick);



//Draw function for draw canvas
function draw(e) {
    if (!painting) return;
    const rect = canvas1.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx1.beginPath();
    ctx1.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx1.fillStyle = 'black';
    ctx1.fill();
    const xIndex = Math.floor(x);
    const yIndex = Math.floor(y);
    for (let i = xIndex - brushSize / 2; i < xIndex + brushSize / 2; i++) {
        for (let j = yIndex - brushSize / 2; j < yIndex + brushSize / 2; j++) {
            if (i >= 0 && i < size && j >= 0 && j < size) {
                matrix[i][j] = 1;
            }
        }
    }
}
document.getElementById('submit').addEventListener('click', async () => {
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    let compressedMatrix = matrix;
    [128, 64, 32, 16].forEach(size => {
        compressedMatrix = new Compressor(compressedMatrix, size).compress(0.10);
    });
    try {
        let topKey = await new Compressor(compressedMatrix, 16).compress(0.10, true);
        console.log(topKey);
    } catch (error) {
        console.error(error);
    }
});


drawStartScreen();