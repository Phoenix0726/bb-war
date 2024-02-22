export class Game {
    constructor(id, AcWingOS) {
        this.id = id;
        this.$game = $('#' + id);
        this.AcWingOS = AcWingOS;

        this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);
        this.settings = new Settings(this);

        this.start();
    }

    start() {
    }
}
