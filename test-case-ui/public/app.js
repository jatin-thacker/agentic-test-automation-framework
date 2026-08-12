document.addEventListener('DOMContentLoaded', () => {
    const btnDesignCases = document.getElementById('btnDesignCases');
    const btnRunMCP = document.getElementById('btnRunMCP');
    const btnExecute = document.getElementById('btnExecute');
    
    const outputConsole = document.getElementById('outputConsole');
    const userStoryInput = document.getElementById('userStoryInput');

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
        printToConsole('Initializing [framework-automation-generator] agent...\nConnecting to @playwright/mcp client...\nGenerating Page Objects and Locators...');

        try {
            const res = await fetch('/api/run-mcp', { method: 'POST' });
            const data = await res.json();
            printToConsole('✅ Automation Scripts Generated via MCP:\n\n' + data.output);
            
            // Unlock final stage
            btnExecute.disabled = false;
        } catch (err) {
            printToConsole('Error: ' + err.message);
        } finally {
            toggleLoading(btnRunMCP, false);
        }
    });

    // Stage 3: Execute Tests
    btnExecute.addEventListener('click', async () => {
        toggleLoading(btnExecute, true);
        printToConsole('Triggering Test Runner: npm run test:smoke...\nWaiting for execution to complete...');

        try {
            const res = await fetch('/api/execute', { method: 'POST' });
            const data = await res.json();
            printToConsole('--- EXECUTION RESULTS ---\n\n' + data.output);
        } catch (err) {
            printToConsole('Execution Error: ' + err.message);
        } finally {
            toggleLoading(btnExecute, false);
        }
    });
});
