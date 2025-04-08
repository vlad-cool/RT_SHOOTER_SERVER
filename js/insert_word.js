function includes(a, b) {
    for (var i = 0; i < a.length; i++) {
        if (a[i][0] == b[0] && a[i][1] == b[1]) {
            return true;
        }
    }
    return false;
}

class InsertWordGame {
    word_groups = [];
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
                generated_position = [Math.floor(Math.random() * HORIZONTAL_SLOTS), Math.floor(Math.random() * (VERTICAL_SLOTS - 1) + 1)];
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
        ctx.fillText(this.word_group[0], box_width, box_height / 2 + FONT_SIZE / 2);
        ctx.fillText(`Score: ${this.score}`, (box_height - FONT_SIZE) / 2, box_height / 2 + FONT_SIZE / 2);

        for (var i = 1; i < this.word_group.length; i++) {
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
            }
        }
        ctx.drawImage(aim, aimxy.x - aim.width / 2, aimxy.y - aim.height / 2);
    }

    constructor() {
        this.aim.src = "/img/aim.png";

        const xhr = new XMLHttpRequest();
        xhr.open("GET", "game/insert_word");
        xhr.onload = function () {
            if (xhr.status === 200) {
                const response = xhr.responseText;
                this.word_groups = JSON.parse(response);
            }
            else {
                console.log("Failed to load game: " + xhr.status);
            }
            this.generate_game();
        }.bind(this);
        xhr.send();
    }
};
