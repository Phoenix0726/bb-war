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
        if (this.isMobileDevice) {
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

        this.radius -= damage;
        if (this.radius < this.eps) {
            this.destroy();
            return false;
        }
        this.damage_vx = Math.cos(angle);
        this.damage_vy = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;
    }

    receive_attack(x, y, angle, damage, ball_uuid, attacker) {
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
        if (this.role != "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
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
