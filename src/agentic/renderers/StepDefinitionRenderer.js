export class StepDefinitionRenderer {
  render(stepSpec = {}) {
    const className = stepSpec.pageClassName || "GeneratedPage";
    const excelPath = stepSpec.excelPath || "src/data/TestData.xlsx";
    const sheetName = stepSpec.sheetName || "GeneratedData";
    const launchPattern = stepSpec.launchPattern || "the user launches the generated application";
    const flowPattern = stepSpec.flowPattern || "the user executes generated flow using test data row {string}";
    const assertPattern = stepSpec.assertPattern || "the user should see the expected generated outcome";

    return `import { Given, When, Then } from "@cucumber/cucumber";
import ${className} from "../../src/pages/${className}.js";

function getPageObject(world) {
  if (!world.generatedPage) {
    world.generatedPage = new ${className}(world.page);
  }
  return world.generatedPage;
}

Given("${launchPattern}", async function () {
  const pageObject = getPageObject(this);
  await pageObject.launchApplication();
});

When("${flowPattern}", async function (rowName) {
  const pageObject = getPageObject(this);
  const row = await this.excelHelper.readRow("${excelPath}", "${sheetName}", rowName);
  await pageObject.runFlow(row);
});

Then("${assertPattern}", async function () {
  const pageObject = getPageObject(this);
  await pageObject.assertExpectedStateVisible();
});
`;
  }
}

export default StepDefinitionRenderer;
