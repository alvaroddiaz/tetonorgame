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

    document.getElementById('check-btn').addEventListener('click', () => {
        validateBoard(puzzleData, updateStats, showStatsModal);
    });
}

function showStatsModal(isWin) {
    const stats = getStats();
    const modal = document.getElementById('modal');

    const winPct = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

    let content = `
        <div class="stats-container">
            <h2>Estadísticas</h2>
            <div class="stats-grid">
                <div class="stat-box"><div class="stat-val">${stats.gamesPlayed}</div><div class="stat-label">Jugadas</div></div>
                <div class="stat-box"><div class="stat-val">${winPct}%</div><div class="stat-label">% Victorias</div></div>
                <div class="stat-box"><div class="stat-val">${stats.currentStreak}</div><div class="stat-label">Racha</div></div>
                <div class="stat-box"><div class="stat-val">${stats.maxStreak}</div><div class="stat-label">Max Racha</div></div>
            </div>
            
            <h3>Últimos Días</h3>
            <div class="history-grid">
                ${renderLast7Days(stats)}
            </div>
            
            ${isWin ? '<div class="win-msg">¡Felicidades!</div>' : ''}
            
            <button id="close-modal-btn" class="btn-primary" style="margin-top:20px">Cerrar</button>
        </div>
    `;

    modal.innerHTML = content;
    modal.classList.remove('hidden');
    document.getElementById('close-modal-btn').onclick = () => modal.classList.add('hidden');
}

function renderLast7Days(stats) {
    let html = '';
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        const status = stats.history[dayStr];

        let initial = d.toLocaleDateString('es-ES', { weekday: 'narrow' });
        let cls = 'history-cell';
        if (status === 'win') cls += ' win';
        else if (status === 'loss') cls += ' loss';

        html += `<div class="${cls}">${initial}</div>`;
    }
    return html;
}