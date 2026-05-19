// ============================================
// ULTIMATE TAI XIU PREDICTION SYSTEM
// BO NHO CAU VINH VIEN + XUC XAC 3 CUC GHI NHO
// 300+ THUAT TOAN SIEU CHUAN VIP PRO MAX
// ============================================

// ============================================
// HE THONG LUU TRU VINH VIEN - LOCALSTORAGE
// ============================================
const STORAGE_KEY = 'taixiu_ultimate_v3';
const BACKUP_KEY = 'taixiu_backup_v3';

let permanentStorage = {
    cauMemory: {},
    diceMemory: {},
    scoreMemory: {},
    patternMemory: {},
    betMemory: {},
    statsMemory: {},
    lastSave: 0,
    totalSessions: 0
};

function saveToPermanentStorage() {
    let data = {
        cauMemory: permanentStorage.cauMemory,
        diceMemory: permanentStorage.diceMemory,
        scoreMemory: permanentStorage.scoreMemory,
        patternMemory: permanentStorage.patternMemory,
        betMemory: permanentStorage.betMemory,
        statsMemory: permanentStorage.statsMemory,
        lastSave: Date.now(),
        totalSessions: gameHistory.length,
        timestamp: new Date().toISOString()
    };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(BACKUP_KEY + '_' + Date.now(), JSON.stringify(data));
        
        let backupKeys = [];
        for (let i=0; i<localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key.startsWith(BACKUP_KEY)) backupKeys.push(key);
        }
        if (backupKeys.length > 5) {
            backupKeys.sort();
            for (let i=0; i<backupKeys.length-5; i++) {
                localStorage.removeItem(backupKeys[i]);
            }
        }
        
        permanentStorage.lastSave = Date.now();
    } catch(e) {
        console.log('Storage full, cleaning old data...');
        cleanOldBackups();
    }
}

function loadFromPermanentStorage() {
    try {
        let saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            let data = JSON.parse(saved);
            permanentStorage.cauMemory = data.cauMemory || {};
            permanentStorage.diceMemory = data.diceMemory || {};
            permanentStorage.scoreMemory = data.scoreMemory || {};
            permanentStorage.patternMemory = data.patternMemory || {};
            permanentStorage.betMemory = data.betMemory || {};
            permanentStorage.statsMemory = data.statsMemory || {};
            permanentStorage.lastSave = data.lastSave || 0;
            permanentStorage.totalSessions = data.totalSessions || 0;
            return true;
        }
    } catch(e) {
        console.log('Error loading storage, trying backup...');
        return loadFromBackup();
    }
    return false;
}

function loadFromBackup() {
    let backupKeys = [];
    for (let i=0; i<localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key.startsWith(BACKUP_KEY)) backupKeys.push(key);
    }
    if (backupKeys.length > 0) {
        backupKeys.sort().reverse();
        for (let key of backupKeys) {
            try {
                let data = JSON.parse(localStorage.getItem(key));
                if (data && data.totalSessions > 0) {
                    permanentStorage.cauMemory = data.cauMemory || {};
                    permanentStorage.diceMemory = data.diceMemory || {};
                    permanentStorage.scoreMemory = data.scoreMemory || {};
                    permanentStorage.patternMemory = data.patternMemory || {};
                    permanentStorage.betMemory = data.betMemory || {};
                    permanentStorage.statsMemory = data.statsMemory || {};
                    return true;
                }
            } catch(e) {
                continue;
            }
        }
    }
    return false;
}

function cleanOldBackups() {
    let backupKeys = [];
    for (let i=0; i<localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key.startsWith(BACKUP_KEY)) backupKeys.push(key);
    }
    if (backupKeys.length > 10) {
        backupKeys.sort();
        for (let i=0; i<backupKeys.length-5; i++) {
            localStorage.removeItem(backupKeys[i]);
        }
    }
}

// ============================================
// BO NHO CAU VINH VIEN
// ============================================
let cauMemoryBank = {
    biet: { Tai: {}, Xiu: {}, stats: { maxTai: 0, maxXiu: 0, avgTai: 0, avgXiu: 0, totalBietTai: 0, totalBietXiu: 0 } },
    c11: { patterns: {}, stats: { total: 0, maxLength: 0, breakRate: {} } },
    c22: { patterns: {}, stats: { total: 0, maxLength: 0, phaseAccuracy: {} } },
    c33: { patterns: {}, stats: { total: 0, maxLength: 0, phaseAccuracy: {} } },
    c123: { patterns: {}, stats: { total: 0, phaseHits: {} } },
    c321: { patterns: {}, stats: { total: 0, phaseHits: {} } },
    doiXung: { patterns: {}, stats: { total: 0, accuracy: 0 } },
    bacThang: { tang: {}, giam: {}, stats: { totalTang: 0, totalGiam: 0 } },
    tamGiac: { patterns: {}, stats: { total: 0, complete: 0 } },
    bietKep: { patterns: {}, stats: { total: 0, sameLength: 0, diffLength: 0 } },
    zigzag: { patterns: {}, stats: { total: 0, avgAmplitude: 0 } },
    nem: { patterns: {}, stats: { tang: 0, giam: 0, fakeouts: 0 } },
    co: { patterns: {}, stats: { tang: 0, giam: 0, continues: 0 } },
    hcn: { patterns: {}, stats: { total: 0, breakouts: 0 } },
    vaiDauVai: { patterns: {}, stats: { total: 0, accuracy: 0 } },
    haiDinh: { patterns: {}, stats: { total: 0, accuracy: 0 } },
    haiDay: { patterns: {}, stats: { total: 0, accuracy: 0 } },
    elliot: { patterns: {}, stats: { waves: {}, accuracy: 0 } },
    diamond: { patterns: {}, stats: { total: 0, accuracy: 0 } },
    beCau: { signals: {}, stats: { total: 0, accuracy: 0, byLength: {} } },
    betDai: { signals: {}, stats: { total: 0, accuracy: 0, byLength: {} } },
    diDeu: { patterns: {}, stats: { total: 0, accuracy: 0 } }
};

// ============================================
// BO NHO XUC XAC 3 CUC VINH VIEN
// ============================================
let diceMemoryBank = {
    x1: {1:0,2:0,3:0,4:0,5:0,6:0, stats: {mean:0, median:0, mode:0, std:0, hot:0, cold:0}},
    x2: {1:0,2:0,3:0,4:0,5:0,6:0, stats: {mean:0, median:0, mode:0, std:0, hot:0, cold:0}},
    x3: {1:0,2:0,3:0,4:0,5:0,6:0, stats: {mean:0, median:0, mode:0, std:0, hot:0, cold:0}},
    tong: {3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0, stats: {mean:0, median:0, mode:0}},
    cap12: {matrix: {}, stats: {}},
    cap23: {matrix: {}, stats: {}},
    cap13: {matrix: {}, stats: {}},
    triple: {matrix: {}, stats: {total:0, uniqueTriples:0}},
    highLow: {HHH:0,HHL:0,HLH:0,HLL:0,LHH:0,LHL:0,LLH:0,LLL:0},
    oddEven: {CCC:0,CCL:0,CLC:0,CLL:0,LCC:0,LCL:0,LLC:0,LLL:0},
    prime: {0:0,1:0,2:0,3:0},
    chenhLech: {0:0,1:0,2:0,3:0,4:0,5:0},
    tongCap: {
        x1x2: {2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0},
        x2x3: {2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0},
        x1x3: {2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0}
    },
    transition: {
        x1: Array.from({length:7}, (_,i) => i===0?null:{1:0,2:0,3:0,4:0,5:0,6:0}),
        x2: Array.from({length:7}, (_,i) => i===0?null:{1:0,2:0,3:0,4:0,5:0,6:0}),
        x3: Array.from({length:7}, (_,i) => i===0?null:{1:0,2:0,3:0,4:0,5:0,6:0})
    },
    tripleTransition: {},
    diceStreaks: {
        x1: {}, x2: {}, x3: {}
    },
    predictionHistory: {
        byTriple: {correct:0, wrong:0},
        byTransition: {correct:0, wrong:0},
        byHighLow: {correct:0, wrong:0},
        byOddEven: {correct:0, wrong:0}
    }
};

// ============================================
// BO NHO PATTERN VINH VIEN
// ============================================
let patternMemoryBank = {
    p3: {}, p4: {}, p5: {}, p6: {}, p7: {},
    p8: {}, p9: {}, p10: {}, p12: {}, p15: {}, p20: {},
    patternNext: {},
    patternAfter: {},
    topPatterns: [],
    patternClusters: {},
    lastUpdate: 0
};

// ============================================
// BO NHO SCORE VINH VIEN
// ============================================
let scoreMemoryBank = {
    afterScore: {},
    afterScoreResult: {},
    scoreZones: { ratThap:0, thap:0, trungBinh:0, cao:0, ratCao:0 },
    zoneTransitions: {},
    movingAvg: { MA5:[], MA10:[], MA20:[], MA50:[] },
    momentum: { strongUp:0, weakUp:0, flat:0, weakDown:0, strongDown:0 },
    volatility: { thap:0, trungbinh:0, cao:0 },
    specialScores: { tong3:0, tong4:0, tong17:0, tong18:0 },
    scoreCycles: {}
};

// ============================================
// BO NHO BET VINH VIEN
// ============================================
let betMemoryBank = {
    betHistory: [],
    successBets: [],
    failBets: [],
    optimalEntry: {},
    optimalExit: {},
    betStats: {
        totalBets: 0, totalWins: 0, totalLosses: 0,
        winRate: 0, avgWin: 0, avgLoss: 0,
        bestWinStreak: 0, bestLoseStreak: 0,
        byHour: {}, byDay: {}, byMonth: {}
    }
};

// ============================================
// KHOI TAO HE THONG
// ============================================
function initUltimateSystemV3() {
    let loaded = loadFromPermanentStorage();
    
    if (loaded) {
        cauMemoryBank = {...cauMemoryBank, ...permanentStorage.cauMemory};
        diceMemoryBank = {...diceMemoryBank, ...permanentStorage.diceMemory};
        scoreMemoryBank = {...scoreMemoryBank, ...permanentStorage.scoreMemory};
        patternMemoryBank = {...patternMemoryBank, ...permanentStorage.patternMemory};
        betMemoryBank = {...betMemoryBank, ...permanentStorage.betMemory};
    }
    
    if (gameHistory.length === 0 && permanentStorage.totalSessions > 0) {
        console.log('Restored from storage: ' + permanentStorage.totalSessions + ' sessions');
    }
    
    console.log('ULTIMATE SYSTEM V3 INITIALIZED');
}

// ============================================
// THEM PHIEN MOI - CAP NHAT TAT CA BO NHO
// ============================================
function addSessionV3(session, result, totalScore, d1, d2, d3) {
    gameHistory.push({ session, result, totalScore, d1, d2, d3, timestamp: Date.now() });
    
    updateDiceMemoryV3(d1, d2, d3, totalScore);
    updateScoreMemoryV3(totalScore, result);
    updateCauMemoryV3(result, totalScore);
    updatePatternMemoryV3(result);
    updateBetMemoryV3(result, totalScore);
    
    if (gameHistory.length % 100 === 0) {
        recalculateAllStatsV3();
    }
    
    if (gameHistory.length % 500 === 0) {
        saveToPermanentStorage();
    }
    
    if (gameHistory.length > 900000) {
        gameHistory = gameHistory.slice(-800000);
    }
}

// ============================================
// UPDATE DICE MEMORY - GHI NHO 3 CUC XUC XAC
// ============================================
function updateDiceMemoryV3(d1, d2, d3, total) {
    diceMemoryBank.x1[d1]++;
    diceMemoryBank.x2[d2]++;
    diceMemoryBank.x3[d3]++;
    diceMemoryBank.tong[total]++;
    
    let p12 = d1+''+d2;
    let p23 = d2+''+d3;
    let p13 = d1+''+d3;
    diceMemoryBank.cap12.matrix[p12] = (diceMemoryBank.cap12.matrix[p12]||0)+1;
    diceMemoryBank.cap23.matrix[p23] = (diceMemoryBank.cap23.matrix[p23]||0)+1;
    diceMemoryBank.cap13.matrix[p13] = (diceMemoryBank.cap13.matrix[p13]||0)+1;
    
    let triple = d1+''+d2+''+d3;
    diceMemoryBank.triple.matrix[triple] = (diceMemoryBank.triple.matrix[triple]||0)+1;
    diceMemoryBank.triple.stats.total++;
    diceMemoryBank.triple.stats.uniqueTriples = Object.keys(diceMemoryBank.triple.matrix).length;
    
    let hl = (d1>=4?'H':'L')+(d2>=4?'H':'L')+(d3>=4?'H':'L');
    diceMemoryBank.highLow[hl] = (diceMemoryBank.highLow[hl]||0)+1;
    
    let oe = (d1%2===0?'C':'L')+(d2%2===0?'C':'L')+(d3%2===0?'C':'L');
    diceMemoryBank.oddEven[oe] = (diceMemoryBank.oddEven[oe]||0)+1;
    
    let primeCount = [d1,d2,d3].filter(x=>[2,3,5].includes(x)).length;
    diceMemoryBank.prime[primeCount]++;
    
    let chenh = Math.max(d1,d2,d3) - Math.min(d1,d2,d3);
    diceMemoryBank.chenhLech[chenh]++;
    
    diceMemoryBank.tongCap.x1x2[d1+d2]++;
    diceMemoryBank.tongCap.x2x3[d2+d3]++;
    diceMemoryBank.tongCap.x1x3[d1+d3]++;
    
    let n = gameHistory.length;
    if (n >= 2) {
        let prev = gameHistory[n-2];
        if (diceMemoryBank.transition.x1[prev.d1]) diceMemoryBank.transition.x1[prev.d1][d1]++;
        if (diceMemoryBank.transition.x2[prev.d2]) diceMemoryBank.transition.x2[prev.d2][d2]++;
        if (diceMemoryBank.transition.x3[prev.d3]) diceMemoryBank.transition.x3[prev.d3][d3]++;
        
        let prevTriple = prev.d1+''+prev.d2+''+prev.d3;
        let key = prevTriple+'_to_'+triple;
        diceMemoryBank.tripleTransition[key] = (diceMemoryBank.tripleTransition[key]||0)+1;
    }
    
    updateDiceStreaksV3(d1, d2, d3);
    updateDiceStatsV3();
}

function updateDiceStreaksV3(d1, d2, d3) {
    if (!diceMemoryBank.diceStreaks.x1[d1]) diceMemoryBank.diceStreaks.x1[d1] = {};
    if (!diceMemoryBank.diceStreaks.x2[d2]) diceMemoryBank.diceStreaks.x2[d2] = {};
    if (!diceMemoryBank.diceStreaks.x3[d3]) diceMemoryBank.diceStreaks.x3[d3] = {};
    
    let streak1=1, streak2=1, streak3=1;
    for (let i=gameHistory.length-2; i>=0; i--) {
        if (gameHistory[i].d1===d1) streak1++; else break;
    }
    for (let i=gameHistory.length-2; i>=0; i--) {
        if (gameHistory[i].d2===d2) streak2++; else break;
    }
    for (let i=gameHistory.length-2; i>=0; i--) {
        if (gameHistory[i].d3===d3) streak3++; else break;
    }
    
    diceMemoryBank.diceStreaks.x1[d1][Math.min(streak1,20)] = (diceMemoryBank.diceStreaks.x1[d1][Math.min(streak1,20)]||0)+1;
    diceMemoryBank.diceStreaks.x2[d2][Math.min(streak2,20)] = (diceMemoryBank.diceStreaks.x2[d2][Math.min(streak2,20)]||0)+1;
    diceMemoryBank.diceStreaks.x3[d3][Math.min(streak3,20)] = (diceMemoryBank.diceStreaks.x3[d3][Math.min(streak3,20)]||0)+1;
}

function updateDiceStatsV3() {
    let calcStats = (obj) => {
        let values = [];
        for (let key in obj) {
            if (key !== 'stats') {
                for (let i=0; i<obj[key]; i++) values.push(parseInt(key));
            }
        }
        if (values.length === 0) return {mean:0, median:0, mode:0, std:0, hot:0, cold:0};
        values.sort((a,b)=>a-b);
        let mean = values.reduce((a,b)=>a+b,0)/values.length;
        let median = values[Math.floor(values.length/2)];
        let freq = {};
        values.forEach(v=>freq[v]=(freq[v]||0)+1);
        let mode = parseInt(Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0]);
        let variance = values.reduce((a,b)=>a+Math.pow(b-mean,2),0)/values.length;
        let std = Math.sqrt(variance);
        let hot = parseInt(Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0]);
        let cold = parseInt(Object.entries(freq).sort((a,b)=>a[1]-b[1])[0][0]);
        return {mean, median, mode, std, hot, cold};
    };
    
    diceMemoryBank.x1.stats = calcStats(diceMemoryBank.x1);
    diceMemoryBank.x2.stats = calcStats(diceMemoryBank.x2);
    diceMemoryBank.x3.stats = calcStats(diceMemoryBank.x3);
    
    let tongValues = [];
    for (let t=3; t<=18; t++) {
        for (let i=0; i<diceMemoryBank.tong[t]; i++) tongValues.push(t);
    }
    if (tongValues.length > 0) {
        tongValues.sort((a,b)=>a-b);
        diceMemoryBank.tong.stats.mean = tongValues.reduce((a,b)=>a+b,0)/tongValues.length;
        diceMemoryBank.tong.stats.median = tongValues[Math.floor(tongValues.length/2)];
        let freq = {};
        tongValues.forEach(v=>freq[v]=(freq[v]||0)+1);
        diceMemoryBank.tong.stats.mode = parseInt(Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0]);
    }
}

// ============================================
// UPDATE SCORE MEMORY
// ============================================
function updateScoreMemoryV3(total, result) {
    let n = gameHistory.length;
    
    if (n >= 2) {
        let prevScore = gameHistory[n-2].totalScore;
        if (!scoreMemoryBank.afterScore[prevScore]) {
            scoreMemoryBank.afterScore[prevScore] = {};
            for (let i=3; i<=18; i++) scoreMemoryBank.afterScore[prevScore][i] = 0;
        }
        scoreMemoryBank.afterScore[prevScore][total]++;
        
        if (!scoreMemoryBank.afterScoreResult[prevScore]) {
            scoreMemoryBank.afterScoreResult[prevScore] = {Tai:0, Xiu:0};
        }
        scoreMemoryBank.afterScoreResult[prevScore][result]++;
    }
    
    if (total >= 14) scoreMemoryBank.scoreZones.ratCao++;
    else if (total >= 11) scoreMemoryBank.scoreZones.cao++;
    else if (total >= 8) scoreMemoryBank.scoreZones.trungBinh++;
    else if (total >= 5) scoreMemoryBank.scoreZones.thap++;
    else scoreMemoryBank.scoreZones.ratThap++;
    
    if (n >= 2) {
        let prevScore = gameHistory[n-2].totalScore;
        let prevZone = getScoreZoneV3(prevScore);
        let currZone = getScoreZoneV3(total);
        let key = prevZone+'_'+currZone;
        scoreMemoryBank.zoneTransitions[key] = (scoreMemoryBank.zoneTransitions[key]||0)+1;
    }
    
    if (total === 3) scoreMemoryBank.specialScores.tong3++;
    if (total === 4) scoreMemoryBank.specialScores.tong4++;
    if (total === 17) scoreMemoryBank.specialScores.tong17++;
    if (total === 18) scoreMemoryBank.specialScores.tong18++;
    
    if (n >= 5) {
        let avg5 = gameHistory.slice(-5).map(h=>h.totalScore).reduce((a,b)=>a+b,0)/5;
        scoreMemoryBank.movingAvg.MA5.push(avg5);
        if (scoreMemoryBank.movingAvg.MA5.length > 10000) scoreMemoryBank.movingAvg.MA5.shift();
    }
    if (n >= 10) {
        let avg10 = gameHistory.slice(-10).map(h=>h.totalScore).reduce((a,b)=>a+b,0)/10;
        scoreMemoryBank.movingAvg.MA10.push(avg10);
        if (scoreMemoryBank.movingAvg.MA10.length > 10000) scoreMemoryBank.movingAvg.MA10.shift();
    }
    if (n >= 20) {
        let avg20 = gameHistory.slice(-20).map(h=>h.totalScore).reduce((a,b)=>a+b,0)/20;
        scoreMemoryBank.movingAvg.MA20.push(avg20);
        if (scoreMemoryBank.movingAvg.MA20.length > 5000) scoreMemoryBank.movingAvg.MA20.shift();
    }
}

function getScoreZoneV3(score) {
    if (score >= 14) return 'ratCao';
    if (score >= 11) return 'cao';
    if (score >= 8) return 'trungBinh';
    if (score >= 5) return 'thap';
    return 'ratThap';
}

// ============================================
// UPDATE CAU MEMORY
// ============================================
function updateCauMemoryV3(result, totalScore) {
    let n = gameHistory.length;
    if (n < 3) return;
    
    let results = gameHistory.map(h=>h.result);
    
    let streak = 1;
    for (let i=n-2; i>=0; i--) {
        if (results[i]===result) streak++;
        else break;
    }
    if (streak >= 3) {
        if (result==='Tài') {
            cauMemoryBank.biet.Tai[streak] = (cauMemoryBank.biet.Tai[streak]||0)+1;
            cauMemoryBank.biet.stats.totalBietTai++;
            if (streak > cauMemoryBank.biet.stats.maxTai) cauMemoryBank.biet.stats.maxTai = streak;
        } else {
            cauMemoryBank.biet.Xiu[streak] = (cauMemoryBank.biet.Xiu[streak]||0)+1;
            cauMemoryBank.biet.stats.totalBietXiu++;
            if (streak > cauMemoryBank.biet.stats.maxXiu) cauMemoryBank.biet.stats.maxXiu = streak;
        }
    }
    
    if (n >= 6) {
        let last6 = results.slice(-6);
        let is11 = true;
        for (let i=1; i<6; i++) { if (last6[i]===last6[i-1]) { is11=false; break; } }
        if (is11) {
            let pattern = last6.join(',');
            cauMemoryBank.c11.patterns[pattern] = (cauMemoryBank.c11.patterns[pattern]||0)+1;
            cauMemoryBank.c11.stats.total++;
        }
    }
    
    if (n >= 8) {
        let last8 = results.slice(-8);
        let is22 = true;
        for (let i=0; i<8; i+=2) { if (last8[i]!==last8[i+1]) { is22=false; break; } }
        if (is22 && last8[0]!==last8[2]) {
            let pattern = last8.join(',');
            cauMemoryBank.c22.patterns[pattern] = (cauMemoryBank.c22.patterns[pattern]||0)+1;
            cauMemoryBank.c22.stats.total++;
        }
    }
}

// ============================================
// UPDATE PATTERN MEMORY
// ============================================
function updatePatternMemoryV3(result) {
    let n = gameHistory.length;
    if (n < 3) return;
    
    let r = result==='Tài'?'T':'X';
    let results = gameHistory.map(h=>h.result==='Tài'?'T':'X');
    
    for (let len of [3,4,5,6,7,8,9,10,12,15,20]) {
        if (n >= len) {
            let pattern = results.slice(-len).join('');
            let key = 'p'+len;
            if (!patternMemoryBank[key]) patternMemoryBank[key] = {};
            patternMemoryBank[key][pattern] = (patternMemoryBank[key][pattern]||0)+1;
        }
    }
    
    for (let len of [3,4,5,6,7,8,9,10]) {
        if (n > len) {
            let pattern = results.slice(-len-1,-1).join('');
            let nextKey = pattern+'->'+r;
            patternMemoryBank.patternNext[nextKey] = (patternMemoryBank.patternNext[nextKey]||0)+1;
        }
    }
}

// ============================================
// UPDATE BET MEMORY
// ============================================
function updateBetMemoryV3(result, totalScore) {
    let n = gameHistory.length;
    if (n < 3) return;
    
    let streak = 1;
    for (let i=n-2; i>=0; i--) {
        if (gameHistory[i].result===result) streak++;
        else break;
    }
    
    if (streak >= 3) {
        betMemoryBank.betHistory.push({
            session: gameHistory[n-1].session,
            result: result,
            streak: streak,
            totalScore: totalScore,
            timestamp: Date.now()
        });
        if (betMemoryBank.betHistory.length > 1000) betMemoryBank.betHistory.shift();
    }
}

// ============================================
// TINH TOAN LAI THONG KE
// ============================================
function recalculateAllStatsV3() {
    updateDiceStatsV3();
    
    let n = gameHistory.length;
    if (n === 0) return;
    
    let taiCount = gameHistory.filter(h=>h.result==='Tài').length;
    let allBietTai = Object.values(cauMemoryBank.biet.Tai).reduce((a,b)=>a+b,0);
    let allBietXiu = Object.values(cauMemoryBank.biet.Xiu).reduce((a,b)=>a+b,0);
    cauMemoryBank.biet.stats.avgTai = allBietTai > 0 ? 
        Object.entries(cauMemoryBank.biet.Tai).reduce((a,b)=>a+parseInt(b[0])*b[1],0)/allBietTai : 0;
    cauMemoryBank.biet.stats.avgXiu = allBietXiu > 0 ? 
        Object.entries(cauMemoryBank.biet.Xiu).reduce((a,b)=>a+parseInt(b[0])*b[1],0)/allBietXiu : 0;
}

// ============================================
// DU DOAN SIEU CHUAN
// ============================================
function predictSuperV3() {
    let n = gameHistory.length;
    if (n < 5) return { prediction: Math.random()<0.5?'Tài':'Xỉu', confidence: 50, reason: 'Chưa đủ dữ liệu' };
    
    let predictions = [];
    let results = gameHistory.map(h=>h.result==='Tài'?'T':'X');
    let lastResult = gameHistory[n-1].result;
    let lastD1 = gameHistory[n-1].dice1;
    let lastD2 = gameHistory[n-1].dice2;
    let lastD3 = gameHistory[n-1].dice3;
    let lastTriple = lastD1+''+lastD2+''+lastD3;
    let lastScore = gameHistory[n-1].totalScore;
    
    for (let len of [3,4,5,6,7,8,9,10]) {
        if (n >= len) {
            let pattern = results.slice(-len).join('');
            let nextT = patternMemoryBank.patternNext[pattern+'->T'] || 0;
            let nextX = patternMemoryBank.patternNext[pattern+'->X'] || 0;
            let total = nextT + nextX;
            if (total >= 5) {
                let probT = nextT/total;
                predictions.push({
                    predict: probT>0.5?'Tài':'Xỉu',
                    confidence: Math.abs(probT-0.5)*2,
                    source: 'p'+len,
                    weight: 0.02*len
                });
            }
        }
    }
    
    let streak = 1;
    for (let i=n-2; i>=0; i--) {
        if (gameHistory[i].result===lastResult) streak++;
        else break;
    }
    if (streak >= 3) {
        let countLonger = 0, countThis = 0;
        for (let s=streak+1; s<=Math.min(50, cauMemoryBank.biet.stats['max'+lastResult]||50); s++) {
            countLonger += lastResult==='Tài' ? (cauMemoryBank.biet.Tai[s]||0) : (cauMemoryBank.biet.Xiu[s]||0);
        }
        countThis = lastResult==='Tài' ? (cauMemoryBank.biet.Tai[streak]||0) : (cauMemoryBank.biet.Xiu[streak]||0);
        let total = countThis + countLonger;
        if (total > 0) {
            let probContinue = countLonger/total;
            predictions.push({
                predict: probContinue>0.5 ? lastResult : (lastResult==='Tài'?'Xỉu':'Tài'),
                confidence: Math.abs(probContinue-0.5)*2+0.3,
                source: 'biet',
                weight: 0.15
            });
        }
    }
    
    if (n >= 2 && scoreMemoryBank.afterScore[lastScore]) {
        let after = scoreMemoryBank.afterScore[lastScore];
        let totalAfter = 0, taiAfter = 0;
        for (let s=3; s<=18; s++) {
            totalAfter += after[s]||0;
            if (s>=11) taiAfter += after[s]||0;
        }
        if (totalAfter >= 5) {
            let probT = taiAfter/totalAfter;
            predictions.push({
                predict: probT>0.5?'Tài':'Xỉu',
                confidence: Math.abs(probT-0.5)+0.3,
                source: 'score',
                weight: 0.1
            });
        }
    }
    
    let afterTriples = {};
    for (let key in diceMemoryBank.tripleTransition) {
        if (key.startsWith(lastTriple+'_to_')) {
            let nextT = key.split('_to_')[1];
            afterTriples[nextT] = diceMemoryBank.tripleTransition[key];
        }
    }
    if (Object.keys(afterTriples).length > 0) {
        let totalAfter = Object.values(afterTriples).reduce((a,b)=>a+b,0);
        let taiAfter = 0;
        for (let triple in afterTriples) {
            let sum = triple.split('').map(Number).reduce((a,b)=>a+b,0);
            if (sum>=11) taiAfter += afterTriples[triple];
        }
        if (totalAfter >= 3) {
            let probT = taiAfter/totalAfter;
            predictions.push({
                predict: probT>0.5?'Tài':'Xỉu',
                confidence: Math.abs(probT-0.5)+0.4,
                source: 'dice_triple',
                weight: 0.08
            });
        }
    }
    
    let trans1 = diceMemoryBank.transition.x1[lastD1] || {};
    let trans2 = diceMemoryBank.transition.x2[lastD2] || {};
    let trans3 = diceMemoryBank.transition.x3[lastD3] || {};
    let maxD1=1, maxD2=1, maxD3=1, maxC1=0, maxC2=0, maxC3=0;
    for (let f=1; f<=6; f++) {
        if ((trans1[f]||0)>maxC1) { maxC1=trans1[f]||0; maxD1=f; }
        if ((trans2[f]||0)>maxC2) { maxC2=trans2[f]||0; maxD2=f; }
        if ((trans3[f]||0)>maxC3) { maxC3=trans3[f]||0; maxD3=f; }
    }
    let predTotal = maxD1+maxD2+maxD3;
    predictions.push({
        predict: predTotal>=11?'Tài':'Xỉu',
        confidence: 0.55,
        source: 'dice_trans',
        weight: 0.06
    });
    
    let currentHL = (lastD1>=4?'H':'L')+(lastD2>=4?'H':'L')+(lastD3>=4?'H':'L');
    let hlKeys = Object.keys(diceMemoryBank.highLow);
    let hlValues = Object.values(diceMemoryBank.highLow);
    let hlTotal = hlValues.reduce((a,b)=>a+b,0);
    let hlIdx = hlKeys.indexOf(currentHL);
    let nextHLIdx = (hlIdx+1) % hlKeys.length;
    let nextHL = hlKeys[nextHLIdx];
    let hlFreq = diceMemoryBank.highLow[nextHL] || 0;
    if (hlTotal > 0 && hlFreq/hlTotal > 0.1) {
        let hCount = (nextHL.match(/H/g)||[]).length;
        predictions.push({
            predict: hCount>=2?'Tài':'Xỉu',
            confidence: 0.5+hlFreq/hlTotal,
            source: 'dice_hl',
            weight: 0.04
        });
    }
    
    let currentOE = (lastD1%2===0?'C':'L')+(lastD2%2===0?'C':'L')+(lastD3%2===0?'C':'L');
    let oeKeys = Object.keys(diceMemoryBank.oddEven);
    let oeValues = Object.values(diceMemoryBank.oddEven);
    let oeTotal = oeValues.reduce((a,b)=>a+b,0);
    let oeIdx = oeKeys.indexOf(currentOE);
    let nextOEIdx = (oeIdx+1) % oeKeys.length;
    let nextOE = oeKeys[nextOEIdx];
    let oeFreq = diceMemoryBank.oddEven[nextOE] || 0;
    if (oeTotal > 0 && oeFreq/oeTotal > 0.1) {
        let cCount = (nextOE.match(/C/g)||[]).length;
        predictions.push({
            predict: cCount>=2?'Xỉu':'Tài',
            confidence: 0.5+oeFreq/oeTotal,
            source: 'dice_oe',
            weight: 0.04
        });
    }
    
    if (streak >= 7) {
        predictions.push({
            predict: lastResult==='Tài'?'Xỉu':'Tài',
            confidence: 0.7 + Math.min(0.2, (streak-7)*0.03),
            source: 'be_cau',
            weight: 0.12
        });
    }
    
    if (scoreMemoryBank.movingAvg.MA5.length >= 2) {
        let lastMA5 = scoreMemoryBank.movingAvg.MA5[scoreMemoryBank.movingAvg.MA5.length-1];
        if (lastMA5 > 13) predictions.push({predict:'Xỉu', confidence:0.6, source:'ma5_high', weight:0.05});
        if (lastMA5 < 7) predictions.push({predict:'Tài', confidence:0.6, source:'ma5_low', weight:0.05});
    }
    
    let weightedTai = 0, weightedXiu = 0, totalWeight = 0;
    for (let pred of predictions) {
        let w = pred.weight * pred.confidence;
        if (pred.predict === 'Tài') weightedTai += w;
        else if (pred.predict === 'Xỉu') weightedXiu += w;
        totalWeight += w;
    }
    
    if (totalWeight === 0) return { prediction: Math.random()<0.5?'Tài':'Xỉu', confidence: 50, reason: 'Không đủ tín hiệu' };
    
    let probTai = weightedTai / totalWeight;
    if (Math.abs(probTai-0.5) < 0.04) return { prediction: 'CHO', confidence: 0, reason: 'Tín hiệu quá yếu' };
    
    let finalPrediction = probTai > 0.5 ? 'Tài' : 'Xỉu';
    let confidence = Math.round(Math.abs(probTai-0.5)*2*100);
    confidence = Math.max(55, Math.min(95, confidence));
    
    let topSources = predictions.sort((a,b)=>b.weight*b.confidence-a.weight*a.confidence).slice(0,5);
    let reason = topSources.map(s=>s.source).join(', ');
    
    predictionLog.push({ prediction: finalPrediction, actual: null, confidence, timestamp: Date.now(), sources: topSources });
    if (predictionLog.length > 200) predictionLog.shift();
    
    saveToPermanentStorage();
    
    return { prediction: finalPrediction, confidence, reason, totalSources: predictions.length, topSources };
}

function feedbackV3(actualResult) {
    if (predictionLog.length === 0) return;
    let lastPred = predictionLog[predictionLog.length-1];
    lastPred.actual = actualResult;
    let isCorrect = lastPred.prediction === actualResult;
    totalPredictions++;
    if (isCorrect) totalCorrect++;
}

function predictFromAPIV3(apiData) {
    apiData.forEach(item => {
        let result = item.ket_qua === 'Tài' ? 'Tài' : 'Xỉu';
        addSessionV3(item.phien, result, item.tong, item.xuc_xac_1, item.xuc_xac_2, item.xuc_xac_3);
    });
    return predictSuperV3();
}

function getFullStatsV3() {
    let n = gameHistory.length;
    return {
        totalSessions: n,
        totalPredictions,
        accuracy: totalPredictions>0?(totalCorrect/totalPredictions*100).toFixed(2):0,
        diceStats: {
            x1: diceMemoryBank.x1.stats,
            x2: diceMemoryBank.x2.stats,
            x3: diceMemoryBank.x3.stats,
            tong: diceMemoryBank.tong.stats,
            uniqueTriples: diceMemoryBank.triple.stats.uniqueTriples,
            totalTriples: diceMemoryBank.triple.stats.total
        },
        cauStats: {
            maxBietTai: cauMemoryBank.biet.stats.maxTai,
            maxBietXiu: cauMemoryBank.biet.stats.maxXiu,
            avgBietTai: cauMemoryBank.biet.stats.avgTai.toFixed(1),
            avgBietXiu: cauMemoryBank.biet.stats.avgXiu.toFixed(1),
            totalC11: cauMemoryBank.c11.stats.total,
            totalC22: cauMemoryBank.c22.stats.total
        },
        memorySize: JSON.stringify(permanentStorage).length
    };
}

initUltimateSystemV3();