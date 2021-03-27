'use strict';
const cd = document.getElementById('content');
const td = document.getElementById('tweet-area');
const audioShoot = document.getElementById('audio-shoot');
const audioCrash = document.getElementById('audio-crash');
audioShoot.volume = 0.05;
audioCrash.volume = 0.05;

// const audioMiss = document.getElementById('audio-miss');
// const audioGameOver = document.getElementById('audio-gameover');
// const audioGameStart = document.getElementById('audio-gamestart');

let ped;        // press enter div
let si;         // setInterval
let degree = 0; // 回転用
const sizeX = 32;  // dotのサイズ      px     default 10
const sizeY = 32;  // dotのサイズ      px     default 10
const maxX = 640;
const maxY = 640;
const patternX = [32,0,32,64];
let gameSpeed = 20; // ゲームスピード   nano秒  default 20
let mode;       // 画面のモード
let ctx;        // canvas.getContext
let keyLeft = false;
let keyRight = false;
let keyZ = false;
let keyEnter = false;
let reserve;    // 残機
let level;      // レベル
let speed;      // 背景速度
let count;      // 汎用カウンタ
let lastLevel = 0;　//最後のLevel
let yourLevel = localStorage.getItem('yourLevel') || 0;

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
    const html = "";
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
        `<p style = "text-align:left;">Your level ${yourLevel}</p>`
        + '<div id="title">DotFighter</div>'
        + '<div id="press-enter" >Press Enter</div>'
        + '<div id="explanation" >You move the Fighter , and you destroy blue dots.</div>';
    cd.innerHTML = html;

    //twitterボタンの作成
    const anchor = document.createElement('a');
    const hrefValue = 
        'https://twitter.com/intent/tweet?button_hashtag='+
        encodeURIComponent("DotFighter")+
        '&ref_src=twsrc%5Etfw';

    const result = '私のDotFighterLevelは'+lastLevel+'です。 https://oosakiken1.github.io/dotfighter/dotfighter.html'
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
        // audioGameStart.play();
    }
}

/**
 * ゲームを開始する処理
 */
function setGame() {
    //ゲーム画面の設定
    mode = 'intro';
    const html = `<canvas id="field" width="${maxX}px" height="${maxY}px"></canvas>`;
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
    isEnable: false,
    isCrash:false,
    img : null,

    //クリア処理
    clear: function () {
        this.x = maxX/2;
        this.isCrash = false;
    },

    //画面表示
    display: function () {
        if (this.isCrash){
            ctx.fillStyle = `rgb(${255*(this.wait/200)},0,0)`;
            ctx.fillRect(this.x, this.y, sizeX, sizeY);
        }
        ctx.drawImage(this.img,patternX[Math.floor(count/16)%4],96,32,32,this.x, this.y, sizeX, sizeY);
    },

    //操作処理
    move: function () {
        if (keyLeft) {
            this.x -= sizeX / 2;
        }
        if (keyRight) {
            this.x += sizeX / 2;
        }
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x >= maxX - sizeX) {
            this.x = maxX - sizeX;
        }
        if (keyZ) {
            sDot.fire(this.x, this.y);
        }

        if (this.isCrash) {
            this.wait --;
            if (this.wait >0 ){
                speed = speed * 0.95;
            } else {
                this.isCrash = false;
                mode = "gameover";
            }
        }
    },

    //ミス処理
    crash: function () {
        reserve--;

        if (reserve <= 0) {
            this.isCrash = true;
            this.wait = 200;
            mode = "crash";
            // audioGameOver.play();

        } else {
            // audioMiss.play();
        }

    }
}

/**
 * sDotオブジェクト(たま)
 */
var sDot = {
    x: 0,
    y: 0,
    isEnable: false,
    img : null,

    //クリア処理
    clear: function () {
        this.isEnable = false;
    },

    //発射処理
    fire: function (x, y) {

        if (!this.isEnable) {
            audioShoot.play();
            this.isEnable = true;
            this.x = x;
            this.y = y;
        }
    },

    //表示処理
    display: function () {
        if (this.isEnable) {
            ctx.fillStyle = 'white';
            // ctx.fillRect(this.x, this.y, sizeX, sizeY);
            ctx.drawImage(this.img,patternX[Math.floor(count/16)%4],96,32,32,this.x, this.y, sizeX, sizeY);
        }
    },

    //移動処理
    move: function () {
        if (this.isEnable) {     
            this.x = myDot.x;
            this.y -= sizeY / 4;
            if (this.y < 0) {
                this.isEnable = false;
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
    
    isEnable: false,
    isCrash :false,
    img : null,

    //クリア処理
    clear: function() {
        this.isCrash = false;
        this.isEnable = false;
        this.wait = 40;
    },

    //出現処理
    create: function () {
        if ((!this.isEnable) && (!this.isCrash)) {
            if (this.wait >0 ){
                this.wait --;
            } else {
                this.isEnable = true;
                this.y = 0;
                this.x = parseInt(Math.random() * (maxX / sizeX)) * sizeX;
                this.speedY = level;
                this.isCrash = false;
            }
        }
    },

    //表示処理
    display: function () {
        if (this.isEnable) {
            // ctx.fillStyle = 'blue';
            // ctx.fillRect(this.x, this.y, sizeX, sizeY);
            ctx.drawImage(this.img,patternX[Math.floor(this.speedY * count/16)%4],0,32,32,this.x, this.y, sizeX, sizeY);
        }
        if (this.isCrash) {
            ctx.fillStyle = `rgb(${255*(this.wait/10)},0,0)`;
            ctx.fillRect(this.x, this.y, sizeX, sizeY);
            ctx.drawImage(this.img,patternX[Math.floor(this.speedY * count/16)%4],0,32,32,this.x, this.y, sizeX, sizeY);
        }
    },

    //移動処理
    move: function () {
//        console.log(this.wait,this.isEnable,this.isCrash);

        if (this.isEnable) {
            this.y += this.speedY;
            if (this.y < 0 || this.y >= maxY) {
                this.isEnable = false;
                this.wait = 40;
                myDot.crash();
            }
        }
        if (this.isCrash) {
            this.y += this.speedY;
            if (this.wait >0 ){
                this.wait --;
            } else {
                this.isCrash = false;
                this.wait = 40;
            }
        }
    },

    //撃墜処理
    crash: function () {
        audioCrash.play();
        this.isCrash = true;
        this.isEnable = false;
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
    isEnable: false,
    img : null,

    //クリア処理
    clear: function() {
        this.isEnable = false;
        this.wait = 10;
    },

    //出現処理
    create: function () {
        if (!this.isEnable) {
            if (this.wait >0 ){
                this.wait --;
            } else {
                this.isEnable = true;
                this.y = 0;
                this.x = parseInt(Math.random() * (maxX / sizeX)) * sizeX;
            }
        }
    },

    //表示処理
    display: function () {
        if (this.isEnable) {
            var color = 63;
            ctx.fillStyle = `rgb(${color},${color},${color})`;
            ctx.fillRect(this.x, this.y, sizeX, sizeY);
        }
    },

    //移動処理
    move: function () {

        if (this.isEnable) {
            this.y += speed;
            if (this.y < 0 || this.y >= maxY) {
                this.isEnable = false;
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
    ctx.clearRect(0, 0, maxX, maxY);

    count ++;

    // スコア表示
    ctx.fillStyle = 'gray';
    ctx.font = "24px 'ＭＳ ゴシック'";
    ctx.fillText(`Level ${level} Life ${reserve}`, 10, 34);  

    //イントロモードの処理
    if (mode === 'intro') {
        speed = parseInt(count / 10);
        if (count > 200) {
            mode = 'game';
        } else {

            if (count < 150) {
                ctx.fillText(`Invaders come here.`, maxX/2-19*6, maxY/2);  
            } else {
                ctx.fillText(`Good Luck♡`, maxX/2-10*6, maxY/2);  
            }

            myDot.move();
            sDot.move();

            // bDot.create();
            // bDot.move();

            // bDot.display();
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

        // bDot.create();
        // bDot.move();

        //命中判定
        if ((sDot.isEnable && eDot.isEnable) &&
        (Math.abs(eDot.x - sDot.x) < sizeX && Math.abs(eDot.y - sDot.y) < sizeY + level)) {
            sDot.clear();
            eDot.crash();
        }

        // bDot.display();
        myDot.display();
        sDot.display();
        eDot.display();
    }

    //クラッシュモード時の処理
    if (mode === 'crash') {
        myDot.move();

        // bDot.create();
        // bDot.move();

        // bDot.display();
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
        if (lastLevel > yourLevel) {
            yourLevel = lastLevel;
            localStorage.setItem('yourLevel',yourLevel);
        }
        clearContent();
        setTitle();
    }
}

//初回はタイトルを表示する。
eDot.img = new Image();
eDot.img.src = './hone.png';
eDot.img.onload = () => {
    myDot.img = new Image();
    myDot.img.src = './majo.png';
    myDot.img.onload = () => {
        sDot.img = new Image();
        sDot.img.src = './koumori.png';
        sDot.img.onload = () => {
            setTitle();
        };
    };
};


