import { FrameworkError } from "./FrameworkError.js";

export class UIActionError extends FrameworkError {
  constructor(message, metadata = {}) {
    super(message, metadata);
    this.name = "UIActionError";
  }
}

export default UIActionError;
