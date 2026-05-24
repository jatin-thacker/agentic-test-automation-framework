export class BaseLocators {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {string} selector
   */
  static by(page, selector) {
    return page.locator(selector);
  }
}

export default BaseLocators;
