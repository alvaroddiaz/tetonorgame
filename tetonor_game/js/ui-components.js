// js/ui-components.js

export function showToast(msg, type = 'neutral') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

export function showInputModal(title, defaultValue, callback) {
    const modal = document.createElement('div');
    modal.className = 'input-modal-overlay';
    modal.innerHTML = `
        <div class="input-modal-content">
            <p>${title}</p>
            <input type="text" id="modal-input" value="${defaultValue}" inputmode="numeric">
            <div class="input-modal-buttons">
                <button id="modal-cancel" class="btn-secondary">Cancelar</button>
                <button id="modal-ok" class="btn-primary">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const input = document.getElementById('modal-input');
    input.focus();
    input.select();

    const close = () => modal.remove();

    document.getElementById('modal-ok').onclick = () => {
        if (callback(input.value)) close();
    };
    document.getElementById('modal-cancel').onclick = close;
}
