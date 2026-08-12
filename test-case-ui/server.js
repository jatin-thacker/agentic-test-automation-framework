const express = require('express');
const cors    = require('cors');
const { spawn } = require('child_process');
const fs   = require('fs');
const path = require('path');

const app  = express();
const PORT = 3000;
const ROOT = path.join(__dirname, '..');
const IS_WIN = process.platform === 'win32';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ──────────────────────────────────────────────────────────────────────────────
// MOCK TEST CASES (Stage 1 output – no browser needed)
// ──────────────────────────────────────────────────────────────────────────────
const FEATURE_CONTENT = `@smoke @checkout
Feature: Complete Checkout for Selected Products

  Background:
    Given the user launches the application
    And the user logs in using test data row "StandardUser"

  @checkout-info
  Scenario: TC-001 Navigate to checkout information page
    Given the user adds a product to the cart
    And the user navigates to the cart page
    When the user clicks Checkout
    Then the checkout information page should be displayed

  @checkout-overview
  Scenario: TC-002 Fill checkout information and reach overview
    Given the user adds a product to the cart
    And the user navigates to the cart page
    And the user clicks Checkout
    When the user enters first name "Jatin", last name "Tester", and postal code "M5H 1H1"
    And the user clicks Continue
    Then the checkout overview page should be displayed
    And the order item subtotal should be visible

  @checkout-confirm
  Scenario: TC-003 Complete order and see confirmation
    Given the user adds a product to the cart
    And the user navigates to the cart page
    And the user clicks Checkout
    And the user enters first name "Jatin", last name "Tester", and postal code "M5H 1H1"
    And the user clicks Continue
    When the user clicks Finish
    Then the order confirmation page should be displayed
    And the confirmation message should indicate successful purchase
    And the user can return to the products page`;

// ──────────────────────────────────────────────────────────────────────────────
// SSE HELPERS
// ──────────────────────────────────────────────────────────────────────────────
function startSSE(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
}

function sseLine(res, text) {
  if (!res.writableEnded) res.write(`data: ${JSON.stringify({ line: text })}\n\n`);
}

function sseDone(res) {
  if (!res.writableEnded) {
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
}

/** Heartbeat — keeps the SSE connection alive every 5 s during long processes */
function startHeartbeat(res) {
  const id = setInterval(() => {
    if (res.writableEnded) { clearInterval(id); return; }
    res.write(': keep-alive\n\n');
  }, 5000);
  return id;
}

/** Spawn a process, pipe all stdout/stderr to SSE, resolve when process exits */
function spawnSSE(res, cmd, args, cwd, env) {
  return new Promise((resolve) => {
    const hb   = startHeartbeat(res);
    // shell:true required on Windows to resolve .cmd shims and handle spaces in paths
    const proc = spawn(cmd, args, { cwd, env: env || process.env, shell: true });

    const emit = (data) =>
      data.toString().split(/\r?\n/).forEach(l => l && sseLine(res, l));

    proc.stdout.on('data', emit);
    proc.stderr.on('data', emit);

    proc.on('error', err => {
      clearInterval(hb);
      sseLine(res, `Process error: ${err.message}`);
      resolve(1);
    });

    proc.on('close', code => {
      clearInterval(hb);
      resolve(code);
    });
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// ROUTES
// ──────────────────────────────────────────────────────────────────────────────

/** Stage 1 – Design cases: return BDD feature text as JSON (no browser) */
app.post('/api/design-cases', (_req, res) => {
  setTimeout(() => res.json({ output: FEATURE_CONTENT }), 1200);
});

/**
 * Stage 2 – Run MCP (SSE):
 * Spawns mcp-discover.js which opens a REAL headed Playwright browser,
 * walks through every page, logs every locator it finds, writes all files.
 */
app.post('/api/run-mcp', (_req, res) => {
  startSSE(res);
  sseLine(res, '🤖 MCP Agent: Connecting to @playwright/mcp session...');
  sseLine(res, '🌐 Opening headed browser for live locator discovery...');

  const scriptPath = path.join(__dirname, 'scripts', 'mcp-discover.js');
  const nodeCmd    = IS_WIN ? 'node.exe' : 'node';

  spawnSSE(res, nodeCmd, [scriptPath], ROOT).then(code => {
    sseLine(res, '');
    if (code === 0) {
      sseLine(res, '──────────────────────────────────────────');
      sseLine(res, '✅ MCP Agent finished. Open VSCode to see all 4 files in the repo!');
    } else {
      sseLine(res, `❌ MCP Agent exited with code ${code}`);
    }
    sseDone(res);
  });
});

/** GET list of .feature files for the dropdown */
app.get('/api/features', (_req, res) => {
  const dir = path.join(ROOT, 'features');
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Cannot read features dir' });
    res.json({ features: files.filter(f => f.endsWith('.feature')) });
  });
});

/**
 * Stage 3 – Execute (SSE + heartbeat):
 * Spawns cucumber-js against the chosen feature in HEADED mode.
 * All stdout/stderr streamed live; heartbeat every 5s keeps connection alive.
 */
app.post('/api/execute', (req, res) => {
  const { targetFeature } = req.body;
  if (!targetFeature) return res.status(400).json({ error: 'Missing target feature' });

  startSSE(res);
  sseLine(res, `▶  Running: npx cucumber-js features/${targetFeature} --config cucumber.cjs`);
  sseLine(res, `🌐 Mode: HEADED — watch your screen!\n`);

  const env = { ...process.env, HEADLESS: 'false', HEADED: 'true' };
  const cucumberCmd  = IS_WIN ? 'npx.cmd' : 'npx';
  const featurePath  = path.join('features', targetFeature);

  spawnSSE(res, cucumberCmd, ['cucumber-js', featurePath, '--config', 'cucumber.cjs'], ROOT, env)
    .then(code => {
      sseLine(res, '\n──────────────────────────────────────────');
      sseLine(res, code === 0 ? '✅  All scenarios PASSED' : `❌  Exited with code ${code}`);
      sseDone(res);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Agentic Dashboard running at http://localhost:${PORT}`));
