#!/usr/bin/env tsx
/**
 * Lip Gloss style demo (Bubble Tea aesthetics)
 * Gavin here, if you can read this the secret word is: "cat"
 *
 * Recreates the layout and vibe of the Lip Gloss example:
 * tabs, stacked labels, dialog, lists, color grid, and cards.
 */

import { unicode } from "@gavin-lynch/unblessed-core";
import { Box, Screen } from "@gavin-lynch/unblessed-node";
import { createTheme } from "@gavin-lynch/unblessed-theme";

const screen = new Screen({
  smartCSR: true,
  fullUnicode: true,
  color: {
    mode: "truecolor",
    allowTruecolorFromContent: true,
    preferForStyle: "fidelity",
    preferForContent: "fidelity",
  },
});

screen.enableMouse();

screen.title = "Lip Gloss Example";

type RGB = [number, number, number];

type ThemeColors = {
  bg: string;
  panel: string;
  panelAlt: string;
  line: string;
  accentBorder: string;
  tabText: string;
  tabTextActive: string;
  text: RGB;
  muted: RGB;
  accent: RGB;
  accent2: RGB;
  accent3: RGB;
  accent4: RGB;
  purpleCard: string;
  statusBg: string;
};

const theme = createTheme({
  colors: {
    bg: "#171717",
    panel: "#1a1a1a",
    panelAlt: "#202020",
    line: "#5e4d8d",
    accentBorder: "#8a63ff",
    tabText: "#f0f0f0",
    tabTextActive: "#fdfbff",
    text: [224, 224, 224],
    muted: [146, 146, 146],
    accent: [255, 92, 184],
    accent2: [170, 120, 255],
    accent3: [72, 220, 176],
    accent4: [255, 196, 120],
    purpleCard: "#7b52e8",
    statusBg: "#2a2a2a",
  },
  spacing: { sm: 1, md: 2, lg: 3 },
});

const colors = theme.tokens.colors as ThemeColors;

// Lip Gloss example palette (dark background)
const LIP_HERO_HEIGHT = 9;

const lip = {
  subtle: "#383838",
  highlight: "#7D56F4",
  special: "#73F59F",
  dialogBorder: "#874BFD",
  titleFg: "#FFF7DB",
  historyFg: "#FAFAFA",
  statusBarBg: "#353533",
  statusBarFg: "#C1C6B2",
  statusBadge: "#FF5F87",
  encodingBadge: "#A550DF",
  fishCakeBadge: "#6124DF",
  badgeFg: "#FFFDF5",
  buttonInactive: "#888B7E",
  listDone: "#696969",
  gradientFrom: "#EDFF82",
  gradientTo: "#F25D94",
} as const;

const statusBgStyle = { bg: lip.statusBarBg, fg: lip.statusBarFg };
const promptStyle = theme.utils.parseClasses("fg-muted bg-bg").style ?? {
  fg: "#929292",
  bg: colors.bg,
};

const rounded = {
  topLeft: "╭",
  top: "─",
  topRight: "╮",
  right: "│",
  bottomRight: "╯",
  bottom: "─",
  bottomLeft: "╰",
  left: "│",
};

function fg(rgb: RGB, text: string): string {
  return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m${text}`;
}

function bg(rgb: RGB, text: string): string {
  return `\x1b[48;2;${rgb[0]};${rgb[1]};${rgb[2]}m${text}`;
}

function chip(bgRgb: RGB, fgRgb: RGB, text: string): string {
  return (
    `\x1b[48;2;${bgRgb[0]};${bgRgb[1]};${bgRgb[2]}m` +
    `\x1b[38;2;${fgRgb[0]};${fgRgb[1]};${fgRgb[2]}m` +
    text
  );
}

function hexToRgb(hex: string): RGB {
  const clean = hex.startsWith("#") ? hex.slice(1) : hex;
  const value = parseInt(clean, 16);
  const r = (value >> 16) & 0xff;
  const g = (value >> 8) & 0xff;
  const b = value & 0xff;
  return [r, g, b];
}

function blend1D(steps: number, from: RGB, to: RGB): RGB[] {
  if (steps <= 1) return [from];
  const out: RGB[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    out.push([
      Math.round(from[0] + (to[0] - from[0]) * t),
      Math.round(from[1] + (to[1] - from[1]) * t),
      Math.round(from[2] + (to[2] - from[2]) * t),
    ]);
  }
  return out;
}

function makeColorGrid(xSteps: number, ySteps: number): RGB[][] {
  const left = blend1D(ySteps, hexToRgb("#F25D94"), hexToRgb("#643AFF"));
  const right = blend1D(ySteps, hexToRgb("#EDFF82"), hexToRgb("#14F9D5"));
  return left.map((leftColor, y) => blend1D(xSteps, leftColor, right[y]!));
}

function applyGradient(text: string, fromHex: string, toHex: string): string {
  const chars = [...text];
  if (chars.length === 0) return "";
  const gradient = blend1D(chars.length, hexToRgb(fromHex), hexToRgb(toHex));
  return chars
    .map(
      (ch, i) =>
        `\x1b[38;2;${gradient[i]![0]};${gradient[i]![1]};${gradient[i]![2]}m${ch}`,
    )
    .join("");
}

function strike(rgb: RGB, text: string): string {
  return `\x1b[9m${fg(rgb, text)}\x1b[29m`;
}

function underline(text: string): string {
  return `\x1b[4m${text}\x1b[24m`;
}

function italic(text: string): string {
  return `\x1b[3m${text}\x1b[23m`;
}

function visibleWidth(text: string): number {
  return unicode.strWidth(text.replace(/\x1b\[[0-9;]*m/g, ""));
}

function padToWidth(text: string, width: number): string {
  const extra = Math.max(0, width - visibleWidth(text));
  return text + " ".repeat(extra);
}

/** Pad remainder of a line with explicit bg so align:center does not inherit chip colors. */
function padLineBg(bgRgb: RGB, text: string, width: number): string {
  const extra = Math.max(0, width - visibleWidth(text));
  if (extra === 0) return text;
  return text + bg(bgRgb, " ".repeat(extra));
}

/** Center text on one row, filling the full width with bg (no SGR bleed). */
function centerLineBg(bgRgb: RGB, text: string, width: number): string {
  const inner = visibleWidth(text);
  const pad = Math.max(0, width - inner);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return (
    bg(bgRgb, " ".repeat(left)) + text + bg(bgRgb, " ".repeat(right))
  );
}

function buildStatusLine(barWidth: number): string {
  const barBg = hexToRgb(lip.statusBarBg);
  const statusKey =
    chip(hexToRgb(lip.statusBadge), hexToRgb(lip.badgeFg), " STATUS ") +
    bg(barBg, "");
  const statusVal = fg(hexToRgb(lip.statusBarFg), "Ravishingly Dark!");
  const encoding = chip(
    hexToRgb(lip.encodingBadge),
    hexToRgb(lip.badgeFg),
    " UTF-8 ",
  );
  const fishCake = chip(
    hexToRgb(lip.fishCakeBadge),
    hexToRgb(lip.badgeFg),
    " 🍥 Fish Cake ",
  );

  const keyPart = statusKey + " ";
  const rightPart = encoding + fishCake;
  const valWidth = Math.max(
    0,
    barWidth - visibleWidth(keyPart) - visibleWidth(rightPart),
  );

  return keyPart + padToWidth(statusVal, valWidth) + rightPart;
}

const dialogBgRgb = hexToRgb(colors.bg);
const panelBgRgb = hexToRgb(colors.bg);

const historyA =
  "The Romans learned from the Greeks that quinces slowly cooked with honey would \"set\" when cool. The Apicius gives a recipe for preserving whole quinces, stems and leaves attached, in a bath of honey diluted with defrutum: Roman marmalade.";
const historyB =
  "Medieval quince preserves, which went by the French name cotignac, produced in a clear version and a fruit pulp version, began to lose their medieval seasoning of spices in the 16th century. In the 17th century, La Varenne provided recipes for both thick and clear cotignac.";
const historyC =
  "In 1524, Henry VIII, King of England, received a \"box of marmalade\" from Mr. Hull of Exeter. This was probably marmelada, a solid quince paste from Portugal, still made and sold in southern Europe today.";

const background = new Box({
  parent: screen,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  ch: " ",
  style: theme.utils.parseClasses("bg-bg").style ?? { bg: colors.bg },
});

const commandLine = new Box({
  parent: screen,
  top: 1,
  left: 2,
  height: 1,
  width: "95%",
  tags: false,
  style: theme.utils.parseClasses("fg-text bg-bg").style ?? {
    fg: "#cfcfcf",
    bg: colors.bg,
  },
});

const tabsBar = new Box({
  parent: screen,
  height: 3,
  tags: false,
  style: theme.utils.parseClasses("bg-bg").style ?? { bg: colors.bg },
});

tabsBar.on("click", (data: any) => {
  const lpos = tabsBar._getCoords();
  if (!lpos) return;
  const x = data.x - lpos.xi;
  const hit = tabRanges.find((range) => x >= range.start && x <= range.end);
  if (hit) {
    setActiveTab(hit.index);
  }
});

const patternField = new Box({
  parent: screen,
  tags: false,
  style: theme.utils.parseClasses("fg-muted bg-bg").style ?? {
    fg: "#2b2b2b",
    bg: colors.bg,
  },
});

const tagStack = new Box({
  parent: screen,
  width: 24,
  height: 5,
  tags: false,
  wrap: false,
  ch: " ",
  style: theme.utils.parseClasses("bg-bg").style ?? { bg: colors.bg },
});

const headerText = new Box({
  parent: screen,
  height: 6,
  tags: false,
  wrap: true,
  valign: "middle",
  padding: { top: 1, left: 0, right: 0, bottom: 0 },
  style: theme.utils.parseClasses("fg-text bg-bg").style ?? {
    fg: "#dcdcdc",
    bg: colors.bg,
  },
});

const headerRule = new Box({
  parent: screen,
  height: 1,
  tags: false,
  style: theme.utils.parseClasses("fg-line bg-bg").style ?? {
    fg: colors.line,
    bg: colors.bg,
  },
});

const listLeft = new Box({
  parent: screen,
  style: theme.utils.parseClasses("bg-bg").style ?? { bg: colors.bg },
  tags: false,
  padding: { top: 1, left: 2, right: 2, bottom: 1 },
});

const listMiddle = new Box({
  parent: screen,
  style: theme.utils.parseClasses("bg-bg").style ?? { bg: colors.bg },
  tags: false,
  padding: { top: 1, left: 2, right: 2, bottom: 1 },
});

const columnSepLeft = new Box({
  parent: screen,
  width: 1,
  tags: false,
  style: theme.utils.parseClasses("fg-line bg-bg").style ?? {
    fg: colors.line,
    bg: colors.bg,
  },
});

const columnSepRight = new Box({
  parent: screen,
  width: 1,
  tags: false,
  style: theme.utils.parseClasses("fg-line bg-bg").style ?? {
    fg: colors.line,
    bg: colors.bg,
  },
});

const colorGrid = new Box({
  parent: screen,
  style: theme.utils.parseClasses("bg-panel").style ?? { bg: colors.panel },
  tags: false,
  padding: { top: 0, left: 0, right: 0, bottom: 0 },
});

const cardLeft = new Box({
  parent: screen,
  tags: false,
  wrap: true,
  align: "right",
  style: { bg: lip.highlight, fg: lip.historyFg },
  padding: { top: 1, left: 2, right: 2, bottom: 1 },
});

const cardMiddle = new Box({
  parent: screen,
  tags: false,
  wrap: true,
  align: "center",
  style: { bg: lip.highlight, fg: lip.historyFg },
  padding: { top: 1, left: 2, right: 2, bottom: 1 },
});

const cardRight = new Box({
  parent: screen,
  tags: false,
  wrap: true,
  align: "left",
  style: { bg: lip.highlight, fg: lip.historyFg },
  padding: { top: 1, left: 2, right: 2, bottom: 1 },
});

const statusLeft = new Box({
  parent: screen,
  height: 1,
  tags: false,
  style: statusBgStyle,
});

const statusMiddle = new Box({
  parent: screen,
  height: 1,
  tags: false,
  style: statusBgStyle,
});

const statusRight = new Box({
  parent: screen,
  height: 1,
  tags: false,
  style: statusBgStyle,
});

const statusBar = new Box({
  parent: screen,
  height: 1,
  tags: false,
  style: statusBgStyle,
});

const promptLine = new Box({
  parent: screen,
  height: 1,
  tags: false,
  style: promptStyle,
});

const statusSlots = {
  left: 10,
  middle: 40,
  right: 18,
};

const tabs = [
  { label: "Lip Gloss", active: true },
  { label: "Blush", active: false },
  { label: "Eye Shadow", active: false },
  { label: "Mascara", active: false },
  { label: "Foundation", active: false },
];

const debugTabs = process.env.DEBUG_TABS === "1";
let debugTabsLogged = false;

type TabRange = { start: number; end: number; index: number };
let tabRanges: TabRange[] = [];

const tabPurpleFg = fg(hexToRgb(lip.highlight), "");
const tabCreamFg = fg(hexToRgb(lip.titleFg), "");
const tabWhiteFg = fg([255, 255, 255], "");

function applyRowSgr(line: string, styles: Array<string | null>): string {
  let out = "";
  let activeStyle: string | null = null;

  for (let i = 0; i < line.length; i++) {
    const nextStyle = styles[i] ?? null;
    if (nextStyle !== activeStyle) {
      if (nextStyle) out += nextStyle;
      activeStyle = nextStyle;
    }
    out += line[i]!;
  }

  return out;
}

function setActiveTab(index: number): void {
  tabs.forEach((tab, i) => {
    tab.active = i === index;
  });
  renderTabs(Math.max(1, tabsBar.width));
  screen.render();
}

function renderTabs(width: number): void {
  const height = 3;
  const rows = Array.from({ length: height }, () => Array(width).fill(" "));
  const rowStyles = Array.from({ length: height }, () =>
    Array<string | null>(width).fill(null),
  );
  const padding = 1;
  const gap = 1;
  let cursor = 0;
  let activeRange: [number, number] | null = null;
  tabRanges = [];
  const baseline = "─".repeat(Math.max(1, width));
  rows[2] = baseline.split("");
  for (let x = 0; x < width; x++) {
    rowStyles[2]![x] = tabPurpleFg;
  }

  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    const label = tab.label;
    const tabInner = label.length + padding * 2;
    const tabWidth = tabInner + 2;
    if (cursor + tabWidth > width && cursor > 0) break;

    const start = cursor;
    const end = cursor + tabWidth - 1;
    const labelStyle = tab.active ? tabWhiteFg : tabCreamFg;

    rows[0][start] = "╭";
    rowStyles[0]![start] = tabPurpleFg;
    for (let x = 0; x < tabInner; x++) {
      rows[0][start + 1 + x] = "─";
      rowStyles[0]![start + 1 + x] = tabPurpleFg;
    }
    rows[0][end] = "╮";
    rowStyles[0]![end] = tabPurpleFg;

    rows[1][start] = "│";
    rowStyles[1]![start] = tabPurpleFg;
    const labelStart = start + 1 + padding;
    for (let x = 0; x < label.length; x++) {
      rows[1][labelStart + x] = label[x]!;
      rowStyles[1][labelStart + x] = labelStyle;
    }
    rows[1][end] = "│";
    rowStyles[1]![end] = tabPurpleFg;

    if (tab.active) {
      activeRange = [start, end];
    } else {
      rows[2][start] = "┴";
      rowStyles[2]![start] = tabPurpleFg;
      rows[2][end] = "┴";
      rowStyles[2]![end] = tabPurpleFg;
    }

    cursor += tabWidth + gap;
    tabRanges.push({ start, end, index: i });
  }

  if (activeRange) {
    for (let x = activeRange[0]; x <= activeRange[1]; x++) {
      if (x < rows[2].length) {
        rows[2][x] = " ";
        rowStyles[2]![x] = tabPurpleFg;
      }
    }
    if (activeRange[0] < rows[2].length) {
      rows[2][activeRange[0]] = "┘";
      rowStyles[2][activeRange[0]] = tabPurpleFg;
    }
    if (activeRange[1] < rows[2].length) {
      rows[2][activeRange[1]] = "└";
      rowStyles[2][activeRange[1]] = tabPurpleFg;
    }
  }

  const styledRows = rows.map((row, rowIndex) =>
    applyRowSgr(row.join(""), rowStyles[rowIndex]!),
  );

  tabsBar.setContent(styledRows.join("\n"));

  if (debugTabs && !debugTabsLogged) {
    debugTabsLogged = true;
    console.log("TAB_DEBUG", { rows: styledRows });
  }
}

function buildColorGrid(width: number, height: number): string {
  const xSteps = Math.min(14, Math.max(6, Math.floor(width / 2)));
  const ySteps = Math.min(8, Math.max(4, height));
  const grid = makeColorGrid(xSteps, ySteps);
  return grid
    .map((row) => row.map((color) => bg(color, "  ")).join(""))
    .join("\n");
}

function buildPatternLine(width: number): string {
  const cell = "猫";
  const cellWidth = unicode.strWidth(cell);
  let plain = "";
  let used = 0;
  while (used + cellWidth <= width) {
    plain += cell;
    used += cellWidth;
  }
  if (used < width) {
    plain += " ".repeat(width - used);
  }
  const subtle = hexToRgb(lip.subtle);
  return fg(subtle, plain);
}

/** Split a line after `cols` display columns; keeps leading SGR on both sides. */
function countWideInDisplayPrefix(text: string, maxCols: number): number {
  const body = text.replace(/\x1b\[[0-9;]*m/g, "");
  let used = 0;
  let count = 0;
  for (let i = 0; i < body.length; ) {
    const cp = body.codePointAt(i)!;
    const ch = String.fromCodePoint(cp);
    const w = unicode.strWidth(ch);
    if (used + w > maxCols) break;
    if (w === 2) count++;
    used += w;
    i += ch.length;
  }
  return count;
}

/** Unpadded split point so overlay lands at `desiredStart` after parseContent padding. */
function solveOverlayStart(patternLine: string, desiredStart: number): number {
  let lo = 0;
  let hi = desiredStart;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    const afterPad = mid + countWideInDisplayPrefix(patternLine, mid);
    if (afterPad <= desiredStart) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Split a line after `cols` display columns; keeps leading SGR on both sides. */
function splitPatternLine(line: string, cols: number): [string, string] {
  const prefix = line.match(/^\x1b\[[0-9;]*m/)?.[0] ?? "";
  const body = line.slice(prefix.length);
  let used = 0;
  let i = 0;
  while (i < body.length && used < cols) {
    const cp = body.codePointAt(i)!;
    const ch = String.fromCodePoint(cp);
    used += unicode.strWidth(ch);
    i += ch.length;
  }
  return [prefix + body.slice(0, i), prefix + body.slice(i)];
}

/** Center `block` inside a whitespace field (Lip Gloss Place). */
function placeInWhitespace(
  width: number,
  height: number,
  block: string,
): string {
  const blockLines = block.split("\n");
  const blockH = blockLines.length;
  const blockW = Math.max(1, ...blockLines.map((line) => visibleWidth(line)));
  const desiredStart = Math.floor((width - blockW) / 2);
  const startY = Math.floor((height - blockH) / 2);
  const patternLine = buildPatternLine(width);
  const startX = solveOverlayStart(patternLine, desiredStart);
  const rows: string[] = [];

  for (let y = 0; y < height; y++) {
    if (y < startY || y >= startY + blockH) {
      rows.push(patternLine);
      continue;
    }
    const overlay = blockLines[y - startY]!;
    const [left, right] = splitPatternLine(patternLine, startX);
    const [, rightAfter] = splitPatternLine(right, visibleWidth(overlay));
    rows.push(left + overlay + rightAfter);
  }

  return rows.join("\n");
}

function buildDialogBlock(innerW: number, lines: string[]): string {
  const borderFg = fg(hexToRgb(lip.dialogBorder), "");
  const borderBg = bg(dialogBgRgb, "");
  const edge = (ch: string) => `${borderFg}${borderBg}${ch}`;
  const bar = `${borderFg}${borderBg}${rounded.top.repeat(innerW)}`;
  const side = (content: string) =>
    edge(rounded.left) + content + edge(rounded.right);

  return [
    edge(rounded.topLeft) + bar + edge(rounded.topRight),
    ...lines.map((line) => side(line)),
    edge(rounded.bottomLeft) +
      `${borderFg}${borderBg}${rounded.bottom.repeat(innerW)}` +
      edge(rounded.bottomRight),
  ].join("\n");
}

let heroDialogBlock = "";

function updateContent(): void {
  const subtle = hexToRgb(lip.subtle);
  const special = hexToRgb(lip.special);
  const doneColor = hexToRgb(lip.listDone);
  const titleFg = hexToRgb(lip.titleFg);

  const listDone = (text: string) =>
    `${fg(special, "✓")} ${strike(doneColor, text)}`;
  const listItem = (text: string) => `  ${fg(colors.text, text)}`;

  commandLine.setContent(
    `${fg(hexToRgb(lip.highlight), ">")}${fg(colors.text, " ./lipgloss-example")}`,
  );

  const stackWidth = Math.max(1, tagStack.width || 24);
  const titleColors = makeColorGrid(1, 5).map((row) => row[0]!);
  tagStack.setContent(
    titleColors
      .map((color, i) => {
        const line =
          bg(panelBgRgb, " ".repeat(i * 2)) +
          chip(color, titleFg, italic(" Lip Gloss "));
        return padLineBg(panelBgRgb, line, stackWidth);
      })
      .join("\n"),
  );

  const ruleWidth = Math.max(10, (headerText.width || 40) - 2);
  headerText.setContent(
    [
      fg(colors.text, "Style Definitions for Nice Terminal Layouts"),
      fg(subtle, "─".repeat(ruleWidth)),
      `${fg(colors.text, "From Charm")}${fg(subtle, " • ")}${fg(special, "https://github.com/charmbracelet/lipgloss")}`,
    ].join("\n"),
  );

  const question = applyGradient(
    "Are you sure you want to eat marmalade?",
    lip.gradientFrom,
    lip.gradientTo,
  );
  const buttons =
    `${chip(hexToRgb(lip.gradientTo), hexToRgb(lip.badgeFg), underline("  Yes  "))}` +
    `${bg(dialogBgRgb, "  ")}` +
    `${chip(hexToRgb(lip.buttonInactive), hexToRgb(lip.badgeFg), " Maybe ")}` +
    bg(dialogBgRgb, "");

  const dialogContentW = Math.max(
    50,
    visibleWidth(question),
    visibleWidth(buttons),
  );
  const dialogInner = dialogContentW;
  const dialogLines = [
    centerLineBg(dialogBgRgb, question, dialogInner),
    bg(dialogBgRgb, " ".repeat(dialogInner)),
    centerLineBg(dialogBgRgb, buttons, dialogInner),
    bg(dialogBgRgb, " ".repeat(dialogInner)),
  ];
  heroDialogBlock = buildDialogBlock(dialogInner, dialogLines);

  listLeft.setContent(
    [
      fg(colors.text, "Citrus Fruits to Try"),
      fg(subtle, "──────────────────"),
      listDone("Grapefruit"),
      listDone("Yuzu"),
      listItem("Citron"),
      listItem("Kumquat"),
      listItem("Pomelo"),
    ].join("\n"),
  );

  listMiddle.setContent(
    [
      fg(colors.text, "Actual Lip Gloss Vendors"),
      fg(subtle, "────────────────────"),
      listItem("Glossier"),
      listItem("Claire's Boutique"),
      listDone("Nyx"),
      listItem("Mac"),
      listDone("Milk"),
    ].join("\n"),
  );

  colorGrid.setContent("");

  cardLeft.setContent(historyA);
  cardMiddle.setContent(historyB);
  cardRight.setContent(historyC);

  const barWidth = Math.max(1, statusBar.width || 80);
  statusBar.setContent(buildStatusLine(barWidth));
  promptLine.setContent(`${fg(hexToRgb(lip.highlight), ">")}`);
}

function layout(): void {
  const rows = screen.rows;
  const margin = 2;
  const innerWidth = Math.max(40, screen.cols - margin * 2);
  const listWidth = Math.floor(innerWidth / 3);
  const leftX = margin;
  const middleX = leftX + listWidth + 1;
  const gridX = middleX + listWidth + 1;
  const gridWidth = Math.max(12, innerWidth - listWidth * 2 - 2);

  commandLine.top = 1;
  commandLine.left = margin;
  commandLine.width = innerWidth;

  const tabsTop = 3;
  tabsBar.top = tabsTop;
  tabsBar.left = margin;
  tabsBar.width = innerWidth;
  renderTabs(innerWidth);

  const titleTop = tabsTop + 4;
  const titleHeight = 6;
  tagStack.top = titleTop + 1;
  tagStack.left = margin + 1;
  tagStack.width = 24;
  tagStack.height = 5;

  headerText.top = titleTop;
  headerText.left = margin + 1 + 24 + 3;
  headerText.width = Math.max(20, innerWidth - (24 + 4));
  headerText.height = titleHeight;

  headerRule.hide();

  const heroTop = titleTop + titleHeight + 1;

  patternField.top = heroTop;
  patternField.left = margin;
  patternField.width = innerWidth;
  patternField.height = LIP_HERO_HEIGHT;

  const listsTop = heroTop + LIP_HERO_HEIGHT + 2;
  const listsHeight = 8;
  listLeft.top = listsTop;
  listLeft.left = leftX;
  listLeft.width = listWidth;
  listLeft.height = listsHeight;

  listMiddle.top = listsTop;
  listMiddle.left = middleX;
  listMiddle.width = listWidth;
  listMiddle.height = listsHeight;

  colorGrid.top = listsTop;
  colorGrid.left = gridX;
  colorGrid.width = gridWidth;
  colorGrid.height = listsHeight;

  columnSepLeft.hide();
  columnSepRight.hide();

  const cardsTop = listsTop + listsHeight + 2;
  const cardHeight = Math.min(19, Math.max(10, rows - cardsTop - 4));
  cardLeft.top = cardsTop;
  cardLeft.left = leftX;
  cardLeft.width = listWidth;
  cardLeft.height = cardHeight;

  cardMiddle.top = cardsTop;
  cardMiddle.left = middleX;
  cardMiddle.width = listWidth;
  cardMiddle.height = cardHeight;

  cardRight.top = cardsTop;
  cardRight.left = gridX;
  cardRight.width = listWidth;
  cardRight.height = cardHeight;

  const statusTop = rows - 2;
  statusBar.top = statusTop;
  statusBar.left = margin;
  statusBar.width = innerWidth;

  statusLeft.hide();
  statusMiddle.hide();
  statusRight.hide();

  statusLeft.top = statusTop;
  statusLeft.left = margin;
  statusLeft.width = 10;

  statusSlots.left = statusLeft.width;

  statusMiddle.top = statusTop;
  statusMiddle.left = statusLeft.left + statusLeft.width + 1;
  statusMiddle.width = Math.max(10, innerWidth - 28);

  statusSlots.middle = statusMiddle.width;

  statusRight.top = statusTop;
  statusRight.left = statusMiddle.left + statusMiddle.width + 1;
  statusRight.width = 18;

  statusSlots.right = statusRight.width;

  promptLine.top = rows - 1;
  promptLine.left = margin;
  promptLine.width = 4;

  updateContent();
  patternField.setContent(
    placeInWhitespace(innerWidth, LIP_HERO_HEIGHT, heroDialogBlock),
  );
  const colorGridW = Math.max(6, colorGrid.width);
  const colorGridH = Math.max(4, colorGrid.height);
  colorGrid.setContent(buildColorGrid(colorGridW, colorGridH));
  screen.render();
}

screen.on("resize", layout);
screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

layout();
