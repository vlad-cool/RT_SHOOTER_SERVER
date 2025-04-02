function includes(a, b) {
    for (var i = 0; i < a.length; i++) {
        if (a[i][0] == b[0] && a[i][1] == b[1]) {
            return true;
        }
    }
    return false;
}

class InsertWordGame {
    word_groups = [
        ["By next year, they ___ their new house.", "build", "builds", "built", "are building", "had built", "will build",],
        ["She ___ her keys before leaving home yesterday.", "lose", "will lose", "has lost", "had lost", "was losing", "lost",],
        ["If it rains, we ___ the picnic.", "cancels", "will cancel", "would cancel", "cancelled", "had cancelled", "cancel",],
        ["You ___ wear a seatbelt while driving.", "can", "may", "might", "would", "could", "must",],
        ["She ___ speak French when she was young.", "can", "must", "should", "would", "might", "could",],
        ["We ___ hurry, or we'll miss the train!", "can", "may", "would", "should", "might", "must",],
        ["The meeting is ___ Monday ___ 10 AM.", "in / at", "at / on", "by / in", "from / to", "during / at", "on / at",],
        ["She lives ___ a small village ___ the mountains.", "in / on", "at / in", "on / at", "by / near", "under / over", "in / in",],
        ["I'll be back ___ an hour.", "on", "at", "by", "for", "since", "in",],
        ["If I ___ you, I would apologize.", "am", "was", "had been", "will be", "would be", "were",],
        ["She ___ happy if she gets the job.", "is", "was", "would be", "had been", "can be", "will be",],
        ["If he ___ harder, he would have passed.", "study", "studied", "has studied", "would study", "will study", "had studied",],
        ["The book ___ by a famous author.", "wrote", "writes", "was writing", "has written", "had written", "is written",],
        ["The bridge ___ last year.", "builds", "built", "is built", "has built", "had built", "was built",],
        ["The letter ___ tomorrow.", "sends", "sent", "was sent", "is sending", "has sent", "will be sent",],
        ["She said she ___ tired.", "is", "has been", "will be", "had been", "would be", "was",],
        ["He told me he ___ the movie before.", "sees", "saw", "has seen", "will see", "would see", "had seen",],
        ["They asked if we ___ help them.", "can", "will", "would", "must", "should", "could",],
        ["Please ___ the lights before leaving.", "turn on", "turn up", "turn down", "turn around", "turn into", "turn off",],
        ["She ___ her grandmother.", "takes off", "takes up", "takes out", "takes over", "takes down", "takes after",],
        ["___ to the party last night?", "You went", "Went you", "You did go", "Have you gone", "Had you gone", "Did you go",],
        ["How long ___ here?", "do you live", "are you living", "did you live", "had you lived", "will you live", "have you lived",],
        ["I wish I ___ taller.", "am", "was", "had been", "will be", "would be", "were",],
        ["There isn't ___ milk left.", "some", "few", "many", "much", "a little", "any",],
        ["She has ___ friends in this city.", "a few", "little", "a little", "many", "much", "few",],
        ["The ___ of the story was unexpected.", "ending", "finish", "finale", "conclusion", "stop", "end",],
        ["He ___ his mistakes and apologized.", "except", "accept", "denied", "refused", "ignored", "admitted",],
        ["This decision will ___ everyone.", "effect", "infect", "defect", "reflect", "perfect", "affect"]
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
        this.generate_game();
    }
};
