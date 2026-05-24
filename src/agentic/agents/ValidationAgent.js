import BaseAgent from "../core/BaseAgent.js";
import FrameworkArtifactValidator from "../validators/FrameworkArtifactValidator.js";

export class ValidationAgent extends BaseAgent {
  constructor(deps = {}) {
    super("ValidationAgent", deps);
    this.validator = deps.validator || new FrameworkArtifactValidator();
  }

  async execute(_input = {}, context = {}) {
    return this.validator.validate({
      artifactSpec: context.artifactDesign,
      generatedArtifacts: context.codeMapper?.artifacts
    });
  }
}

export default ValidationAgent;
