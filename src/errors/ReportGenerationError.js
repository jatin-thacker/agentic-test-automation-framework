import { FrameworkError } from "./FrameworkError.js";

export class ReportGenerationError extends FrameworkError {
  constructor(message, metadata = {}) {
    super(message, metadata);
    this.name = "ReportGenerationError";
  }
}

export default ReportGenerationError;
