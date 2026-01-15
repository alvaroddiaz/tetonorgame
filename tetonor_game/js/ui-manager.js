// js/ui-manager.js
import { getDailySeed } from './utils.js';
import { showInputModal, showToast } from './ui-components.js';
import { saveCurrentState } from './persistence.js';

let draggedSource = null;
let sourceZone = null;

export function renderBoard(gridItems) {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    gridItems.forEach((item, idx) => {
        const cell = document.createElement('div');
        cell.className = 'cell';

        cell.innerHTML = `
            <div class="result-display">${item.result}</div>
            <div class="cell-logic">
                <div class="drop-zone" data-index="${idx}-top"></div>
                <div class="operator-toggle" data-index="${idx}" data-op="?">?</div>
                <div class="drop-zone" data-index="${idx}-bottom"></div>
            </div>
        `;
        board.appendChild(cell);

        // Add click listener to operator toggle
        cell.querySelector('.operator-toggle').onclick = (e) => toggleOperator(e.target);
    });
}

function toggleOperator(el) {
    const current = el.textContent;
    if (current === '?') el.textContent = '+';
    else if (current === '+') el.textContent = 'x';
    else el.textContent = '?';
    el.dataset.op = el.textContent;
    saveCurrentState();
}

export function renderInventory(operands) {
    const inv = document.getElementById('inventory');
    inv.innerHTML = '';

    // Create an array of indices [0...15] and shuffle it using a seeded RNG
    const seed = getDailySeed();
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);

    // Simple mulberry32 for this specific shuffle
    const rng = (function (a) {
        return function () {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    })(h);

    // Pick a count between 6 and 9
    const hiddenCount = Math.floor(rng() * 4) + 6; // 6, 7, 8, or 9

    // All indices except the last one (operands.length - 1)
    const candidates = Array.from({ length: operands.length - 1 }, (_, i) => i);

    // Shuffle candidates
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // Pick first 'hiddenCount' indices, but ensure no more than 2 consecutive are hidden
    const hiddenIndices = new Set();
    let hiddenCountLeft = hiddenCount;

    // Use candidates as the sequence to check for clumps
    // candidates is already shuffled. We'll pick from it but check against operands order.
    // However, operands.forEach uses id [0...15]. Let's pick and then fix.
    const tempIndices = new Set(candidates.slice(0, hiddenCount));

    // Convert to sorted array of hidden indices to check neighbors
    const finalHidden = new Set();
    const allIndices = Array.from({ length: operands.length - 1 }, (_, i) => i);

    // We'll iterate through all indices and hide if they were in tempIndices 
    // AND don't create a clump of 3.
    let consecutiveCount = 0;
    const pickedFromCandidates = new Set(tempIndices);

    allIndices.forEach(id => {
        if (pickedFromCandidates.has(id)) {
            if (consecutiveCount < 2) {
                finalHidden.add(id);
                consecutiveCount++;
            } else {
                // Too many consecutive. Try to move this hidden status to the next available non-clumping candidate.
                // For simplicity in a seeded environment, we just don't hide this one if it clumps.
                consecutiveCount = 0;
            }
        } else {
            consecutiveCount = 0;
        }
    });

    // If we missed some due to clumping, try to fill back from the end of candidates
    // until we reach hiddenCount or run out of safe spots.
    if (finalHidden.size < hiddenCount) {
        const remainingCandidates = candidates.slice(hiddenCount);
        for (const candId of remainingCandidates) {
            if (finalHidden.size >= hiddenCount) break;

            // Check if adding candId creates a clump of 3
            if (!finalHidden.has(candId - 1) || !finalHidden.has(candId - 2)) {
                if (!finalHidden.has(candId + 1) || !finalHidden.has(candId + 2)) {
                    finalHidden.add(candId);
                }
            }
        }
    }

    const hiddenIndicesSet = finalHidden;

    operands.forEach((num, id) => {
        const token = document.createElement('div');
        token.className = 'number-token';
        token.dataset.id = id;

        let isHidden = hiddenIndicesSet.has(id);

        // EXTRA ROBUST GUARD: Never hide the last token
        if (id === operands.length - 1) {
            isHidden = false;
        }

        if (isHidden) {
            token.classList.add('hidden-token');
            token.textContent = '?';
            token.dataset.value = '';
            token.draggable = false;
        } else {
            token.textContent = num;
            token.dataset.value = num;
            token.draggable = true;
        }

        token.dataset.uses = 2;

        const badge = document.createElement('span');
        badge.className = 'token-badge';
        badge.textContent = `x2`;
        token.appendChild(badge);

        token.addEventListener('dragstart', handleInventoryDragStart);
        token.addEventListener('click', handleInventoryTokenClick);

        inv.appendChild(token);
    });
}

function handleInventoryTokenClick(e) {
    const token = e.target.closest('.number-token');
    if (!token.classList.contains('hidden-token') && !token.classList.contains('user-guessed')) return;

    const currentVal = token.dataset.value || '';
    showInputModal("Adivina el número:", currentVal, (val) => {
        const trimmedVal = val.trim();
        if (trimmedVal === '') {
            token.textContent = '?';
            token.dataset.value = '';
            token.classList.add('hidden-token');
            token.classList.remove('user-guessed');
            token.draggable = false;
            return true;
        }

        const num = parseInt(trimmedVal);
        if (!isNaN(num) && /^\d+$/.test(trimmedVal)) {
            token.textContent = num;
            token.dataset.value = num;
            token.classList.remove('hidden-token');
            token.classList.add('user-guessed');
            token.draggable = true;
            return true;
        } else {
            showToast("Por favor, introduce un número válido", "error");
            return false;
        }
    });
}

export function setupDragAndDrop() {
    const board = document.getElementById('game-board');
    board.addEventListener('dragstart', handleBoardDragStart);
    document.body.addEventListener('dragover', e => e.preventDefault());
    document.body.addEventListener('drop', handleDrop);
    document.body.addEventListener('dragenter', handleDragEnter);
    document.body.addEventListener('dragleave', handleDragLeave);
}

function handleInventoryDragStart(e) {
    const token = e.target.closest('.number-token');
    if (!token || token.classList.contains('used-up')) {
        e.preventDefault();
        return;
    }

    draggedSource = token;
    sourceZone = null;

    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', token.dataset.value);
    e.dataTransfer.setData('source-id', token.dataset.id);

    setTimeout(() => token.style.opacity = '0.5', 0);
}

function handleBoardDragStart(e) {
    const token = e.target.closest('.number-token');
    if (!token) return;

    draggedSource = token;
    sourceZone = token.parentElement;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', token.dataset.value);
    e.dataTransfer.setData('source-id', token.dataset.sourceId);

    setTimeout(() => token.style.opacity = '0.5', 0);
}

function handleDragEnter(e) {
    const zone = e.target.closest('.drop-zone');
    if (zone && !zone.hasChildNodes()) {
        zone.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const zone = e.target.closest('.drop-zone');
    if (zone) {
        zone.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    if (draggedSource) draggedSource.style.opacity = '1';

    const dropZone = e.target.closest('.drop-zone');

    if (dropZone) {
        dropZone.classList.remove('drag-over');
        if (dropZone.hasChildNodes()) return;

        const value = e.dataTransfer.getData('text/plain');
        const sourceId = e.dataTransfer.getData('source-id');

        if (sourceZone === null) {
            createTokenInSlot(dropZone, value, sourceId);
            updateInventoryCount(sourceId, -1);
        } else {
            dropZone.appendChild(draggedSource);
        }

        saveCurrentState();
        return;
    }

    if (sourceZone !== null && !dropZone) {
        draggedSource.remove();
        const sourceId = e.dataTransfer.getData('source-id');
        updateInventoryCount(sourceId, +1);
        saveCurrentState();
    }

    draggedSource = null;
    sourceZone = null;
}

export function createTokenInSlot(zone, value, sourceId) {
    const token = document.createElement('div');
    token.className = 'number-token';
    token.draggable = true;
    token.textContent = value;
    token.dataset.value = value;
    token.dataset.sourceId = sourceId;

    token.oncontextmenu = (e) => {
        e.preventDefault();
        token.remove();
        updateInventoryCount(sourceId, +1);
        saveCurrentState();
    };

    zone.appendChild(token);
}

export function updateInventoryCount(id, change) {
    const invToken = document.querySelector(`.inventory .number-token[data-id="${id}"]`);
    if (invToken) {
        let currentUses = parseInt(invToken.dataset.uses);
        currentUses += change;

        if (currentUses > 2) currentUses = 2;
        if (currentUses < 0) currentUses = 0;

        invToken.dataset.uses = currentUses;

        const badge = invToken.querySelector('.token-badge');
        if (badge) badge.textContent = `x${currentUses}`;

        if (currentUses === 0) {
            invToken.classList.add('used-up');
            invToken.draggable = false;
        } else {
            invToken.classList.remove('used-up');
            invToken.draggable = true;
        }
    }
}
