// js/scratchpad.js

let canvas, ctx;
let drawing = false;
let currentColor = '#000';

export function initScratchpad() {
    canvas = document.getElementById('scratchpad-canvas');
    ctx = canvas.getContext('2d');

    // Auto-resize canvas
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);

    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        draw({ clientX: touch.clientX, clientY: touch.clientY });
    }, { passive: false });

    // Tools logic
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.onclick = () => {
            currentColor = btn.dataset.color;
        };
    });

    document.getElementById('clear-scratchpad').onclick = () => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    };

    document.getElementById('scratchpad-toggle').onclick = toggleScratchpad;
    document.getElementById('close-scratchpad').onclick = toggleScratchpad;
}

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
}

export function toggleScratchpad() {
    document.body.classList.toggle('scratchpad-active');
    // Resize after transition to ensure correct dimensions
    setTimeout(resizeCanvas, 450);
}

function startDrawing(e) {
    drawing = true;
    const { x, y } = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e) {
    if (!drawing) return;
    const { x, y } = getMousePos(e);
    ctx.strokeStyle = currentColor;
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing() {
    drawing = false;
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}
