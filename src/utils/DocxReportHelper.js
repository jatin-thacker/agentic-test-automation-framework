import path from "node:path";
import fs from "fs-extra";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  ImageRun,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
  HeadingLevel,
  VerticalAlign,
  PageBreak,
  LineRuleType,
} from "docx";
import { LoggerUtils } from "./LoggerUtils.js";
import { ReportGenerationError } from "../errors/ReportGenerationError.js";

// ─── Colour palette ──────────────────────────────────────────────────────────
const COLORS = {
  headerBg:   "1E3A5F", // deep navy
  headerText: "FFFFFF",
  passedBg:   "D6F5E3", // soft green
  passedText: "1A7340",
  failedBg:   "FDDEDE", // soft red
  failedText: "B91C1C",
  skippedBg:  "FEF9C3", // soft yellow
  skippedText:"92400E",
  tableBorder:"BFCFE7",
  altRow:     "F0F4FA", // light blue-grey for alternate rows
  white:      "FFFFFF",
  accent:     "2563EB", // electric blue for headings
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function ms(ns) {
  return ns ? `${(ns / 1_000_000).toFixed(0)} ms` : "—";
}

function statusColors(status) {
  const s = (status || "").toLowerCase();
  if (s === "passed")  return { bg: COLORS.passedBg,  fg: COLORS.passedText };
  if (s === "failed")  return { bg: COLORS.failedBg,  fg: COLORS.failedText };
  return { bg: COLORS.skippedBg, fg: COLORS.skippedText };
}

function statusEmoji(status) {
  const s = (status || "").toLowerCase();
  if (s === "passed")  return "✅";
  if (s === "failed")  return "❌";
  return "⏭";
}

function cell(text, { bold = false, color = "000000", bg, width, vAlign } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    verticalAlign: vAlign || VerticalAlign.CENTER,
    shading: bg ? { type: ShadingType.SOLID, color: bg, fill: bg } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 4, color: COLORS.tableBorder },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.tableBorder },
      left:   { style: BorderStyle.SINGLE, size: 4, color: COLORS.tableBorder },
      right:  { style: BorderStyle.SINGLE, size: 4, color: COLORS.tableBorder },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: 240, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({ text: String(text), bold, color }),
        ],
      }),
    ],
  });
}

function headerCell(text, width) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: { type: ShadingType.SOLID, color: COLORS.headerBg, fill: COLORS.headerBg },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 4, color: COLORS.headerBg },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.headerBg },
      left:   { style: BorderStyle.SINGLE, size: 4, color: COLORS.headerBg },
      right:  { style: BorderStyle.SINGLE, size: 4, color: COLORS.headerBg },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({ text, bold: true, color: COLORS.headerText, size: 20 }),
        ],
      }),
    ],
  });
}

// ─── Main class ──────────────────────────────────────────────────────────────
export class DocxReportHelper {
  constructor(options = {}) {
    this.logger = options.logger || new LoggerUtils();
    this.outputDir = path.resolve(process.cwd(), "src/reports/html-report");
    this.screenshotDir = path.resolve(process.cwd(), "src/reports/screenshots");
    this.cucumberJsonPath = path.resolve(
      process.cwd(),
      "src/reports/cucumber-json/cucumber-report.json"
    );
  }

  async generate(fileName = "test-execution-report.docx") {
    try {
      await fs.ensureDir(this.outputDir);

      // ── Load cucumber JSON ──────────────────────────────────────────────────
      const features = (await fs.pathExists(this.cucumberJsonPath))
        ? await fs.readJson(this.cucumberJsonPath)
        : [];

      // ── Aggregate metrics ───────────────────────────────────────────────────
      let totalScenarios = 0, passed = 0, failed = 0, skipped = 0;
      let totalDurationNs = 0;
      const runDate = new Date();

      for (const feature of features) {
        for (const scenario of (feature.elements || [])) {
          totalScenarios++;
          let scenarioFailed = false;
          for (const step of (scenario.steps || [])) {
            if (step.hidden) continue;
            const dur = step.result?.duration || 0;
            totalDurationNs += dur;
            if (step.result?.status === "failed") scenarioFailed = true;
          }
          if (scenarioFailed) failed++;
          else {
            const allStatuses = (scenario.steps || [])
              .filter(s => !s.hidden)
              .map(s => s.result?.status);
            if (allStatuses.every(s => s === "skipped" || s === "pending")) skipped++;
            else passed++;
          }
        }
      }

      const passRate = totalScenarios > 0
        ? `${((passed / totalScenarios) * 100).toFixed(1)}%`
        : "N/A";
      const totalDurationMs = (totalDurationNs / 1_000_000).toFixed(0);

      // ── Document children ───────────────────────────────────────────────────
      const children = [];

      // Title
      children.push(
        new Paragraph({
          heading: HeadingLevel.TITLE,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: "Test Execution Report",
              bold: true,
              color: COLORS.accent,
              size: 56,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: `Generated: ${runDate.toLocaleString()}   |   Application: SauceDemo`,
              color: "555555",
              size: 20,
            }),
          ],
        })
      );

      // ── Executive Summary Table ─────────────────────────────────────────────
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 160 },
          children: [new TextRun({ text: "Executive Summary", bold: true, color: COLORS.accent })],
        })
      );

      const summaryTable = new Table({
        width: { size: 9000, type: WidthType.DXA },
        rows: [
          new TableRow({ children: [headerCell("Metric", 3500), headerCell("Value", 5500)] }),
          new TableRow({ children: [cell("Run Date / Time", { bold: true }), cell(runDate.toLocaleString())] }),
          new TableRow({ children: [cell("Total Scenarios", { bold: true }), cell(String(totalScenarios))] }),
          new TableRow({
            children: [
              cell("Passed", { bold: true }),
              cell(`${statusEmoji("passed")} ${passed}`, { bg: COLORS.passedBg, color: COLORS.passedText }),
            ],
          }),
          new TableRow({
            children: [
              cell("Failed", { bold: true }),
              cell(`${statusEmoji("failed")} ${failed}`, {
                bg: failed > 0 ? COLORS.failedBg : COLORS.white,
                color: failed > 0 ? COLORS.failedText : "000000",
              }),
            ],
          }),
          new TableRow({ children: [cell("Skipped", { bold: true }), cell(String(skipped))] }),
          new TableRow({ children: [cell("Pass Rate", { bold: true, color: COLORS.passedText }), cell(passRate, { bold: true, color: COLORS.passedText })] }),
          new TableRow({ children: [cell("Total Duration", { bold: true }), cell(`${totalDurationMs} ms`)] }),
        ],
      });
      children.push(summaryTable);
      children.push(new Paragraph({ spacing: { after: 400 } }));

      // ── Per-feature / per-scenario sections ─────────────────────────────────
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 160 },
          children: [new TextRun({ text: "Scenario Details", bold: true, color: COLORS.accent })],
        })
      );

      for (const feature of features) {
        // Feature heading
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 280, after: 80 },
            children: [
              new TextRun({ text: `Feature: ${feature.name || "Unnamed Feature"}`, bold: true, color: COLORS.accent }),
            ],
          })
        );

        for (const scenario of (feature.elements || [])) {
          const visibleSteps = (scenario.steps || []).filter(s => !s.hidden);
          const scenarioPassed = visibleSteps.every(s => s.result?.status === "passed");
          const scenarioStatus = scenarioPassed ? "passed" : "failed";
          const { bg: scenarioBg } = statusColors(scenarioStatus);

          // Scenario heading pill
          children.push(
            new Paragraph({
              spacing: { before: 200, after: 80 },
              children: [
                new TextRun({ text: `${statusEmoji(scenarioStatus)}  `, size: 22 }),
                new TextRun({
                  text: `Scenario: ${scenario.name || "Unnamed"}`,
                  bold: true,
                  size: 22,
                  color: scenarioPassed ? COLORS.passedText : COLORS.failedText,
                }),
                new TextRun({
                  text: `   [${scenario.tags?.map(t => t.name).join(", ") || ""}]`,
                  size: 18,
                  color: "888888",
                }),
              ],
            })
          );

          // Steps table
          const stepRows = [
            new TableRow({
              children: [
                headerCell("#", 400),
                headerCell("Step", 4800),
                headerCell("Status", 1500),
                headerCell("Duration", 1300),
              ],
            }),
          ];

          let stepIndex = 0;
          for (const step of visibleSteps) {
            stepIndex++;
            const status = step.result?.status || "skipped";
            const { bg, fg } = statusColors(status);
            const isAltRow = stepIndex % 2 === 0;
            const rowBg = status !== "passed" ? bg : (isAltRow ? COLORS.altRow : COLORS.white);

            stepRows.push(
              new TableRow({
                children: [
                  cell(String(stepIndex), { bg: rowBg }),
                  cell(`${step.keyword?.trim() || ""} ${step.name || ""}`, { bg: rowBg }),
                  cell(`${statusEmoji(status)} ${status.toUpperCase()}`, { bg, color: fg, bold: true }),
                  cell(ms(step.result?.duration), { bg: rowBg }),
                ],
              })
            );

            // Embed failure message if present
            if (status === "failed" && step.result?.error_message) {
              stepRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      columnSpan: 4,
                      shading: { type: ShadingType.SOLID, color: "FFF5F5", fill: "FFF5F5" },
                      margins: { top: 80, bottom: 80, left: 200, right: 200 },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.failedBg },
                        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.failedBg },
                        left: { style: BorderStyle.THICK, size: 12, color: COLORS.failedText },
                        right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.failedBg },
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Error: ${step.result.error_message.split("\n")[0]}`,
                              color: COLORS.failedText,
                              size: 18,
                              font: "Courier New",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                })
              );
            }
          }

          children.push(
            new Table({ width: { size: 8000, type: WidthType.DXA }, rows: stepRows })
          );

          // Embed screenshots for failed scenarios
          if (!scenarioPassed) {
            await this.#embedScreenshots(children, scenario.name || "");
          }

          children.push(new Paragraph({ spacing: { after: 200 } }));
        }
      }

      // ── Build document with header/footer ──────────────────────────────────
      const doc = new Document({
        creator: "Agentic Test Automation Framework",
        title: "Test Execution Report",
        description: "Auto-generated test execution report",
        styles: {
          paragraphStyles: [
            {
              id: "Normal",
              name: "Normal",
              run: { font: "Calibri", size: 22 },
            },
          ],
        },
        sections: [
          {
            properties: {
              page: {
                margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 },
              },
              pageNumberStart: 1,
              pageNumberFormatType: NumberFormat.DECIMAL,
            },
            headers: {
              default: new Header({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.LEFT,
                    border: {
                      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.accent },
                    },
                    children: [
                      new TextRun({ text: "SauceDemo  |  Agentic Test Automation Framework  |  Test Execution Report", size: 18, color: "555555" }),
                    ],
                  }),
                ],
              }),
            },
            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    border: {
                      top: { style: BorderStyle.SINGLE, size: 6, color: COLORS.accent },
                    },
                    children: [
                      new TextRun({ text: `Generated: ${runDate.toLocaleDateString()}   |   Page `, size: 18, color: "555555" }),
                      new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "555555" }),
                      new TextRun({ text: " of ", size: 18, color: "555555" }),
                      new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "555555" }),
                    ],
                  }),
                ],
              }),
            },
            children,
          },
        ],
      });

      const outPath = path.join(this.outputDir, fileName);
      const buffer = await Packer.toBuffer(doc);
      await fs.writeFile(outPath, buffer);
      await this.logger.info(`DOCX report generated: ${outPath}`);
      return outPath;
    } catch (error) {
      throw new ReportGenerationError("Failed to generate DOCX report", { cause: error.message });
    }
  }

  // ── Embed screenshot images for a failed scenario ─────────────────────────
  async #embedScreenshots(children, scenarioName) {
    try {
      if (!(await fs.pathExists(this.screenshotDir))) return;
      const allFiles = await fs.readdir(this.screenshotDir);

      // Match screenshots by scenario name slug (kebab-case comparison)
      const slug = scenarioName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const matches = allFiles.filter(f =>
        f.endsWith(".png") &&
        (f.toLowerCase().includes(slug) || f.toLowerCase().includes("failed"))
      );

      if (matches.length === 0) return;

      children.push(
        new Paragraph({
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({ text: "📸 Failure Screenshot(s)", bold: true, color: COLORS.failedText, size: 20 }),
          ],
        })
      );

      for (const file of matches.slice(0, 3)) {
        const imgPath = path.join(this.screenshotDir, file);
        const imgBuffer = await fs.readFile(imgPath);
        children.push(
          new Paragraph({
            spacing: { after: 120 },
            alignment: AlignmentType.LEFT,
            children: [
              new ImageRun({
                data: imgBuffer,
                transformation: { width: 600, height: 340 },
                type: "png",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: file, italics: true, color: "888888", size: 16 }),
            ],
          })
        );
      }
    } catch {
      // Screenshot embedding is best-effort; silently skip on error
    }
  }
}

export default DocxReportHelper;
