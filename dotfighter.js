const cd = document.getElementById('content');
var ped;        // press enter div
var si;         // setInterval
var degree = 0; // 回転用
var size = 10;  // dotのサイズ
var mode;       // 画面のモード
var ctx;        // canvas.getContext
var keyLeft = false;
var keyRight = false;
var keyZ = false;
var keyEnter = false;
var reserve;    // 残機
var level;      // ドットレベル


//画面とintervalのクリア処理
function clearContent() {
    clearInterval(si);
    var html = "";
    cd.innerHTML = html;
}

//キーの押し始めを拾う処理
document.body.addEventListener('keydown',
    event => {
        if (event.key === 'Enter') {
            keyEnter = true;
        } else if (event.key === 'ArrowRight') {
            keyRight = true;
        } else if (event.key === 'ArrowLeft') {
            keyLeft = true;
        } else if (event.key === 'z') {
            keyZ = true;
        }
    }
);

//キーの押し終わりを拾う処理
document.body.addEventListener('keyup',
    event => {
        if (event.key === 'Enter') {
            keyEnter = false;
        } else if (event.key === 'ArrowRight') {
            keyRight = false;
        } else if (event.key === 'ArrowLeft') {
            keyLeft = false;
        } else if (event.key === 'z') {
            keyZ = false;
        }
    }
);

//タイトル画面の開始処理
function setTitle() {
    const html =
        '<div id="title">DotFighter</div>'
        + '<div id="press-enter" >Press Enter</div>'
        + '<div id="explanation" >If u move the Fighter , u use Left Key and Right Key and Z key.</div>';
    cd.innerHTML = html;
    ped = document.getElementById('press-enter');
    si = setInterval(intervalTitle, 20);
    mode = 'title';
}

//タイトル表示中のintervel処理
function intervalTitle() {
    degree = degree + 6;
    ped.style.transform = `rotateX(${degree}deg)`;
    if (keyEnter) {
        clearContent();
        setGame();
    }
}


//ゲームを開始する処理
function setGame() {
    const html = '<canvas id="field" width="600px" height="600px"></canvas>';
    cd.innerHTML = html;

    const canvas = document.getElementById('field');
    ctx = canvas.getContext('2d');

    mode = 'game';
    si = setInterval(intervalGame, 20);
    myDot.clear();
    sDot.clear();
    eDot.clear();

    reserve = 2;// 3
    level = 1;
}

//mydotオブジェクト
var myDot = {
    x: 0,
    y: 550,
    enable: false,

    //クリア処理
    clear: function () {
        this.x = 300;
    },

    //画面表示
    display: function () {
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.x, this.y, size, size);
    },

    //操作処理
    move: function () {
        if (keyLeft) {
            this.x -= size;
        } else if (keyRight) {
            this.x += size;
        }
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x >= 600) {
            this.x = 600 - size;
        }
        this.x %= 600;
        if (keyZ) {
            sDot.fire(this.x, this.y);
        }
    }
}

//sDotオブジェクト
var sDot = {
    x: 0,
    y: 0,
    enable: false,

    //クリア処理
    clear: function () {
        this.enable = false;
    },

    //発射処理
    fire: function (x, y) {

        if (!this.enable) {
            this.enable = true;
            this.x = x;
            this.y = y;
        }
    },

    //表示処理
    display: function () {
        if (this.enable) {
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x, this.y, size, size);
        }
    },

    //移動処理
    move: function () {
        if (this.enable) {
            this.x = myDot.x;
            this.y -= size;
            if (this.y < 0) {
                this.enable = false;
            }
        }
    }
}

//edotオブジェクト
var eDot = {
    x: 0,
    y: 0,
    speedX: 0,
    speedY: 0,
    wait :40,
    enable: false,
    inCrash :false,

    //クリア処理
    clear: function() {
        this.inCrash = false;
        this.enable = false;
        this.wait = 40;
    },

    //出現処理
    create: function () {
        if ((!this.enable) && (!this.inCrash)) {
            if (this.wait >0 ){
                this.wait --;
            } else {
                this.enable = true;
                this.y = 0;
                this.x = parseInt(Math.random() * (600 / size)) * size;
                this.speedY = level;
                this.inCrash = false;
            }
        }
    },

    //表示処理
    display: function () {
        if (this.enable) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(this.x, this.y, size, size);
        }
        if (this.inCrash) {
            ctx.fillStyle = `rgb(${255*(this.wait/10)},0,0)`;
            ctx.fillRect(this.x, this.y, size, size);
        }
    },

    //移動処理
    move: function () {
//        console.log(this.wait,this.enable,this.inCrash);

        if (this.enable) {
            this.y += this.speedY;
            if (this.y < 0 || this.y >= 600) {
                this.enable = false;
                this.wait = 40;
                reserve--;
                if (reserve < 0) {
                    mode = "gameover";
                }
            }
        }
        if (this.inCrash) {
            this.y += this.speedY;
            if (this.wait >0 ){
                this.wait --;
            } else {
                this.inCrash = false;
                this.wait = 40;
            }
        }
    },

    //撃墜処理
    crash: function () {
        this.inCrash = true;
        this.enable = false;
        level++;
        this.wait = 10;
    }
}


//ゲーム中のinterval処理
function intervalGame() {
    //    var canvas = document.getElementById('field');
    //    var ctx = canvas.getContext('2d');

    //canvasのクリア
    ctx.clearRect(0, 0, 600, 600);


//    ctx.globalCompositeOperation = "source-over";
//    ctx.fillStyle = "rgba(0,0,0,.2)";
//    ctx.fillRect(0, 0, 600, 600);
//    ctx.globalCompositeOperation = "source-out";


    // スコア表示
    ctx.fillStyle = 'gray';
    ctx.font = "24px 'ＭＳ ゴシック'";
    ctx.fillText(`Level ${level} Life ${reserve}`, 10, 34);  // 座標 (20, 50) にテキスト描画

    //ゲームモードの時の処理
    if (mode === 'game') {
        myDot.move();
        sDot.move();

        eDot.create();
        eDot.move();

        //命中判定
        if ((sDot.enable && eDot.enable) &&
        (Math.abs(eDot.x - sDot.x) < size && Math.abs(eDot.y - sDot.y) < size + level)) {
            sDot.clear();
            eDot.crash();
        }

        myDot.display();
        sDot.display();
        eDot.display();
    }

    //ゲームオーバー移行処理
    if (mode === 'gameover') {
        clearContent();
        setGameOver();
    }
}

//ゲームオーバー画面の開始処理
function setGameOver() {
    const html =
        '<div id="title">You lose.</div>' +
        `<p>Your level is ${level}</p>`;
    cd.innerHTML = html;
    ped = document.getElementById('title');

    mode = 'gameover';
    si = setInterval(intervalGameOver, 20);
    degree = 0;
}

//ゲームオーバー画面中のintervel処理
function intervalGameOver() {
    degree = degree + 3;
    if (degree <= 360) {
        ped.style.transform = `rotateY(${degree}deg)`;
    }
    if (degree > 360*2) {
        clearContent();
        setTitle();
    }
}

//初回はタイトルを表示する。
setTitle();

