export class SCMClient {
  async invokeTool() {
    throw new Error("invokeTool(toolName, input) must be implemented by SCM client");
  }
}

export default SCMClient;
