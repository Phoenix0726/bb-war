class Ranklist {
    constructor(menu) {
        this.menu = menu;
        this.$ranklist = $(`
            <div class="game-ranklist">
                <div class="game-ranklist-item">
                    <div class="game-ranklist-ranking">排名</div>
                    <div class="game-ranklist-username">用户名</div>
                    <div class="game-ranklist-score">积分</div>
                </div>
            </div>
        `);
        this.$ranklist.hide();
        this.isShow = false;
        this.menu.$menu.append(this.$ranklist);

        this.start();
    }

    start() {
        this.players = [];
        setTimeout(() => {
            $.ajax({
                url: "https://app6552.acapp.acwing.com.cn/settings/ranklist/",
                type: "GET",
                headers: {
                    'Authorization': "Bearer " + this.menu.root.access,
                },
                success: resp => {
                    for (let i = 0; i < resp.length; i++) {
                        this.players.push(resp[i]);
                    }
                    for (let i = 0; i < this.players.length; i++) {
                        this.add_player(i + 1, this.players[i]);
                    }
                },
                error: () => {
                    this.menu.root.settings.login();
                }
            });
        }, 1000);
    }

    add_player(ranking, player) {
        let style = ranking % 2;
        let $item = (`
            <div class="game-ranklist-item game-ranklist-item-${style}">
                <div class="game-ranklist-ranking">${ranking}</div>
                <div class="game-ranklist-username">${player.username}</div>
                <div class="game-ranklist-score">${player.score}</div>
            </div>
        `);
        this.$ranklist.append($item);
    }

    show() {
        this.isShow = true;
        this.$ranklist.show();
    }

    hide() {
        this.isShow = false;
        this.$ranklist.hide();
    }
}
