class GameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
            <div class="game-menu">
                <div class="game-menu-field">
                    <div class="game-menu-item game-menu-item-single">单人模式</div>
                    <div class="game-menu-item game-menu-item-multi">多人模式</div>
                    <div class="game-menu-item game-menu-item-settings">退出</div>
                </div>
                <div class="game-menu-bar">
                    <div class="game-menu-bar-item game-menu-ranklist">
                        <img src="static/image/menu/ranklist.png">
                        <div>排行榜</div>
                    </div>
                    <div class="game-menu-bar-item game-menu-friendlist">
                        <img src="static/image/menu/friends.png">
                        <div>好友列表</div>
                    </div>
                </div>
            </div>
        `);

        this.$menu.hide();
        this.root.$game.append(this.$menu);
        this.$single = this.$menu.find('.game-menu-item-single');
        this.$multi = this.$menu.find('.game-menu-item-multi');
        this.$settings = this.$menu.find('.game-menu-item-settings');

        this.$ranklist = this.$menu.find('.game-menu-ranklist');
        this.ranklist = new Ranklist(this);

        this.$friendList = this.$menu.find('.game-menu-friendlist');
        this.friendList = new FriendList(this);

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;

        this.$single.click(function() {
            outer.hide();
            outer.root.playground.show("single mode");
        });

        this.$multi.click(function() {
            outer.hide();
            outer.root.playground.show("multi mode");
        });

        this.$settings.click(function() {
            outer.root.settings.logout_on_remote();
        });

        this.$ranklist.click(function() {
            if (outer.ranklist.isShow) {
                outer.ranklist.hide();
            } else {
                outer.ranklist.show();
            }
        });

        this.$friendList.click(function() {
            if (outer.friendList.isShow) {
                outer.friendList.hide();
            } else {
                outer.friendList.show();
            }
        });
    }

    show() {
        this.$menu.show();
    }

    hide() {
        this.$menu.hide();
    }
}
