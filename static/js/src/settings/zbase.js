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
            console.log(storage.get('access'));

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
