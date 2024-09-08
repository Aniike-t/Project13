import { drawRectangle, drawCircle, healthColor } from './utils/shapes.js';
import Sprite from './Sprite.js';

export default class EnemySprite extends Sprite {
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