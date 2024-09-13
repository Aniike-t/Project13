export default class Particle {
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
