var aimxy = { x: 500, y: 500, press: false, hold: false };

const FONT_SIZE = 48;
const FRAME_OFFSET = 20;
const HITBOX_OFFSET = 20;
const HORIZONTAL_SLOTS = 4;
const VERTICAL_SLOTS = 5;

var aim = new Image();
aim.src = "/img/aim.png";

function draw_aim() {
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    ctx.drawImage(aim, aimxy.x - aim.width / 2, aimxy.y - aim.height / 2);
}

class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // Basic properties
    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    get normalized() {
        const mag = this.magnitude;
        return mag > 0 ? this.divide(mag) : new Vector3();
    }

    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    divide(scalar) {
        return scalar !== 0
            ? new Vector3(this.x / scalar, this.y / scalar, this.z / scalar)
            : new Vector3();
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v) {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    addInPlace(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    normalizeInPlace() {
        const mag = this.magnitude;
        if (mag > 0) {
            this.x /= mag;
            this.y /= mag;
            this.z /= mag;
        }
        return this;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    equals(v, precision = 0.0001) {
        return (
            Math.abs(this.x - v.x) < precision &&
            Math.abs(this.y - v.y) < precision &&
            Math.abs(this.z - v.z) < precision
        );
    }

    toString() {
        return `Vector3(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
    }
}

var calibration_step = 0;
var calibration_top_left;
var calibration_top_right;
var calibration_bottom_left;
var calibration_bottom_right;

function project(aim_vector) {
    aim_vector = new Vector3(aim_vector.x, aim_vector.y, aim_vector.z)

    var left_norm = calibration_bottom_left.cross(calibration_top_left).normalized;
    var right_norm = calibration_top_right.cross(calibration_bottom_right).normalized;
    var to_top_norm = left_norm.cross(right_norm);
    var project_to_horizontal_plane = aim_vector.subtract(aim_vector.multiply(aim_vector.dot(to_top_norm))).normalized;
    var alpha_1 = Math.asin(project_to_horizontal_plane.dot(left_norm));
    var alpha_2 = Math.asin(project_to_horizontal_plane.dot(right_norm));
    var alpha_max = Math.PI - Math.acos(left_norm.dot(right_norm));
    var x = (alpha_1 / alpha_max + alpha_max - alpha_2 / alpha_max) / 2;
    x = Math.max(x, 0);
    x = Math.min(x, 1);
    x = Math.floor(x * cvs.width);

    var bottom_norm = calibration_bottom_right.cross(calibration_bottom_left).normalized;
    var top_norm = calibration_top_left.cross(calibration_top_right).normalized;
    var to_right_norm = bottom_norm.cross(top_norm);
    var project_to_vertical_plane = aim_vector.subtract(aim_vector.multiply(aim_vector.dot(to_right_norm))).normalized;
    var beta_1 = Math.asin(project_to_vertical_plane.dot(top_norm));
    var beta_2 = Math.asin(project_to_vertical_plane.dot(bottom_norm));
    var beta_max = Math.PI - Math.acos(top_norm.dot(bottom_norm));
    var y = (beta_1 / beta_max + beta_max - beta_2 / beta_max) / 2;
    y = Math.max(y, 0);
    y = Math.min(y, 1);
    y = Math.floor(y * cvs.height);

    return { x: x, y: y };
}

function calibration(aim_vector) {
    switch (calibration_step) {
        case 0:
            ctx.fillStyle = "red";
            ctx.fillRect(0, 0, 100, 100);
            ctx.fillStyle = "blue";
            ctx.fillRect(cvs.width - 101, 0, 100, 100);
            ctx.fillRect(cvs.width - 101, cvs.height - 101, 100, 100);
            ctx.fillRect(0, cvs.height - 101, 100, 100);
            calibration_step = 1;
            break;
        case 1:
            if (aim_vector.press && !aim_vector.hold) {
                calibration_top_left = new Vector3(aim_vector.x, aim_vector.y, aim_vector.z);
                ctx.fillStyle = "green";
                ctx.fillRect(0, 0, 100, 100);
                ctx.fillStyle = "red";
                ctx.fillRect(cvs.width - 101, 0, 100, 100);
                ctx.fillStyle = "blue";
                ctx.fillRect(cvs.width - 101, cvs.height - 101, 100, 100);
                ctx.fillRect(0, cvs.height - 101, 100, 100);
                calibration_step = 2;
            }
            break;
        case 2:
            if (aim_vector.press && !aim_vector.hold) {
                calibration_top_right = new Vector3(aim_vector.x, aim_vector.y, aim_vector.z);
                ctx.fillStyle = "green";
                ctx.fillRect(0, 0, 100, 100);
                ctx.fillRect(cvs.width - 101, 0, 100, 100);
                ctx.fillStyle = "red";
                ctx.fillRect(cvs.width - 101, cvs.height - 101, 100, 100);
                ctx.fillStyle = "blue";
                ctx.fillRect(0, cvs.height - 101, 100, 100);
                calibration_step = 3;
            }
            break;
        case 3:
            if (aim_vector.press && !aim_vector.hold) {
                calibration_bottom_right = new Vector3(aim_vector.x, aim_vector.y, aim_vector.z);
                ctx.fillStyle = "green";
                ctx.fillRect(0, 0, 100, 100);
                ctx.fillRect(cvs.width - 101, 0, 100, 100);
                ctx.fillRect(cvs.width - 101, cvs.height - 101, 100, 100);
                ctx.fillStyle = "red";
                ctx.fillRect(0, cvs.height - 101, 100, 100);
                ctx.fillStyle = "blue";
                calibration_step = 4;
            }
            break;
        case 4:
            if (aim_vector.press && !aim_vector.hold) {
                calibration_bottom_left = new Vector3(aim_vector.x, aim_vector.y, aim_vector.z);
                ctx.fillStyle = "green";
                ctx.fillRect(0, 0, 100, 100);
                ctx.fillRect(cvs.width - 101, 0, 100, 100);
                ctx.fillRect(cvs.width - 101, cvs.height - 101, 100, 100);
                ctx.fillRect(0, cvs.height - 101, 100, 100);
                calibration_step = 5;
            }
            break;
    }
}

var cvs = document.getElementById("canvas");
cvs.height = window.innerHeight; //координаты будут верные по экрану
cvs.width = window.innerWidth;
var ctx = cvs.getContext("2d");
ctx.imageSmoothingEnabled = false;
var k = { x: window.innerHeight / 240, y: window.innerWidth / 256 };

class Ufo {

    x;
    y;
    type;
    dir;
    bird = new Image();
    w;
    h;

    constructor(x, y, dir, type, w, h, img) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.dir = dir;
        this.w = w;
        this.h = h;
        this.bird.src = img;
    }

    collisionCheck() {
        if ((aimxy.x > this.x && aimxy.x < this.x + this.w * k.x) &&
            (aimxy.y > this.y && aimxy.y < this.y + this.h * k.x)) {
            return true;
        }
        return false;
    }

    flyDuck() {
        if ((this.x > cvs.width) || (this.y > cvs.height) || (this.y < -this.h * k.y)) {
            this.x = -50;
            this.y = -50;
        }
        if ((aimxy.press === true) && this.collisionCheck() && (this.type < 2)) {
            this.type = 2;
        } else if (aimxy.press === true) {
            this.dir = (this.dir + 1) % 4;
        }
        if (this.type === 100) {
            ctx.drawImage(this.bird, 260, 0, 25, 40, this.x, this.y, this.w * k.x, this.h * k.x);
            this.y = (this.y + 3);
        } else if (this.type > 1) {
            ctx.drawImage(this.bird, 220, 0, 36, 40, this.x, this.y, this.w * k.x, this.h * k.x);
            this.type = this.type + 1;
        } else {
            ctx.drawImage(this.bird, 0 + this.type * 110, 0, 36, 40, this.x, this.y, this.w * k.x, this.h * k.x);
            if (this.type === 0) {
                this.x = (this.x + 1 - this.dir % 3);
                this.y = (this.y - 1);
            } else if (this.type === 1) {
                this.x = (this.x + 2);
                this.y = (this.y - this.dir % 4);
            }
        }
    }
};

class Duck extends Ufo {

    fly;
    col;

    constructor(x, y, fly, col, type, dir) {
        super(x, y, type, dir, 36, 40, "/img/ducks.png")
        this.fly = fly;
        this.col = col;
    }

    flyDuck() {
        if ((this.x > cvs.width) || (this.y > cvs.height) || (this.y < -this.h * k.y)) {
            this.x = (this.x - 300 * (this.type + 1)) * (this.type - 1) % cvs.width;
            this.type = this.type % 2;
            this.y = cvs.height - this.type * 3 * cvs.height / 4;
            this.col = (this.col + 1) % 3;
        }
        if ((aimxy.press === true) && this.collisionCheck() && (this.type < 2)) {
            this.type = 2;
        } else if (aimxy.press === true) {
            this.dir = (this.dir + 1) % 4;
        }
        if (this.type === 100) {
            ctx.drawImage(this.bird, 260 - this.col - (1 - this.col % 2) * this.col / 2, 0 + this.col * 44, 25, 40, this.x, this.y, this.w * k.x, this.h * k.x);
            this.y = (this.y + 3);
        } else if (this.type > 1) {
            ctx.drawImage(this.bird, 220 - this.col - (1 - this.col % 2) * this.col / 2, 0 + this.col * 44, 36, 40, this.x, this.y, this.w * k.x, this.h * k.x);
            this.type = this.type + 1;
        } else {
            ctx.drawImage(this.bird, 0 + (this.fly - this.fly % 10) / 10 * 36 - this.col - (1 - this.col % 2) * this.col / 2 + this.type * 110, 0 + this.col * 40, 36, 40, this.x, this.y, this.w * k.x, this.h * k.x);
            if (this.type === 0) {
                this.x = (this.x + 1 - this.dir % 3);
                this.y = (this.y - 1);
            } else if (this.type === 1) {
                this.x = (this.x + 2);
                this.y = (this.y - this.dir % 4);
            }
            this.fly = (this.fly + 1) % 30;
        }
    }
};

class WordChoice extends Ufo {

    def;
    words;
    len;

    constructor(x, y, type, dir, def, words) {
        super(x, y, type, dir, 15, 40, "/img/frame.png");
        this.h = 15;
        this.w = 40;
        this.img =
            this.def = ["?"];
        this.words = ["apple", "pearpear", "banananana", "watermelon"];
        this.len = 4;
    }

    flyDuck() {

        for (var i = 0; i < this.len; i++) {
            ctx.font = "32px serif";
            ctx.drawImage(this.bird, 1, 1, 38, 14, (cvs.width - this.w * k.x) * (i % (this.len / 2) + 1) / (this.len / 2 + 1), (cvs.height - this.h * k.y * 2) * (Math.floor(i / 2) + 1) / (3) - this.h * k.y / 3 * 2, this.w * k.x * 1.5, this.h * k.y);
            ctx.fillText(this.words[i], (cvs.width - this.w * k.x) * (i % (this.len / 2) + 1) / (this.len / 2 + 1) + this.w * k.x / 10, (cvs.height - this.h * k.y * 2) * (Math.floor(i / 2) + 1) / (3));
        }

    }

};

class wordsPlay {

    ufo = new WordChoice(0, 0, 0);
    bg = new Image();
    aim = new Image();

    constructor() {
        this.aim.src = "/img/aim.png";
        this.bg.src = "/img/scenes.png";
    }

    draw() {
        ctx.drawImage(this.bg, 0, 0, 256, 220, 0, 0, cvs.width, cvs.height);
        this.ufo.flyDuck();
        ctx.drawImage(this.aim, aimxy.x - aim.width / 2, aimxy.y - aim.height / 2);
    }
};

class ufosPlay {

    ufos = [new Ufo(cvs.width / 4, cvs.height, 0, 0, 0, 1),
    new Duck(0, cvs.height / 4, 0, 1, 1, 0),
    new Duck(cvs.width / 8, cvs.height, 0, 2, 0, 0),
    new Duck(cvs.width / 8, cvs.height / 4, 0, 2, 2, 0)];

    bg = new Image();
    bgt = new Image();
    aim = new Image();

    constructor() {
        this.bgt.src = "/img/transscenes.png";
        this.aim.src = "/img/aim.png";
        this.bg.src = "/img/scenes.png";
    }
    draw() {
        ctx.drawImage(this.bg, 0, 0, 256, 220, 0, 0, cvs.width, cvs.height);
        this.ufos.forEach(ufo => ufo.flyDuck());
        ctx.drawImage(this.bgt, 0, 0, 256, 190, 0, 0, cvs.width, cvs.height);
        ctx.drawImage(this.aim, aimxy.x - aim.width / 2, aimxy.y - aim.height / 2);
    }
};

var GAME = "INSERT_WORD"
// var GAME = "EXTRA_WORD"
var DISABLE_CALIBRATION = false;

play1 = new ufosPlay;
play2 = new wordsPlay;

var game;

function run() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "get_aim/0");
    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = xhr.responseText;
            aim_vector = JSON.parse(response);

            // console.log(aim_vector);

            if (!DISABLE_CALIBRATION && calibration_step < 5) {
                calibration(aim_vector);
            }
            else if (DISABLE_CALIBRATION || calibration_step == 5) {
                switch (GAME) {
                    case "TEST":
                        setInterval(function () { draw_aim() }, 16);
                        break;
                    case "EXTRA_WORD":
                        game = new ExtraWordGame();
                        setInterval(function () { game.draw() }, 16);
                        break;
                    case "INSERT_WORD":
                        game = new InsertWordGame();
                        setInterval(function () { game.draw() }, 16);
                        break;
                    case "GAME_2":
                        setInterval(function () { play2.draw() }, 16);
                        break;
                }
                calibration_step = 6;
            }
            else {
                if (!DISABLE_CALIBRATION) {
                    aimxy = project(aim_vector);
                    var old_press = aimxy.press;
                    var press = aim_vector.press
                    aimxy.press = press;
                    aimxy.hold = old_press;
                }
                else {
                    aimxy.press = false;
                    aimxy.hold = false;
                }
                console.log(aimxy.press, aimxy.hold);
            }
            // else {

            // play1.draw(); //project(aim_vector)
            //}
        }
        else {
            console.log("Failed to load data: " + xhr.status);
        }
    };
    xhr.send();
}

aimxy = { x: 200, y: 180, press: true, hold: true };
setInterval(run, 100);

