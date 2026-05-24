# Playwright Cucumber Test Automation Framework

This repository contains a baseline Playwright + Cucumber automation framework for SauceDemo.

## What Is Included

- `features/login.feature` contains the live smoke login scenario.
- `features/step-definitions/login.steps.js` drives the smoke flow.
- `src/pages/LoginPage.js` owns the login page behavior and selectors.
- `src/runners/` contains test and report runners.
- `src/utils/` contains logging, waits, assertions, screenshots, Excel data, and file helpers.

## Commands

```bash
npm test
npm run test:smoke
npm run test:headed
npm run report
npm run clean
```

## Environment

Copy `.env.example` to `.env` and adjust values as needed:

```env
NODE_ENV=local
DEFAULT_BROWSER=chromium
HEADLESS=true
DEFAULT_TIMEOUT_MS=10000
ACTION_RETRY_COUNT=2
REPORT_OUTPUT_DIR=src/reports
```

Update `src/config/AppConfig.json` for the application name and base URL.

## Project Layout

```text
features/
  login.feature
  step-definitions/
  support/

src/
  config/
  data/
  errors/
  pages/
  runners/
  utils/
```

## Framework Rules

- Page objects own their selectors.
- Feature files stay in `features/`.
- Step definitions stay in `features/step-definitions/`.
- Page objects stay in `src/pages/`.
- Runtime reports and screenshots stay under `src/reports/`.
