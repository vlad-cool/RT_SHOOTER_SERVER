export function ducks(aimxy) {
    var cvs = document.getElementById("canvas");
    cvs.height = window.innerHeight;
    cvs.width = window.innerWidth;
    var ctx = cvs.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    var k = {x: window.innerHeight/240, y: window.innerWidth/256};

    var centX = cvs.width/2;
    var centY = cvs.height/2;

    var shot = {a: 100, shot: false};

    class Duck {
        constructor(x, y, fly, col, type, dir) {
            this.x = x;
            this.y = y;
            this.fly = fly;
            this.col = col;
            this.type = type;
            this.dir = dir;
        }
        
        collisionCheck() {
            if ((aimxy.x > this.x && aimxy.x < this.x + 30*k.x) && 
                (aimxy.y > this.y && aimxy.y < this.y + 30*k.y)) {
                return true;
            }
            return false;
        }
    }

    var duck1 = new Duck(centX/2, cvs.height,   0, 0, 0, 1);
    var duck2 = new Duck(0,       cvs.height/4, 0, 1, 1, 0);
    var duck4 = new Duck(centX/4, cvs.height/4, 0, 2, 2, 0);
    var duck3 = new Duck(centX/4, cvs.height,   0, 2, 0, 0);

    var bird = new Image();
    var bg = new Image();
    var bgt = new Image();
    var aim = new Image();

    bird.src = "/img/ducks.png";
    bg.src = "/img/scenes.png";
    bgt.src = "/img/transscenes.png";
    aim.src = "/img/aim.png";
};
export function flyDuck(duck) {
        if ((duck.x > cvs.width) || (duck.y > cvs.height) || (duck.y < -40*k.y)) {
            var duck1 = {x: centX/2, y: cvs.height, fly: 0, col: 2, type: 0, dir: 0};
            duck.x    = (duck.x-300*(duck.type + 1))*(duck.type - 1)%cvs.width;
            duck.type = duck.type%2;
            duck.y    = cvs.height-duck.type*3*cvs.height/4;
            duck.col  = (duck.col + 1)%3; 
        }
        if ((aimxy.press === 1) && duck.collisionCheck() && (duck.type < 2)) {
            duck.type = 2;
        } else if (aimxy.press === 1) {
            duck.dir = (duck.dir + 1)%4;
        }
        if (duck.type === 100) {
            ctx.drawImage(bird, 260-duck.col-(1-duck.col%2)*duck.col/2, 0 + duck.col*44, 25, 40, duck.x, duck.y, 36*k.x, 40*k.x);
            duck.y = (duck.y + 3);
        } else if (duck.type > 1) {
            ctx.drawImage(bird, 220-duck.col-(1-duck.col%2)*duck.col/2, 0 + duck.col*44, 36, 40, duck.x, duck.y, 36*k.x, 40*k.x);
            duck.type = duck.type + 1;
        } else {
            ctx.drawImage(bird, 0 + (duck.fly-duck.fly%10)/10*36-duck.col-(1-duck.col%2)*duck.col/2 + duck.type*110, 0 + duck.col*40, 36, 40, duck.x, duck.y, 36*k.x, 40*k.x);
            if (duck.type === 0) {
                duck.x = (duck.x+1-duck.dir%3);
                duck.y = (duck.y-1);
            } else if (duck.type === 1) {
                duck.x = (duck.x+2);
                duck.y = (duck.y-duck.dir%4);
            }   
            duck.fly = (duck.fly+1)%30;
        }
};

export function draw(aimxy) {
        flyDuck(duck1);
        flyDuck(duck2);
        flyDuck(duck3);
        flyDuck(duck4);
        ctx.drawImage(bgt, 0, 0, 256, 190, 0, 0, cvs.width, cvs.height);
        ctx.drawImage(aim, aimxy.x, aimxy.y);
};
    // function run() {
    // const xhr = new XMLHttpRequest();
    // xhr.open('GET', 'get_data');
    // xhr.onload = function() {
    //     if (xhr.status === 200) {
    //         const response = xhr.responseText;
    //         console.log(response);
    //         aimxy = JSON.parse(response);
    //         aimxy.x = aimxy.x/1920*cvs.width;
    //         aimxy.y = aimxy.y/1080*cvs.height;
    //     }
    //     else {
    //         console.log('Ошибка загрузки данных: ' + xhr.status);
    //     }
    // };
    // xhr.send();
    // drawCanv();
    // draw(aimxy);
    // };
    // drawCanv();
    // setInterval(run, 16);
