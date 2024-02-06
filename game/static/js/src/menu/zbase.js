class GameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
            <div class="game-menu">
                <div class="game-menu-field">
                    <div class="game-menu-item game-menu-item-single">单人模式</div>
                    <div class="game-menu-item game-menu-item-multi">多人模式</div>
                    <div class="game-menu-item game-menu-item-settings">设置</div>
                </div>
            </div>
        `);

        this.root.$game.append(this.$menu);
        this.$single = this.$menu.find('.game-menu-item-single');
        this.$multi = this.$menu.find('.game-menu-item-multi');
        this.$settings = this.$menu.find('.game-menu-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;

        this.$single.click(function() {
            outer.hide();
            outer.root.playground.show();
        });

        this.$multi.click(function() {
            console.log("click multi mode");
        });

        this.$settings.click(function() {
            console.log("click settings");
        });
    }

    show() {
        this.$menu.show();
    }

    hide() {
        this.$menu.hide();
    }
}
