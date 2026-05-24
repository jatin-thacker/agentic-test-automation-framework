import { FrameworkError } from "./FrameworkError.js";

export class AssertionFrameworkError extends FrameworkError {
  constructor(message, metadata = {}) {
    super(message, metadata);
    this.name = "AssertionFrameworkError";
  }
}

export default AssertionFrameworkError;
