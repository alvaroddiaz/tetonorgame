// js/game-logic.js
import { mulberry32, shuffleArray } from './utils.js';
import { showToast } from './ui-components.js';

const MAX_NUM = 25;

export function generatePuzzle(seedStr) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
    const rng = mulberry32(h);

    const pairs = [];
    const usedPairs = new Set();
    while (pairs.length < 8) {
        const a = Math.floor(rng() * MAX_NUM) + 1;
        const b = Math.floor(rng() * MAX_NUM) + 1;
        const pairKey = a < b ? `${a},${b}` : `${b},${a}`;
        if (!usedPairs.has(pairKey)) {
            usedPairs.add(pairKey);
            pairs.push([a, b]);
        }
    }

    let gridItems = [];
    let operands = [];

    pairs.forEach(pair => {
        const [a, b] = pair;
        gridItems.push({ result: a + b, pair: [a, b], op: '+' });
        gridItems.push({ result: a * b, pair: [a, b], op: '*' });
        operands.push(a);
        operands.push(b);
    });

    gridItems = shuffleArray(gridItems, rng);
    operands.sort((a, b) => a - b);

    return { grid: gridItems, operands: operands };
}

export function validateBoard(puzzleData, updateStatsCallback, showStatsModalCallback) {
    const board = document.getElementById('game-board');
    const cells = board.querySelectorAll('.cell');
    let allCorrect = true;
    let filledCount = 0;

    cells.forEach(cell => {
        const resultVal = parseInt(cell.querySelector('.result-display').textContent);
        const opToggle = cell.querySelector('.operator-toggle').textContent;
        const slots = cell.querySelectorAll('.drop-zone');

        const getVal = (zone) => {
            if (zone.dataset.inputValue) return parseInt(zone.dataset.inputValue);
            if (zone.firstChild && zone.firstChild.dataset) return parseInt(zone.firstChild.dataset.value);
            return null;
        };

        const val1 = getVal(slots[0]);
        const val2 = getVal(slots[1]);

        if (val1 !== null) filledCount++;
        if (val2 !== null) filledCount++;

        if (val1 !== null && val2 !== null) {
            let mathCorrect = false;
            if (opToggle === '+') {
                if (val1 + val2 === resultVal) mathCorrect = true;
            } else if (opToggle === 'x' || opToggle === '*') {
                if (val1 * val2 === resultVal) mathCorrect = true;
            }

            if (!mathCorrect) allCorrect = false;
        } else {
            allCorrect = false;
        }

        if (opToggle === '?') allCorrect = false;
    });

    if (filledCount < 32) {
        showToast("Faltan números por colocar", "error");
        return;
    }

    if (allCorrect) {
        const today = new Date().toISOString().split('T')[0]; // Simple seed basis or use utility
        updateStatsCallback(true);
        showStatsModalCallback(true);
        // We'll handle localStorage in persistence or here depending on structure.
        // For now, let's keep it simple.
    } else {
        showToast("Hay errores. Revisa operaciones y números.", "error");
    }
}
