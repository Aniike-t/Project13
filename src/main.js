import AudioManager from './AudioManager.js';
import drawRectangle from './utils/shapes.js';
import Compressor from './Compressor.js';

//Main Frame Game 
const audioManager = new AudioManager();
const gamecanvas = document.getElementById('game');
const gcanvas = gamecanvas.getContext('2d');
gcanvas.canvas.width = 512;
gcanvas.canvas.height = 256;


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
document.getElementById('clear').addEventListener('click', () => {
    ctx1.clearRect(0 ,0, canvas1.width, canvas1.height);

})

//Main Game Draw scene
function drawStartScreen() {
    const [x, y, w, h] = [190, 100, 120, 50];
    gcanvas.fillStyle = '#C3C7CB'; gcanvas.fillRect(x, y, w, h);
    gcanvas.fillStyle = '#FFF'; gcanvas.fillRect(x, y, w, 2); gcanvas.fillRect(x, y, 2, h);
    gcanvas.fillStyle = '#000'; gcanvas.fillRect(x + w - 2, y, 2, h); gcanvas.fillRect(x, y + h - 2, w, 2);
    gcanvas.font = '16px Arial'; gcanvas.textAlign = 'center'; gcanvas.fillStyle = '#000'; gcanvas.fillText('Play', x + w / 2, y + h / 2 + 5);
    drawRectangle(gcanvas, 0, gcanvas.canvas.height-20, gcanvas.canvas.width, 50, '#C3C7CB')
    drawRectangle(gcanvas, 0, -25, gcanvas.canvas.width, 50, '#C3C7CB')
    drawRectangle(gcanvas, 0, 0, 20, gcanvas.canvas.height, '#C3C7CB')
    drawRectangle(gcanvas, gcanvas.canvas.width-20, 0, 20, gcanvas.canvas.height, '#C3C7CB')
}

function startGameLoop() {
    gcanvas.save();
    gcanvas.clearRect(0, 0, gcanvas.canvas.width, gcanvas.canvas.height);
    drawRectangle(gcanvas, 0, 256-50, 512, 50)
    console.log('Game loop started');
    gcanvas.restore();
}

function onClick() {
    // audioManager.playMelody('melody1',true, 0.3/2);
    startGameLoop();
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
document.getElementById('submit').addEventListener('click', () => {
    let sizes = [128, 64, 32, 16];
    let compressedMatrix = matrix;
    sizes.forEach(size => {
        let compressor = new Compressor(compressedMatrix, size);
        compressedMatrix = compressor.compress(0.10);
    });
    new Compressor(compressedMatrix, 16).compress(0.10, true)
    .then(topKey => {
        console.log('Topmost similarity key:', topKey);
    })
    .catch(error => {
        console.error('Error during compression or comparison:', error);
    });
});

drawStartScreen();