var aim = new Image();
aim.src = "/img/aim.png";

function draw_aim() {
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    console.log(aim.width);
    ctx.drawImage(aim, aimxy.x - aim.width / 2, aimxy.y - aim.height / 2);
}
