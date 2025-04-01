var aimxy = { x: 500, y: 500, press: false, hold: false };

var cvs = document.getElementById("canvas");
cvs.height = window.innerHeight;//-window.innerHeight%240;
cvs.width = window.innerWidth;//-window.innerWidth%256;
var ctx = cvs.getContext("2d");
ctx.imageSmoothingEnabled = false;

var bird = new Image();
var bg = new Image();
var bgt = new Image();
var aim = new Image();

bird.src = "/img/ducks.png";
bg.src = "/img/scenes.png";
bgt.src = "/img/transscenes.png";
aim.src = "/img/aim.png";

function draw() {
    ctx.drawImage(bird, 0, 0, 256, 220, 0, 0, cvs.width, cvs.height);

}




function run() {
    
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "get_aim/0");
    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = xhr.responseText;
            aimxy = JSON.parse(response);
            draw();
            console.log(aimxy);
        }
        else {
            console.log("Failed to load data: " + xhr.status);
        }
    };
    xhr.send();
};

setInterval(run, 16);