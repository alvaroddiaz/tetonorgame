// app.js
import { setupDate, getDailySeed } from './js/utils.js';
import { generatePuzzle, validateBoard } from './js/game-logic.js';
import { renderBoard, renderInventory, setupDragAndDrop, createTokenInSlot } from './js/ui-manager.js';
import { loadProgress, restoreState, updateStats, getStats } from './js/persistence.js';
import { initScratchpad } from './js/scratchpad.js';

document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

function initGame() {
    setupDate();
    initScratchpad();
    const seed = getDailySeed();
    const puzzleData = generatePuzzle(seed);

    renderBoard(puzzleData.grid);
    renderInventory(puzzleData.operands);
    setupDragAndDrop();

    // Check if we have saved progress
    const savedState = loadProgress(seed);
    if (savedState) {
        restoreState(savedState, puzzleData.operands, createTokenInSlot);
    }

    document.getElementById('check-solution').addEventListener('click', () => {
        validateBoard(puzzleData, updateStats, (isWin) => showStatsModal(isWin));
    });

    document.getElementById('close-stats').onclick = () => {
        document.getElementById('stats-modal').classList.add('hidden');
    };

    // Help Modal Logic
    const helpModal = document.getElementById('help-modal');
    document.getElementById('help-toggle').onclick = () => {
        helpModal.classList.remove('hidden');
    };
    document.getElementById('close-help').onclick = () => {
        helpModal.classList.add('hidden');
    };
    document.getElementById('close-help-top').onclick = () => {
        helpModal.classList.add('hidden');
    };
}

function showStatsModal(isWin) {
    const stats = getStats();
    const modal = document.getElementById('stats-modal');
    modal.classList.remove('hidden');

    document.getElementById('stat-played').textContent = stats.gamesPlayed;
    document.getElementById('stat-streak').textContent = stats.currentStreak;
    document.getElementById('win-message').textContent = isWin ? "¡Impresionante! Lo has logrado." : "";

    const historyGrid = document.getElementById('history-grid');
    historyGrid.innerHTML = '';

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        const status = stats.history[dayStr];

        const cell = document.createElement('div');
        cell.className = 'history-cell';
        if (status === 'win') cell.classList.add('win');
        else if (status === 'loss') cell.classList.add('loss');
        cell.textContent = d.toLocaleDateString('es-ES', { weekday: 'narrow' });
        historyGrid.appendChild(cell);
    }
}
