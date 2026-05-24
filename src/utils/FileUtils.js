import path from "node:path";
import fs from "fs-extra";

export class FileUtils {
  static resolveFromRoot(...segments) {
    return path.resolve(process.cwd(), ...segments);
  }

  static async ensureDir(dirPath) {
    await fs.ensureDir(dirPath);
  }

  static async writeJson(filePath, data) {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeJson(filePath, data, { spaces: 2 });
  }

  static async writeText(filePath, content) {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, "utf-8");
  }

  static async readJson(filePath, fallback = null) {
    try {
      return await fs.readJson(filePath);
    } catch {
      return fallback;
    }
  }

  static async readText(filePath, fallback = "") {
    try {
      return await fs.readFile(filePath, "utf-8");
    } catch {
      return fallback;
    }
  }

  static async listFilesRecursive(rootDir) {
    const results = [];
    async function walk(current) {
      const entries = await fs.readdir(current, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
          results.push(fullPath);
        }
      }
    }
    await walk(rootDir);
    return results;
  }

  static async latestSubDirectory(rootDir) {
    const exists = await fs.pathExists(rootDir);
    if (!exists) return null;
    const entries = (await fs.readdir(rootDir, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
    if (entries.length === 0) return null;
    return path.join(rootDir, entries[entries.length - 1]);
  }
}

export default FileUtils;
