const express = require('express');
const app = express();

app.use(express.json());

// ======================
// GLOBAL STATE
// ======================
let gameHistory = [];
let predictionLog = [];
let totalCorrect = 0;
let totalPredictions = 0;

// ======================
// MEMORY BANKS (GỌN LẠI BẢN SERVER)
// ======================
let cauMemoryBank = {
    biet: { Tai: {}, Xiu: {}, stats: { maxTai: 0, maxXiu: 0 } }
};

let diceMemoryBank = {
    x1: {}, x2: {}, x3: {},
    tong: {},
    tripleTransition: {},
    transition: { x1: {}, x2: {}, x3: {} }
};

let patternMemoryBank = {
    patternNext: {}
};

let scoreMemoryBank = {
    afterScore: {}
};

// ======================
// SAVE SESSION
// ======================
function addSessionV2(session, result, totalScore, d1, d2, d3) {
    gameHistory.push({ session, result, totalScore, d1, d2, d3 });

    updateDice(d1, d2, d3, totalScore);
    updateScore(totalScore, result);
    updateCau(result);

    if (gameHistory.length > 20000) {
        gameHistory = gameHistory.slice(-15000);
    }
}

// ======================
// DICE UPDATE
// ======================
function updateDice(d1, d2, d3, total) {
    diceMemoryBank.x1[d1] = (diceMemoryBank.x1[d1] || 0) + 1;
    diceMemoryBank.x2[d2] = (diceMemoryBank.x2[d2] || 0) + 1;
    diceMemoryBank.x3[d3] = (diceMemoryBank.x3[d3] || 0) + 1;

    diceMemoryBank.tong[total] = (diceMemoryBank.tong[total] || 0) + 1;

    let triple = `${d1}${d2}${d3}`;
    diceMemoryBank.tripleTransition[triple] =
        (diceMemoryBank.tripleTransition[triple] || 0) + 1;
}

// ======================
// SCORE UPDATE
// ======================
function updateScore(total, result) {
    let n = gameHistory.length;
    if (n < 2) return;

    let prev = gameHistory[n - 2].totalScore;

    if (!scoreMemoryBank.afterScore[prev]) {
        scoreMemoryBank.afterScore[prev] = {};
    }

    scoreMemoryBank.afterScore[prev][total] =
        (scoreMemoryBank.afterScore[prev][total] || 0) + 1;
}

// ======================
// CAU UPDATE
// ======================
function updateCau(result) {
    let n = gameHistory.length;
    if (n < 3) return;

    let streak = 1;
    for (let i = n - 2; i >= 0; i--) {
        if (gameHistory[i].result === result) streak++;
        else break;
    }

    if (streak >= 3) {
        let bank = cauMemoryBank.biet[result];
        bank[streak] = (bank[streak] || 0) + 1;
    }
}

// ======================
// PREDICT ENGINE (GỌN)
// ======================
function predict() {
    if (gameHistory.length < 5) {
        return {
            prediction: Math.random() > 0.5 ? "Tài" : "Xỉu",
            confidence: 50
        };
    }

    let last = gameHistory[gameHistory.length - 1];
    let score = last.totalScore;

    let after = scoreMemoryBank.afterScore[score];
    let tai = 0, xiu = 0;

    if (after) {
        for (let k in after) {
            if (k >= 11) tai += after[k];
            else xiu += after[k];
        }
    }

    let result = tai > xiu ? "Tài" : "Xỉu";
    let confidence = Math.min(95, 55 + Math.abs(tai - xiu) * 2);

    predictionLog.push({ result });
    if (predictionLog.length > 1000) predictionLog.shift();

    return {
        prediction: result,
        confidence: Math.round(confidence)
    };
}

// ======================
// STATS
// ======================
function stats() {
    return {
        sessions: gameHistory.length,
        predictions: predictionLog.length,
        accuracy:
            totalPredictions > 0
                ? (totalCorrect / totalPredictions) * 100
                : 0,
        memory: {
            dice: Object.keys(diceMemoryBank.x1).length,
            patterns: Object.keys(patternMemoryBank.patternNext).length
        }
    };
}

// ======================
// API ROUTES
// ======================
app.get("/predict", (req, res) => {
    res.json(predict());
});

app.post("/feed", (req, res) => {
    let d = req.body;

    addSessionV2(
        d.session,
        d.result,
        d.totalScore,
        d.d1,
        d.d2,
        d.d3
    );

    res.json({ status: "ok" });
});

app.get("/stats", (req, res) => {
    res.json(stats());
});

// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});

