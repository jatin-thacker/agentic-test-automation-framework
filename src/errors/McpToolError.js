import { FrameworkError } from "./FrameworkError.js";

export class McpToolError extends FrameworkError {
  constructor(message, metadata = {}) {
    super(message, metadata);
    this.name = "McpToolError";
  }
}

export default McpToolError;
