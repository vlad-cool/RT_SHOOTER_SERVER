var cvs = document.getElementById("canvas");
cvs.height = window.innerHeight;//-window.innerHeight%240;
cvs.width = window.innerWidth;//-window.innerWidth%256;
var ctx = cvs.getContext("2d");
ctx.imageSmoothingEnabled = false;
var k = { x: window.innerHeight / 240, y: window.innerWidth / 256 };

var centX = cvs.width / 2;
var centY = cvs.height / 2;
var xPos = cvs.width / 4;
var yPos = cvs.height / 4;
var aimxy = { x: 0, y: 0, press: 0, hold: 0 };
var shot = { a: 100, shot: false };
var duck1 = { x: centX / 2, y: cvs.height, fly: 0, col: 0, type: 0, dir: 1 };
var duck2 = { x: 0, y: cvs.height / 4, fly: 0, col: 1, type: 1, dir: 0 };
var duck4 = { x: centX / 4, y: cvs.height / 4, fly: 0, col: 2, type: 2, dir: 0 };
var duck3 = { x: centX / 4, y: cvs.height, fly: 0, col: 2, type: 0, dir: 0 };

var bird = new Image();
var bg = new Image();
var bgt = new Image();
var aim = new Image();

bird.src = "/img/ducks.png";
bg.src = "/img/scenes.png";
bgt.src = "/img/transscenes.png";
aim.src = "/img/aim.png";

function drawCanv() {
    ctx.drawImage(bg, 0, 0, 256, 220, 0, 0, cvs.width, cvs.height);
}

function collisionCheck(duck) {
    if ((aimxy.x > duck.x && aimxy.x < duck.x + 30 * k.x) && (aimxy.y > duck.y && aimxy.y < duck.y + 30 * k.y)) {
        return true;
    }
    return false;
}

function flyDuck(duck) {
    if ((aimxy.press === 1) && collisionCheck(duck)) {
        duck.type = 2;
    } else if (aimxy.press === 1) {
        duck.dir = duck.dir + 1;
    }
    if (duck.type === 100) {
        ctx.drawImage(bird, 260 - duck.col - (1 - duck.col % 2) * duck.col / 2, 0 + duck.col * 44, 25, 40, duck.x, duck.y, 36 * k.x, 40 * k.x);
        duck.y = (duck.y + 3);
    } else if (duck.type > 1) {
        ctx.drawImage(bird, 220 - duck.col - (1 - duck.col % 2) * duck.col / 2, 0 + duck.col * 44, 36, 40, duck.x, duck.y, 36 * k.x, 40 * k.x);
        duck.type = duck.type + 1;

    } else {
        ctx.drawImage(bird, 0 + (duck.fly - duck.fly % 10) / 10 * 36 - duck.col - (1 - duck.col % 2) * duck.col / 2 + duck.type * 110, 0 + duck.col * 40, 36, 40, duck.x, duck.y, 36 * k.x, 40 * k.x);
        if (duck.type === 0) {
            duck.x = (duck.x + 1 - duck.dir % 3);
            duck.y = (duck.y - 1);
        } else if (duck.type === 1) {
            duck.x = (duck.x + 2);
            duck.y = (duck.y - duck.dir % 4);
        }
        duck.fly = (duck.fly + 1) % 30;
    }
}

function draw(aimxy) {
    flyDuck(duck1);
    flyDuck(duck2);
    flyDuck(duck3);
    flyDuck(duck4);
    ctx.drawImage(bgt, 0, 0, 256, 190, 0, 0, cvs.width, cvs.height);
    ctx.drawImage(aim, aimxy.x, aimxy.y);
}

function run() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'get_data');
    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = xhr.responseText;
            console.log(response);
            aimxy = JSON.parse(response);
            aimxy.x = aimxy.x / 1920 * cvs.width;
            aimxy.y = aimxy.y / 1080 * cvs.height;
        }
        else {
            console.log('Ошибка загрузки данных: ' + xhr.status);
        }
    };
    xhr.send();
    drawCanv();
    draw(aimxy);
};
drawCanv();
setInterval(run, 16);