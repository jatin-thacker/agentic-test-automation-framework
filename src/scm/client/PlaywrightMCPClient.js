import path from "node:path";
import fs from "fs-extra";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import SCMClient from "./SCMClient.js";
import SCMTools from "../contracts/SCMTools.js";
import { DateUtils } from "../../utils/DateUtils.js";

const DEFAULT_COMMAND = process.platform === "win32" ? "npx.cmd" : "npx";
const DEFAULT_ARGS = ["playwright-mcp", "--browser=chrome"];
const RUN_CODE_TOOLS = ["browser_run_code_unsafe", "browser_run_code"];

function parseCommandArgs(rawValue) {
  if (!rawValue || !String(rawValue).trim()) return null;

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed;
    }
  } catch {
    // Fallback to whitespace parsing below.
  }

  return String(rawValue)
    .match(/(?:[^\s"]+|"[^"]*")+/g)
    ?.map((token) => token.replace(/^"|"$/g, ""))
    ?.filter(Boolean) || null;
}

export class PlaywrightMCPClient extends SCMClient {
  constructor(options = {}) {
    super();
    this.rootDir = options.rootDir || process.cwd();
    this.command = options.command || process.env.PLAYWRIGHT_MCP_COMMAND || DEFAULT_COMMAND;
    this.args = options.args || parseCommandArgs(process.env.PLAYWRIGHT_MCP_ARGS) || DEFAULT_ARGS;
    this.client =
      options.client ||
      new Client(
        {
          name: "agentic-test-automation-framework",
          version: "1.0.0"
        },
        {
          capabilities: {}
        }
      );
    this.transport = null;
    this.connected = false;
    this.availableTools = new Set();
  }

  async invokeTool(toolName, input = {}) {
    try {
      await this.#ensureConnected();

      switch (toolName) {
        case SCMTools.launchBrowser:
          return await this.#launchBrowser(toolName, input);
        case SCMTools.openUrl:
          return await this.#openUrl(toolName, input);
        case SCMTools.click:
          return await this.#click(toolName, input);
        case SCMTools.hover:
          return await this.#hover(toolName, input);
        case SCMTools.type:
          return await this.#type(toolName, input);
        case SCMTools.selectOption:
          return await this.#selectOption(toolName, input);
        case SCMTools.pressKey:
          return await this.#pressKey(toolName, input);
        case SCMTools.waitFor:
          return await this.#waitFor(toolName, input);
        case SCMTools.assertText:
          return await this.#assertText(toolName, input);
        case SCMTools.probeElement:
          return await this.#probeElement(toolName, input);
        case SCMTools.getPageMetadata:
          return await this.#getPageMetadata(toolName);
        case SCMTools.collectInteractiveElements:
          return await this.#collectInteractiveElements(toolName, input);
        case SCMTools.captureNetwork:
          return await this.#captureNetwork(toolName, input);
        case SCMTools.navigateBack:
          return await this.#navigateBack(toolName);
        case SCMTools.navigateForward:
          return await this.#navigateForward(toolName);
        case SCMTools.captureSnapshot:
          return await this.#captureSnapshot(toolName);
        case SCMTools.closeBrowser:
          return await this.#closeBrowser(toolName);
        default:
          return this.#fail(toolName, `Unsupported Playwright MCP tool mapping: ${toolName}`);
      }
    } catch (error) {
      return this.#fail(toolName, error.message);
    }
  }

  async #launchBrowser(toolName, input = {}) {
    return this.#ok(toolName, {
      browser: input.browser || "chrome",
      headed: !this.args.includes("--headless"),
      command: this.command,
      args: this.args
    });
  }

  async #openUrl(toolName, input = {}) {
    const url = input.url;
    if (!url) return this.#fail(toolName, "openUrl requires input.url");

    const navigateResult = await this.#callFirstAvailable(["browser_navigate"], { url });
    if (navigateResult) {
      return this.#ok(toolName, {
        requestedUrl: url,
        ...navigateResult,
        page: await this.#safeGetPageMetadata()
      });
    }

    const runResult = await this.#runPageCode(`
      await page.goto(${JSON.stringify(url)}, { waitUntil: "domcontentloaded" });
      return { url: page.url(), title: await page.title() };
    `);

    return this.#ok(toolName, { requestedUrl: url, ...runResult });
  }

  async #click(toolName, input = {}) {
    const selector = input.selector;
    if (!selector) return this.#fail(toolName, "click requires input.selector");
    const timeoutMs = Number(input.timeout ?? 10000);

    if (!input.force) {
      const clickResult = await this.#callFirstAvailable(["browser_click"], {
        target: selector,
        element: input.elementName,
        button: input.button,
        doubleClick: Boolean(input.doubleClick),
        modifiers: Array.isArray(input.modifiers) ? input.modifiers : undefined
      });
      if (clickResult) {
        return this.#ok(toolName, {
          selector,
          timeoutMs,
          ...clickResult,
          page: await this.#safeGetPageMetadata()
        });
      }
    }

    const runResult = await this.#runPageCode(`
      const locator = page.locator(${JSON.stringify(selector)});
      await locator.click({ timeout: ${JSON.stringify(timeoutMs)}, force: ${JSON.stringify(Boolean(input.force))} });
      return { clicked: true, selector: ${JSON.stringify(selector)} };
    `);

    return this.#ok(toolName, { selector, ...runResult });
  }

  async #hover(toolName, input = {}) {
    const selector = input.selector;
    if (!selector) return this.#fail(toolName, "hover requires input.selector");

    const hoverResult = await this.#callFirstAvailable(["browser_hover"], {
      target: selector,
      element: input.elementName
    });
    if (hoverResult) {
      return this.#ok(toolName, {
        selector,
        ...hoverResult
      });
    }

    const timeoutMs = Number(input.timeout ?? 10000);
    const runResult = await this.#runPageCode(`
      const locator = page.locator(${JSON.stringify(selector)});
      await locator.hover({ timeout: ${JSON.stringify(timeoutMs)} });
      return { hovered: true, selector: ${JSON.stringify(selector)} };
    `);
    return this.#ok(toolName, { selector, ...runResult });
  }

  async #type(toolName, input = {}) {
    const selector = input.selector;
    if (!selector) return this.#fail(toolName, "type requires input.selector");
    const value = String(input.value ?? "");
    const timeoutMs = Number(input.timeout ?? 10000);

    const typeResult = await this.#callFirstAvailable(["browser_type"], {
      target: selector,
      text: value,
      element: input.elementName,
      slowly: Boolean(input.slowly),
      submit: Boolean(input.submit)
    });
    if (typeResult) {
      return this.#ok(toolName, {
        selector,
        typedLength: value.length,
        ...typeResult
      });
    }

    const runResult = await this.#runPageCode(`
      const locator = page.locator(${JSON.stringify(selector)});
      await locator.fill("", { timeout: ${JSON.stringify(timeoutMs)} });
      await locator.type(${JSON.stringify(value)}, { timeout: ${JSON.stringify(timeoutMs)} });
      return { selector: ${JSON.stringify(selector)}, typedLength: ${value.length} };
    `);

    return this.#ok(toolName, { selector, typedLength: value.length, ...runResult });
  }

  async #selectOption(toolName, input = {}) {
    const selector = input.selector;
    if (!selector) return this.#fail(toolName, "selectOption requires input.selector");

    const value = input.value;
    const label = input.label;
    if (typeof value === "undefined" && typeof label === "undefined") {
      return this.#fail(toolName, "selectOption requires input.value or input.label");
    }

    if (typeof value !== "undefined") {
      const directResult = await this.#callFirstAvailable(["browser_select_option"], {
        target: selector,
        element: input.elementName,
        values: [String(value)]
      });
      if (directResult) {
        return this.#ok(toolName, {
          selector,
          value: String(value),
          ...directResult
        });
      }
    }

    const timeoutMs = Number(input.timeout ?? 10000);
    const runResult = await this.#runPageCode(`
      const locator = page.locator(${JSON.stringify(selector)});
      await locator.waitFor({ state: "visible", timeout: ${JSON.stringify(timeoutMs)} });
      await locator.selectOption(${
        typeof label !== "undefined"
          ? `{ label: ${JSON.stringify(String(label))} }`
          : `{ value: ${JSON.stringify(String(value))} }`
      });
      return {
        selector: ${JSON.stringify(selector)},
        selectedBy: ${JSON.stringify(typeof label !== "undefined" ? "label" : "value")},
        selectedValue: ${JSON.stringify(typeof label !== "undefined" ? String(label) : String(value))}
      };
    `);

    return this.#ok(toolName, {
      selector,
      selectedBy: typeof label !== "undefined" ? "label" : "value",
      selectedValue: typeof label !== "undefined" ? String(label) : String(value),
      ...runResult
    });
  }

  async #pressKey(toolName, input = {}) {
    const key = input.key;
    if (!key) return this.#fail(toolName, "pressKey requires input.key");

    const pressResult = await this.#callFirstAvailable(["browser_press_key"], {
      key: String(key)
    });
    if (pressResult) {
      return this.#ok(toolName, {
        key: String(key),
        ...pressResult
      });
    }

    const runResult = await this.#runPageCode(`
      await page.keyboard.press(${JSON.stringify(String(key))});
      return { key: ${JSON.stringify(String(key))}, pressed: true };
    `);
    return this.#ok(toolName, { key: String(key), ...runResult });
  }

  async #waitFor(toolName, input = {}) {
    const timeoutMs = Number(input.timeout ?? 10000);
    const waitText = input.text ? String(input.text) : null;
    const waitTextGone = input.textGone ? String(input.textGone) : null;
    const waitSeconds = Number(input.time ?? 0);

    if (waitText || waitTextGone || waitSeconds > 0) {
      const directResult = await this.#callFirstAvailable(["browser_wait_for"], {
        text: waitText || undefined,
        textGone: waitTextGone || undefined,
        time: waitSeconds > 0 ? waitSeconds : undefined
      });

      if (directResult) {
        return this.#ok(toolName, {
          mode: "page-signal",
          text: waitText,
          textGone: waitTextGone,
          time: waitSeconds > 0 ? waitSeconds : null,
          ...directResult
        });
      }

      if (waitSeconds > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
        return this.#ok(toolName, {
          mode: "timer",
          time: waitSeconds
        });
      }

      const runResult = await this.#runPageCode(`
        await page.waitForFunction(
          ({ text, textGone }) => {
            const body = document.body?.innerText || "";
            if (text && !body.includes(text)) return false;
            if (textGone && body.includes(textGone)) return false;
            return true;
          },
          { timeout: ${JSON.stringify(timeoutMs)} },
          { text: ${JSON.stringify(waitText)}, textGone: ${JSON.stringify(waitTextGone)} }
        );
        return { text: ${JSON.stringify(waitText)}, textGone: ${JSON.stringify(waitTextGone)} };
      `);
      return this.#ok(toolName, {
        mode: "page-signal",
        text: waitText,
        textGone: waitTextGone,
        ...runResult
      });
    }

    const selector = input.selector;
    if (!selector) {
      return this.#fail(toolName, "waitFor requires input.selector or one of input.text/input.textGone/input.time");
    }

    const state = input.state || "visible";
    const runResult = await this.#runPageCode(`
      const locator = page.locator(${JSON.stringify(selector)});
      await locator.waitFor({ state: ${JSON.stringify(state)}, timeout: ${JSON.stringify(timeoutMs)} });
      return { selector: ${JSON.stringify(selector)}, state: ${JSON.stringify(state)} };
    `);

    return this.#ok(toolName, { selector, state, ...runResult });
  }

  async #assertText(toolName, input = {}) {
    const selector = input.selector;
    if (!selector) return this.#fail(toolName, "assertText requires input.selector");
    const expectedText = String(input.text ?? input.expectedText ?? "").trim();
    if (!expectedText) return this.#fail(toolName, "assertText requires input.text or input.expectedText");
    const timeoutMs = Number(input.timeout ?? 10000);

    const runResult = await this.#runPageCode(`
      const locator = page.locator(${JSON.stringify(selector)});
      await locator.waitFor({ state: "visible", timeout: ${JSON.stringify(timeoutMs)} });
      const actualText = await locator.innerText({ timeout: ${JSON.stringify(timeoutMs)} }).catch(() => "");
      const normalizedActual = String(actualText || "").replace(/\\s+/g, " ").trim();
      const normalizedExpected = String(${JSON.stringify(expectedText)}).replace(/\\s+/g, " ").trim();
      if (!normalizedActual.includes(normalizedExpected)) {
        throw new Error(\`Expected text "\${normalizedExpected}" in ${JSON.stringify(selector)} but found "\${normalizedActual}"\`);
      }
      return {
        selector: ${JSON.stringify(selector)},
        expectedText: normalizedExpected,
        actualText: normalizedActual
      };
    `);

    return this.#ok(toolName, {
      selector,
      expectedText,
      ...runResult
    });
  }

  async #probeElement(toolName, input = {}) {
    const selector = input.selector;
    if (!selector) return this.#fail(toolName, "probeElement requires input.selector");

    const timeoutMs = Number(input.timeout ?? 2000);
    const runResult = await this.#runPageCode(`
      const locator = page.locator(${JSON.stringify(selector)});
      let count = 0;
      try {
        count = await locator.count();
      } catch {
        count = 0;
      }
      const exists = count > 0;
      let visible = false;
      let enabled = false;
      if (exists) {
        try {
          const first = locator.first();
          await first.waitFor({ state: "attached", timeout: ${JSON.stringify(timeoutMs)} });
          visible = await first.isVisible();
          enabled = await first.isEnabled();
        } catch {
          visible = false;
          enabled = false;
        }
      }
      return { selector: ${JSON.stringify(selector)}, count, exists, visible, enabled };
    `);

    return this.#ok(toolName, { selector, ...runResult });
  }

  async #getPageMetadata(toolName) {
    const metadata = await this.#getPageMetadataCore();
    return this.#ok(toolName, metadata);
  }

  async #collectInteractiveElements(toolName, input = {}) {
    const maxElements = Math.max(1, Number(input.maxElements ?? 30));
    const includeHidden = Boolean(input.includeHidden);

    const runResult = await this.#runPageCode(`
      const payload = await page.evaluate(
        ({ maxElements, includeHidden }) => {
          const selector = [
            "a",
            "button",
            "input",
            "select",
            "textarea",
            "[role='button']",
            "[role='link']"
          ].join(",");

          const nodes = Array.from(document.querySelectorAll(selector));
          const isVisible = (el) => {
            const style = window.getComputedStyle(el);
            if (style.visibility === "hidden" || style.display === "none") return false;
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          };

          const escapeCss = (value) =>
            String(value || "").replace(/([ !"#$%&'()*+,./:;<=>?@[\\\\\\]^\\\\\`{|}~])/g, "\\\\$1");

          const selectorFor = (el) => {
            if (el.id) return "#" + escapeCss(el.id);
            const dataTest = el.getAttribute("data-test");
            if (dataTest) return \`[data-test="\${dataTest.replace(/"/g, "\\\\\\"")}"]\`;
            const nameAttr = el.getAttribute("name");
            if (nameAttr) return \`\${el.tagName.toLowerCase()}[name="\${nameAttr.replace(/"/g, "\\\\\\"")}"]\`;
            const ariaLabel = el.getAttribute("aria-label");
            if (ariaLabel) return \`\${el.tagName.toLowerCase()}[aria-label="\${ariaLabel.replace(/"/g, "\\\\\\"")}"]\`;
            const typeAttr = el.getAttribute("type");
            if (typeAttr) return \`\${el.tagName.toLowerCase()}[type="\${typeAttr.replace(/"/g, "\\\\\\"")}"]\`;
            return el.tagName.toLowerCase();
          };

          const compactText = (value) =>
            String(value || "")
              .replace(/\\s+/g, " ")
              .trim()
              .slice(0, 120);

          const result = [];
          const seen = new Set();
          for (const el of nodes) {
            if (!includeHidden && !isVisible(el)) continue;
            const entry = {
              tag: el.tagName.toLowerCase(),
              selector: selectorFor(el),
              text: compactText(el.innerText || el.value || el.getAttribute("aria-label") || ""),
              role: compactText(el.getAttribute("role") || ""),
              type: compactText(el.getAttribute("type") || ""),
              dataTest: compactText(el.getAttribute("data-test") || "")
            };
            const dedupeKey = \`\${entry.selector}::\${entry.text}::\${entry.role}::\${entry.type}\`;
            if (seen.has(dedupeKey)) continue;
            seen.add(dedupeKey);
            result.push(entry);
            if (result.length >= maxElements) break;
          }

          return {
            url: location.href,
            title: document.title,
            totalCandidates: nodes.length,
            returned: result.length,
            elements: result
          };
        },
        { maxElements: ${JSON.stringify(maxElements)}, includeHidden: ${JSON.stringify(includeHidden)} }
      );
      return payload;
    `);

    return this.#ok(toolName, {
      maxElements,
      includeHidden,
      ...runResult
    });
  }

  async #captureNetwork(toolName, input = {}) {
    const includeStatic = Boolean(input.includeStatic);
    const filter = input.filter ? String(input.filter) : null;

    const directResult = await this.#callFirstAvailable(["browser_network_requests"], {
      static: includeStatic,
      filter: filter || undefined
    });

    if (directResult) {
      return this.#ok(toolName, {
        includeStatic,
        filter,
        ...directResult
      });
    }

    const runResult = await this.#runPageCode(`
      const payload = await page.evaluate((filterValue) => {
        const entries = performance
          .getEntriesByType("resource")
          .map((entry) => ({
            name: entry.name,
            initiatorType: entry.initiatorType,
            transferSize: entry.transferSize,
            duration: entry.duration
          }));
        const filtered = filterValue ? entries.filter((entry) => entry.name.includes(filterValue)) : entries;
        return {
          total: entries.length,
          returned: filtered.length,
          requests: filtered.slice(0, 100)
        };
      }, ${JSON.stringify(filter)});
      return payload;
    `);

    return this.#ok(toolName, {
      includeStatic,
      filter,
      ...runResult
    });
  }

  async #navigateBack(toolName) {
    const directResult = await this.#callFirstAvailable(["browser_navigate_back"], {});
    if (directResult) {
      return this.#ok(toolName, {
        ...directResult,
        page: await this.#safeGetPageMetadata()
      });
    }

    const runResult = await this.#runPageCode(`
      const response = await page.goBack({ waitUntil: "domcontentloaded" });
      return {
        url: page.url(),
        title: await page.title(),
        hasResponse: Boolean(response)
      };
    `);
    return this.#ok(toolName, runResult);
  }

  async #navigateForward(toolName) {
    const runResult = await this.#runPageCode(`
      const response = await page.goForward({ waitUntil: "domcontentloaded" });
      return {
        url: page.url(),
        title: await page.title(),
        hasResponse: Boolean(response)
      };
    `);
    return this.#ok(toolName, runResult);
  }

  async #captureSnapshot(toolName) {
    const tracesDir = path.resolve(this.rootDir, "src/reports/traces");
    await fs.ensureDir(tracesDir);
    const screenshotPath = path.join(tracesDir, `scm-snapshot-${DateUtils.timestampForPath()}.png`);
    const portablePath = screenshotPath.replace(/\\/g, "/");

    const directResult = await this.#callFirstAvailable(["browser_take_screenshot"], {
      type: "png",
      fullPage: true,
      filename: portablePath
    });
    if (directResult) {
      return this.#ok(toolName, {
        screenshotPath,
        ...directResult,
        page: await this.#safeGetPageMetadata()
      });
    }

    const runResult = await this.#runPageCode(`
      const title = await page.title();
      const url = page.url();
      await page.screenshot({ path: ${JSON.stringify(portablePath)}, fullPage: true });
      return { title, url, screenshotPath: ${JSON.stringify(screenshotPath)} };
    `);

    return this.#ok(toolName, { screenshotPath, ...runResult });
  }

  async #closeBrowser(toolName) {
    try {
      if (this.availableTools.has("browser_close")) {
        await this.client.callTool({ name: "browser_close", arguments: {} });
      }
    } catch {
      // Swallow tool-close errors; we'll still disconnect the client.
    }

    await this.#disconnect();
    return this.#ok(toolName, { closed: true });
  }

  async #getPageMetadataCore() {
    const runResult = await this.#runPageCode(`
      const payload = await page.evaluate(() => {
        const bodyText = (document.body?.innerText || "").replace(/\\s+/g, " ");
        const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
          .map((heading) => heading.textContent?.trim() || "")
          .filter(Boolean)
          .slice(0, 5);
        const loginSignals = {
          username: Boolean(document.querySelector("[data-test='username'], input[name='username'], input[type='email']")),
          password: Boolean(document.querySelector("[data-test='password'], input[type='password']")),
          submit: Boolean(document.querySelector("[data-test='login-button'], button[type='submit'], input[type='submit']"))
        };
        const hasLoginForm = loginSignals.username && loginSignals.password;
        const visibleButtonCount = Array.from(document.querySelectorAll("button, [role='button'], input[type='submit']"))
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
          })
          .length;
        return {
          url: location.href,
          title: document.title,
          headingPreview: headings,
          hasLoginForm,
          loginSignals,
          visibleButtonCount,
          bodyPreview: bodyText.trim().slice(0, 200)
        };
      });
      return payload;
    `);

    return {
      ...runResult
    };
  }

  async #safeGetPageMetadata() {
    try {
      return await this.#getPageMetadataCore();
    } catch {
      return null;
    }
  }

  async #ensureConnected() {
    if (this.connected) return;

    this.transport = new StdioClientTransport({
      command: this.command,
      args: this.args,
      cwd: this.rootDir
    });

    await this.client.connect(this.transport);

    const listedTools = await this.client.listTools();
    this.availableTools = new Set((listedTools?.tools || []).map((tool) => tool.name));

    if (!this.#resolveToolName(RUN_CODE_TOOLS)) {
      throw new Error(
        "Playwright MCP is connected, but run-code tool is unavailable. Enable core capabilities for browser execution."
      );
    }

    this.connected = true;
  }

  async #disconnect() {
    if (typeof this.client.close === "function") {
      await this.client.close().catch(() => {});
    }
    if (typeof this.transport?.close === "function") {
      await this.transport.close().catch(() => {});
    }
    this.transport = null;
    this.connected = false;
    this.availableTools.clear();
  }

  async #callFirstAvailable(candidates = [], args = {}) {
    const toolName = this.#resolveToolName(candidates);
    if (!toolName) return null;
    return this.#callMcpTool(toolName, args);
  }

  async #callMcpTool(toolName, args = {}) {
    const sanitizedArgs = Object.fromEntries(
      Object.entries(args || {}).filter(([, value]) => typeof value !== "undefined")
    );

    const result = await this.client.callTool({
      name: toolName,
      arguments: sanitizedArgs
    });

    if (result?.isError) {
      const message = this.#extractText(result) || `MCP tool '${toolName}' returned an error.`;
      throw new Error(message);
    }

    return {
      mcpTool: toolName,
      ...(this.#extractStructured(result) || {}),
      rawText: this.#extractText(result)
    };
  }

  async #runPageCode(codeBody) {
    const runCodeTool = this.#resolveToolName(RUN_CODE_TOOLS);
    if (!runCodeTool) {
      throw new Error("No Playwright MCP run-code tool available.");
    }

    const code = [
      "async (page) => {",
      `  ${codeBody.trim().replace(/\n/g, "\n  ")}`,
      "}"
    ].join("\n");

    const result = await this.client.callTool({
      name: runCodeTool,
      arguments: { code }
    });

    if (result?.isError) {
      const message = this.#extractText(result) || `MCP tool '${runCodeTool}' returned an error.`;
      throw new Error(message);
    }

    const structured = this.#extractStructured(result);
    return {
      mcpTool: runCodeTool,
      ...(structured || {}),
      rawText: this.#extractText(result)
    };
  }

  #extractText(result) {
    if (!Array.isArray(result?.content)) return "";
    return result.content
      .filter((item) => item?.type === "text" && typeof item.text === "string")
      .map((item) => item.text)
      .join("\n")
      .trim();
  }

  #extractStructured(result) {
    if (result?.structuredContent && typeof result.structuredContent === "object") {
      return result.structuredContent;
    }

    const text = this.#extractText(result);
    if (!text) return null;

    const jsonCandidate = text
      .split("\n")
      .find((line) => line.trim().startsWith("{") && line.trim().endsWith("}"));
    if (!jsonCandidate) return null;

    try {
      return JSON.parse(jsonCandidate);
    } catch {
      return null;
    }
  }

  #resolveToolName(candidates = []) {
    for (const candidate of candidates) {
      if (this.availableTools.has(candidate)) return candidate;
    }
    return null;
  }

  #ok(toolName, data = {}) {
    return {
      success: true,
      toolName,
      data,
      error: null,
      metadata: {
        mode: "playwright-mcp",
        command: this.command,
        args: this.args
      }
    };
  }

  #fail(toolName, message) {
    return {
      success: false,
      toolName,
      data: null,
      error: message,
      metadata: {
        mode: "playwright-mcp",
        command: this.command,
        args: this.args
      }
    };
  }
}

export default PlaywrightMCPClient;
