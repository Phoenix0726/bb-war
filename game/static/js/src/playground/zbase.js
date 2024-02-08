class GamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="game-playground"></div>`);

        // this.hide();
        this.root.$game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.gameMap = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.2, true));

        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.getRandomColor(), this.height * 0.2, false));
        }

        this.start();
    }

    getRandomColor() {
        let colors = ["blue", "green", "yellow", "red", "pink"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    start() {
    }

    show() {
        this.$playground.show();
    }

    hide() {
        this.$playground.hide();
    }
}
