const cd = document.getElementById('content');
const td = document.getElementById('tweet-area');

var ped;        // press enter div
var si;         // setInterval
var degree = 0; // 回転用
var size = 10;  // dotのサイズ      px     default 10  
var gameSpeed = 20; // ゲームスピード   nano秒  default 20
var mode;       // 画面のモード
var ctx;        // canvas.getContext
var keyLeft = false;
var keyRight = false;
var keyZ = false;
var keyEnter = false;
var reserve;    // 残機
var level;      // レベル
var speed;      // 背景速度
var count;      // 汎用カウンタ
var lastLevel = 0;　//最後のLevel

/**
 * 指定した要素の子どもを全て削除する
 * @parm {HTMLElement} element HTMLの要素
 */
function removeAllChild(element){
    while (element.firstChild){
        element.removeChild(element.firstChild);
    }
}

/**
 * 画面とintervalのクリア処理 
 */
function clearContent() {
    clearInterval(si);
    var html = "";
    cd.innerHTML = html;
}

/**
 * キーの押し始めを拾う処理
 */
document.body.addEventListener('keydown',
    event => {
        if (event.key === 'Enter') {
            keyEnter = true;
        } else if (event.key === 'ArrowRight') {
            keyRight = true;
        } else if (event.key === 'ArrowLeft') {
            keyLeft = true;
        } else if (event.key === "z" || event.key === " ") {
            keyZ = true;
        }
    }
);

/**
 * キーの押し終わりを拾う処理
 */
document.body.addEventListener('keyup',
    event => {
        if (event.key === 'Enter') {
            keyEnter = false;
        } else if (event.key === 'ArrowRight') {
            keyRight = false;
        } else if (event.key === 'ArrowLeft') {
            keyLeft = false;
        } else if (event.key === "z" || event.key === " ") {
            keyZ = false;
        }
    }
);

/**
 * タイトル画面の開始処理
 */
function setTitle() {
    //タイトル画面の設定
    mode = 'title';
    const html =
        '<div id="title">DotFighter</div>'
        + '<div id="press-enter" >Press Enter</div>'
        + '<div id="explanation" >You move the Fighter , and you destory blue dots.</div>';
    cd.innerHTML = html;


    //twitterボタンの作成
    const anchor = document.createElement('a');
    const hrefValue = 
        'https://twitter.com/intent/tweet?button_hashtag='+
        encodeURIComponent("DotFighter")+
        '&ref_src=twsrc%5Etfw';

    var result = '私のDotFighterLevelは'+lastLevel+'です。 https://oosakiken1.github.io/dotfighter/dotfighter.html'
    anchor.setAttribute('href',hrefValue);
    anchor.className = 'twitter-hashtag-button';
    anchor.setAttribute('data-text',result);
    anchor.innerText = 'Tweet #DotFighter';

    const script = document.createElement('script');
    script.setAttribute('src','https://platform.twitter.com/widgets.js');

    //childの削除
    removeAllChild(td);

    td.appendChild(anchor);
    td.appendChild(script);

    //interval処理の設定
    ped = document.getElementById('press-enter');
    si = setInterval(intervalTitle, 20);
}

/**
 * タイトル表示中のintervel処理
 */
function intervalTitle() {
    degree = degree + 6;
    ped.style.transform = `rotateX(${degree}deg)`;
    if (keyEnter) {
        clearContent();
        setGame();
    }
}

/**
 * ゲームを開始する処理
 */
function setGame() {
    //ゲーム画面の設定
    mode = 'intro';
    const html = '<canvas id="field" width="600px" height="600px"></canvas>';
    cd.innerHTML = html;

    const canvas = document.getElementById('field');
    ctx = canvas.getContext('2d');

    //ゲーム初期化
    myDot.clear();
    sDot.clear();
    eDot.clear();
    bDot.clear();

    reserve = 3;// 3
    level = 1;
    speed = 0;
    count = 0;

    //interval処理の設定
    si = setInterval(intervalGame, gameSpeed);
}

/**
 * mydotオブジェクト(どっと)
 */
var myDot = {
    x: 0,
    y: 550,
    wait: 0,
    enable: false,
    inCrash:false,

    //クリア処理
    clear: function () {
        this.x = 300;
        this.inCrash = false;
    },

    //画面表示
    display: function () {
        if (!this.inCrash){
            ctx.fillStyle = 'gray';
        } else {
            ctx.fillStyle = `rgb(${255*(this.wait/200)},0,0)`;
        }
        ctx.fillRect(this.x, this.y, size, size);
    },

    //操作処理
    move: function () {
        if (keyLeft) {
            this.x -= size;
        }
        if (keyRight) {
            this.x += size;
        }
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x >= 600) {
            this.x = 600 - size;
        }
        if (keyZ) {
            sDot.fire(this.x, this.y);
        }

        if (this.inCrash) {
            this.wait --;
            if (this.wait >0 ){
                speed = speed * 0.95;
            } else {
                this.inCrash = false;
                mode = "gameover";
            }
        }
    },

    //ミス処理
    crash: function () {
        reserve--;

        if (reserve <= 0) {
            this.inCrash = true;
            this.wait = 200;
            mode = "crash";

        }
    }
}

/**
 * sDotオブジェクト(たま)
 */
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
    },


}

/**
 * eDotオブジェクト（てき）
 */
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
                myDot.crash();
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
/**
 * bDotオブジェクト(背景) 
 */
var bDot = {
    x: 0,
    y: 0,
    wait :10,
    enable: false,

    //クリア処理
    clear: function() {
        this.enable = false;
        this.wait = 10;
    },

    //出現処理
    create: function () {
        if (!this.enable) {
            if (this.wait >0 ){
                this.wait --;
            } else {
                this.enable = true;
                this.y = 0;
                this.x = parseInt(Math.random() * (600 / size)) * size;
            }
        }
    },

    //表示処理
    display: function () {
        if (this.enable) {
            var color = 63;
            ctx.fillStyle = `rgb(${color},${color},${color})`;
            ctx.fillRect(this.x, this.y, size, size);
        }
    },

    //移動処理
    move: function () {

        if (this.enable) {
            this.y += speed;
            if (this.y < 0 || this.y >= 600) {
                this.enable = false;
                this.wait = 10;
            }
        }
    },

}

/**
 * ゲーム中のinterval処理
 */
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
    ctx.fillText(`Level ${level} Life ${reserve}`, 10, 34);  

    //イントロモードの処理
    if (mode === 'intro') {
        count ++;
        speed = parseInt(count / 10);
        if (count > 200) {
            mode = 'game';
        } else {

            if (count < 150) {
                ctx.fillText(`COVID come here.`, 300-16*6, 300);  
            } else {
                ctx.fillText(`Good Luck♡`, 300-10*6, 300);  
            }

            myDot.move();
            sDot.move();

            bDot.create();
            bDot.move();

            bDot.display();
            sDot.display();
            myDot.display();
        }
    }

    //ゲームモードの時の処理
    if (mode === 'game') {
        myDot.move();
        sDot.move();

        eDot.create();
        eDot.move();

        bDot.create();
        bDot.move();

        //命中判定
        if ((sDot.enable && eDot.enable) &&
        (Math.abs(eDot.x - sDot.x) < size && Math.abs(eDot.y - sDot.y) < size + level)) {
            sDot.clear();
            eDot.crash();
        }

        bDot.display();
        myDot.display();
        sDot.display();
        eDot.display();
    }

    //クラッシュモード時の処理
    if (mode === 'crash') {
        myDot.move();

        bDot.create();
        bDot.move();

        bDot.display();
        myDot.display();
    }


    //ゲームオーバー移行処理
    if (mode === 'gameover') {
        clearContent();
        setGameOver();
    }
}

/**
 * ゲームオーバー画面の開始処理
 */
function setGameOver() {
    const html =
        '<div id="title">You lose.</div>' +
        `<p>Your level is ${level}</p>`;
    cd.innerHTML = html;
    ped = document.getElementById('title');

    mode = 'gameover';
    degree = 0;

    si = setInterval(intervalGameOver, 20);
}

/**
 * ゲームオーバー画面中のintervel処理
 */
function intervalGameOver() {
    degree = degree + 3;
    if (degree <= 360) {
        ped.style.transform = `rotateY(${degree}deg)`;
    }
    if (degree > 360*2) {
        lastLevel = level;
        clearContent();
        setTitle();
    }
}

//初回はタイトルを表示する。
setTitle();

