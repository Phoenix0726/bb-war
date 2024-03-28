class Storage {

    constructor(props) {
        this.props = props || {}
        this.source = this.props.source || window.localStorage
        this.initRun();
    }
    initRun(){
        /*
        * set 存储方法
        * @ param {String}     key 键
        * @ param {String}     value 值，存储的值可能是数组/对象，不能直接存储，需要转换 JSON.stringify
        * @ param {String}     expired 过期时间，以分钟为单位
        */
        const reg = new RegExp("__expires__");
        let data = this.source;
        let list = Object.keys(data);
        if(list.length > 0){
            list.map((key,v)=>{
                if( !reg.test(key )){
                    let now = Date.now();
                    let expires = data[`${key}__expires__`]||Date.now+1;
                    if (now >= expires ) {
                        this.remove(key);
                    };
                };
                return key;
            });
        };
    }

	set(key, value, expired) {
	    /*
	    * set 存储方法
	    * @ param {String}     key 键
	    * @ param {String}     value 值，
	    * @ param {String}     expired 过期时间，以毫秒为单位，非必须
	    */
	    let source = this.source;
	    source[key] = JSON.stringify(value);
	    if (expired){
	        source[`${key}__expires__`] = Date.now() + expired
	    };
	    return value;
	}

    get(key) {
        /*
        * get 获取方法
        * @ param {String}     key 键
        * @ param {String}     expired 存储时为非必须字段，所以有可能取不到，默认为 Date.now+1
        */
        const source = this.source,
        expired = source[`${key}__expires__`]||Date.now+1;
        const now = Date.now();
    
        if ( now >= expired ) {
            this.remove(key);
            return;
        }
        const value = source[key] ? JSON.parse(source[key]) : source[key];
        return value;
	}

	remove(key) {
	    const data = this.source,
	        value = data[key];
	    delete data[key];
	    delete data[`${key}__expires__`];
	    return value;
	}

}

var storage = new Storage();

/*  Example
var ls=new Storage();
ls.set('userId','zhangsan',5000);
window.setInterval(()=>{
        console.log(ls.get("userId"));
},1000)
*/
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
            $.ajax({
                url: "https://app6552.acapp.acwing.com.cn/settings/messages/",
                type: "GET",
                data: {
                    username1: "test",
                    username2: "test2",
                },
                success: resp => {
                    console.log(resp);
                },
                error: () => {
                    console.log("error");
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
let GAME_OBJECTS = [];


class GameObject {
    constructor() {
        GAME_OBJECTS.push(this);

        this.uuid = this.create_uuid();

        this.has_called_start = false;  // 是否调用过 start
        this.timedelta = 0;     // 两帧间的时间间隔
    }

    create_uuid() {
        let uuid = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));
            uuid += x;
        }
        return uuid;
    }

    start() {   // 第一帧执行
    }

    update() {  // 每一帧执行
    }

    late_update() {     // 在每一帧的最后执行一次
    }

    on_destroy() {  // 销毁前执行
    }

    destroy() {     // 销毁该对象
        this.on_destroy();

        for (let i = 0; i < GAME_OBJECTS.length; i++) {
            if (GAME_OBJECTS[i] === this) {
                GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}


let last_timestamp;

let GAME_ANIMATION = function(timestamp) {
    for (let i = 0; i < GAME_OBJECTS.length; i++) {
        let obj = GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    for (let i = 0; i < GAME_OBJECTS.length; i++) {
        let obj = GAME_OBJECTS[i];
        obj.late_update();
    }

    last_timestamp = timestamp;

    requestAnimationFrame(GAME_ANIMATION);
}


requestAnimationFrame(GAME_ANIMATION);
class ChatField {
    constructor(playground) {
        this.playground = playground;

        this.$history = $(`<div class="chat-field-history">聊天记录</div>`);
        this.$history.hide();

        this.$input = $(`<input type="text" class="chat-field-input">`);
        this.$input.hide();
        this.showing = null;

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;

        this.$input.keydown(function(e) {
            if (e.which === 27) {   // esc 关闭聊天框
                outer.hide_input();
                return false;
            }
            if (e.which === 13) {
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if (text) {
                    outer.$input.val("");
                    outer.add_message(username, text);
                    outer.playground.mps.send_message(username, text);
                }
                return false;
            }
        });
    }

    render_message(message) {
        return $(`<div>${message}</div>`);
    }

    add_message(username, text) {
        this.show_history();
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    show_history() {
        let outer = this;
        this.$history.fadeIn();
        if (this.showing) {
            clearTimeout(this.showing);
        }
        this.showing = setTimeout(function() {
            outer.$history.fadeOut();
            outer.showing = null;
        }, 3000);
    }

    show_input() {
        this.show_history();
        this.$input.show();
        this.$input.focus();
    }

    hide_input() {
        this.$input.hide();
        this.playground.gameMap.$canvas.focus();
    }
}
class GameMap extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
        this.$canvas.focus();
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class NoticeBoard extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.gameMap.ctx;
        this.text = "0 人已就绪";

        this.start();
    }

    start() {
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20);
    }

    write(text) {
        this.text = text;
    }
}
class Particle extends GameObject {
    constructor(playground, x, y, radius, color, vx, vy, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.gameMap.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.move_length = move_length;
        this.eps = 0.01;
        this.friction = 0.9;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.speed *= this.friction;

        this.render();
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends GameObject {
    constructor(playground, x, y, radius, color, speed, role, username, photo) {
        super();
        this.playground = playground;
        this.ctx = this.playground.gameMap.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.role = role;
        this.username = username;
        this.photo = photo;
        this.eps = 0.01;
        
        this.hp = 100;

        this.curSkill = null;
        this.damage_vx = 0;
        this.damage_vy = 0;
        this.damage_speed = 0;
        this.friction = 0.9;

        this.gameTime = 0;

        this.fireballs = [];

        this.blink_maxdist = 0.8;   // 闪现最大距离
        
        if (this.role !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }

        if (this.role === "me") {
            this.fireball_coldtime_length = 3;     // 火球3秒冷却时间
            this.fireball_coldtime = this.fireball_coldtime_length;
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";
            this.fireball_img_x = 1.5;
            this.fireball_img_y = 0.9;
            this.fireball_img_r = 0.04;

            this.blink_coldtime_length = 5;     // 闪现5秒冷却时间
            this.blink_coldtime = this.blink_coldtime_length;
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
            this.blink_img_x = 1.62;
            this.blink_img_y = 0.9;
            this.blink_img_r = 0.04;
        }
    }

    start() {
        this.playground.playerCount++;
        this.playground.noticeBoard.write(this.playground.playerCount + " 人已就绪");
        if (this.playground.playerCount >= 3) {
            this.playground.state = "fighting";
            this.playground.noticeBoard.write("fighting");
        }

        if (this.role === "me") {
            this.add_listening_events();
        } else if (this.role === "robot") {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    isMobileDevice() {
        return navigator.userAgent.match(
            /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        );
    }

    add_listening_events() {
        if (this.isMobileDevice()) {
            this.add_listening_events_mobile();
        } else {
            this.add_listening_events_pc();
        }
    }
    
    // pc端事件
    add_listening_events_pc() {
        let outer = this;

        this.playground.gameMap.$canvas.on("contextmenu", function() {
            return false;
        });

        this.playground.gameMap.$canvas.mousedown(function(e) {
            if (outer.playground.state !== "fighting") {
                return true;
            }

            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {    // 鼠标右键
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);

                // 广播移动操作
                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);
                }
            } else if (e.which === 1) {     // 鼠标左键
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if (outer.curSkill === "fireball") {
                    let fireball = outer.shoot_fireball(tx, ty);

                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(fireball.uuid, tx, ty);
                    }
                }
                if (outer.curSkill === "blink") {
                    outer.blink(tx, ty);

                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_blink(tx, ty);
                    }
                }
                outer.curSkill = null;
            }
        });

        this.playground.gameMap.$canvas.keydown(function(e) {
            if (e.which === 13) {   // enter
                // 打开聊天框
                if (outer.playground.mode === "multi mode") {
                    outer.playground.chatField.show_input();
                    return false;
                }
            }
            if (e.which === 27) {   // esc
                // 关闭聊天框
                if (outer.playground.mode === "multi mode") {
                    outer.playground.chatField.hide_input();
                    return false;
                }
            }
            if (outer.playground.state !== "fighting") {
                return true;
            }
            if (e.which === 81) {   // q
                if (outer.fireball_coldtime > outer.eps) {
                    return true;
                }
                outer.curSkill = "fireball";
                return false;
            }
            if (e.which === 87) {   // w
                if (outer.blink_coldtime > outer.eps) {
                    return true;
                }
                outer.curSkill = "blink";
                return false;
            }
        });
    }

    // 移动端事件
    add_listening_events_mobile() {
        let outer = this;

        let lastTouchend = 0;

        this.playground.gameMap.$canvas[0].addEventListener('touchend', function(e) {
            let now = Date.now();
            if (now - lastTouchend <= 300) {    // 禁用双击放大
                e.preventDefault();
            }
            lastTouchend = now;

            if (outer.playground.state !== "fighting") {
                return true;
            }

            const rect = outer.ctx.canvas.getBoundingClientRect();

            let tx = (e.changedTouches[0].pageX - rect.left) / outer.playground.scale;
            let ty = (e.changedTouches[0].pageY - rect.top) / outer.playground.scale;

            // 点击火球技能
            if (outer.get_dist(tx, ty, outer.fireball_img_x, outer.fireball_img_y) <= outer.fireball_img_r && outer.fireball_coldtime <= outer.eps) {
                outer.curSkill = "fireball";
                return false;
            }

            // 点击瞬移技能
            if (outer.get_dist(tx, ty, outer.blink_img_x, outer.blink_img_y) <= outer.blink_img_r && outer.blink_coldtime <= outer.eps) {
                outer.curSkill = "blink";
                return false;
            }

            // 释放火球技能
            if (outer.curSkill === "fireball") {
                let fireball = outer.shoot_fireball(tx, ty);
                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_shoot_fireball(fireball.uuid, tx, ty);
                }
                outer.curSkill = null;
                return false;
            }

            // 释放瞬移技能
            if (outer.curSkill === "blink") {
                outer.blink(tx, ty);
                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_blink(tx, ty);
                }
                outer.curSkill = null;
                return false;
            }

            outer.move_to(tx, ty);
            if (outer.playground.mode === "multi mode") {
                outer.playground.mps.send_move_to(tx, ty);
            }
        });
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);

        let fireball = new FireBall(this.playground, this, x, y, vx, vy);   
        this.fireballs.push(fireball);

        this.fireball_coldtime = this.fireball_coldtime_length;

        return fireball;
    }

    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.uuid === uuid) {
                fireball.destroy();
                break;
            }
        }
    }

    blink(tx, ty) {
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, this.blink_maxdist);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.move_length = 0;

        this.blink_coldtime = this.blink_coldtime_length;
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attack(angle, damage) {
        for (let i = 0; i < 10 + Math.random() * 10; i++) {
            let x = this.x, y = this.y;
            let radius = this.radius * 0.1 * Math.random();
            let color = this.color;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5; 
            new Particle(this.playground, x, y, radius, color, vx, vy, speed, move_length);
        }

        this.hp -= damage;

        if (this.hp < this.eps) {
            this.destroy();
            return false;
        }
        this.damage_vx = Math.cos(angle);
        this.damage_vy = Math.sin(angle);
        this.damage_speed = 1;
        this.speed *= 0.8;
    }

    receive_attack(x, y, angle, damage, ball_uuid, attacker) {
        console.log(x, y);
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attack(angle, damage);
    }

    update() {
        this.gameTime += this.timedelta / 1000;
        this.update_win();
        this.update_move();
        if (this.playground.state === "fighting" && this.role === "me") {
            this.update_coldtime();
        }
        this.render();
    }

    update_move() {
        if (this.role === "robot" && this.gameTime > 5 && Math.random() < 1 / 300.0) {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * player.vx * this.timedelta / 1000;
            let ty = player.y + player.speed * player.vy * this.timedelta / 1000;
            this.shoot_fireball(player.x, player.y);
        }
        if (this.damage_speed > this.eps) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_vx * this.damage_speed * this.timedelta / 1000 * 0.5;
            this.y += this.damage_vy * this.damage_speed * this.timedelta / 1000 * 0.5;
            console.log(this.timedelta / 1000);
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.role === "robot") {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    update_coldtime() {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }
    
    update_win() {
        if (this.playground.state === "fighting" && this.role === "me" && this.playground.players.length === 1) {
            this.playground.state = "over";
            this.playground.scoreBoard.win();
        }
    }

    render() {
        let scale = this.playground.scale;
        let radius = this.radius * (1 - 0.5 * (100 - this.hp) / 100);
        if (this.role != "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - radius) * scale, (this.y - radius) * scale, radius * 2 * scale, radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if (this.role === "me" && this.playground.state === "fighting") {
            this.render_skill_coldtime();
        }
    }

    render_skill_coldtime() {
        let scale = this.playground.scale;
        let x = this.fireball_img_x;
        let y = this.fireball_img_y;
        let r = this.fireball_img_r;;

        // 火球技能图标
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > this.eps) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / this.fireball_coldtime_length) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        // 闪现技能图标
        x = this.blink_img_x;
        y = this.blink_img_y;
        r = this.blink_img_r;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blink_coldtime > this.eps) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / this.blink_coldtime_length) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

    }

    on_destroy() {
        if (this.role === "me") {
            if (this.playground.state === "fighting") {
                this.playground.state = "over";
                this.playground.scoreBoard.lose();
            }
        }
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] == this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}
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
class FireBall extends GameObject {
    constructor(playground, player, x, y, vx, vy) {
        super();
        this.playground = playground;
        this.ctx = this.playground.gameMap.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = 0.01;
        this.vx = vx;
        this.vy = vy;
        this.color = "orange";
        this.speed = 0.5;
        this.move_length = 1;
        this.damage = 20;
        this.eps = 0.01;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        this.update_move();
        if (this.player.role !== "enemy") {
            this.update_attack();
        }
        
        this.render();
    }

    update_move() {
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack() {
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
                break;
            }
        }
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        return distance < this.radius + player.radius;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attack(angle, this.damage);

        if (this.playground.mode === "multi mode") {
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }

        this.destroy();
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() {
        let fireballs = this.player.fireballs;
        for (let i = 0; i < fireballs.length; i++) {
            if (fireballs[i] === this) {
                fireballs.splice(i, 1);
                break;
            }
        }
    }
}
class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app6552.acapp.acwing.com.cn/wss/multiplayer/?token=" + playground.root.access);
        
        this.start();
    }

    start() {
        this.receive();
    }

    receive() {
        let outer = this;

        this.ws.onmessage = function(e) {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid == outer.uuid) {
                return false;
            }
            let event = data.event;
            if (event === "create player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            } else if (event === "move to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === "shoot fireball") {
                outer.receive_shoot_fireball(uuid, data.ball_uuid, data.tx, data.ty);
            } else if (event === "attack") {
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            } else if (event === "blink") {
                outer.receive_blink(uuid, data.tx, data.ty);
            } else if (event === "message") {
                outer.receive_message(data.username, data.text);
            }
        };
    }

    send_create_player(username, photo) {
        let outer = this;

        this.ws.send(JSON.stringify({
            'event': "create player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }

    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.2,
            "enemy",
            username,
            photo,
        );
        player.uuid = uuid;
        this.playground.players.push(player);
    }

    send_move_to(tx, ty) {
        let outer = this;

        this.ws.send(JSON.stringify({
            'event': "move to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_move_to(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.move_to(tx, ty);
        }
    }

    get_player(uuid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            if (player.uuid === uuid) {
                return player;
            }
        }
        return null;
    }

    send_shoot_fireball(ball_uuid, tx, ty) {
        let outer = this;

        this.ws.send(JSON.stringify({
            'event': "shoot fireball",
            'uuid': outer.uuid,
            'ball_uuid': ball_uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_shoot_fireball(uuid, ball_uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this;

        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        console.log(x, y);
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if (attacker && attackee) {
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }

    send_blink(tx, ty) {
        let outer = this;

        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.blink(tx, ty);
        }
    }

    send_message(username, text) {
        let outer = this;

        this.ws.send(JSON.stringify({
            'event': "message",
            'uuid': outer.uuid,
            'username': username,
            'text': text,
        }));
    }

    receive_message(username, text) {
        this.playground.chatField.add_message(username, text);
    }
}
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
class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if (this.root.AcWingOS) {
            this.platform = "ACAPP";
        }
        this.username = "";
        this.photo = "https://tse1-mm.cn.bing.net/th/id/OIP-C.b6FislURK8IeQUVOKRV7hwHaHY?rs=1&pid=ImgDetMain";

        this.$settings = $(`
            <div class="settings">
                <div class="settings-login">
                    <div class="settings-title">登录</div>
                    <div class="settings-username settings-item">
                        <input type="text" placeholder="用户名">
                    </div>
                    <div class="settings-password settings-item">
                        <input type="password" placeholder="密码">
                    </div>
                    <div class="settings-submit settings-item">
                        <button>登录</button>
                    </div>
                    <div class="settings-errormsg">
                    </div>
                    <div class="settings-option">
                        注册
                    </div>
                    <br/>
                    <div class="settings-acwing settings-item">
                        <img src="https://app6552.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                        <br/>
                        <div>AcWing一键登录</div>
                    </div>
                </div>
                <div class="settings-register">
                    <div class="settings-title">注册</div>
                    <div class="settings-username settings-item">
                        <input type="text" placeholder="用户名">
                    </div>
                    <div class="settings-password settings-item settings-password-first">
                        <input type="password" placeholder="密码">
                    </div>
                    <div class="settings-password settings-item settings-password-second">
                        <input type="password" placeholder="确认密码">
                    </div>
                    <div class="settings-submit settings-item">
                        <button>注册</button>
                    </div>
                    <div class="settings-errormsg">
                    </div>
                    <div class="settings-option">
                        登录
                    </div>
                    <br/>
                    <div class="settings-acwing settings-item">
                        <img src="https://app6552.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                        <br/>
                        <div>AcWing一键登录</div>
                    </div>
                </div>
            </div>
        `);

        this.$login = this.$settings.find(".settings-login");
        this.$login_username = this.$login.find(".settings-username input");
        this.$login_password = this.$login.find(".settings-password input");
        this.$login_submit = this.$login.find(".settings-submit button");
        this.$login_errormsg = this.$login.find(".settings-errormsg");
        this.$login_register = this.$login.find(".settings-option");
        this.$login.hide();

        this.$register = this.$settings.find(".settings-register");
        this.$register_username = this.$register.find(".settings-username input");
        this.$register_password = this.$register.find(".settings-password-first input");
        this.$register_password_confirm = this.$register.find(".settings-password-second input");
        this.$register_submit = this.$register.find(".settings-submit button");
        this.$register_errormsg = this.$register.find(".settings-errormsg");
        this.$register_login = this.$register.find(".settings-option");
        this.$register.hide();

        this.$acwing_login = this.$settings.find(".settings-acwing img")

        this.root.$game.append(this.$settings);

        this.start();


        this.expire = 60 * 60 * 1000;      // 1h
    }
    
    start() {
        this.getinfo();
        this.add_listening_events();
    }

    refresh_jwt_token() {
        setInterval(() => {
            $.ajax({
                url: "https://app6552.acapp.acwing.com.cn/settings/token/refresh/",
                type: "POST",
                data: {
                    refresh: this.root.refresh,
                },
                success: resp => {
                    this.root.access = resp.access;
                    storage.set('access', resp.access, this.expire);
                },
                error: () => {
                    this.login();
                }
            });
        }, 60 * 1000);

		/*setTimeout(() => {
            $.ajax({
                url: "https://app6552.acapp.acwing.com.cn/settings/ranklist/",
                type: "get",
                headers: {
                    'Authorization': "Bearer " + this.root.access,
                },
                success: resp => {
                    console.log(resp);
                },
                error: () => {
                    console.log(storage.get('access'));
                }
            });
        }, 5000);*/
    }

    add_listening_events() {
        let outer = this;

        this.add_listening_events_login();
        this.add_listening_events_register();

        this.$acwing_login.click(function() {
            outer.acwing_login();
        });
    }

    add_listening_events_login() {
        let outer = this;

        this.$login_register.click(function() {
            outer.register();
        });

        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }

    add_listening_events_register() {
        let outer = this;

        this.$register_login.click(function() {
            outer.login();
        });

        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }

    login_on_remote(username, password) {     // 在远程服务器上登录
        username = username || this.$login_username.val();
        password = password || this.$login_password.val();
        this.$login_errormsg.empty();

        $.ajax({
            url: "https://app6552.acapp.acwing.com.cn/settings/token/",
            type: "POST",
            data: {
                username: username,
                password: password,
            },
            success: resp => {
                this.root.access = resp.access;
                this.root.refresh = resp.refresh;

                storage.set('access', this.root.access, this.expire);
                storage.set('refresh', this.root.refresh, this.expire);

                this.refresh_jwt_token();

                this.getinfo_web();
            },
            error: () => {
                this.$login_errormsg.html("用户名或密码错误");
            }
        });
    }

    logout_on_remote() {    // 在远程服务器上注销登录
        if (this.platform === "ACAPP") {
            this.root.AcWingOS.api.window.close();
        }

        storage.remove('access');
        storage.remove('refresh');

        this.root.access = "";
        this.root.refresh = "";
        location.href = "/";
    }

    register_on_remote() {  // 在远程服务器上注册
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_errormsg.empty();

        $.ajax({
            url: "https://app6552.acapp.acwing.com.cn/settings/register/",
            type: "POST",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: resp => {
                if (resp.result === "success") {
                    this.login_on_remote(username, password);
                } else {
                    this.$register_errormsg.html(resp.result);
                }
            }
        });
    }

    register() {    // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() {   // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    getinfo() {
        if (this.platform === "ACAPP") {
            this.getinfo_acapp();
        } else {
            this.root.access = storage.get('access');
            this.root.refresh = storage.get('refresh');

            if (this.root.access) {
                this.getinfo_web();
                this.refresh_jwt_token();
            } else {
                this.login();
            }
        }
    }

    getinfo_web() {
        $.ajax({
            url: "https://app6552.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: this.platform,
            },
            headers: {
                'Authorization': "Bearer " + this.root.access,
            },
            success: resp => {
                if (resp.result === "success") {
                    this.username = resp.username;
                    this.photo = resp.photo;

                    this.hide();
                    this.root.menu.show();
                } else {
                    this.login();
                }
            },
            error: () => {
                this.login();
            }
        });
    }

    getinfo_acapp() {
        let outer = this;

        $.ajax({
            url: "https://app6552.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }

    acapp_login(appid, redirect_uri, scope, state) {
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, resp => {
            if (resp.result === "success") {
                this.username = resp.username;
                this.photo = resp.photo;

                this.root.access = resp.access;
                this.root.refresh = resp.refresh;
                this.refresh_jwt_token();

                this.hide();
                this.root.menu.show();
            }
        });
    }

    show() {
        this.$settings.show();
    }

    hide() {
        this.$settings.hide();
    }

    acwing_login() {
        $.ajax({
            url: "https://app6552.acapp.acwing.com.cn/settings/acwing/web/apply_code",
            type: "GET",
            success: function(resp) {
                if (resp.result == "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }
}
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
