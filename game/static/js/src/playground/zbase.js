class GamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="game-playground"></div>`);
        this.root.$game.append(this.$playground);

        this.hide();

        this.start();
    }

    getRandomColor() {
        let colors = ["blue", "green", "yellow", "red", "pink"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    start() {
        let outer = this;

        let uuid = this.create_uuid();
        $(window).on(`resize.${uuid}`, function() {
            outer.resize();
        });

        if (this.root.AcWingOS) {
            this.root.AcWingOS.api.window.on_close(function() {
                $(window).off(`resize.${uuid}`);
            });
        }
    }

    create_uuid() {
        let uuid = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));
            uuid += x;
        }
        return uuid;
    }

    show(mode) {
        let outer = this;

        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.gameMap = new GameMap(this);
        this.noticeBoard = new NoticeBoard(this);
        this.scoreBoard = new ScoreBoard(this);
        this.playerCount = 0;
        
        this.resize();

        this.mode = mode;
        this.state = "waiting";     // waiting fighting over

        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.2, "me", this.root.settings.username, this.root.settings.photo));

        if (mode === "single mode") {
            for (let i = 0; i < 5; i++) {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.getRandomColor(), 0.2, "robot"));
            }
        } else if (mode === "multi mode") {
            this.chatField = new ChatField(this);

            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;

            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }

    }

    hide() {
        while (this.players && this.players.length > 0) {
            this.players[0].destroy();
        }

        if (this.gameMap) {
            this.gameMap.destroy();
            this.gameMap = null;
        }

        if (this.noticeBoard) {
            this.noticeBoard.destroy();
            this.noticeBoard = null;
        }

        if (this.scoreBoard) {
            this.scoreBoard.destroy();
            this.scoreBoard = null;
        }

        this.$playground.empty();

        this.$playground.hide();
    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;

        if (this.gameMap) {
            this.gameMap.resize();
        }
    }
}
