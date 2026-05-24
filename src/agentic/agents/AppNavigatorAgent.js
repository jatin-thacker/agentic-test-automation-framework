import BaseAgent from "../core/BaseAgent.js";
import { AppConfig } from "../../config/AppConfig.js";
import SCMTools from "../../scm/contracts/SCMTools.js";

const SELECTOR_CANDIDATES = Object.freeze({
  username: ["[data-test='username']", "input[name='username']", "input[type='email']"],
  password: ["[data-test='password']", "input[type='password']"],
  loginButton: ["[data-test='login-button']", "button[type='submit']", "input[type='submit']"],
  loginError: ["[data-test='error']", "[role='alert']", ".error-message-container"],
  inventoryContainer: ["[data-test='inventory-container']", ".inventory_container", "main"],
  inventoryItems: [".inventory_item", "[data-test='inventory-item']", ".inventory_list .inventory_item"],
  menuButton: ["#react-burger-menu-btn", "[data-test='open-menu']", "button[aria-label*='menu' i]"],
  logoutLink: ["#logout_sidebar_link", "[data-test='logout-sidebar-link']", "a[href*='logout' i]"],
  loginForm: [".login-box", "[data-test='login-button']", "form"]
});

export class AppNavigatorAgent extends BaseAgent {
  constructor(deps = {}) {
    super("AppNavigatorAgent", deps);
    this.scmClient = deps.scmClient;
    this.actionPlanner = deps.actionPlanner || null;
  }

  async execute(_input = {}, context = {}, options = {}) {
    const story = context.userStory || context.story || {};
    const externalPlan = await this.#planWithExternalPlanner(story, context, options);
    const intent = externalPlan?.intent || this.#deriveIntent(story);
    const plannedActions = externalPlan?.actions?.length
      ? externalPlan.actions.map((action) => ({ required: action.required !== false, ...action }))
      : this.#buildBaseActions();
    const explorationActions = [];
    const toolResults = [];
    const pageSnapshots = [];
    const interactiveSnapshots = [];
    let networkTrace = null;

    if (!this.scmClient) {
      return {
        mode: options.scmMode || "playwright-mcp",
        detectedFlow: intent.detectedFlow,
        expectedOutcome: intent.expectedOutcome,
        intent,
        actions: plannedActions,
        explorationActions,
        exploration: {
          pageSnapshots,
          interactiveSnapshots,
          networkTrace
        },
        toolResults
      };
    }

    await this.#invokeAndTrack(SCMTools.launchBrowser, {
      browser: options.browser || "chrome",
      headless: false
    }, toolResults, { phase: "bootstrap" });

    try {
      if (externalPlan?.actions?.length) {
        await this.#executeActions(plannedActions, toolResults, pageSnapshots);
      } else {
        await this.#executeActions(plannedActions, toolResults, pageSnapshots);

        const pageState = await this.#invokeAndTrack(
          SCMTools.getPageMetadata,
          {},
          toolResults,
          { phase: "inspection", label: "initial-page-state", required: false }
        );
        const initialMetadata = pageState?.success ? pageState.data : null;

        const shouldRunLogin = intent.requiresAuthentication || initialMetadata?.hasLoginForm;
        if (shouldRunLogin) {
          const loginActions = await this.#buildLoginActions(intent);
          await this.#executeActions(loginActions, toolResults, pageSnapshots);
          plannedActions.push(...loginActions);
        }

        const storyActions = await this.#buildStoryActions(intent);
        await this.#executeActions(storyActions, toolResults, pageSnapshots);
        plannedActions.push(...storyActions);

        if (intent.hasDualOutcomeCoverage) {
          const dualActions = await this.#buildDualOutcomeActions();
          await this.#executeActions(dualActions, toolResults, pageSnapshots);
          plannedActions.push(...dualActions);
        }
      }

      const interactiveResult = await this.#invokeAndTrack(
        SCMTools.collectInteractiveElements,
        {
          maxElements: Number(options.maxInteractiveElements ?? 30),
          includeHidden: false
        },
        toolResults,
        { phase: "exploration", label: "interactive-elements", required: false }
      );
      if (interactiveResult?.success) {
        interactiveSnapshots.push({
          capturedAt: new Date().toISOString(),
          elements: interactiveResult.data?.elements || [],
          totalCandidates: interactiveResult.data?.totalCandidates || 0
        });

        const generatedExplorationActions = this.#buildExplorationActions(
          interactiveResult.data?.elements || [],
          intent,
          options
        );
        explorationActions.push(...generatedExplorationActions);
        await this.#executeActions(generatedExplorationActions, toolResults, pageSnapshots);
      }

      const networkResult = await this.#invokeAndTrack(
        SCMTools.captureNetwork,
        {
          includeStatic: false
        },
        toolResults,
        { phase: "trace", label: "network", required: false }
      );
      if (networkResult?.success) {
        networkTrace = networkResult.data;
      }

      await this.#invokeAndTrack(
        SCMTools.captureSnapshot,
        { url: AppConfig.baseUrl, title: "Post Flow Snapshot" },
        toolResults,
        { phase: "finalize", label: "snapshot", required: false }
      );
    } finally {
      await this.#invokeAndTrack(
        SCMTools.closeBrowser,
        {},
        toolResults,
        { phase: "finalize", label: "close-browser", required: false }
      );
    }

    return {
      mode: options.scmMode || "playwright-mcp",
      detectedFlow: intent.detectedFlow,
      expectedOutcome: intent.expectedOutcome,
      intent,
      actions: plannedActions,
      explorationActions,
      exploration: {
        pageSnapshots,
        interactiveSnapshots,
        networkTrace
      },
      toolResults
    };
  }

  #buildBaseActions() {
    return [
      {
        type: "navigate",
        description: "Open application",
        tool: SCMTools.openUrl,
        input: { url: AppConfig.baseUrl }
      }
    ];
  }

  async #buildLoginActions(intent = {}) {
    const usernameValue =
      intent.username ||
      (intent.expectsErrorOnly && !intent.usesIncorrectPassword ? "locked_out_user" : "standard_user");
    const passwordValue =
      intent.password ||
      (intent.usesIncorrectPassword || (intent.expectsErrorOnly && usernameValue === "standard_user")
        ? "invalid_password"
        : "secret_sauce");

    const usernameSelector = await this.#resolveSelector(SELECTOR_CANDIDATES.username);
    const passwordSelector = await this.#resolveSelector(SELECTOR_CANDIDATES.password);
    const loginButtonSelector = await this.#resolveSelector(SELECTOR_CANDIDATES.loginButton);
    const assertionSelector = intent.expectsErrorOnly
      ? await this.#resolveSelector(SELECTOR_CANDIDATES.loginError)
      : await this.#resolveSelector(SELECTOR_CANDIDATES.inventoryContainer);

    return [
      {
        type: "type",
        description: "Type username",
        locatorName: "usernameInput",
        selector: usernameSelector,
        valueKey: "username",
        elementName: "Username Input",
        tool: SCMTools.type,
        input: { selector: usernameSelector, value: usernameValue, elementName: "Username Input" }
      },
      {
        type: "type",
        description: "Type password",
        locatorName: "passwordInput",
        selector: passwordSelector,
        valueKey: "password",
        elementName: "Password Input",
        tool: SCMTools.type,
        input: { selector: passwordSelector, value: passwordValue, elementName: "Password Input" }
      },
      {
        type: "click",
        description: "Submit login form",
        locatorName: "loginButton",
        selector: loginButtonSelector,
        elementName: "Login Button",
        tool: SCMTools.click,
        input: { selector: loginButtonSelector, elementName: "Login Button" }
      },
      {
        type: "assertVisible",
        description: "Validate post-login state",
        locatorName: intent.expectsErrorOnly ? "loginError" : "inventoryContainer",
        selector: assertionSelector,
        elementName: intent.expectsErrorOnly ? "Login Error" : "Inventory Container",
        tool: SCMTools.waitFor,
        input: { selector: assertionSelector, state: "visible" }
      }
    ];
  }

  async #buildStoryActions(intent = {}) {
    const actions = [];

    if (intent.requiresInventoryVisibility && !intent.expectsErrorOnly) {
      const selector = await this.#resolveSelector(SELECTOR_CANDIDATES.inventoryContainer);
      actions.push({
        type: "assertVisible",
        description: "Validate inventory container visibility",
        locatorName: "inventoryContainer",
        selector,
        elementName: "Inventory Container",
        tool: SCMTools.waitFor,
        input: { selector, state: "visible" }
      });
    }

    if (intent.requiresProductVisibility && !intent.expectsErrorOnly) {
      const selector = await this.#resolveSelector(SELECTOR_CANDIDATES.inventoryItems);
      actions.push({
        type: "assertVisible",
        description: "Validate product cards are visible",
        locatorName: "inventoryItems",
        selector,
        elementName: "Inventory Item",
        tool: SCMTools.waitFor,
        input: { selector, state: "visible" }
      });
    }

    if (intent.requiresMenuOpen) {
      const selector = await this.#resolveSelector(SELECTOR_CANDIDATES.menuButton);
      actions.push({
        type: "click",
        description: "Open application menu",
        locatorName: "menuButton",
        selector,
        elementName: "Application Menu Button",
        tool: SCMTools.click,
        input: { selector, elementName: "Application Menu Button" }
      });
      actions.push({
        type: "wait",
        description: "Wait for menu animation",
        tool: SCMTools.waitFor,
        input: { time: 1 }
      });
    }

    if (intent.requiresLogout) {
      const selector = await this.#resolveSelector(SELECTOR_CANDIDATES.logoutLink);
      actions.push({
        type: "assertVisible",
        description: "Wait for logout option to become visible",
        locatorName: "logoutLink",
        selector,
        elementName: "Logout Link",
        tool: SCMTools.waitFor,
        input: { selector, state: "visible" }
      });
      actions.push({
        type: "click",
        description: "Click logout option",
        locatorName: "logoutLink",
        selector,
        elementName: "Logout Link",
        tool: SCMTools.click,
        input: { selector, elementName: "Logout Link", force: true }
      });
      const loginFormSelector = await this.#resolveSelector(SELECTOR_CANDIDATES.loginForm);
      actions.push({
        type: "assertVisible",
        description: "Validate login form is visible after logout",
        locatorName: "loginForm",
        selector: loginFormSelector,
        elementName: "Login Form",
        tool: SCMTools.waitFor,
        input: { selector: loginFormSelector, state: "visible" }
      });
    }

    if (intent.requiresProtectedInventoryCheck) {
      actions.push({
        type: "navigate",
        description: "Open protected inventory URL",
        tool: SCMTools.openUrl,
        input: { url: new URL("inventory.html", AppConfig.baseUrl).toString() }
      });
      const loginFormSelector = await this.#resolveSelector(SELECTOR_CANDIDATES.loginForm);
      actions.push({
        type: "assertVisible",
        description: "Protected inventory should redirect to login form",
        locatorName: "loginForm",
        selector: loginFormSelector,
        elementName: "Login Form",
        tool: SCMTools.waitFor,
        input: { selector: loginFormSelector, state: "visible" }
      });
    }

    if (intent.requiresBackNavigationCheck) {
      actions.push({
        type: "navigateBack",
        description: "Use browser back navigation",
        tool: SCMTools.navigateBack,
        input: {}
      });
      const loginFormSelector = await this.#resolveSelector(SELECTOR_CANDIDATES.loginForm);
      actions.push({
        type: "assertVisible",
        description: "Back navigation should still show login form",
        locatorName: "loginForm",
        selector: loginFormSelector,
        elementName: "Login Form",
        tool: SCMTools.waitFor,
        input: { selector: loginFormSelector, state: "visible" }
      });
    }

    return actions;
  }

  async #buildDualOutcomeActions() {
    const menuButtonSelector = await this.#resolveSelector(SELECTOR_CANDIDATES.menuButton);
    const logoutSelector = await this.#resolveSelector(SELECTOR_CANDIDATES.logoutLink);
    const usernameSelector = await this.#resolveSelector(SELECTOR_CANDIDATES.username);
    const passwordSelector = await this.#resolveSelector(SELECTOR_CANDIDATES.password);
    const loginButtonSelector = await this.#resolveSelector(SELECTOR_CANDIDATES.loginButton);
    const errorSelector = await this.#resolveSelector(SELECTOR_CANDIDATES.loginError);

    return [
      {
        type: "click",
        description: "Open menu before invalid-login verification",
        locatorName: "menuButton",
        selector: menuButtonSelector,
        elementName: "Application Menu Button",
        tool: SCMTools.click,
        input: { selector: menuButtonSelector, elementName: "Application Menu Button" },
        required: false
      },
      {
        type: "wait",
        description: "Wait for menu animation",
        tool: SCMTools.waitFor,
        input: { time: 1 },
        required: false
      },
      {
        type: "click",
        description: "Log out before invalid-login verification",
        locatorName: "logoutLink",
        selector: logoutSelector,
        elementName: "Logout Link",
        tool: SCMTools.click,
        input: { selector: logoutSelector, elementName: "Logout Link", force: true },
        required: false
      },
      {
        type: "type",
        description: "Type locked user",
        locatorName: "usernameInput",
        selector: usernameSelector,
        valueKey: "username",
        elementName: "Username Input",
        tool: SCMTools.type,
        input: { selector: usernameSelector, value: "locked_out_user", elementName: "Username Input" },
        required: false
      },
      {
        type: "type",
        description: "Type standard password for locked user",
        locatorName: "passwordInput",
        selector: passwordSelector,
        valueKey: "password",
        elementName: "Password Input",
        tool: SCMTools.type,
        input: { selector: passwordSelector, value: "secret_sauce", elementName: "Password Input" },
        required: false
      },
      {
        type: "click",
        description: "Submit locked user login",
        locatorName: "loginButton",
        selector: loginButtonSelector,
        elementName: "Login Button",
        tool: SCMTools.click,
        input: { selector: loginButtonSelector, elementName: "Login Button" },
        required: false
      },
      {
        type: "assertVisible",
        description: "Validate login error for locked user",
        locatorName: "loginError",
        selector: errorSelector,
        elementName: "Login Error",
        tool: SCMTools.waitFor,
        input: { selector: errorSelector, state: "visible" },
        required: false
      }
    ];
  }

  #buildExplorationActions(interactiveElements = [], intent = {}, options = {}) {
    const maxHovers = Math.max(0, Number(options.maxHoverExploration ?? 2));
    const maxClicks = Math.max(0, Number(options.maxClickExploration ?? 1));
    const skipClickRegex = /(logout|delete|remove|checkout|reset|cancel)/i;
    const storyKeywords = this.#extractStoryKeywords(intent.rawText || "");

    const interactiveTags = new Set(["a", "button", "input", "select", "textarea"]);

    const elements = interactiveElements
      .filter((entry) => entry?.selector)
      .filter((entry) => interactiveTags.has(entry.tag) || /button|link/i.test(entry.role || ""))
      .slice(0, Math.max(maxHovers, maxClicks) * 4);

    const ranked = elements.sort((a, b) => {
      const aScore = this.#scoreElementForStory(a, storyKeywords);
      const bScore = this.#scoreElementForStory(b, storyKeywords);
      return bScore - aScore;
    });

    const selectedForHover = ranked.slice(0, maxHovers);
    const selectedForClick = ranked
      .filter((entry) => !skipClickRegex.test(`${entry.text || ""} ${entry.selector || ""}`))
      .slice(0, maxClicks);

    const actions = [];
    for (const entry of selectedForHover) {
      actions.push({
        type: "hover",
        description: `Hover discovered element: ${entry.text || entry.selector}`,
        locatorName: null,
        selector: entry.selector,
        elementName: entry.text || entry.selector,
        tool: SCMTools.hover,
        input: { selector: entry.selector, elementName: entry.text || entry.selector },
        required: false
      });
    }
    for (const entry of selectedForClick) {
      actions.push({
        type: "click",
        description: `Click discovered element: ${entry.text || entry.selector}`,
        locatorName: null,
        selector: entry.selector,
        elementName: entry.text || entry.selector,
        tool: SCMTools.click,
        input: { selector: entry.selector, elementName: entry.text || entry.selector },
        required: false
      });
      actions.push({
        type: "wait",
        description: "Wait briefly after discovered click",
        tool: SCMTools.waitFor,
        input: { time: 1 },
        required: false
      });
      actions.push({
        type: "navigateBack",
        description: "Return to prior page after discovered click",
        tool: SCMTools.navigateBack,
        input: {},
        required: false
      });
    }
    return actions;
  }

  async #executeActions(actions = [], toolResults = [], pageSnapshots = []) {
    for (const action of actions) {
      if (!action.tool) continue;
      const result = await this.#invokeAndTrack(action.tool, action.input || {}, toolResults, {
        phase: action.type || "action",
        label: action.description,
        required: action.required !== false
      });

      if (this.#shouldCapturePageSnapshot(action, result)) {
        await this.#capturePageSnapshot(action.description, pageSnapshots, toolResults);
      }
    }
  }

  async #invokeAndTrack(toolName, input, toolResults, options = {}) {
    const result = await this.scmClient.invokeTool(toolName, input || {});
    const entry = {
      ...result,
      trace: {
        phase: options.phase || "action",
        label: options.label || null,
        required: options.required !== false
      }
    };
    toolResults.push(entry);
    return entry;
  }

  async #capturePageSnapshot(label, pageSnapshots, toolResults) {
    const metadataResult = await this.#invokeAndTrack(
      SCMTools.getPageMetadata,
      {},
      toolResults,
      { phase: "snapshot", label, required: false }
    );
    if (metadataResult?.success) {
      pageSnapshots.push({
        label,
        capturedAt: new Date().toISOString(),
        page: metadataResult.data
      });
    }
  }

  #shouldCapturePageSnapshot(action = {}, result = {}) {
    if (!result?.success) return false;
    return [
      SCMTools.openUrl,
      SCMTools.click,
      SCMTools.navigateBack,
      SCMTools.navigateForward
    ].includes(action.tool);
  }

  async #resolveSelector(candidates = []) {
    if (!Array.isArray(candidates) || candidates.length === 0) return "main";
    if (!this.scmClient) return candidates[0];

    for (const selector of candidates) {
      const probeResult = await this.scmClient.invokeTool(SCMTools.probeElement, { selector, timeout: 1000 });
      if (probeResult?.success && probeResult.data?.exists) {
        return selector;
      }
    }
    return candidates[0];
  }

  #deriveIntent(story = {}) {
    const acceptanceCriteria = Array.isArray(story.acceptanceCriteria) ? story.acceptanceCriteria : [];
    const text = [story.title || "", story.content || "", ...acceptanceCriteria].join("\n");
    const lowered = text.toLowerCase();

    const mentionsLogin = /(login|log in|sign in|authenticate|authentication)/i.test(text);
    const mentionsLogout = /(logout|log out|sign out)/i.test(text);
    const mentionsError = /(invalid|incorrect|wrong|fail|error|locked)/i.test(text);
    const mentionsSuccess = /\b(valid|success|inventory|access|authenticated)\b/i.test(text);
    const mentionsProduct = /(product items?|products? should be displayed|browsing)/i.test(text);
    const mentionsMenu = /(open(s|ing)? the application menu|menu)/i.test(text);
    const mentionsProtectedInventory = /(protected inventory|inventory url|without re-login|without relogin|without login)/i.test(
      text
    );
    const mentionsBackNav = /(browser back|back button|navigate back)/i.test(text);
    const usesIncorrectPassword = /(incorrect password|invalid password|wrong password)/i.test(text);
    const hasDualOutcomeCoverage = /(valid and invalid|successful and failed|success and error|both valid and invalid)/i.test(
      text
    );

    const usernameMatch = text.match(/username\s*[`'"]([^`'"]+)[`'"]/i);
    const passwordMatch = text.match(/password\s*[`'"]([^`'"]+)[`'"]/i);

    const expectsErrorOnly = mentionsError && !mentionsSuccess && !hasDualOutcomeCoverage;
    const expectedOutcome = hasDualOutcomeCoverage ? "mixed" : expectsErrorOnly ? "error" : "success";

    return {
      rawText: lowered,
      detectedFlow: mentionsLogin || mentionsLogout ? "auth-centric" : "generic",
      expectedOutcome,
      expectsErrorOnly,
      hasDualOutcomeCoverage,
      requiresAuthentication: mentionsLogin || mentionsLogout || mentionsProtectedInventory,
      requiresInventoryVisibility: /(inventory container|inventory page|inventory)/i.test(text),
      requiresProductVisibility: mentionsProduct,
      requiresMenuOpen: mentionsMenu || mentionsLogout,
      requiresLogout: mentionsLogout,
      requiresProtectedInventoryCheck: mentionsProtectedInventory,
      requiresBackNavigationCheck: mentionsBackNav,
      usesIncorrectPassword,
      username: usernameMatch?.[1] ? usernameMatch[1].trim() : null,
      password: passwordMatch?.[1] ? passwordMatch[1].trim() : null
    };
  }

  #extractStoryKeywords(rawText = "") {
    const blacklist = new Set([
      "the",
      "and",
      "with",
      "from",
      "that",
      "this",
      "then",
      "when",
      "user",
      "should",
      "page",
      "flow"
    ]);
    return String(rawText || "")
      .split(/[^a-z0-9_]+/i)
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word.length >= 4 && !blacklist.has(word))
      .slice(0, 15);
  }

  #scoreElementForStory(element = {}, keywords = []) {
    if (!keywords.length) return 0;
    const haystack = `${element.text || ""} ${element.selector || ""} ${element.role || ""}`.toLowerCase();
    return keywords.reduce((score, keyword) => score + (haystack.includes(keyword) ? 1 : 0), 0);
  }

  async #planWithExternalPlanner(story, context, options) {
    if (!this.actionPlanner || typeof this.actionPlanner.plan !== "function") {
      return null;
    }

    try {
      const plan = await this.actionPlanner.plan({
        story,
        context,
        options,
        app: { baseUrl: AppConfig.baseUrl },
        selectorCandidates: SELECTOR_CANDIDATES
      });
      if (!plan || !Array.isArray(plan.actions) || plan.actions.length === 0) {
        return null;
      }
      return plan;
    } catch (error) {
      await this.logger.warn("[AppNavigatorAgent] external action planner failed. Falling back to built-in planner.", {
        error: error.message
      });
      return null;
    }
  }
}

export default AppNavigatorAgent;
