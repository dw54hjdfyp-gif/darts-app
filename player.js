function startGame(playerCount) {

    localStorage.setItem(
        "playerCount",
        playerCount
    );

    // 直前で選択したゲームモードを見て遷移先を決定
    const gameMode = localStorage.getItem("gameMode");

    if (gameMode === "countup") {
        location.href = "countup.html";
    }
    else if (gameMode === "cricket") {
        location.href = "cricket.html";
    }
    else {
        // 301/501/701 などの数値モードは x01.html に遷移
        location.href = "x01.html";
    }
}