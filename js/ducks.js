mDef = ["0. A feature or service that makes a place pleasant, comfortable or easy to live in",
    "1. A building, service, equipment, etc. provided for a particular purpose",
    "2. To look for something/somebody",
    "3. All the workers employed in an organization considered as a group"];
mWords = [["amenity", "facility", "staff", "feature"],
["amenity", "facility", "staff", "feature"],
["amenity", "facility", "staff", "seek"],
["amenity", "seek", "staff", "feature"]];
mAns = [0,1,3,2];
j = 0;

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
        console.log(this.type, this.collisionCheck(), aimxy.press)
        if (this.type < 20) {
            if ((this.collisionCheck()) && (aimxy.press)) {
                if (this.check) {
                    this.type = 60;
                    ctx.fillText(this.word, this.x + 4 * k.x, this.y + 9 * k.y);
                    ctx.drawImage(this.bird, 1 + (this.type - this.type % 10) * 4, 1, 39, 14, this.x, this.y, this.w * k.x * 1.5, this.h * k.y);
                    play3.score += 200;
                } else {
                    this.type = 20;
                    ctx.fillText(this.word, this.x + 4 * k.x, this.y + 9 * k.y);
                    ctx.drawImage(this.bird, 1 + (this.type - this.type % 10) * 4, 1, 39, 14, this.x, this.y, this.w * k.x * 1.5, this.h * k.y);
                    play3.score -= 100;
                }
            }
            else {
                ctx.fillText(this.word, this.x + 4 * k.x, this.y + 9 * k.y);
                ctx.drawImage(this.bird, 1 + (this.type - this.type % 10) * 4, 1, 39, 14, this.x, this.y, this.w * k.x * 1.5, this.h * k.y);
            }
        } else if ((this.type < 50) || (this.type > 59) && ((this.type < 79))) {
            this.type += 1;
            ctx.fillText(this.word, this.x + 4 * k.x, this.y + 9 * k.y);
            ctx.drawImage(this.bird, 1 + (this.type - this.type % 10) * 4, 1, 39, 14, this.x, this.y, this.w * k.x * 1.5, this.h * k.y);

        } else if (this.type === 79) {
            ctx.fillText(this.word, this.x + 4 * k.x, this.y + 9 * k.y);
            ctx.drawImage(this.bird, 1 + (this.type - this.type % 10) * 4, 1, 39, 14, this.x, this.y, this.w * k.x * 1.5, this.h * k.y);

            if (j === mDef.length) {j = 0};

            play3.def = mDef[j];
            play3.ufos = [new Word((0 === mAns[j]), mWords[j][0], cvs.width / 3.5, cvs.height / 4),
            new Word((1 === mAns[j]), mWords[j][1], cvs.width / 3.5, cvs.height / 2),
            new Word((2 === mAns[j]), mWords[j][2], 3 * cvs.width / 5, cvs.height / 4),
            new Word((3 === mAns[j]), mWords[j][3], 3 * cvs.width / 5, cvs.height / 2)];;
            j += 1;
        } else {
            this.type = 59;
            ctx.fillText(this.word, this.x + 4 * k.x, this.y + 9 * k.y);
            ctx.drawImage(this.bird, 1 + (this.type - this.type % 10) * 4, 1, 39, 14, this.x, this.y, this.w * k.x * 1.5, this.h * k.y);

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
        fillTextWithLineBreaks(ctx, this.def, 14 * k.x, 10 * k.y, 20 * k.y);
        ctx.drawImage(this.ufos[0].bird, 1, 1, 38, 14, k.x, k.y, cvs.width - 2 * k.x, 15 * k.y);
        ctx.drawImage(this.ufos[0].bird, 1, 1, 38, 14, cvs.width - 60 * k.x, 16 * k.y, 59 * k.x, 15 * k.y);
        ctx.fillText(`Score: ${this.score}`, cvs.width - 57 * k.x, 25 * k.y);
    }
};

