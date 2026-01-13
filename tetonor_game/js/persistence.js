// js/persistence.js
import { getDailySeed } from './utils.js';

export function getUserId() {
    let uid = localStorage.getItem('tetonor_uid');
    if (!uid) {
        uid = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('tetonor_uid', uid);
    }
    return uid;
}

export function getStats() {
    const defaultStats = {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        history: {}
    };
    const stored = localStorage.getItem('tetonor_stats');
    return stored ? JSON.parse(stored) : defaultStats;
}

export function updateStats(win) {
    const stats = getStats();
    const today = getDailySeed();

    if (stats.history[today]) return;

    stats.gamesPlayed++;
    if (win) {
        stats.gamesWon++;
        stats.currentStreak++;
        if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
        stats.history[today] = 'win';
    } else {
        stats.currentStreak = 0;
        stats.history[today] = 'loss';
    }

    localStorage.setItem('tetonor_stats', JSON.stringify(stats));
}

export function saveCurrentState() {
    const state = {};
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, idx) => {
        const slots = cell.querySelectorAll('.drop-zone');
        const op = cell.querySelector('.operator-toggle').dataset.op;

        const topToken = slots[0].firstElementChild;
        const bottomToken = slots[1].firstElementChild;

        const v1 = topToken ? topToken.dataset.value : null;
        const v2 = bottomToken ? bottomToken.dataset.value : null;
        const s1 = topToken ? topToken.dataset.sourceId : null;
        const s2 = bottomToken ? bottomToken.dataset.sourceId : null;

        if (v1 || v2 || op !== '?') {
            state[idx] = {
                top: { val: v1, src: s1 },
                bottom: { val: v2, src: s2 },
                op: op
            };
        }
    });

    const data = {
        seed: getDailySeed(),
        board: state
    };

    localStorage.setItem('tetonor_progress', JSON.stringify(data));
}

export function loadProgress(seed) {
    const save = localStorage.getItem('tetonor_progress');
    if (save) {
        const parsed = JSON.parse(save);
        if (parsed.seed === seed) return parsed;
    }
    return null;
}

export function restoreState(savedState, initialOperands, createTokenInSlot) {
    const cells = document.querySelectorAll('.cell');
    const inventoryCounts = new Array(initialOperands.length).fill(2);

    for (const cellIndex in savedState.board) {
        const cellData = savedState.board[cellIndex];
        const cellElement = cells[cellIndex];
        const dropZones = cellElement.querySelectorAll('.drop-zone');
        const opToggle = cellElement.querySelector('.operator-toggle');

        // Restore Operator
        if (cellData.op) {
            opToggle.textContent = cellData.op;
            opToggle.dataset.op = cellData.op;
        }

        if (cellData.top.val !== null) {
            createTokenInSlot(dropZones[0], cellData.top.val, cellData.top.src);
            inventoryCounts[parseInt(cellData.top.src)]--;
        }
        if (cellData.bottom.val !== null) {
            createTokenInSlot(dropZones[1], cellData.bottom.val, cellData.bottom.src);
            inventoryCounts[parseInt(cellData.bottom.src)]--;
        }
    }

    inventoryCounts.forEach((count, id) => {
        const invToken = document.querySelector(`.inventory .number-token[data-id="${id}"]`);
        if (invToken) {
            invToken.dataset.uses = count;
            const badge = invToken.querySelector('.token-badge');
            if (badge) badge.textContent = `x${count}`;
            if (count === 0) {
                invToken.classList.add('used-up');
                invToken.draggable = false;
                if (invToken.classList.contains('user-guessed')) {
                    // Ensure user-guessed tokens also get the badge/state
                }
            }
        }
    });
}
