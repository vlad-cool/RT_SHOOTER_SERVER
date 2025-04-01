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
                draw_aim(project(aim_vector));
            }
        }
        else {
            console.log("Failed to load data: " + xhr.status);
        }
    };
    xhr.send();
};

setInterval(run, 100);
