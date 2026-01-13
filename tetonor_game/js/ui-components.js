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
    const existing = document.getElementById('input-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'input-modal';
    modal.className = 'input-modal-overlay';
    modal.innerHTML = `
        <div class="input-modal-content">
            <p>${title}</p>
            <input type="text" id="input-modal-field" value="${defaultValue}" inputmode="numeric" autofocus />
            <div class="input-modal-buttons">
                <button id="input-modal-cancel" class="btn-secondary">Cancelar</button>
                <button id="input-modal-ok" class="btn-primary">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const field = document.getElementById('input-modal-field');
    field.focus();
    field.select();

    const handleOk = () => {
        const shouldClose = callback(field.value);
        if (shouldClose !== false) {
            modal.remove();
        }
    };

    const handleCancel = () => {
        modal.remove();
    };

    document.getElementById('input-modal-ok').onclick = handleOk;
    document.getElementById('input-modal-cancel').onclick = handleCancel;

    field.addEventListener('keydown', (e) => {
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape'];
        if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
            e.preventDefault();
            return;
        }

        if (e.key === 'Enter') {
            handleOk();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    });
}
