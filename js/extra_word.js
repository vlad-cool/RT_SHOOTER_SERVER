const FONT_SIZE = 48;
const FRAME_OFFSET = 20;
const HITBOX_OFFSET = 5;
const HORIZONTAL_SLOTS = 4;
const VERTICAL_SLOTS = 5;

function includes(a, b) {
    for (var i = 0; i < a.length; i++) {
        if (a[i][0] == b[0] && a[i][1] == b[1]) {
            return true;
        }
    }
    return false;
}

class ExtraWordGame {
    word_groups = [
        ["Banana", "Orange", "Apple", "Cranberry", "Watermelon", "Mushroom"],
        ["Car", "Tram", "Plane", "Train", "Motorbike", "House"],
        ["Dog", "Cat", "Lion", "Elephant", "Dolphin", "Oak"],
        ["Piano", "Guitar", "Violin", "Trumpet", "Flute", "Microphone"],
        ["France", "Germany", "Brazil", "Japan", "Australia", "Paris"],
        ["Square", "Circle", "Triangle", "Rectangle", "Pentagon", "Pyramid"],
        ["Shirt", "Pants", "Jacket", "Socks", "Hat", "Hanger"],
        ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Moon"],
        ["Soccer", "Basketball", "Tennis", "Golf", "Swimming", "Helmet"],
        ["Rose", "Tulip", "Sunflower", "Daisy", "Orchid", "Cactus"],
        ["Doctor", "Teacher", "Engineer", "Chef", "Artist", "Hospital"],
        ["Gold", "Silver", "Copper", "Iron", "Aluminum", "Plastic"],
        ["Math", "Physics", "Chemistry", "Biology", "History", "Classroom"],
        ["Rain", "Snow", "Wind", "Fog", "Lightning", "Umbrella"],
        ["Chair", "Table", "Sofa", "Cabinet", "Bookshelf", "Lamp"],
    ];
    aim = new Image();
    score = 0;

    generate_game() {
        this.word_group = this.word_groups[Math.floor(Math.random() * (this.word_groups.length))]
        this.bad_word_xn = -1;
        this.bad_word_yn = -1;

        this.used_positions = [];

        for (var i = 0; i < this.word_group.length; i++) {
            var generated_position = -1;
            do {
                generated_position = [Math.floor(Math.random() * HORIZONTAL_SLOTS), Math.floor(Math.random() * VERTICAL_SLOTS)];
            } while (includes(this.used_positions, generated_position) || generated_position[0] + generated_position[1] == 0);
            this.used_positions.push(generated_position);
        }
    }

    draw() {
        var box_width = cvs.width / HORIZONTAL_SLOTS;
        var box_height = cvs.height / VERTICAL_SLOTS;

        ctx.fillStyle = "White";
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        ctx.font = `${FONT_SIZE}px serif`;
        
        ctx.fillStyle = "blue";
        ctx.fillText(`Score: ${this.score}`, 0, box_height / 2 + FONT_SIZE / 2);

        for (var i = 0; i < this.word_group.length; i++) {
            var word = this.word_group[i];

            var x_n = this.used_positions[i][0]
            var y_n = this.used_positions[i][1]

            var x = box_width * (x_n + 1 / 2);
            var y = box_height * (y_n + 1 / 2);

            const textMetrics = ctx.measureText(word);
            ctx.strokeStyle = "gray"
            ctx.strokeRect(x - FRAME_OFFSET - textMetrics.width / 2, y - FRAME_OFFSET - FONT_SIZE / 2, textMetrics.width + FRAME_OFFSET * 2, FONT_SIZE + FRAME_OFFSET * 2);
            ctx.fillStyle = "black";
            ctx.fillText(word, x - textMetrics.width / 2, y + FONT_SIZE / 2);

            if (
                aimxy.x >= x - HITBOX_OFFSET - textMetrics.width / 2 &&
                aimxy.x <= x + HITBOX_OFFSET + textMetrics.width / 2 &&
                aimxy.y >= y - HITBOX_OFFSET - FONT_SIZE / 2 &&
                aimxy.y <= y + HITBOX_OFFSET + FONT_SIZE / 2 &&
                aimxy.press && !aimxy.hold
            ) {
                aimxy.hold = true;
                if (i + 1 == this.word_group.length) {
                    console.log("Success Hit");
                    this.score += 100;
                    this.generate_game();
                }
                else {
                    this.score -= 200;
                    this.score = Math.max(0, this.score);
                    console.log("Bad Hit");
                }
                const current = new Date();
            }
        }
        ctx.drawImage(aim, aimxy.x - aim.width / 2, aimxy.y - aim.height / 2);
    }

    constructor() {
        this.aim.src = "/img/aim.png";
        this.generate_game();
    }
};
