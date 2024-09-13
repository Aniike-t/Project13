
// Audio Manager
class AudioManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        this.melodies = {
            '1': 'a b n b o b c',
            '2': 'a'.repeat(4),
            '3': 'za',
            '4': 'o',
        };
    }

    playMelody(key, loop = false, interval = 0.15, volume = 1) {
        this.play(this.melodies[key], loop, interval, volume);
    }

    play(melody, loop = false, interval, volume = 1) {
        const playTone = (index) => {
            if (index >= melody.length) {
                if (loop) setTimeout(() => playTone(0), interval * 950);  // Restart the melody
                if(interval>0.09)interval -= 0.005;
                return;
            }
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.type = 'square'; 
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.frequency.setValueAtTime(220 + (melody.charCodeAt(index) % 88) * 10, this.context.currentTime);
            gain.gain.setValueAtTime(0, this.context.currentTime);
            gain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.05);  
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + interval);  
            osc.start();
            osc.stop(this.context.currentTime + interval);
            osc.onended = () => {
                setTimeout(() => playTone(index + 1), interval * 1000); 
            };
        };
        playTone(0);
    }
}

//Functions
function drawRectangle(gcanvas, x, y, width, height, color = 'black') {
    gcanvas.fillStyle = color;
    gcanvas.fillRect(x, y, width, height);
}
function drawCircle(ctx, x, y, radius, color = 'black'){
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}
function drawLightning(ctx, x1, y1, x2, y2, depth = 6, offset = 50) {
    if (depth === 0) return;
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo((x1 + x2) / 2 + (Math.random() * offset - offset / 2), (y1 + y2) / 2 + (Math.random() * offset - offset / 2)); ctx.lineTo(x2, y2); ctx.stroke();
    drawLightning(ctx, x1, y1, (x1 + x2) / 2 + (Math.random() * offset - offset / 2), (y1 + y2) / 2 + (Math.random() * offset - offset / 2), depth - 1, offset / 1.5);
    drawLightning(ctx, (x1 + x2) / 2 + (Math.random() * offset - offset / 2), (y1 + y2) / 2 + (Math.random() * offset - offset / 2), x2, y2, depth - 1, offset / 1.5);
}
const healthColor = (maxHealth, health) => `#${Math.floor(255 * (health / maxHealth)).toString(16).padStart(2, '0').repeat(3)}`;



//Compressor
class Compressor {
    constructor(matrix, targetSize) {
        this.matrix = matrix;
        this.targetSize = targetSize;
        this.matSize = matrix.length;
    }
    compress(threshold = 0.25, compare = false) {
        const scaledMatrix = this.createMatrix(this.targetSize);
        const blockSize = this.matSize / this.targetSize;

        for (let i = 0; i < this.targetSize; i++) {
            for (let j = 0; j < this.targetSize; j++) {
                let sum = 0, count = 0;
                for (let x = Math.floor(i * blockSize); x < Math.floor((i + 1) * blockSize); x++) {
                    for (let y = Math.floor(j * blockSize); y < Math.floor((j + 1) * blockSize); y++) {
                        if (x < this.matSize && y < this.matSize) {
                            sum += this.matrix[x][y];
                            count++;
                        }
                    }
                }
                const average = sum / count;
                scaledMatrix[i][j] = average > threshold ? 1 : 0;
            }
        }

        if (compare) {
            return this.compareWithTemplates(scaledMatrix);
        }

        return scaledMatrix;
    }

    compareWithTemplates(scaledMatrix) {
        const template = {
            "0":["0000000000000000","0005911111180000","0591111111111000","0711115491111100","2911520000911140","7111000000071190","7112000000008190","7112000000008190","7112000000008190","7112000000001190","7911000000021190","5811140000411190","0781115445111100","0088881111111500","0005555888855000","0000055555500000"],
            "13":["0000000000000000","0000000000000000","0111199997777760","0111111111111192","0333333333333322","0000000000000000","0099900000055500","0999900000069820","0911900000079820","0911006982279820","0911227997229770","0911111111119770","0711111111111870","0057888377765500","0000000000000000","0000000000000000"]
        };
        let similarities = {};
        let topKey = null;
        let maxSimilarity = 0;
        Object.keys(template).forEach(key => {
            const similarity = compareMatrices(scaledMatrix, applyReverseMappingToMatrix(convertTemplateToMatrix(template[key])));
            similarities[key] = similarity;
            console.log(`Similarity with template ${key}: ${similarity}%`);
            if (similarity > 50) {
                const alteredSimilarity = (similarity - 50) * 100 / 50;
                console.log(`Similarity altered = ${alteredSimilarity}%`);
                if (alteredSimilarity > maxSimilarity) {
                    maxSimilarity = alteredSimilarity;
                    topKey = key;
                }
            }
        });
        console.log('Topmost similarity key:', topKey);
        document.getElementById('i2').innerHTML = 'Top Prediction : '+topKey+'<br>Accuracy :'+maxSimilarity
        return topKey;
    }

    createMatrix(size) {
        return Array(size).fill(null).map(() => Array(size).fill(0));
    }
}


function convertTemplateToMatrix(templateArray) {
    return templateArray.map(row => row.split('').map(Number));
}

function applyReverseMappingToMatrix(matrix) {
    return matrix.map(row => row.map(reverseMapToAverage));
}

function reverseMapToAverage(value) {
    return value === 1 ? 1 : value >= 0 && value <= 9 ? value / 10 : 0;
}

function compareMatrices(scaledMatrix, templateMatrix) {
    let countMatch = 0;
    let onesValueOG = 0;
    let totalScaledOnes = 0;
    const threshold = 0.5;

    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            if (templateMatrix[i][j] > threshold) {
                onesValueOG++;
                if (scaledMatrix[i][j] === 1) {
                    countMatch++;
                } else {
                    countMatch -= 1.5;
                }
            } else if (templateMatrix[i][j] >= threshold - 0.2 && scaledMatrix[i][j] === 1) {
                countMatch += 0.3;
            }
            if (scaledMatrix[i][j] === 1) {
                totalScaledOnes++;
            }
        }
    }
    return ((Math.max(0, countMatch * onesValueOG / Math.max(totalScaledOnes, 1)) / onesValueOG) * 100).toFixed(2);
}


//Sprite.js
class Sprite {
    constructor(x, y, img, ctx, scale = 1, rot = 0, vibInt = 1, vibFreq = 150, health = 25) {
        this.x = x;
        this.y = y;
        this.img = img;
        this.ctx = ctx;
        this.scale = scale;
        this.rot = rot;
        this.vibInt = vibInt;
        this.vibFreq = vibFreq;
        this.vibOff = { x: 0, y: 0 };
        this.lastVib = 0;
        this.health = health;
    }

    vibrate() {
        if (Date.now() - this.lastVib >= this.vibFreq) {
            this.vibOff = {
                x: (Math.random() - 0.25) * this.vibInt,
                y: (Math.random() - 0.25) * this.vibInt
            };
            this.lastVib = Date.now();
        }
    }
    moveTo(valueX, valueY){
        this.y += valueY;
        this.x += valueX;
    }
    draw() {
        this.vibrate();
        this.ctx.save();
        this.ctx.translate(this.x + this.vibOff.x + (this.img.width * this.scale) / 2, this.y + this.vibOff.y + (this.img.height * this.scale) / 2);
        this.ctx.rotate(this.rot);
        this.ctx.drawImage(this.img, -this.img.width * this.scale / 2, -this.img.height * this.scale / 2, this.img.width * this.scale, this.img.height * this.scale);
        this.ctx.restore();
    }
}

//Enemy Sprite.js
class EnemySprite extends Sprite {
    constructor(x, y, img, ctx, scale = 1, rot = 0, vibInt = 1, vibFreq = 150, shape = 'rectangle', health) {
        super(x, y, img, ctx, scale, rot, vibInt, vibFreq);
        this.shape = shape;
        this.health = health;
        this.maxHealth = 10;
    }
    vibrate() {
        super.vibrate(); 
    }
    moveTo(valueX, valueY) {
        super.moveTo(valueX, valueY); 
    }
    draw() {
        this.vibrate(); 
        this.ctx.save();
        this.ctx.translate(this.x + this.vibOff.x, this.y + this.vibOff.y);
        this.shape === 'rectangle' ? drawRectangle(this.ctx, -50, -50, 12* this.scale, 12* this.scale ) : drawCircle(this.ctx, 0, 0, 12 * this.scale);
        this.shape === 'rectangle' ? drawRectangle(this.ctx, -50, -50, 11* this.scale, 11* this.scale, healthColor(this.maxHealth,this.health)) : drawCircle(this.ctx, 0, 0, 11 * this.scale, healthColor(this.maxHealth,this.health));
        this.ctx.restore();
    }
}

//Particle.js
class Particle {
    constructor(x, y, ctx, speed, angle) {
        this.x = x + (Math.random() - 0.5) * 100;
        this.y = y + (Math.random() - 0.5) * 100;
        this.ctx = ctx;
        this.speedX = speed * Math.cos(angle);
        this.speedY = speed * Math.sin(angle);
        this.color = 'red';
        this.size = 5;
        this.lifespan = 3000;
        this.creationTime = Date.now();
    }

    draw() {
        const lifeProgress = (Date.now() - this.creationTime) / this.lifespan;
        if (lifeProgress >= 1) return false;

        this.x += this.speedX;
        this.y += this.speedY;

        this.ctx.globalAlpha = 1 - lifeProgress;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.size, this.size);

        return true;
    }
}





//Main Frame Game 
const audioManager = new AudioManager();
const gamecanvas = document.getElementById('g');
const gcanvas = gamecanvas.getContext('2d');
gcanvas.canvas.height = 256;
gcanvas.canvas.width = gcanvas.canvas.height*2;
let topKey = false;
let maxHealth = 50;
const color_C3C7CB = '#C3C7CB';
let score = 0;
let particles = [];


//Draw Methods
const canvas1 = document.getElementById('d');
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
    if(Sinterval>2000){
        Sinterval -=20;
    }
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


document.getElementById('s').addEventListener('click', async () => {
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
        matrix = Array(size).fill(null).map(() => Array(size).fill(0));
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

