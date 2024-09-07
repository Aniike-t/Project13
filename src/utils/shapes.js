export function drawRectangle(gcanvas, x, y, width, height, color = 'black') {
    gcanvas.fillStyle = color;
    gcanvas.fillRect(x, y, width, height);
}
export function drawCircle(ctx, x, y, radius, color = 'black'){
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}
export function drawLightning(ctx, x1, y1, x2, y2, depth = 6, offset = 50) {
    if (depth === 0) return;
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo((x1 + x2) / 2 + (Math.random() * offset - offset / 2), (y1 + y2) / 2 + (Math.random() * offset - offset / 2)); ctx.lineTo(x2, y2); ctx.stroke();
    drawLightning(ctx, x1, y1, (x1 + x2) / 2 + (Math.random() * offset - offset / 2), (y1 + y2) / 2 + (Math.random() * offset - offset / 2), depth - 1, offset / 1.5);
    drawLightning(ctx, (x1 + x2) / 2 + (Math.random() * offset - offset / 2), (y1 + y2) / 2 + (Math.random() * offset - offset / 2), x2, y2, depth - 1, offset / 1.5);
}
export const healthColor = (maxHealth, health) => `#${Math.floor(255 * (health / maxHealth)).toString(16).padStart(2, '0').repeat(3)}`;