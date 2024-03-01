class ScoreBoard extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.gameMap.ctx;

        this.state = null;

        this.winImg = new Image();
        this.winImg.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_8f58341a5e-win.png";
        this.loseImg = new Image();
        this.loseImg.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_9254b5f95e-lose.png";
    }

    start() {
    }

    add_listening_events() {
        let outer = this;
        let $canvas = this.playground.gameMap.$canvas;
        $canvas.on('click', function() {
            outer.playground.hide();
            outer.playground.root.menu.show();
        });
    }

    win() {
        this.state = "win";
        let outer = this;
        setTimeout(function() {
            outer.add_listening_events();
        }, 1000);
    }

    lose() {
        this.state = "lose";
        let outer = this;
        setTimeout(function() {
            outer.add_listening_events();
        }, 1000);
    }

    late_update() {
        this.render();
    }

    render() {
        let len = this.playground.height / 2;
        if (this.state === "win") {
            this.ctx.drawImage(this.winImg, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        } else if (this.state === "lose") {
            this.ctx.drawImage(this.loseImg, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
    }
}
