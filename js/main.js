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
        super(x, y, dir, type, 36, 40, "/img/ducks.png")
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

class Word extends Ufo {

    word;
    check;

    constructor(check, word, x, y) {
        super(x, y, 0, 0, 40, 15, "/img/frame.png");
        this.check = check;
        this.word = word;
    }

    collisionCheck() {
        if ((aimxy.x > this.x && aimxy.x < this.x + this.w * k.x * 1.5) &&
            (aimxy.y > this.y && aimxy.y < this.y + this.h * k.y)) {
            return true;
        }
        return false;
    }

    flyDuck() {
        
        ctx.font = "32px serif";
        console.log(this.type,this.collisionCheck(),aimxy.press)
        if (this.type < 20) {
                if ((this.collisionCheck()) && (aimxy.press)) {
                    if (this.check) {
                        this.type = 60;
                        ctx.fillText(this.word, this.x+4*k.x, this.y+9*k.y);
                        ctx.drawImage(this.bird, 1+(this.type-this.type%10)*4, 1, 39, 14, this.x, this.y, this.w * k.x * 1.5, this.h * k.y);
                        play3.score += 200;
                    } else {
                        this.type = 20;
                        ctx.fillText(this.word, this.x+4*k.x, this.y+9*k.y);
                        ctx.drawImage(this.bird, 1+(this.type-this.type%10)*4, 1, 39, 14, this.x, this.y, this.w * k.x * 1.5, this.h * k.y);
                        play3.score -= 100;
                    }
                }
                else {
                    ctx.fillText(this.word, this.x+4*k.x, this.y+9*k.y);
                    ctx.drawImage(this.bird, 1+(this.type-this.type%10)*4, 1, 39, 14, this.x, this.y, this.w * k.x * 1.5, this.h * k.y);
                }
        } else if ((this.type < 50) || (this.type > 59) && ((this.type < 79))) {
            this.type += 1; 
            ctx.fillText(this.word, this.x+4*k.x, this.y+9*k.y);
            ctx.drawImage(this.bird, 1+(this.type-this.type%10)*4, 1, 39, 14, this.x, this.y, this.w * k.x * 1.5, this.h * k.y);

        } else if (this.type === 79) { 
            ctx.fillText(this.word, this.x+4*k.x, this.y+9*k.y);
            ctx.drawImage(this.bird, 1+(this.type-this.type%10)*4, 1, 39, 14, this.x, this.y, this.w * k.x * 1.5, this.h * k.y);
            
            play35.score = play3.score;
            play3 = play35;
        } else {
            this.type = 59; 
            ctx.fillText(this.word, this.x+4*k.x, this.y+9*k.y);
            ctx.drawImage(this.bird, 1+(this.type-this.type%10)*4, 1, 39, 14, this.x, this.y, this.w * k.x * 1.5, this.h * k.y);
            
        }

        //ctx.drawImage(this.bird, 1+this.type*40, 1, 38+this.type*40, 14, (cvs.width - this.w * k.x) * (i % (this.len / 2) + 1) / (this.len / 2 + 1), (cvs.height - this.h * k.y * 2) * (Math.floor(i / 2) + 1) / (3) - this.h * k.y / 3 * 2, this.w * k.x * 1.5, this.h * k.y);
        //ctx.fillText(this.word, (cvs.width - this.w * k.x) * (i % (this.len / 2) + 1) / (this.len / 2 + 1) + this.w * k.x / 10, (cvs.height - this.h * k.y * 2) * (Math.floor(i / 2) + 1) / (3));

        
    }

};

class ufosPlay {

    ufos;
    bg = new Image();
    bgt = new Image();
    aim = new Image();

    constructor(ufos) {
        this.ufos = ufos;
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

class ducksPlay extends ufosPlay {
    constructor(ufos) {
        super(ufos);
    }
};

function fillTextWithLineBreaks(ctx, text, x, y, lineHeight) {
    const lines = text.split('\n');
    lines.forEach((line, i) => {
        ctx.fillText(line, x, y + (i * lineHeight));
    });
}

class wordsPlay extends ufosPlay {
    def;
    score;
    constructor(def, ufos) {
        super(ufos);
        this.ufos = ufos;
        this.def = def;
        this.score = 0;
    }

    draw() {
        ctx.drawImage(this.bg, 0, 0, 256, 220, 0, 0, cvs.width, cvs.height);
        this.ufos.forEach(ufo => ufo.flyDuck());
        ctx.drawImage(this.bgt, 0, 0, 256, 190, 0, 0, cvs.width, cvs.height);
        ctx.drawImage(this.aim, aimxy.x - aim.width / 2, aimxy.y - aim.height / 2);
        fillTextWithLineBreaks(ctx, this.def, 14*k.x, 10*k.y, 20*k.y);
        ctx.drawImage(this.ufos[0].bird, 1, 1, 38, 14, k.x, k.y, cvs.width-2*k.x, 15*k.y);
        ctx.drawImage(this.ufos[0].bird, 1, 1, 38, 14, cvs.width-60*k.x, 16*k.y, 59*k.x, 15*k.y);
        ctx.fillText(`Score: ${this.score}`, cvs.width-57*k.x, 25*k.y);
    }
};

var GAME = "GAME_2";
var DISABLE_CALIBRATION = true;

//play1 = new ufosPlay;
play2 = new ducksPlay([ new Duck(cvs.width / 4, cvs.height,     0, 0, 0, 1),
                        new Duck(0,             cvs.height / 4, 0, 1, 1, 0),
                        new Duck(cvs.width / 8, cvs.height,     0, 2, 0, 0),
                        new Duck(cvs.width / 8, cvs.height / 4, 0, 2, 2, 0)]);
wordsMass = ["amenity", "facility", "staff", "feature"]
play3 = new wordsPlay("0. A feature or service that makes a place pleasant, comfortable or easy to live in",
                    [new Word(true,"amenity", cvs.width / 3.5, cvs.height / 4),
                    new Word(false,"facility", cvs.width / 3.5, cvs.height / 2),
                    new Word(false,"staff", 3*cvs.width / 5, cvs.height / 4),
                    new Word(false, "feature", 3*cvs.width / 5, cvs.height / 2)]);
play35 = new wordsPlay("1. A feature or service that makes a place pleasant, comfortable or easy to live in",
                        [new Word(false,"staff", cvs.width / 3.5, cvs.height / 4),
                        new Word(false,"facility", cvs.width / 3.5, cvs.height / 2),
                        new Word(true,"amenity", 3*cvs.width / 5, cvs.height / 4),
                        new Word(false, "feature", 3*cvs.width / 5, cvs.height / 2)]);
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
                    case "GAME_3":
                        setInterval(function () { play3.draw() }, 16);
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

//             play1.draw(); //project(aim_vector)
//             }
        }
        else {
            console.log("Failed to load data: " + xhr.status);
        }
    };
    xhr.send();
}

aimxy = { x: 400, y: 185, press: true, hold: true };
//setInterval(function () { game.draw() }, 16);
setInterval(run, 100);

