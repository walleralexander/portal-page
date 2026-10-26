// ---- Contact / Report Form -------------------------------------------------
// Seite melden.html. Versand serverseitig ueber api/report.php; Empfaenger und Bot-Pruefung dort.
// Vorbefuellung aus dem Info-Popup: melden.html?link=<Titel>&url=<Adresse>
function setReportStatus(message, type = '') {
    const statusEl = document.getElementById('report-status');
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('ok', 'error');
    if (type) statusEl.classList.add(type);
}

function resetReportStartedAt() {
    const startedAt = document.getElementById('report-started-at');
    if (startedAt) startedAt.value = String(Date.now());
}

function initReportForm() {
    const form = document.getElementById('entry-report-form');
    if (!form || form.dataset.initialized === 'true') return;
    form.dataset.initialized = 'true';
    resetReportStartedAt();

    const params = new URLSearchParams(location.search);
    if (params.get('url')) {
        form.elements.url.value = params.get('url');
        form.elements.details.placeholder = `Was stimmt mit „${params.get('link') || params.get('url')}“ nicht?`;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const details = (document.getElementById('report-details')?.value || '').trim();
        if (details.length < 10) {
            setReportStatus('Bitte eine genauere Beschreibung eingeben (mindestens 10 Zeichen).', 'error');
            return;
        }

        const submitBtn = document.getElementById('report-submit');
        if (submitBtn) submitBtn.disabled = true;
        setReportStatus('Wird gesendet …');

        try {
            const response = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(form)))
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || 'Senden fehlgeschlagen. Bitte spaeter erneut versuchen.');

            setReportStatus(result.message || 'Danke fuer die Meldung.', 'ok');
            form.reset();
            resetReportStartedAt();
        } catch (error) {
            // Eingaben bleiben stehen, damit nichts verloren geht.
            setReportStatus(error.message, 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

initReportForm();
