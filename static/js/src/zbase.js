export class Game {
    constructor(id, AcWingOS, access, refresh) {
        this.id = id;
        this.$game = $('#' + id);
        this.AcWingOS = AcWingOS;

        this.access = access;
        this.refresh = refresh;

        this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);
        this.settings = new Settings(this);

        this.start();
    }

    start() {
    }
}
