class FriendList {
    constructor(menu) {
        this.menu = menu;
        this.$friendList = $(`
            <div class="game-friendlist">
            </div>
        `);
        this.$friendList.hide();
        this.isShow = false;
        this.menu.$menu.append(this.$friendList);

        this.start();
    }

    start() {
        setTimeout(() => {
            $.ajax({
                url: "https://app6552.acapp.acwing.com.cn/settings/friends/",
                type: "GET",
                headers: {
                    'Authorization': "Bearer " + this.menu.root.access,
                },
                success: resp => {
                    for (let i = 0; i < resp.length; i++) {
                        this.showFriend(resp[i]);
                    }

                    this.add_listening_events();
                }
            });
        });
    }

    add_listening_events() {
        this.$friendList.on('click', ".game-friendlist-item", function() {
            let username = $(this).find('.game-friend-username').text();
            console.log(username);
        });
    }

    showFriend(friend) {
        let $item = (`
            <div class="game-friendlist-item">
                <div class="game-friend-photo">
                    <img src="${friend.photo}">
                </div>
                <div class="game-friend-username">${friend.username}</div>
            </div>
        `);
        this.$friendList.append($item);
    }

    show() {
        this.isShow = true;
        this.$friendList.show();
    }

    hide() {
        this.isShow = false;
        this.$friendList.hide();
    }
}
