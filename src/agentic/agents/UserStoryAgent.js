import path from "node:path";
import fs from "fs-extra";
import BaseAgent from "../core/BaseAgent.js";
import { DateUtils } from "../../utils/DateUtils.js";
import { StringUtils } from "../../utils/StringUtils.js";

export class UserStoryAgent extends BaseAgent {
  constructor(deps = {}) {
    super("UserStoryAgent", deps);
  }

  async execute(input = {}, _context = {}, _options = {}) {
    const defaultStoryPath = path.resolve(process.cwd(), "src/agentic/mock-data/sample-user-story.txt");
    const storyPath = input.storyPath ? path.resolve(process.cwd(), input.storyPath) : defaultStoryPath;
    const storyText = input.storyText || (await fs.readFile(storyPath, "utf-8"));
    const lines = storyText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const title = this.#deriveTitle(lines);
    const acceptanceCriteria = this.#deriveAcceptanceCriteria(storyText);
    const parsedSteps = this.#deriveParsedSteps(acceptanceCriteria);
    const storyId = `story-${StringUtils.sanitizeFileName(title || DateUtils.timestampForPath())}`;

    return {
      storyId,
      title: title || "Generated user story",
      content: storyText,
      storyPath: input.storyText ? null : storyPath,
      acceptanceCriteria,
      parsedSteps,
      storyFormat: parsedSteps.length > 0 ? "gherkin-like" : "narrative",
      generatedAt: DateUtils.nowIso()
    };
  }

  #deriveTitle(lines) {
    if (lines.length === 0) return "";
    const first = lines[0];
    return first.replace(/^#\s*/, "").replace(/^user story\s*:\s*/i, "").trim();
  }

  #deriveAcceptanceCriteria(storyText) {
    const rawLines = String(storyText || "").split(/\r?\n/);
    const criteria = [];
    let inAcceptanceSection = false;
    let currentCriterion = "";

    for (const rawLine of rawLines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (/^acceptance criteria\s*:/i.test(line)) {
        inAcceptanceSection = true;
        continue;
      }

      if (!inAcceptanceSection) {
        if (/^(given|when|then|and)\s+/i.test(line)) {
          criteria.push(line);
        }
        continue;
      }

      const isNewCriterion = /^[-*]\s+/.test(line) || /^(given|when|then|and)\s+/i.test(line) || /^ac[:\s]/i.test(line);
      if (isNewCriterion) {
        if (currentCriterion) criteria.push(currentCriterion.trim());
        currentCriterion = line.replace(/^[-*]\s+/, "").replace(/^ac[:\s]*/i, "").trim();
      } else if (currentCriterion) {
        currentCriterion = `${currentCriterion} ${line}`.trim();
      } else {
        currentCriterion = line;
      }
    }

    if (currentCriterion) criteria.push(currentCriterion.trim());

    if (criteria.length > 0) {
      return criteria;
    }

    return ["User should complete the intended flow successfully."];
  }

  #deriveParsedSteps(acceptanceCriteria = []) {
    const steps = [];
    let inferredKeyword = "Then";

    for (const criterion of acceptanceCriteria) {
      const text = String(criterion || "").trim();
      if (!text) continue;

      const keywordMatch = text.match(/^(given|when|then|and)\s+/i);
      if (keywordMatch) {
        inferredKeyword = keywordMatch[1][0].toUpperCase() + keywordMatch[1].slice(1).toLowerCase();
        steps.push({
          keyword: inferredKeyword,
          text: text.replace(/^(given|when|then|and)\s+/i, "").trim()
        });
        continue;
      }

      const normalizedText = text.toLowerCase();
      if (/click|enter|type|submit|open|navigate|select/.test(normalizedText)) {
        inferredKeyword = "When";
      } else if (/visible|should|verify|see|land|redirect/.test(normalizedText)) {
        inferredKeyword = "Then";
      }

      steps.push({ keyword: inferredKeyword, text });
    }

    return steps;
  }
}

export default UserStoryAgent;
