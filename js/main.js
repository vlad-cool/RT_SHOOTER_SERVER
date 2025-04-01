var aimxy = { x: 500, y: 500, press: false, hold: false };

var aim = new Image();
aim.src = "/img/aim.png";

function draw_aim(aimxy) {
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    ctx.drawImage(aim, aimxy.x, aimxy.y);
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

    console.log(x, y);

    return {x: x, y: y};
}

function calibration(aim_vector) {
    console.log(calibration_step);
    switch (calibration_step) {
        case 0:
            console.log("Starting step 0")
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
                console.log("Starting step 1")
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
                console.log("Starting step 2")
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
                console.log("Starting step 3")
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
                console.log("Starting step 4")
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

function run() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "get_aim/0");
    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = xhr.responseText;
            aim_vector = JSON.parse(response);

            console.log(aim_vector);

            if (calibration_step != 5) {
                calibration(aim_vector);
            }
            else {
                // project(aim_vector)
                // draw_aim(project(aim_vector));
                play1.draw(calibration(aim_vector));
            }
        }
        else {
            console.log("Failed to load data: " + xhr.status);
        }
    };
    xhr.send();
};

setInterval(run, 100);
