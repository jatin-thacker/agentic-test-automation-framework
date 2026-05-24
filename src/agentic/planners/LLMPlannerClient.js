import path from "node:path";
import fs from "fs-extra";
import { EnvironmentConfig } from "../../config/EnvironmentConfig.js";

function resolveBaseUrl(baseUrl = "https://api.openai.com/v1") {
  return String(baseUrl || "").trim().replace(/\/+$/, "");
}

function extractJsonCandidate(text = "") {
  const raw = String(text || "").trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    // continue to heuristics
  }

  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    try {
      return JSON.parse(fencedMatch[1].trim());
    } catch {
      // continue to heuristics
    }
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const candidate = raw.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }

  return null;
}

export class LLMPlannerClient {
  constructor(options = {}) {
    this.baseUrl = resolveBaseUrl(
      options.baseUrl ||
        EnvironmentConfig.get("LLM_API_BASE_URL", EnvironmentConfig.get("OPENAI_BASE_URL", "https://api.openai.com/v1"))
    );
    this.apiKey =
      options.apiKey ||
      EnvironmentConfig.get("LLM_API_KEY", EnvironmentConfig.get("OPENAI_API_KEY", ""));
    this.model =
      options.model ||
      EnvironmentConfig.get("LLM_MODEL", EnvironmentConfig.get("OPENAI_MODEL", ""));
    this.temperature =
      typeof options.temperature === "number"
        ? options.temperature
        : Number(EnvironmentConfig.get("LLM_TEMPERATURE", 0.15));
    this.timeoutMs =
      typeof options.timeoutMs === "number"
        ? options.timeoutMs
        : Number(EnvironmentConfig.get("LLM_TIMEOUT_MS", 60000));
    const mockPlanPath =
      options.mockPlanPath ||
      EnvironmentConfig.get("LLM_MOCK_PLAN_PATH", "");
    this.mockPlanPath = mockPlanPath ? path.resolve(process.cwd(), mockPlanPath) : null;
  }

  isConfigured() {
    return Boolean(this.mockPlanPath || (this.apiKey && this.model));
  }

  async generatePlan({ stage = null, systemPrompt, userPrompt } = {}) {
    if (this.mockPlanPath) {
      if (!(await fs.pathExists(this.mockPlanPath))) {
        throw new Error(`LLM mock plan path not found: ${this.mockPlanPath}`);
      }
      const mockPayload = await fs.readJson(this.mockPlanPath);
      const plan = mockPayload?.stages
        ? stage && mockPayload.stages[stage]
          ? mockPayload.stages[stage]
          : mockPayload.default || mockPayload.stages.default || null
        : mockPayload;

      if (!plan) {
        throw new Error(
          `LLM mock plan file does not contain a plan for stage '${stage || "default"}'.`
        );
      }

      return {
        provider: "mock",
        model: "mock-plan",
        stage,
        rawText: JSON.stringify(plan, null, 2),
        plan
      };
    }

    if (!this.apiKey || !this.model) {
      throw new Error(
        "AI-first mode requires an LLM planner. Set LLM_API_KEY + LLM_MODEL, or LLM_MOCK_PLAN_PATH for offline development."
      );
    }

    const endpoint = `${this.baseUrl}/chat/completions`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          temperature: this.temperature,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                systemPrompt ||
                "You are an automation planning engine. Return JSON only. Do not wrap the response in markdown."
            },
            {
              role: "user",
              content: userPrompt || "Return a valid automation plan as JSON."
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM planner request failed (${response.status} ${response.statusText}): ${errorText}`);
      }

      const payload = await response.json();
      const rawText =
        payload?.choices?.[0]?.message?.content ||
        payload?.output_text ||
        payload?.output?.[0]?.content?.[0]?.text ||
        "";
      const plan = extractJsonCandidate(rawText);
      if (!plan) {
        throw new Error("LLM planner returned invalid JSON.");
      }

      return {
        provider: "openai-compatible",
        model: this.model,
        stage,
        rawText,
        plan
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export default LLMPlannerClient;
