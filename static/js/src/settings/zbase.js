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
