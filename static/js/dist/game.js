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
            </div>
        `);

        this.$menu.hide();
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
            outer.root.settings.logout_on_remote();
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

        this.has_called_start = false;  // 是否调用过 start
        this.timedelta = 0;     // 两帧间的时间间隔
    }

    start() {   // 第一帧执行
    }

    update() {  // 每一帧执行
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
    last_timestamp = timestamp;

    requestAnimationFrame(GAME_ANIMATION);
}


requestAnimationFrame(GAME_ANIMATION);
class GameMap extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
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
        this.eps = 1;
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends GameObject {
    constructor(playground, x, y, radius, color, speed, isMe) {
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
        this.isMe = isMe;
        this.eps = 0.1;
        
        this.curSkill = null;
        this.damage_vx = 0;
        this.damage_vy = 0;
        this.damage_speed = 0;
        this.friction = 0.9;

        this.gameTime = 0;
        
        if (this.isMe) {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }

    start() {
        if (this.isMe) {
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }
    
    add_listening_events() {
        let outer = this;

        this.playground.gameMap.$canvas.on("contextmenu", function() {
            return false;
        });

        this.playground.gameMap.$canvas.mousedown(function(e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
            } else if (e.which === 1) {
                if (outer.curSkill === "fireball") {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }
                outer.curSkill = null;
            }
        });

        $(window).keydown(function(e) {
            if (e.which === 81) {   // q
                outer.curSkill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let angle = Math.atan2(ty - y, tx - x);
        let vx = Math.cos(angle), vy = Math.sin(angle);

        new FireBall(this.playground, this, x, y, vx, vy);   
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

        this.radius -= damage;
        if (this.radius < 10) {
            this.destroy();
            return false;
        }
        this.damage_vx = Math.cos(angle);
        this.damage_vy = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;
    }

    update() {
        this.gameTime += this.timedelta / 1000;
        if (!this.isMe && this.gameTime > 5 && Math.random() < 1 / 300.0) {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * player.vx * this.timedelta / 1000;
            let ty = player.y + player.speed * player.vy * this.timedelta / 1000;
            this.shoot_fireball(player.x, player.y);
        }
        if (this.damage_speed > 10) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_vx * this.damage_speed * this.timedelta / 1000 * 0.5;
            this.y += this.damage_vy * this.damage_speed * this.timedelta / 1000 * 0.5;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.isMe) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    render() {
        if (this.isMe) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] == this) {
                this.playground.players.splice(i, 1);
                break;
            }
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
        this.radius = this.playground.height * 0.01;
        this.vx = vx;
        this.vy = vy;
        this.color = "orange";
        this.speed = this.playground.height * 0.5;
        this.move_length = this.playground.height;
        this.damage = this.playground.height * 0.01;
        this.eps = 0.1;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }

        this.render();
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
        this.destroy();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class GamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="game-playground"></div>`);

        this.hide();

        this.start();
    }

    getRandomColor() {
        let colors = ["blue", "green", "yellow", "red", "pink"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    start() {
    }

    show() {
        this.root.$game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.gameMap = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.2, true));

        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.getRandomColor(), this.height * 0.2, false));
        }

        this.$playground.show();
    }

    hide() {
        this.$playground.hide();
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
        this.photo = "";

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
    }
    
    start() {
        this.getinfo();
        this.add_listening_events();
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

    login_on_remote() {     // 在远程服务器上登录
        let outer = this;

        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_errormsg.empty();

        $.ajax({
            url: "https://app6552.acapp.acwing.com.cn/settings/login",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_errormsg.html(resp.result);
                }
            }
        });
    }

    logout_on_remote() {    // 在远程服务器上注销登录
        if (this.platform === "ACAPP") {
            return false;
        }

        $.ajax({
            url: "https://app6552.acapp.acwing.com.cn/settings/logout",
            type: "GET",
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                }
            }
        });
    }

    register_on_remote() {  // 在远程服务器上注册
        let outer = this;

        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_errormsg.empty();

        $.ajax({
            url: "https://app6552.acapp.acwing.com.cn/settings/register",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$register_errormsg.html(resp.result);
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
            this.getinfo_web();
        }
    }

    getinfo_web() {
        let outer = this;

        $.ajax({
            url: "https://app6552.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;

                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
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
        let outer = this;

        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp) {
            console.log(resp);
            if (resp.result === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;

                outer.hide();
                outer.root.menu.show();
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
                console.log(resp);
                if (resp.result == "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }
}
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
