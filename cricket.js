const numbers = [20,19,18,17,16,15,'BULL'];
const numberValues = { '20':20,'19':19,'18':18,'17':17,'16':16,'15':15,'BULL':25 };

// プレイヤーカラー: P1=赤, P2=青, P3=黄, P4=緑
const playerColors = ['#e53935', '#1e88e5', '#fdd835', '#43a047'];

let players = [];
let currentPlayer = 0;
let multiplier = 1;
let gameOver = false;
let throwNum = 1;
let turnCount = 1; // full rounds of all players

// DOM 要素（読み込み時初期化）
let singleBtn, doubleBtn, tripleBtn, buttonsEl, currentPlayerEl, playerScoresEl, scoreEl, leftMarksEl, rightMarksEl, turnCurrentEl, turnMaxEl;

function setMultiplier(v) {
    multiplier = v;
    if (singleBtn) singleBtn.classList.remove('active');
    if (doubleBtn) doubleBtn.classList.remove('active');
    if (tripleBtn) tripleBtn.classList.remove('active');
    if (v === 1 && singleBtn) singleBtn.classList.add('active');
    else if (v === 2 && doubleBtn) doubleBtn.classList.add('active');
    else if (v === 3 && tripleBtn) tripleBtn.classList.add('active');
}

function startGame(playerCount) {
    players = [];
    for (let i = 0; i < playerCount && i < 4; i++) {
        const marks = {};
        numbers.forEach(n => marks[n] = 0);
        players.push({ marks: marks, score: 0 });
    }

    currentPlayer = 0;
    multiplier = 1;
    gameOver = false;
    throwNum = 1;
    turnCount = 1;

    const playerSelectEl = document.getElementById('playerSelect');
    if (playerSelectEl) playerSelectEl.style.display = 'none';
    const gameAreaEl = document.getElementById('gameArea');
    if (gameAreaEl) gameAreaEl.style.display = 'block';

    updateDisplay();
}

function hitNumber(n) {
    if (gameOver) return;
    const player = players[currentPlayer];
    if (!player) return;

    // 他プレイヤーの誰かが未クローズかどうか
    const opponentsNotClosed = players.some((p, idx) => idx !== currentPlayer && p.marks[n] < 3);

    // recipients: players (other than current) who have marks < 3 on this number
    const recipients = players.map((p, idx) => ({ idx, marks: p.marks[n], score: p.score }))
        .filter(r => r.idx !== currentPlayer && r.marks < 3);

    if (player.marks[n] < 3) {
        const toAdd = Math.min(3 - player.marks[n], multiplier);
        const overflow = multiplier - toAdd;
        player.marks[n] += toAdd;
        if (overflow > 0) {
            // 3人以上の場合、4hit目以降は自分ではなく未クローズの全プレイヤーへ渡す
            if (players.length >= 3 && recipients.length > 0) {
                recipients.forEach(r => {
                    players[r.idx].score += overflow * numberValues[n];
                });
            } else {
                // 通常は自分へ加算（相手が未クローズでない、または1-2人のゲーム）
                player.score += overflow * numberValues[n];
            }
        }
    } else {
        // 既にクローズしている場合の追加得点処理
        if (players.length >= 3 && recipients.length > 0) {
            // 3人以上なら未クローズの全プレイヤーへ点数付与
            recipients.forEach(r => {
                players[r.idx].score += multiplier * numberValues[n];
            });
        } else {
            // それ以外は自分へ加算（2人ルールと従来の動作）
            if (opponentsNotClosed) {
                player.score += multiplier * numberValues[n];
            }
        }
    }

    updateDisplay();
    checkWin();
    if (gameOver) return;

    // 投数更新
    throwNum++;
    if (throwNum > 3) {
        throwNum = 1;
        nextPlayer();
    }
}

function checkWin() {
    // 終了条件: 全てクローズしたプレイヤーの中で、スコアが全体最低の場合に終了
    const minScore = Math.min(...players.map(p => p.score));
    const winningClosedIdx = players.findIndex(p => numbers.every(n => p.marks[n] >= 3) && p.score === minScore);
    if (winningClosedIdx !== -1) {
        gameOver = true;
        showResultOverlay(`PLAYER ${winningClosedIdx+1} WIN!`, players.map((pl, idx) => ({ name: `P${idx+1}`, score: pl.score })));
        return;
    }
}

function nextPlayer() {
    if (gameOver) return;
    const previousPlayer = currentPlayer;
    currentPlayer = (currentPlayer + 1) % players.length;
    throwNum = 1;
    // 1ターンは全プレイヤーが3投ずつ投げ終わったとき
    if (currentPlayer === 0 && previousPlayer === players.length - 1) {
        turnCount++;
        // 20ターン終了時は最小スコアのプレイヤーが勝ち
        if (turnCount >= 20) {
            const minScore = Math.min(...players.map(p => p.score));
            const winnerIdx = players.findIndex(p => p.score === minScore);
            gameOver = true;
            showResultOverlay(`PLAYER ${winnerIdx+1} WIN!`, players.map((pl, idx) => ({ name: `P${idx+1}`, score: pl.score })));
            return;
        }
    }
    updateDisplay();
}

function updateDisplay() {
    if (currentPlayerEl) currentPlayerEl.textContent = `PLAYER ${currentPlayer+1}`;

    if (scoreEl) scoreEl.style.display = 'block';
    if (scoreEl) scoreEl.textContent = players[currentPlayer] ? players[currentPlayer].score : '0';
    if (turnCurrentEl) turnCurrentEl.textContent = turnCount;
    if (turnMaxEl) turnMaxEl.textContent = 20;

    // プレイヤーカード（スコアのみ表示）
    if (playerScoresEl) {
        playerScoresEl.innerHTML = '';
        players.forEach((p, idx) => {
            const div = document.createElement('div');
            div.classList.add('player-card');
            if (idx === currentPlayer) div.classList.add('active');

            div.innerHTML = `
                <div class="player-name">P${idx+1}</div>
                <div class="player-score">${p.score}</div>
            `;

            playerScoresEl.appendChild(div);
        });
    }

    // ボードのマーク列を更新（左右に分割して中央の番号列を挟む）
    const leftMarks = document.getElementById('leftMarks');
    const rightMarks = document.getElementById('rightMarks');
    if (leftMarks) leftMarks.innerHTML = '';
    if (rightMarks) rightMarks.innerHTML = '';

    const leftCount = Math.ceil(players.length / 2);

    for (let i = 0; i < players.length && i < 4; i++) {
        const col = document.createElement('div');
        col.classList.add('mark-column');
        const header = document.createElement('div');
        header.style.textAlign = 'center';
        header.style.fontWeight = 'bold';
        header.style.color = playerColors[i] || '#fff';
        header.textContent = `P${i+1}`;
        col.appendChild(header);

        numbers.forEach(n => {
            const row = document.createElement('div');
            row.classList.add('mark-row');
            const m = players[i].marks[n];
            let markSymbol = '&nbsp;';
            let markColor = '#ccc';
            if (m === 1) { markSymbol = '/'; markColor = playerColors[i] || '#ccc'; }
            else if (m === 2) { markSymbol = '×'; markColor = playerColors[i] || '#ccc'; }
            else if (m >= 3) { markSymbol = '⚪︎'; markColor = '#fff'; }
            row.innerHTML = `<div style="text-align:center; color:${markColor};">${markSymbol}</div>`;
            col.appendChild(row);
        });

        if (i < leftCount) {
            if (leftMarks) leftMarks.appendChild(col);
        } else {
            if (rightMarks) rightMarks.appendChild(col);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    singleBtn = document.getElementById('singleBtn');
    doubleBtn = document.getElementById('doubleBtn');
    tripleBtn = document.getElementById('tripleBtn');
    buttonsEl = document.getElementById('buttons');
    currentPlayerEl = document.getElementById('currentPlayer');
    playerScoresEl = document.getElementById('playerScores');
    scoreEl = document.getElementById('score');
    turnCurrentEl = document.getElementById('turnCurrent');
    turnMaxEl = document.getElementById('turnMax');
    leftMarksEl = document.getElementById('leftMarks');
    rightMarksEl = document.getElementById('rightMarks');

    if (singleBtn) singleBtn.addEventListener('click', () => setMultiplier(1));
    if (doubleBtn) doubleBtn.addEventListener('click', () => setMultiplier(2));
    if (tripleBtn) tripleBtn.addEventListener('click', () => setMultiplier(3));

    if (buttonsEl) {
        numbers.forEach(n => {
            const btn = document.createElement('button');
            btn.textContent = n;
            if (n === 'BULL') btn.classList.add('bull');
            btn.addEventListener('click', () => hitNumber(n));
            buttonsEl.appendChild(btn);
        });
    }

    const playerCount = parseInt(localStorage.getItem('playerCount') || '0', 10);
    if (playerCount && playerCount > 0) startGame(playerCount);
    else location.href = 'player.html';
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
