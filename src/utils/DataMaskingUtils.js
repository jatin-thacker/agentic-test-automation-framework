export class DataMaskingUtils {
  static isSensitiveLabel(label = "") {
    const lowered = String(label).toLowerCase();
    return ["password", "secret", "token", "credential", "key"].some((k) => lowered.includes(k));
  }

  static maskValue(value) {
    if (value === null || value === undefined) return value;
    const text = String(value);
    if (text.length <= 2) return "***";
    return `${text[0]}***${text[text.length - 1]}`;
  }

  static maybeMask(label, value) {
    return this.isSensitiveLabel(label) ? this.maskValue(value) : value;
  }
}

export default DataMaskingUtils;
