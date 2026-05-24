import path from "node:path";
import fs from "fs-extra";

function normalizeCommand(value) {
  const token = String(value || "").trim().toLowerCase();
  if (!token) return "";
  return token.startsWith("/") ? token : `/${token}`;
}

export class CommandRegistry {
  constructor(options = {}) {
    this.registryPath =
      options.registryPath ||
      path.resolve(process.cwd(), "src/agentic/commands/command-registry.json");
    this.registry = null;
  }

  async load() {
    if (this.registry) return this.registry;
    this.registry = await fs.readJson(this.registryPath);
    this.#validateRegistry(this.registry);
    return this.registry;
  }

  async resolve(rawCommandToken) {
    const registry = await this.load();
    const normalizedInput = normalizeCommand(rawCommandToken);
    for (const command of registry.commands || []) {
      const tokens = [command.name, ...(command.aliases || [])].map(normalizeCommand);
      if (tokens.includes(normalizedInput)) {
        return command;
      }
    }
    return null;
  }

  async list() {
    const registry = await this.load();
    return registry.commands || [];
  }

  #validateRegistry(registry) {
    if (!registry || typeof registry !== "object") {
      throw new Error("Command registry must be a JSON object.");
    }
    if (!Array.isArray(registry.commands)) {
      throw new Error("Command registry must contain an array 'commands'.");
    }
    for (const command of registry.commands) {
      if (!command.id || !command.name || !command.handler) {
        throw new Error("Each command requires id, name, and handler.");
      }
    }
  }
}

export default CommandRegistry;
