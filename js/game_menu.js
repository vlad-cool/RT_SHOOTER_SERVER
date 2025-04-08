function includes(a, b) {
    for (var i = 0; i < a.length; i++) {
        if (a[i][0] == b[0] && a[i][1] == b[1]) {
            return true;
        }
    }
    return false;
}

const AVAILABLE_GAMES = ["Insert word", "Extra word", "Ducks", "Game 3"];

class GameMenu {
    aim = new Image();
    score = 0;

    generate_game() {
        this.used_positions = [];

        for (var i = 0; i < AVAILABLE_GAMES.length; i++) {
            var generated_position = [i % VERTICAL_SLOTS, Math.round(i / VERTICAL_SLOTS)];
            this.used_positions.push(generated_position);
        }
    }

    draw() {
        var box_width = cvs.width / HORIZONTAL_SLOTS;
        var box_height = cvs.height / VERTICAL_SLOTS;

        ctx.fillStyle = "White";
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        ctx.font = `${FONT_SIZE}px serif`;

        // ctx.fillStyle = "blue";
        // ctx.fillText(`Score: ${this.score}`, (box_height - FONT_SIZE) / 2, box_height / 2 + FONT_SIZE / 2);

        for (var i = 0; i < AVAILABLE_GAMES.length; i++) {
            var word = AVAILABLE_GAMES[i];

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
                return AVAILABLE_GAMES[i];
            }
        }
        ctx.drawImage(aim, aimxy.x - aim.width / 2, aimxy.y - aim.height / 2);
    }

    constructor() {
        this.aim.src = "/img/aim.png";
        this.generate_game();
    }
};
