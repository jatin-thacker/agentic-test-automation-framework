document.addEventListener('DOMContentLoaded', () => {
    const btnDesignCases = document.getElementById('btnDesignCases');
    const btnRunMCP = document.getElementById('btnRunMCP');
    const btnExecute = document.getElementById('btnExecute');
    
    const outputConsole = document.getElementById('outputConsole');
    const userStoryInput = document.getElementById('userStoryInput');
    const featureSelector = document.getElementById('featureSelector');

    // Helper to toggle button loading state
    function toggleLoading(btn, isLoading) {
        const text = btn.querySelector('.btn-text');
        const loader = btn.querySelector('.loader');
        if (isLoading) {
            btn.disabled = true;
            text.classList.add('hidden');
            loader.classList.remove('hidden');
        } else {
            btn.disabled = false;
            text.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    }

    // Helper to print to console
    function printToConsole(text, append = false) {
        if (append) {
            outputConsole.textContent += '\n\n' + text;
        } else {
            outputConsole.textContent = text;
        }
        outputConsole.parentElement.scrollTop = outputConsole.parentElement.scrollHeight;
    }

    // Fetch existing features on load
    async function loadFeatures() {
        try {
            const res = await fetch('/api/features');
            const data = await res.json();
            
            featureSelector.innerHTML = '';
            if (data.features && data.features.length > 0) {
                data.features.forEach(file => {
                    const opt = document.createElement('option');
                    opt.value = file;
                    opt.textContent = file;
                    featureSelector.appendChild(opt);
                });
                btnExecute.disabled = false;
            } else {
                featureSelector.innerHTML = '<option value="">No features found</option>';
            }
        } catch (err) {
            console.error('Failed to load features', err);
            featureSelector.innerHTML = '<option value="">Error loading features</option>';
        }
    }

    loadFeatures();

    // Stage 1: Design Cases
    btnDesignCases.addEventListener('click', async () => {
        const story = userStoryInput.value.trim();
        if (!story) {
            alert('Please paste a user story first.');
            return;
        }

        toggleLoading(btnDesignCases, true);
        printToConsole('Initializing [test-case-designer] agent...\nAnalyzing User Story markdown...\nGenerating BDD scenarios...');

        try {
            const res = await fetch('/api/design-cases', { method: 'POST' });
            const data = await res.json();
            printToConsole(data.output);
            
            // Unlock next stage
            btnRunMCP.disabled = false;
        } catch (err) {
            printToConsole('Error: ' + err.message);
        } finally {
            toggleLoading(btnDesignCases, false);
        }
    });

    // Stage 2: Run MCP
    btnRunMCP.addEventListener('click', async () => {
        toggleLoading(btnRunMCP, true);
        printToConsole('Initializing [framework-automation-generator] agent...\nConnecting to @playwright/mcp client...\nWriting Page Objects, Locators, and Step Definitions to disk...');

        try {
            const res = await fetch('/api/run-mcp', { method: 'POST' });
            const data = await res.json();
            printToConsole(data.output);
            
            // Reload dropdown so the newly generated feature file appears
            await loadFeatures();
            
            // Ensure the newly created checkout.feature is selected
            if (featureSelector.querySelector('option[value="checkout.feature"]')) {
                featureSelector.value = 'checkout.feature';
            }
            
        } catch (err) {
            printToConsole('Error: ' + err.message);
        } finally {
            toggleLoading(btnRunMCP, false);
        }
    });

    // Stage 3: Execute Tests (Headed)
    btnExecute.addEventListener('click', async () => {
        const selectedFeature = featureSelector.value;
        if (!selectedFeature) return;

        toggleLoading(btnExecute, true);
        printToConsole(`Triggering headed execution for: ${selectedFeature}...\nWatch your screen for the Playwright browser!`);

        try {
            const res = await fetch('/api/execute', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetFeature: selectedFeature })
            });
            const data = await res.json();
            printToConsole('--- HEADED EXECUTION RESULTS ---\n\n' + data.output);
        } catch (err) {
            printToConsole('Execution Error: ' + err.message);
        } finally {
            toggleLoading(btnExecute, false);
        }
    });
});
