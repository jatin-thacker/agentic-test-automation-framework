/**
 * Checkout Test Data
 * Standard and edge case test data for checkout flow testing
 */

export const CheckoutTestData = Object.freeze({
  /**
   * Standard/Happy Path test data
   */
  standard: {
    firstName: "Jatin",
    lastName: "Tester",
    postalCode: "M5H 1H1",
    description: "Standard Canadian postal code format"
  },

  /**
   * Edge case: Names with special characters
   */
  edge: {
    withSpecialChars: {
      firstName: "Jean-Marc",
      lastName: "O'Brien",
      postalCode: "A1B-2C3",
      description: "Names with hyphens and apostrophes, alphanumeric postal code"
    },
    longNames: {
      firstName: "Christopher",
      lastName: "Williamson",
      postalCode: "12345",
      description: "Longer names with standard numeric postal code"
    },
    singleCharNames: {
      firstName: "J",
      lastName: "D",
      postalCode: "00000",
      description: "Minimum valid single-character names"
    }
  },

  /**
   * Invalid/boundary case data for error validation
   */
  invalid: {
    emptyFirstName: {
      firstName: "",
      lastName: "Smith",
      postalCode: "12345",
      description: "Empty first name - should be rejected"
    },
    emptyLastName: {
      firstName: "John",
      lastName: "",
      postalCode: "12345",
      description: "Empty last name - should be rejected"
    },
    emptyPostalCode: {
      firstName: "John",
      lastName: "Smith",
      postalCode: "",
      description: "Empty postal code - should be rejected"
    },
    allFieldsEmpty: {
      firstName: "",
      lastName: "",
      postalCode: "",
      description: "All fields empty - should be rejected"
    }
  }
});

/**
 * Helper to get test data by category and key
 * @param {string} category - "standard", "edge", "invalid"
 * @param {string} key - data key within category
 * @returns {object} Test data object with firstName, lastName, postalCode, description
 */
export function getCheckoutTestData(category, key = "standard") {
  if (category === "standard") {
    return CheckoutTestData.standard;
  }
  if (category === "edge" && key) {
    return CheckoutTestData.edge[key];
  }
  if (category === "invalid" && key) {
    return CheckoutTestData.invalid[key];
  }
  throw new Error(`Invalid test data category '${category}' or key '${key}'`);
}

export default CheckoutTestData;
