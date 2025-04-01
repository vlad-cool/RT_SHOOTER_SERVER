var cvs = document.getElementById("canvas");
cvs.height = window.innerHeight; //координаты будут верные по экрану
cvs.width = window.innerWidth;
var ctx = cvs.getContext("2d");
ctx.imageSmoothingEnabled = false;
var k = {x: window.innerHeight/240, y: window.innerWidth/256};

function drawCanv() {
    
}

var aimxy = { x: 500, y: 500, press: false, hold: false };

class Duck {
    
    x;
    y;
    fly;
    col;
    type;
    dir;
    bg = new Image();
    bird = new Image();
    bgt = new Image();
    aim = new Image();
    
    constructor(x, y, fly, col, type, dir) {
        this.x = x;
        this.y = y;
        this.fly = fly;
        this.col = col;
        this.type = type;
        this.dir = dir;

        this.bird.src = "/img/ducks.png";
    }
    
    collisionCheck(aimxy) {
        if ((aimxy.x > this.x && aimxy.x < this.x + 30*k.x) && 
            (aimxy.y > this.y && aimxy.y < this.y + 30*k.y)) {
            return true;
        }
        return false;
    }
    
    flyDuck(aimxy) {
        if ((this.x > cvs.width) || (this.y > cvs.height) || (this.y < -40*k.y)) {
            this.x = (this.x-300*(this.type + 1))*(this.type - 1)%cvs.width;
            this.type = this.type%2;
            this.y = cvs.height-this.type*3*cvs.height/4;
            this.col = (this.col + 1)%3; 
        }
        if ((aimxy.press === 1) && this.collisionCheck(aimxy) && (this.type < 2)) {
            this.type = 2;
        } else if (aimxy.press === 1) {
            this.dir = (this.dir + 1)%4;
        }
        if (this.type === 100) {
            ctx.drawImage(this.bird, 260-this.col-(1-this.col%2)*this.col/2, 0 + this.col*44, 25, 40, this.x, this.y, 36*k.x, 40*k.x);
            this.y = (this.y + 3);
        } else if (this.type > 1) {
            ctx.drawImage(this.bird, 220-this.col-(1-this.col%2)*this.col/2, 0 + this.col*44, 36, 40, this.x, this.y, 36*k.x, 40*k.x);
            this.type = this.type + 1;
        } else {
            ctx.drawImage(this.bird, 0 + (this.fly-this.fly%10)/10*36-this.col-(1-this.col%2)*this.col/2 + this.type*110, 0 + this.col*40, 36, 40, this.x, this.y, 36*k.x, 40*k.x);
            if (this.type === 0) {
                this.x = (this.x+1-this.dir%3);
                this.y = (this.y-1);
            } else if (this.type === 1) {
                this.x = (this.x+2);
                this.y = (this.y-this.dir%4);
            }   
            this.fly = (this.fly+1)%30;
        }
    } 
};

class ducksPlay {

    ducks = [new Duck(cvs.width/4, cvs.height,   0, 0, 0, 1),
             new Duck(0,           cvs.height/4, 0, 1, 1, 0),
             new Duck(cvs.width/8, cvs.height,   0, 2, 0, 0),
             new Duck(cvs.width/8, cvs.height/4, 0, 2, 2, 0)];

    bg = new Image();
    bgt = new Image();
    aim = new Image();

    constructor() {
        this.bgt.src = "/img/transscenes.png";
        this.aim.src = "/img/aim.png";
        this.bg.src = "/img/scenes.png";
    }
    draw(aimxy) {
        ctx.drawImage(this.bg, 0, 0, 256, 220, 0, 0, cvs.width, cvs.height);
        this.ducks.forEach(duck => duck.flyDuck(aimxy));
        ctx.drawImage(this.bgt, 0, 0, 256, 190, 0, 0, cvs.width, cvs.height);
        ctx.drawImage(this.aim, aimxy.x, aimxy.y);
    } 
};

play1 = new ducksPlay;
// play2 = new wordsPlay;

function run() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "get_aim/0");
    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = xhr.responseText;
            aimxy = JSON.parse(response);
            play1.draw(aimxy);
            console.log(aimxy);
        }
        else {
            console.log("Failed to load data: " + xhr.status);
        }
    };
    xhr.send();
};

// drawCanv();
setInterval(run, 16);