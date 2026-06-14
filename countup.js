let players = [];
let currentPlayer = 0;

let round = 1;
let throwNum = 1;
let multiplier = 1;

const singleBtn = document.getElementById("singleBtn");
const doubleBtn = document.getElementById("doubleBtn");
const tripleBtn = document.getElementById("tripleBtn");
const scoreEl = document.getElementById("score");
const roundEl = document.getElementById("round");
const throwEl = document.getElementById("throw");
const turnCurrentEl = document.getElementById("turnCurrent");
const turnMaxEl = document.getElementById("turnMax");
const buttonsEl = document.getElementById("buttons");
const currentPlayerEl = document.getElementById("currentPlayer");
const playerScoresEl = document.getElementById("playerScores");

singleBtn.addEventListener("click", () => {
    setMultiplier(1);
});

doubleBtn.addEventListener("click", () => {
    setMultiplier(2);
});

tripleBtn.addEventListener("click", () => {
    setMultiplier(3);
});

function setMultiplier(value) {

    multiplier = value;

    singleBtn.classList.remove("active");
    doubleBtn.classList.remove("active");
    tripleBtn.classList.remove("active");

    if (value === 1) {
        singleBtn.classList.add("active");
    }
    else if (value === 2) {
        doubleBtn.classList.add("active");
    }
    else {
        tripleBtn.classList.add("active");
    }
}


// ----------------------
// ボタン生成
// ----------------------

// 1〜20
for (let i = 1; i <= 20; i++) {
    createButton(i, i);
}

// BULL
createButton("BULL", 50, true);

// MISS
createButton("MISS", 0);

function createButton(label, point, isBull = false) {

    const btn = document.createElement("button");

    btn.textContent = label;

    if (isBull) {
        btn.classList.add("bull");
    }

    btn.addEventListener("click", () => {

        let score = point;

        // 1〜20だけ倍率適用
        if (point >= 1 && point <= 20) {
            score = point * multiplier;
        }

        addScore(score);
    });

    buttonsEl.appendChild(btn);
}

// ----------------------
// ゲーム開始
// ----------------------

function startGame(playerCount) {

    players = [];

    for (let i = 0; i < playerCount; i++) {
        players.push({
            score: 0
        });
    }

    currentPlayer = 0;
    round = 1;
    throwNum = 1;

    const playerSelectEl = document.getElementById("playerSelect");
    if (playerSelectEl) {
        playerSelectEl.style.display = "none";
    }

    const gameAreaEl = document.getElementById("gameArea");
    if (gameAreaEl) {
        gameAreaEl.style.display = "block";
    }

    updateDisplay();
    updatePlayerScores();
}

// ページ読み込み時: プレイヤー数が保存されていれば自動で開始、なければ選択画面へ戻す
window.addEventListener("DOMContentLoaded", () => {
    const playerCount = parseInt(localStorage.getItem("playerCount") || "0", 10);

    if (playerCount && playerCount > 0) {
        startGame(playerCount);
    }
    else {
        // 直接 countup.html を開いた場合など、プレイヤー未選択なら選択画面へリダイレクト
        location.href = "player.html";
    }
});

// ----------------------
// スコア加算
// ----------------------

function addScore(point) {

    // ゲーム終了済み
    if (round > 8) {
        showResultOverlay('ゲーム終了！', players.map((p, i) => ({ name: `PLAYER ${i+1}`, score: p.score })));
        return;
    }

    // 現在のプレイヤー
    const player = players[currentPlayer];

    // 加算
    player.score += point;

    // 投数更新
    throwNum++;

    // 3投終了
    if (throwNum > 3) {

        throwNum = 1;

        // 次プレイヤーへ
        currentPlayer++;

        // 全員投げ終わった
        if (currentPlayer >= players.length) {

            currentPlayer = 0;
            round++;
        }
    }

    updateDisplay();

    // ゲーム終了
    if (round > 8) {

        showResultOverlay('ゲーム終了！', players.map((p, i) => ({ name: `PLAYER ${i+1}`, score: p.score })));
    }
}

function showResultOverlay(title, scores) {
    let overlay = document.getElementById('resultOverlay');
    if (!overlay) return alert(title + '\n' + scores.map(s => `${s.name}: ${s.score}`).join('\n'));
    document.getElementById('resultTitle').textContent = title;
    const scoresEl = document.getElementById('resultScores');
    scoresEl.innerHTML = scores.map(s => `<div>${s.name}: ${s.score}</div>`).join('');
    overlay.style.display = 'flex';

    const retryBtn = document.getElementById('resultRetry');
    const homeBtn = document.getElementById('resultHome');
    if (retryBtn) { retryBtn.innerText = 'もう一度'; retryBtn.onclick = () => { location.reload(); } }
    if (homeBtn) { homeBtn.innerText = 'ホーム画面へ'; homeBtn.onclick = () => { location.href = 'home.html'; } }
}

// ----------------------
// 表示更新
// ----------------------

function updateDisplay() {

    const player = players[currentPlayer];

    currentPlayerEl.textContent =
        `PLAYER ${currentPlayer + 1}`;

    scoreEl.textContent = player.score;

    roundEl.textContent =
        Math.min(round, 8);

    throwEl.textContent = throwNum;

    if (turnCurrentEl) turnCurrentEl.textContent = Math.min(round, 8);
    if (turnMaxEl) turnMaxEl.textContent = 8;

    // 上部スコア表示
    playerScoresEl.innerHTML = "";

    players.forEach((p, index) => {

        const div = document.createElement("div");

        div.classList.add("player-card");

        if (index === currentPlayer) {
            div.classList.add("active");
        }

        div.innerHTML = `
            <div class="player-name">
                P${index + 1}
            </div>

            <div class="player-score">
                ${p.score}
            </div>
        `;

        playerScoresEl.appendChild(div);
    });
}