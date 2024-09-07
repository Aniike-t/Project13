export default class Sprite {
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