import AudioManager from './AudioManager.js';
import {drawRectangle, drawCircle, drawLightning, healthColor} from './utils/shapes.js';
import Compressor from './Compressor.js';
import Sprite from './Sprite.js';
import EnemySprite from './EnemySprite.js';
import Particle from './Particle.js';


//Main Frame Game 
const audioManager = new AudioManager();
const gamecanvas = document.getElementById('game');
const gcanvas = gamecanvas.getContext('2d');
gcanvas.canvas.height = 256;
gcanvas.canvas.width = gcanvas.canvas.height*2;
let topKey = false;
let maxHealth = 50;
const color_C3C7CB = '#C3C7CB';
let score = 0;
let particles = [];


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
    // gamecanvas.addEventListener('click', onClick);
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
function ResetPos(){
    Psprite.y = 180;Ssprite.y = Psprite.y;
}


function startGameLoop() {
    if (Psprite.health <= 0) {
        location.reload();
        return;
    }
    
    gcanvas.save();
    gcanvas.clearRect(0, 0, gcanvas.canvas.width, gcanvas.canvas.height);
    drawRectangle(gcanvas, 0, 0, 512, 256, healthColor(maxHealth, Psprite.health));
    drawEnemies(gcanvas);
    Psprite.draw();
    Ssprite.draw();

    if (topKey == '13') {
        audioManager.playMelody('2', false, 0.05);
        Ssprite.y = 128;
        Psprite.y = -999;
        drawLightning(gcanvas, Ssprite.x + 45, Ssprite.y + 10, Math.random() * gcanvas.canvas.width, Math.random() * gcanvas.canvas.width);
    } else {
        ResetPos();
    }
    
    particles = particles.filter(particle => particle.draw());
    gcanvas.restore();

    // Draw the border after clearing and restoring the canvas.
    DrawBorder(color_C3C7CB);
}





// Game loop function
function gameLoop() {
    startGameLoop();
    requestAnimationFrame(gameLoop);
}
let Sinterval = 5000;
function onClick() {
    audioManager.playMelody('1',true,0.2,0.025);
    gameLoop();
    setInterval(spawnEnemy, Sinterval);
    Sinterval -=20;
    gamecanvas.removeEventListener('click', onClick);
}
gamecanvas.addEventListener('click', onClick);



//Draw function for draw canvas
function draw(e) {
    if (!painting) return;
    const rect = canvas1.getBoundingClientRect();
    ctx1.beginPath();
    ctx1.arc(e.clientX - rect.left, e.clientY - rect.top, brushSize / 2, 0, Math.PI * 2);
    ctx1.fillStyle = 'black';
    ctx1.fill();
    const xIndex = Math.floor(e.clientX - rect.left);
    const yIndex = Math.floor(e.clientY - rect.top);
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
    topKey = await new Compressor(compressedMatrix, 16).compress(0.10, true);
    if (topKey === '13' && enemies.length!=0) {
        score+=3;
        matrix = Array(size).fill(null).map(() => Array(size).fill(0));
        //Remove 5 health from every enemy
        enemies.forEach(enemy => {
            enemy.health -= 5;
        });
        setTimeout(() => {
            topKey = false
        }, 1000);return;
    }else if(topKey === '0' && enemies.length!=0){
        removeClosestEnemy();
        score+=1;return;
    }else{
        score-=1;
        RemovePhealth(1);
    }
    ScoreManager();
    audioManager.playMelody('3',false, 0.3);
});



function removeClosestEnemy() {
    let closestEnemyIndex = null;
    let minDistance = Infinity;
    enemies.forEach((enemy, index) => {
        let distance = Math.abs(enemy.x - Psprite.x);
        if (distance < minDistance) {
            minDistance = distance;
            closestEnemyIndex = index;
        }
    });
    if (closestEnemyIndex !== null) {
        let enemy = enemies[closestEnemyIndex];
        enemies.splice(closestEnemyIndex, 1);
        score += 1; 
        ScoreManager(Psprite.health);
        var k =30;
        while(k){
            particles.push(new Particle(enemy.x, enemy.y, gcanvas, 2, Math.random() * Math.PI * 2));k--;
        }
    }
}


let enemies = [];
const enemySpeed = 0.25; 

function spawnEnemy() {
    const yPos = Math.random() < 0.5 ? 85 : 215; // Randomly select x = 50 (rectangle) or x = 210 (circle)
    const shape = yPos === 85 ? 'rectangle' : 'circle'; // Choose shape based on x position
    const enemy = new EnemySprite(512, yPos, null, gcanvas, 1, 0, 1, 150, shape, 10); // Start at y = 512
    enemies.push(enemy);
}
function drawEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.moveTo(-enemySpeed, 0); // Move enemy upwards (from y = 512 to y = 0)
        enemy.draw(); // Draw the enemy
        if (enemy.y < 0 ) { 
            enemies.splice(index, 1); // Remove enemies that are off screen
            RemovePhealth(1);
        }
        if (enemy.health <= 0) { 
             enemies.splice(index, 1); // Remove enemies that are off screen
             score+=1; ScoreManager();
             var k =10
             while(k){
                 particles.push(new Particle(enemy.x, enemy.y, gcanvas, 2, Math.random() * Math.PI * 2));k--;
             }
        }
    });
}
function ScoreManager(){
    document.getElementById('i1').innerHTML = ' Score : '+score;
}

ScoreManager()
function RemovePhealth(health){
    Psprite.health -= health
}
drawStartScreen();