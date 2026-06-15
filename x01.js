let players = [];
let currentPlayer = 0;
let throwNum = 1;
let multiplier = 1;
let gameTarget = 301;
let gameOver = false;
let turnCount = 1;
let turnStartRemaining = 0;

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
const gameTitleEl = document.getElementById("gameTitle");
const maxRoundsEl = document.getElementById("maxRounds");

singleBtn.addEventListener("click", () => setMultiplier(1));
doubleBtn.addEventListener("click", () => setMultiplier(2));
tripleBtn.addEventListener("click", () => setMultiplier(3));

function setMultiplier(value) {
    multiplier = value;

    singleBtn.classList.remove("active");
    doubleBtn.classList.remove("active");
    tripleBtn.classList.remove("active");

    if (value === 1) singleBtn.classList.add("active");
    else if (value === 2) doubleBtn.classList.add("active");
    else tripleBtn.classList.add("active");
}

// ボタン生成
for (let i = 1; i <= 20; i++) createButton(i, i);
createButton("BULL", 50, true);
createButton("MISS", 0);

function createButton(label, point, isBull = false) {
    const btn = document.createElement("button");
    btn.textContent = label;

    if (isBull) btn.classList.add("bull");

    btn.addEventListener("click", () => {
        let score = point;
        if (point >= 1 && point <= 20) score = point * multiplier;
        addScore(score);
    });

    buttonsEl.appendChild(btn);
}

function startGame(playerCount) {
    players = [];

    for (let i = 0; i < playerCount; i++) {
        players.push({ remaining: gameTarget });
    }

    currentPlayer = 0;
    throwNum = 1;
    gameOver = false;
    turnCount = 1;

    // 現在ターン開始時の残り点を記録
    turnStartRemaining = players[currentPlayer].remaining;

    const playerSelectEl = document.getElementById("playerSelect");
    if (playerSelectEl) playerSelectEl.style.display = "none";

    const gameAreaEl = document.getElementById("gameArea");
    if (gameAreaEl) gameAreaEl.style.display = "block";

    updateDisplay();
    updatePlayerScores();
}

function addScore(point) {
    if (gameOver) return;

    const player = players[currentPlayer];
    const previous = player.remaining;

    // ターン開始時の残り点が未設定なら設定（初投の前に）
    if (throwNum === 1) {
        turnStartRemaining = player.remaining;
    }

    // 当てたら残り点を減らす
    const newRemaining = player.remaining - point;

    // ブラスト（0未満）はバースト
    if (newRemaining < 0) {
        player.remaining = turnStartRemaining;
        // 次プレイヤーへ
        nextTurnAfterBust();
        return;
    }

    player.remaining = newRemaining;

    // 0で勝利
    if (player.remaining === 0) {
        gameOver = true;
        showResultOverlay(`PLAYER ${currentPlayer + 1} の勝利！`, players.map((p, i) => ({ name: `PLAYER ${i+1}`, score: p.remaining })));
        return;
    }

    // 投数更新
    throwNum++;

    if (throwNum > 3) {
        throwNum = 1;
        currentPlayer++;
        if (currentPlayer >= players.length) {
            currentPlayer = 0;
            turnCount++;
        }
        // 次プレイヤーのターン開始時点を記録
        turnStartRemaining = players[currentPlayer].remaining;
    }

    updateDisplay();
}

function nextTurnAfterBust() {
    // バースト時は得点戻して次プレイヤーへ
    throwNum = 1;
    currentPlayer++;
    if (currentPlayer >= players.length) {
        currentPlayer = 0;
        turnCount++;
    }
    // 次プレイヤーのターン開始時点を記録
    turnStartRemaining = players[currentPlayer].remaining;
    updateDisplay();
}

function updateDisplay() {
    const player = players[currentPlayer];

    currentPlayerEl.textContent = `PLAYER ${currentPlayer + 1}`;
    scoreEl.textContent = player ? player.remaining : gameTarget;
    throwEl.textContent = throwNum;
    roundEl.textContent = "-";
    maxRoundsEl.textContent = "-";

    if (turnCurrentEl) turnCurrentEl.textContent = turnCount;
    if (turnMaxEl) turnMaxEl.textContent = '-';

    updatePlayerScores();
}

function updatePlayerScores() {
    playerScoresEl.innerHTML = "";
    players.forEach((p, index) => {
        const div = document.createElement("div");
        div.classList.add("player-card");
        if (index === currentPlayer) div.classList.add("active");
        div.innerHTML = `
            <div class="player-name">P${index + 1}</div>
            <div class="player-score">${p.remaining}</div>
        `;
        playerScoresEl.appendChild(div);
    });
}

// 読み込み時にゲームモード（301/501/701）を取得して自動開始
window.addEventListener("DOMContentLoaded", () => {
    const stored = localStorage.getItem("gameMode");
    const playerCount = parseInt(localStorage.getItem("playerCount") || "0", 10);

    if (stored && !isNaN(parseInt(stored, 10))) {
        gameTarget = parseInt(stored, 10);
    }

    gameTitleEl.textContent = `${gameTarget}`;

    if (playerCount && playerCount > 0) {
        startGame(playerCount);
    }
    else {
        // プレイヤー未選択なら選択画面へ
        location.href = "player.html";
    }
});

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
