import path from "node:path";
import ExcelJS from "exceljs";
import actionLogStore from "./ActionLogStore.js";
import { ACTION_STATUS, ACTION_TYPES } from "./Constants.js";
import { DateUtils } from "./DateUtils.js";
import { LoggerUtils } from "./LoggerUtils.js";
import { ExcelDataError } from "../errors/ExcelDataError.js";

export class ExcelHelper {
  /**
   * @param {object} [options]
   * @param {LoggerUtils} [options.logger]
   */
  constructor(options = {}) {
    this.logger = options.logger || new LoggerUtils();
  }

  async readRow(filePath, sheetName, rowName) {
    const description = `Read Excel row '${rowName}' from ${sheetName}`;
    await this.logger.info(description);
    actionLogStore.add({
      timestamp: DateUtils.nowIso(),
      actionType: ACTION_TYPES.EXCEL,
      description,
      status: ACTION_STATUS.STARTED
    });
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(path.resolve(process.cwd(), filePath));
      const sheet = workbook.getWorksheet(sheetName);
      if (!sheet) {
        throw new ExcelDataError(`Sheet not found: ${sheetName}`);
      }
      const header = sheet.getRow(1).values.slice(1);
      let matched = null;
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const values = row.values.slice(1);
        if (String(values[0]) === String(rowName)) {
          matched = values;
        }
      });
      if (!matched) {
        throw new ExcelDataError(`RowName not found: ${rowName}`);
      }
      const obj = {};
      header.forEach((key, idx) => {
        obj[key] = matched[idx];
      });
      actionLogStore.add({
        timestamp: DateUtils.nowIso(),
        actionType: ACTION_TYPES.EXCEL,
        description: `${description} succeeded`,
        status: ACTION_STATUS.PASSED
      });
      return obj;
    } catch (error) {
      actionLogStore.add({
        timestamp: DateUtils.nowIso(),
        actionType: ACTION_TYPES.EXCEL,
        description: `${description} failed`,
        status: ACTION_STATUS.FAILED,
        errorMessage: error.message
      });
      if (error instanceof ExcelDataError) throw error;
      throw new ExcelDataError("Failed to read Excel data", { cause: error.message });
    }
  }

  async writeRows(filePath, sheetName, columns, rows) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);
    sheet.addRow(columns);
    for (const row of rows) {
      sheet.addRow(columns.map((c) => row[c] ?? ""));
    }
    await workbook.xlsx.writeFile(path.resolve(process.cwd(), filePath));
    return filePath;
  }
}

export default ExcelHelper;
