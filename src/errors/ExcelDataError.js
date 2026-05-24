import { FrameworkError } from "./FrameworkError.js";

export class ExcelDataError extends FrameworkError {
  constructor(message, metadata = {}) {
    super(message, metadata);
    this.name = "ExcelDataError";
  }
}

export default ExcelDataError;
