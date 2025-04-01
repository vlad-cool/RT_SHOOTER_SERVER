const FONT_SIZE = 48;
const FRAME_OFFSET = 20;
const HITBOX_OFFSET = 5;
const HORIZONTAL_SLOTS = 4;
const VERTICAL_SLOTS = 5;

class ExtraWordGame {
    word_groups = [
        ["Banana", "Orange", "Apple", "Cranberry", "Watermelon", "Mushroom"],
        ["Car", "Tram", "Plane", "Train", "Motorbike", "House"],
    ]
    aim = new Image();

    draw() {
        var box_width = cvs.width / HORIZONTAL_SLOTS;
        var box_height = cvs.height / VERTICAL_SLOTS;

        ctx.fillStyle = "White";
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        ctx.font = `${FONT_SIZE}px serif`;
        for (var i = 0; i < this.word_group.length; i++) {
            var word = this.word_group[i];

            var x_n = this.used_positions[i][0]
            var y_n = this.used_positions[i][1]

            var x = box_width * (x_n + 1 / 2);
            var y = box_height * (y_n + 1 / 2);

            const textMetrics = ctx.measureText(word);
            ctx.fillStyle = "gray";
            ctx.fillRect(x - FRAME_OFFSET - textMetrics.width / 2, y - FRAME_OFFSET - FONT_SIZE / 2, textMetrics.width + FRAME_OFFSET * 2, FONT_SIZE + FRAME_OFFSET * 2);
            ctx.fillStyle = "purple";
            ctx.fillText(word, x - textMetrics.width / 2, y + FONT_SIZE / 2);

            if (
                aimxy.x >= x - HITBOX_OFFSET - textMetrics.width / 2 &&
                aimxy.x <= x + HITBOX_OFFSET + textMetrics.width / 2 &&
                aimxy.y >= y - HITBOX_OFFSET - FONT_SIZE / 2 &&
                aimxy.y <= y + HITBOX_OFFSET + FONT_SIZE / 2
            ) {
                if (i + 1 == this.word_group.length) {
                    console.log("Success Hit");
                }
                else {
                    console.log("Bad Hit");
                }
                const current = new Date();
            }
        }
        ctx.drawImage(aim, aimxy.x - aim.width / 2, aimxy.y - aim.height / 2);
    }

    generate_game() {
        this.word_group = this.word_groups[Math.floor(Math.random() * (this.word_groups.length))]
        this.bad_word_xn = -1;
        this.bad_word_yn = -1;

        this.used_positions = [];

        for (var i = 0; i < this.word_group.length; i++) {
            var generated_position = -1;
            do {
                generated_position = [Math.floor(Math.random() * HORIZONTAL_SLOTS), Math.floor(Math.random() * VERTICAL_SLOTS)];
                console.log(generated_position);
            } while (this.used_positions.includes(generated_position));
            this.used_positions.push(generated_position);
        }
    }

    constructor() {
        this.aim.src = "/img/aim.png";
        this.generate_game();
    }
};
