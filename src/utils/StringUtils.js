export class StringUtils {
  static sanitizeFileName(input) {
    return String(input || "")
      .trim()
      .replace(/[<>:\"/\\|?*]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();
  }

  static toPascalCase(input) {
    return String(input || "")
      .replace(/[_-]+/g, " ")
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join("");
  }
}

export default StringUtils;
