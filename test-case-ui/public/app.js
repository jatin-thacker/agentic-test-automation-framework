document.addEventListener('DOMContentLoaded', () => {
    const btnDesignCases = document.getElementById('btnDesignCases');
    const btnRunMCP      = document.getElementById('btnRunMCP');
    const btnExecute     = document.getElementById('btnExecute');

    const outputConsole  = document.getElementById('outputConsole');
    const userStoryInput = document.getElementById('userStoryInput');
    const featureSelector = document.getElementById('featureSelector');

    // ──────────────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────────────
    function toggleLoading(btn, isLoading) {
        btn.querySelector('.btn-text').classList.toggle('hidden', isLoading);
        btn.querySelector('.loader').classList.toggle('hidden', !isLoading);
        btn.disabled = isLoading;
    }

    function printToConsole(text, append = false) {
        outputConsole.textContent = append
            ? outputConsole.textContent + '\n' + text
            : text;
        outputConsole.parentElement.scrollTop = outputConsole.parentElement.scrollHeight;
    }

    function appendLine(line) {
        outputConsole.textContent += '\n' + line;
        outputConsole.parentElement.scrollTop = outputConsole.parentElement.scrollHeight;
    }

    /** Consume an SSE stream from a POST endpoint. Calls onLine per data chunk, onDone on close. */
    async function streamPost(url, body, onLine, onDone) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split('\n\n');
            buffer = parts.pop(); // keep incomplete chunk

            for (const part of parts) {
                const dataLine = part.split('\n').find(l => l.startsWith('data:'));
                if (!dataLine) continue;
                try {
                    const json = JSON.parse(dataLine.slice(5).trim());
                    if (json.done) { onDone && onDone(); return; }
                    if (json.line !== undefined) onLine(json.line);
                } catch (_) { /* skip malformed */ }
            }
        }
        onDone && onDone();
    }

    // ──────────────────────────────────────────────────────
    // LOAD FEATURES INTO DROPDOWN
    // ──────────────────────────────────────────────────────
    async function loadFeatures(selectValue) {
        try {
            const res = await fetch('/api/features');
            const data = await res.json();
            featureSelector.innerHTML = '';
            if (data.features && data.features.length > 0) {
                data.features.forEach(f => {
                    const opt = document.createElement('option');
                    opt.value = f;
                    opt.textContent = f;
                    featureSelector.appendChild(opt);
                });
                if (selectValue) featureSelector.value = selectValue;
                btnExecute.disabled = false;
            } else {
                featureSelector.innerHTML = '<option value="">No .feature files found</option>';
            }
        } catch (e) {
            featureSelector.innerHTML = '<option value="">Error loading features</option>';
        }
    }

    loadFeatures();

    // ──────────────────────────────────────────────────────
    // STAGE 1 – Design Cases
    // ──────────────────────────────────────────────────────
    btnDesignCases.addEventListener('click', async () => {
        if (!userStoryInput.value.trim()) { alert('Paste a User Story first.'); return; }
        toggleLoading(btnDesignCases, true);
        printToConsole('[test-case-designer] Analysing User Story...\n');
        try {
            const res = await fetch('/api/design-cases', { method: 'POST' });
            const data = await res.json();
            printToConsole(data.output);
            btnRunMCP.disabled = false;
        } catch (e) {
            appendLine('ERROR: ' + e.message);
        } finally {
            toggleLoading(btnDesignCases, false);
        }
    });

    // ──────────────────────────────────────────────────────
    // STAGE 2 – Run MCP (SSE streaming)
    // ──────────────────────────────────────────────────────
    btnRunMCP.addEventListener('click', async () => {
        toggleLoading(btnRunMCP, true);
        printToConsole('[framework-automation-generator] Starting MCP session...\n');
        try {
            await streamPost(
                '/api/run-mcp',
                {},
                line => appendLine(line),
                async () => {
                    // Refresh dropdown — newly written checkout.feature will appear
                    await loadFeatures('checkout.feature');
                    toggleLoading(btnRunMCP, false);
                }
            );
        } catch (e) {
            appendLine('ERROR: ' + e.message);
            toggleLoading(btnRunMCP, false);
        }
    });

    // ──────────────────────────────────────────────────────
    // STAGE 3 – Execute (SSE streaming, headed)
    // ──────────────────────────────────────────────────────
    btnExecute.addEventListener('click', async () => {
        const selected = featureSelector.value;
        if (!selected) return;
        toggleLoading(btnExecute, true);
        printToConsole(`[executor] Launching headed Playwright for: ${selected}\n`);
        try {
            await streamPost(
                '/api/execute',
                { targetFeature: selected },
                line => appendLine(line),
                () => toggleLoading(btnExecute, false)
            );
        } catch (e) {
            appendLine('ERROR: ' + e.message);
            toggleLoading(btnExecute, false);
        }
    });
});
