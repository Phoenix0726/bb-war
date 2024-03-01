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
