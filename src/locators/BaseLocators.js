export class BaseLocators {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {string} selector
   */
  static by(page, selector) {
    return page.locator(selector);
  }

  /**
   * @param {import('@playwright/test').Page} page
   * @param {Array<{name: string, selector: string}>} entries
   * @param {string} name
   */
  static byName(page, entries = [], name = "") {
    const entry = (entries || []).find((item) => item?.name === name);
    if (!entry?.selector) {
      throw new Error(`Locator '${name}' is not defined`);
    }
    return page.locator(entry.selector);
  }
}

export default BaseLocators;
