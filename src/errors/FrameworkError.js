export class FrameworkError extends Error {
  /**
   * @param {string} message
   * @param {object} [metadata]
   */
  constructor(message, metadata = {}) {
    super(message);
    this.name = "FrameworkError";
    this.metadata = metadata;
  }
}

export default FrameworkError;
