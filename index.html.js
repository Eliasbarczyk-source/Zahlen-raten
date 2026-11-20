const ADMIN_PASSWORD = "admin123";
let isAdmin = localStorage.getItem("isAdmin") === "true";
let doubleCoinsEvent = localStorage.getItem("doubleCoinsEvent") === "true";
let playerName = localStorage.getItem("playerName") || "";
let coins = Number(localStorage.getItem("savedCoins")) || 0;
let freeTries = Number(localStorage.getItem("savedFreeTries")) || 0;
let guessMultiplier = Number(localStorage.getItem("savedGuessMult")) || 1;

let bot1 = Number(localStorage.getItem("bot1")) || 0;
let bot2 = Number(localStorage.getItem("bot2")) || 0;
let bot3 = Number(localStorage.getItem("bot3")) || 0;
let bot4 = Number(localStorage.getItem("bot4")) || 0;

let lb10 = JSON.parse(localStorage.getItem("lb10")) || new Array();
let lb100 = JSON.parse(localStorage.getItem("lb100")) || new Array();
let lb1000 = JSON.parse(localStorage.getItem("lb1000")) || new Array();

let maxRange = 1000, baseReward = 50, tries = 0, botTimer = 0;
let numberTG = Math.floor(Math.random() * maxRange) + 1;

window.onload = function () {
    document.getElementById("playerNameInput").value = playerName;
    applyAdminUI(); updateRangeLabels(); updateStatsDisplay();
    updateShopDisplay(); renderBotsView(); renderLeaderboard();
    checkWheelCooldown(); setInterval(checkWheelCooldown, 1000);

    setInterval(function () {
        let income = getIncomePerCycle();
        if (income > 0) {
            botTimer += 0.2;
            let bar = document.getElementById("botProgressFill");
            if (bar) bar.style.width = Math.min((botTimer / 5) * 100, 100) + "%";
            if (botTimer >= 5) { botTimer = 0; coins += income; updateStatsDisplay(); }
        }
    }, 200);
};
function promptAdminLogin() {
    if (isAdmin) { switchView("admin"); return; }
    let pw = prompt("Admin-Passwort eingeben:");
    if (pw === ADMIN_PASSWORD) { isAdmin = true; localStorage.setItem("isAdmin", "true"); applyAdminUI(); switchView("admin"); }
    else if (pw !== null) { alert("Falsches Passwort!"); }
}
function adminLogout() { isAdmin = false; localStorage.setItem("isAdmin", "false"); applyAdminUI(); switchView("guess"); }
function applyAdminUI() {
    document.getElementById("adminBadge").style.display = isAdmin ? "inline-block" : "none";
    document.getElementById("adminNavBtn").style.display = isAdmin ? "inline-block" : "none";
    document.getElementById("eventBanner").style.display = doubleCoinsEvent ? "block" : "none";
    let btn = document.getElementById("toggle2xBtn");
    if (btn) { btn.innerHTML = doubleCoinsEvent ? "🔥 2x Münzen Event: AN" : "🔥 2x Münzen Event: AUS"; btn.className = doubleCoinsEvent ? "btn-red" : "btn-green"; }
}
function toggleDoubleCoinsEvent() {
    doubleCoinsEvent = !doubleCoinsEvent; localStorage.setItem("doubleCoinsEvent", doubleCoinsEvent);
    applyAdminUI(); updateRangeLabels(); updateStatsDisplay(); renderBotsView();
    document.getElementById("adminStatus").innerHTML = doubleCoinsEvent ? "✅ 2x Event AN!" : "⏹️ 2x Event AUS.";
}
function adminGiveCoins(a) { coins += a; updateStatsDisplay(); document.getElementById("adminStatus").innerHTML = "✅ +" + a + " 🪙!"; }
function adminGiveFreeTries(a) { freeTries += a; updateStatsDisplay(); updateShopDisplay(); document.getElementById("adminStatus").innerHTML = "✅ +" + a + " 🛡️!"; }
function adminResetWheel() { localStorage.setItem("lastWheelSpin", 0); checkWheelCooldown(); document.getElementById("adminStatus").innerHTML = "✅ Rad resettet!"; }
function adminResetBots() { bot1 = 0; bot2 = 0; bot3 = 0; bot4 = 0; saveBots(); updateStatsDisplay(); updateShopDisplay(); renderBotsView(); document.getElementById("adminStatus").innerHTML = "✅ Bots auf 0!"; }
function adminClearLeaderboard() { lb10 = new Array(); lb100 = new Array(); lb1000 = new Array(); localStorage.setItem("lb10", "[]"); localStorage.setItem("lb100", "[]"); localStorage.setItem("lb1000", "[]"); renderLeaderboard(); document.getElementById("adminStatus").innerHTML = "✅ Ranglisten leer!"; }
function saveBots() { localStorage.setItem("bot1", bot1); localStorage.setItem("bot2", bot2); localStorage.setItem("bot3", bot3); localStorage.setItem("bot4", bot4); }
function getEventMult() { return doubleCoinsEvent ? 2 : 1; }
function getIncomePerCycle() { return ((bot1 * 1) + (bot2 * 5) + (bot3 * 25) + (bot4 * 120)) * getEventMult(); }
function savePlayerName() { playerName = document.getElementById("playerNameInput").value.trim(); localStorage.setItem("playerName", playerName); }

function updateStatsDisplay() {
    document.getElementById("displayCoins").innerHTML = "🪙 " + coins;
    document.getElementById("displayFreeTries").innerHTML = "🛡️ Gratis: " + freeTries + " | ⚡ Multi: " + guessMultiplier + "x";
    document.getElementById("displayIncome").innerHTML = "🤖 +" + getIncomePerCycle() + " 🪙 / 5s";
    localStorage.setItem("savedCoins", coins); localStorage.setItem("savedFreeTries", freeTries); localStorage.setItem("savedGuessMult", guessMultiplier);
}

function switchView(view) {
    document.getElementById("guessGame").style.display = view === "guess" ? "block" : "none";
    document.getElementById("botsGame").style.display = view === "bots" ? "block" : "none";
    document.getElementById("shopGame").style.display = view === "shop" ? "block" : "none";
    document.getElementById("casinoGame").style.display = view === "casino" ? "block" : "none";
    document.getElementById("adminGame").style.display = view === "admin" ? "block" : "none";
    if (view === "shop") updateShopDisplay();
    if (view === "bots") renderBotsView();
}

function renderBotsView() {
    document.getElementById("botTotalSummary").innerHTML = getIncomePerCycle() + " 🪙";
    let c = document.getElementById("ownedBotsList"); c.innerHTML = "";
    let m = getEventMult();
    if (bot1 > 0) c.innerHTML += '<div class="bot-showcase"><h3>🤖 Mini-Bot (x' + bot1 + ')</h3><p style="color:#00e676;">+' + (bot1 * 1 * m) + ' 🪙 / 5s</p></div>';
    if (bot2 > 0) c.innerHTML += '<div class="bot-showcase"><h3>🦾 Turbo-Bot (x' + bot2 + ')</h3><p style="color:#00e676;">+' + (bot2 * 5 * m) + ' 🪙 / 5s</p></div>';
    if (bot3 > 0) c.innerHTML += '<div class="bot-showcase"><h3>🚀 Mega-Fabrik (x' + bot3 + ')</h3><p style="color:#00e676;">+' + (bot3 * 25 * m) + ' 🪙 / 5s</p></div>';
    if (bot4 > 0) c.innerHTML += '<div class="bot-showcase"><h3>🛸 Quanten-Reaktor (x' + bot4 + ')</h3><p style="color:#00e676;">+' + (bot4 * 120 * m) + ' 🪙 / 5s</p></div>';
    if (bot1 === 0 && bot2 === 0 && bot3 === 0 && bot4 === 0) c.innerHTML = '<div class="panel-box"><p>Noch keine Bots gekauft.</p></div>';
}
function getBotPrice(t) {
    if (t === 1) return Math.round(150 * Math.pow(1.35, bot1));
    if (t === 2) return Math.round(750 * Math.pow(1.35, bot2));
    if (t === 3) return Math.round(3500 * Math.pow(1.35, bot3));
    if (t === 4) return Math.round(15000 * Math.pow(1.35, bot4));
}
function getMultPrice() { return Math.round(250 * Math.pow(2, guessMultiplier - 1)); }

function updateShopDisplay() {
    document.getElementById("bot1Count").innerHTML = bot1; document.getElementById("bot2Count").innerHTML = bot2;
    document.getElementById("bot3Count").innerHTML = bot3; document.getElementById("bot4Count").innerHTML = bot4;
    document.getElementById("bot1Price").innerHTML = getBotPrice(1); document.getElementById("bot2Price").innerHTML = getBotPrice(2);
    document.getElementById("bot3Price").innerHTML = getBotPrice(3); document.getElementById("bot4Price").innerHTML = getBotPrice(4);
    document.getElementById("shopFreeCount").innerHTML = freeTries; document.getElementById("shopMultCount").innerHTML = guessMultiplier + "x";
    document.getElementById("multPrice").innerHTML = getMultPrice();
}

function buyFreeTry() {
    if (coins < 50) { document.getElementById("shopStatus").innerHTML = "❌ Zu wenig Münzen!"; return; }
    coins -= 50; freeTries++; updateStatsDisplay(); updateShopDisplay(); document.getElementById("shopStatus").innerHTML = "✅ +1 Gratis-Versuch!";
}
function buyMultiplier() {
    let p = getMultPrice(); if (coins < p) { document.getElementById("shopStatus").innerHTML = "❌ Zu wenig Münzen!"; return; }
    coins -= p; guessMultiplier++; updateStatsDisplay(); updateShopDisplay(); updateRangeLabels(); document.getElementById("shopStatus").innerHTML = "✅ Multiplikator erhöht!";
}
function buyWheelReset() {
    if (coins < 120) { document.getElementById("shopStatus").innerHTML = "❌ Zu wenig Münzen!"; return; }
    coins -= 120; localStorage.setItem("lastWheelSpin", 0); updateStatsDisplay(); checkWheelCooldown(); document.getElementById("shopStatus").innerHTML = "✅ Glücksrad bereit!";
}
function buyHint() {
    if (coins < 40) { document.getElementById("shopStatus").innerHTML = "❌ Zu wenig Münzen!"; return; }
    coins -= 40; updateStatsDisplay(); document.getElementById("shopStatus").innerHTML = "🔮 Zahl ist " + (numberTG % 2 === 0 ? "GERADE" : "UNGERADE") + "!";
}
function buyBot(t) {
    let p = getBotPrice(t); if (coins < p) { document.getElementById("shopStatus").innerHTML = "❌ Zu wenig Münzen!"; return; }
    coins -= p; if (t === 1) bot1++; if (t === 2) bot2++; if (t === 3) bot3++; if (t === 4) bot4++;
    saveBots(); updateStatsDisplay(); updateShopDisplay(); renderBotsView(); document.getElementById("shopStatus").innerHTML = "✅ Bot gekauft!";
}
function updateRangeLabels() {
    let m = guessMultiplier * getEventMult();
    document.getElementById("btn10").innerHTML = "1 – 10 (+" + (2 * m) + " 🪙)";
    document.getElementById("btn100").innerHTML = "1 – 100 (+" + (10 * m) + " 🪙)";
    document.getElementById("btn1000").innerHTML = "1 – 1000 (+" + (50 * m) + " 🪙)";
    document.getElementById("do").innerHTML = "Rate eine Zahl von 1 bis " + maxRange + " (+" + (baseReward * m) + " 🪙)";
}
function setRange(newMax, newBase) {
    maxRange = newMax; baseReward = newBase; numberTG = Math.floor(Math.random() * maxRange) + 1; tries = 0;
    document.getElementById("displayTries").innerHTML = "Versuche: 0"; updateRangeLabels();
    document.getElementById("btn10").classList.remove("active"); document.getElementById("btn100").classList.remove("active"); document.getElementById("btn1000").classList.remove("active");
    document.getElementById("btn" + newMax).classList.add("active"); renderLeaderboard();
}
function guessnumber() {
    let myInput = document.getElementById("my"); if (myInput.value === "") return;
    let usedFree = false;
    if (freeTries > 0) { freeTries--; usedFree = true; updateStatsDisplay(); } else { tries++; }
    document.getElementById("displayTries").innerHTML = "Versuche: " + tries + (usedFree ? " (🛡️ Gratis)" : "");

    if (numberTG == Number(myInput.value)) {
        let score = tries === 0 ? 1 : tries;
        let name = (isAdmin ? "👑 " : "") + (playerName !== "" ? playerName : "Gast");
        let list = maxRange === 10 ? lb10 : (maxRange === 100 ? lb100 : lb1000);
        list.push({ name: name, tries: score }); list.sort(function (a, b) { return a.tries - b.tries; });
        if (list.length > 3) list.length = 3;
        localStorage.setItem("lb" + maxRange, JSON.stringify(list)); renderLeaderboard();

        let win = baseReward * guessMultiplier * getEventMult(); coins += win; updateStatsDisplay();
        document.getElementById("do").innerHTML = "GEWONNEN in " + score + " Versuchen! +" + win + " 🪙";
        numberTG = Math.floor(Math.random() * maxRange) + 1; tries = 0; document.getElementById("displayTries").innerHTML = "Versuche: 0";
    } else if (numberTG > Number(myInput.value)) document.getElementById("do").innerHTML = "Größer";
    else document.getElementById("do").innerHTML = "Kleiner";
    myInput.value = "";
}
function renderLeaderboard() {
    document.getElementById("lbRangeTitle").innerHTML = maxRange;
    let tbody = document.getElementById("leaderboardBody"); tbody.innerHTML = "";
    let list = maxRange === 10 ? lb10 : (maxRange === 100 ? lb100 : lb1000);
    if (list.length === 0) { tbody.innerHTML = '<tr><td colspan="3" style="color:#888;">Noch keine Top-3 Einträge.</td></tr>'; return; }
    list.forEach(function (e, i) { tbody.innerHTML += '<tr><td>' + (i === 0 ? "🥇 1." : i === 1 ? "🥈 2." : "🥉 3.") + '</td><td>' + e.name + '</td><td><strong>' + e.tries + '</strong></td></tr>'; });
}
let currentRotation = 0;
function checkWheelCooldown() {
    let diff = Date.now() - (Number(localStorage.getItem("lastWheelSpin")) || 0);
    let btn = document.getElementById("spinBtn"), status = document.getElementById("wheelStatus");
    if (diff < 3600000) {
        let rem = 3600000 - diff; btn.disabled = true;
        status.innerHTML = "Nächster Dreh in " + Math.floor(rem / 60000) + "m " + Math.floor((rem % 60000) / 1000) + "s";
    } else { btn.disabled = false; if (status.innerHTML.startsWith("Nächster Dreh")) status.innerHTML = "Bereit zum Drehen!"; }
}
function spinWheel() {
    if (Date.now() - (Number(localStorage.getItem("lastWheelSpin")) || 0) < 3600000) return;
    localStorage.setItem("lastWheelSpin", Date.now()); document.getElementById("spinBtn").disabled = true;
    let idx = Math.floor(Math.random() * 6);
    currentRotation += 2160 + ((360 - (idx * 60 + 30) - (currentRotation % 360) + 360) % 360);
    document.getElementById("wheel").style.transform = "rotate(" + currentRotation + "deg)";
    document.getElementById("wheelStatus").innerHTML = "Das Rad dreht sich...";
    setTimeout(function () {
        let m = getEventMult();
        if (idx === 0) { coins += 25 * m; document.getElementById("wheelStatus").innerHTML = "Gewonnen: +" + (25 * m) + " 🪙!"; }
        if (idx === 1) { freeTries += 1; document.getElementById("wheelStatus").innerHTML = "Gewonnen: +1 🛡️!"; }
        if (idx === 2) { coins += 50 * m; document.getElementById("wheelStatus").innerHTML = "Gewonnen: +" + (50 * m) + " 🪙!"; }
        if (idx === 3) { freeTries += 2; document.getElementById("wheelStatus").innerHTML = "Gewonnen: +2 🛡️!"; }
        if (idx === 4) { coins += 100 * m; document.getElementById("wheelStatus").innerHTML = "Gewonnen: +" + (100 * m) + " 🪙!"; }
        if (idx === 5) { freeTries += 1; document.getElementById("wheelStatus").innerHTML = "Gewonnen: +1 🛡️!"; }
        updateStatsDisplay();
    }, 3500);
}
function selectCasinoGame(g) {
    document.getElementById("gameBj").style.display = g === "bj" ? "block" : "none";
    document.getElementById("gameAon").style.display = g === "aon" ? "block" : "none";
    document.getElementById("gameRoul").style.display = g === "roul" ? "block" : "none";
    document.getElementById("gameSlot").style.display = g === "slot" ? "block" : "none";
    document.getElementById("gameMines").style.display = g === "mines" ? "block" : "none";
    document.getElementById("gameHorse").style.display = g === "horse" ? "block" : "none";
    document.getElementById("tabBj").classList.toggle("active", g === "bj");
    document.getElementById("tabAon").classList.toggle("active", g === "aon");
    document.getElementById("tabRoul").classList.toggle("active", g === "roul");
    document.getElementById("tabSlot").classList.toggle("active", g === "slot");
    document.getElementById("tabMines").classList.toggle("active", g === "mines");
    document.getElementById("tabHorse").classList.toggle("active", g === "horse");
}
function setAllIn(id) { document.getElementById(id).value = coins; }
let playerHand = new Array(), dealerHand = new Array(), currentBjBet = 0;
function createCard() {
    const suits = new Array("♠️", "♣️", "♥️", "♦️"), names = new Array("2", "3", "4", "5", "6", "7", "8", "9", "10", "B", "D", "K", "A"), pts = new Array(2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11);
    let s = suits.at(Math.floor(Math.random() * 4)), v = Math.floor(Math.random() * 13);
    return { label: s + " " + names.at(v), pts: pts.at(v), isRed: (s === "♥️" || s === "♦️") };
}
function calculateScore(hand) {
    let sc = 0, ac = 0; hand.forEach(function (c) { sc += c.pts; if (c.pts === 11) ac++; });
    while (sc > 21 && ac > 0) { sc -= 10; ac--; } return sc;
}
function renderCards(hide) {
    let dDiv = document.getElementById("dealerCards"), pDiv = document.getElementById("playerCards"); dDiv.innerHTML = ""; pDiv.innerHTML = "";
    dealerHand.forEach(function (c, i) { dDiv.innerHTML += (hide && i === 1) ? '<div class="card">🂠 ?</div>' : '<div class="card ' + (c.isRed ? 'red' : '') + '">' + c.label + '</div>'; });
    playerHand.forEach(function (c) { pDiv.innerHTML += '<div class="card ' + (c.isRed ? 'red' : '') + '">' + c.label + '</div>'; });
    document.getElementById("playerScoreText").innerHTML = calculateScore(playerHand);
    document.getElementById("dealerScoreText").innerHTML = hide ? dealerHand.at(0).pts + " + ?" : calculateScore(dealerHand);
}
function startBlackjack() {
    let bet = Number(document.getElementById("bjBet").value); if (bet <= 0 || isNaN(bet) || coins < bet) { document.getElementById("bjStatus").innerHTML = "Ungültiger Einsatz!"; return; }
    currentBjBet = bet; coins -= bet; updateStatsDisplay(); playerHand = new Array(createCard(), createCard()); dealerHand = new Array(createCard(), createCard()); renderCards(true);
    document.getElementById("bjStartBtn").disabled = true; document.getElementById("hitBtn").disabled = false; document.getElementById("standBtn").disabled = false;
    if (calculateScore(playerHand) === 21) { let w = Math.round(bet * 2.5) * getEventMult(); coins += w; updateStatsDisplay(); renderCards(false); document.getElementById("bjStatus").innerHTML = "🔥 BLACKJACK! +" + w + " 🪙!"; endBlackjack(); }
    else document.getElementById("bjStatus").innerHTML = "Karte ziehen oder Halten?";
}
function hitCard() { playerHand.push(createCard()); renderCards(true); if (calculateScore(playerHand) > 21) { renderCards(false); document.getElementById("bjStatus").innerHTML = "💥 Überkauft!"; endBlackjack(); } }
function standCard() {
    while (calculateScore(dealerHand) < 17) dealerHand.push(createCard()); renderCards(false);
    let p = calculateScore(playerHand), d = calculateScore(dealerHand);
    if (d > 21 || p > d) { let w = currentBjBet * 2 * getEventMult(); coins += w; updateStatsDisplay(); document.getElementById("bjStatus").innerHTML = "🎉 Gewonnen! +" + w + " 🪙!"; }
    else if (p === d) { coins += currentBjBet; updateStatsDisplay(); document.getElementById("bjStatus").innerHTML = "🤝 Unentschieden!"; }
    else document.getElementById("bjStatus").innerHTML = "❌ Dealer gewinnt!"; endBlackjack();
}
function endBlackjack() { document.getElementById("bjStartBtn").disabled = false; document.getElementById("hitBtn").disabled = true; document.getElementById("standBtn").disabled = true; }

let aonPot = 0, aonStep = 0;
function startAon() {
    let bet = Number(document.getElementById("aonBet").value); if (bet <= 0 || isNaN(bet) || coins < bet) { document.getElementById("aonStatus").innerHTML = "Ungültiger Einsatz!"; return; }
    coins -= bet; updateStatsDisplay(); aonPot = bet; aonStep = 1; updateAonDisplay(); document.getElementById("aonStatus").innerHTML = "Drücke auf Verdoppeln!";
    document.getElementById("aonDoubleBtn").disabled = false; document.getElementById("aonCashoutBtn").disabled = false; document.getElementById("aonBet").disabled = true;
}
function doubleAon() {
    if (Math.random() < 0.5) { aonPot *= 2; aonStep *= 2; updateAonDisplay(); document.getElementById("aonStatus").innerHTML = "🔥 VERDOPPELT!"; }
    else { aonPot = 0; aonStep = 0; updateAonDisplay(); document.getElementById("aonStatus").innerHTML = "💀 EINGEZOGEN!"; resetAonControls(); }
}
function cashoutAon() { if (aonPot > 0) { let w = aonPot * getEventMult(); coins += w; updateStatsDisplay(); document.getElementById("aonStatus").innerHTML = "💰 +" + w + " 🪙!"; aonPot = 0; aonStep = 0; updateAonDisplay(); resetAonControls(); } }
function updateAonDisplay() { document.getElementById("aonPotText").innerHTML = aonPot + " 🪙"; document.getElementById("aonMultiplier").innerHTML = aonStep + "x"; }
function resetAonControls() { document.getElementById("aonDoubleBtn").disabled = true; document.getElementById("aonCashoutBtn").disabled = true; document.getElementById("aonBet").disabled = false; }
let roulSpinning = false;
function playRoulette(choice) {
    if (roulSpinning) return; let bet = Number(document.getElementById("roulBet").value); if (bet <= 0 || isNaN(bet) || coins < bet) { document.getElementById("roulStatus").innerHTML = "Ungültiger Einsatz!"; return; }
    coins -= bet; updateStatsDisplay(); roulSpinning = true; let disp = document.getElementById("roulDisplay"), t = 0; document.getElementById("roulStatus").innerHTML = "Kugel rollt...";
    let anim = setInterval(function () {
        let num = Math.floor(Math.random() * 37); disp.innerHTML = num; disp.style.background = num === 0 ? "#00c853" : (num % 2 === 0 ? "#111" : "#e53935");
        if (++t > 15) {
            clearInterval(anim); let col = num === 0 ? "Grün" : (num % 2 === 0 ? "Schwarz" : "Rot");
            if (choice === col) { let w = bet * (col === "Grün" ? 14 : 2) * getEventMult(); coins += w; updateStatsDisplay(); document.getElementById("roulStatus").innerHTML = "🎉 " + num + " (" + col + ")! +" + w + " 🪙!"; }
            else document.getElementById("roulStatus").innerHTML = "❌ " + num + " (" + col + ")! Verloren."; roulSpinning = false;
        }
    }, 80);
}

let slotSpinning = false;
function spinSlots() {
    if (slotSpinning) return; let bet = Number(document.getElementById("slotBet").value); if (bet <= 0 || isNaN(bet) || coins < bet) { document.getElementById("slotStatus").innerHTML = "Ungültiger Einsatz!"; return; }
    coins -= bet; updateStatsDisplay(); slotSpinning = true; const syms = new Array("🍒", "🍋", "🔔", "🍀", "💎"); let t = 0;
    let anim = setInterval(function () {
        let s1 = syms.at(Math.floor(Math.random() * 5)), s2 = syms.at(Math.floor(Math.random() * 5)), s3 = syms.at(Math.floor(Math.random() * 5));
        document.getElementById("reel1").innerHTML = s1; document.getElementById("reel2").innerHTML = s2; document.getElementById("reel3").innerHTML = s3;
        if (++t > 14) {
            clearInterval(anim);
            if (s1 === s2 && s2 === s3) { let w = bet * (s1 === "💎" ? 25 : 10) * getEventMult(); coins += w; updateStatsDisplay(); document.getElementById("slotStatus").innerHTML = "🔥 JACKPOT! +" + w + " 🪙!"; }
            else if (s1 === s2 || s2 === s3 || s1 === s3) { let w = bet * 2 * getEventMult(); coins += w; updateStatsDisplay(); document.getElementById("slotStatus").innerHTML = "✨ 2 Gleiche! +" + w + " 🪙!"; }
            else document.getElementById("slotStatus").innerHTML = "Kein Treffer!"; slotSpinning = false;
        }
    }, 80);
}

let minesActive = false, minesBet = 0, minesBombs = new Array(), minesSafe = 0;
function startMines() {
    let bet = Number(document.getElementById("minesBet").value); if (bet <= 0 || isNaN(bet) || coins < bet) { document.getElementById("minesStatus").innerHTML = "Ungültiger Einsatz!"; return; }
    coins -= bet; updateStatsDisplay(); minesBet = bet; minesActive = true; minesSafe = 0; minesBombs = new Array();
    while (minesBombs.length < 4) { let r = Math.floor(Math.random() * 16); if (!minesBombs.includes(r)) minesBombs.push(r); }
    document.getElementById("minesStartBtn").disabled = true; document.getElementById("minesCashoutBtn").disabled = true; document.getElementById("minesWinPreview").innerHTML = 0; document.getElementById("minesStatus").innerHTML = "Klicke auf die Felder!";
    let grid = document.getElementById("minesGrid"); grid.innerHTML = "";
    for (let i = 0; i < 16; i++) grid.innerHTML += '<div id="tile' + i + '" class="mine-tile" onclick="clickMineTile(' + i + ')">❓</div>';
}
function clickMineTile(idx) {
    if (!minesActive) return; let tile = document.getElementById("tile" + idx); if (tile.classList.contains("safe")) return;
    if (minesBombs.includes(idx)) { tile.classList.add("bomb"); tile.innerHTML = "💣"; minesActive = false; document.getElementById("minesStatus").innerHTML = "💥 BOMBE!"; document.getElementById("minesStartBtn").disabled = false; document.getElementById("minesCashoutBtn").disabled = true; }
    else { tile.classList.add("safe"); tile.innerHTML = "💎"; minesSafe++; let w = Math.round(minesBet * (1 + minesSafe * 0.5)) * getEventMult(); document.getElementById("minesWinPreview").innerHTML = w; document.getElementById("minesCashoutBtn").disabled = false; document.getElementById("minesStatus").innerHTML = "💎 Gewinn: " + w + " 🪙"; }
}
function cashoutMines() {
    if (!minesActive || minesSafe === 0) return; let w = Math.round(minesBet * (1 + minesSafe * 0.5)) * getEventMult(); coins += w; updateStatsDisplay(); minesActive = false;
    document.getElementById("minesStatus").innerHTML = "💰 +" + w + " 🪙!"; document.getElementById("minesStartBtn").disabled = false; document.getElementById("minesCashoutBtn").disabled = true;
}

let raceRunning = false;
function startHorseRace(chosen) {
    if (raceRunning) return; let bet = Number(document.getElementById("horseBet").value); if (bet <= 0 || isNaN(bet) || coins < bet) { document.getElementById("horseStatus").innerHTML = "Ungültiger Einsatz!"; return; }
    coins -= bet; updateStatsDisplay(); raceRunning = true; let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    for (let i = 1; i <= 4; i++) document.getElementById("horse" + i).style.left = "0%";
    document.getElementById("horseStatus").innerHTML = "🏁 Rennen läuft...";
    let anim = setInterval(function () {
        p1 += Math.random() * 5.5; p2 += Math.random() * 5.5; p3 += Math.random() * 5.5; p4 += Math.random() * 5.5;
        document.getElementById("horse1").style.left = Math.min(p1, 90) + "%"; document.getElementById("horse2").style.left = Math.min(p2, 90) + "%";
        document.getElementById("horse3").style.left = Math.min(p3, 90) + "%"; document.getElementById("horse4").style.left = Math.min(p4, 90) + "%";
        let winH = p1 >= 90 ? 1 : (p2 >= 90 ? 2 : (p3 >= 90 ? 3 : (p4 >= 90 ? 4 : 0)));
        if (winH > 0) {
            clearInterval(anim); raceRunning = false;
            if (winH === chosen) { let w = bet * 4 * getEventMult(); coins += w; updateStatsDisplay(); document.getElementById("horseStatus").innerHTML = "🏆 Pferd " + winH + " gewinnt! +" + w + " 🪙!"; }
            else document.getElementById("horseStatus").innerHTML = "❌ Pferd " + winH + " gewinnt. Verloren!";
        }
    }, 100);
}
