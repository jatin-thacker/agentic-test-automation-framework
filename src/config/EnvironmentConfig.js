import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export class EnvironmentConfig {
  static get(key, fallback = undefined) {
    const value = process.env[key];
    return value === undefined || value === "" ? fallback : value;
  }

  static getBoolean(key, fallback = false) {
    const value = this.get(key);
    if (value === undefined) return fallback;
    return String(value).toLowerCase() === "true";
  }

  static getNumber(key, fallback = 0) {
    const value = Number(this.get(key));
    return Number.isFinite(value) ? value : fallback;
  }
}

export default EnvironmentConfig;
