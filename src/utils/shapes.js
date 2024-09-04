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