function drawRectangle(gcanvas, x, y, width, height, color = 'black') {
    gcanvas.fillStyle = color;
    gcanvas.fillRect(x, y, width, height);
}



export default drawRectangle;