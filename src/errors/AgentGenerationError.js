import { FrameworkError } from "./FrameworkError.js";

export class AgentGenerationError extends FrameworkError {
  constructor(message, metadata = {}) {
    super(message, metadata);
    this.name = "AgentGenerationError";
  }
}

export default AgentGenerationError;
