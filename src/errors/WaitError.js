import { FrameworkError } from "./FrameworkError.js";

export class WaitError extends FrameworkError {
  constructor(message, metadata = {}) {
    super(message, metadata);
    this.name = "WaitError";
  }
}

export default WaitError;
