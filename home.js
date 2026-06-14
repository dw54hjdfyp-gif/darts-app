function selectGame(game) {

    // 選んだゲームを保存
    localStorage.setItem("gameMode", game);

    // プレイヤー選択へ移動
    location.href = "player.html";
}