const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const postcss = require("postcss");
const safeParser = require("postcss-safe-parser");

const ROOT = __dirname;
const STYLE = path.join(ROOT, "style.css");

const PAGES = [
  "index.html",
  "about.html",
  "contact.html",
  "news.html",
  "customers.html",
  "solutions.html",
  "fraudprotect.html"
];

(async () => {
  const cssText = fs.readFileSync(STYLE, "utf8");
  const ast = postcss.parse(cssText, { parser: safeParser });

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let report = [];

  for (const html of PAGES) {
    await page.goto("file://" + path.join(ROOT, html), {
      waitUntil: "networkidle0"
    });

    const used = await page.evaluate(() => {
      const s = new Set();
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.selectorText) {
              try {
                if (document.querySelector(rule.selectorText))
                  s.add(rule.selectorText);
              } catch {}
            }
          }
        } catch {}
      }
      return [...s];
    });

    ast.walkRules(rule => {
      if (!rule.selector) return;
      rule.selector.split(",").forEach(sel => {
        if (used.includes(sel.trim())) {
          report.push({
            page: html,
            selector: sel.trim(),
            line: rule.source.start.line
          });
        }
      });
    });
  }

  fs.writeFileSync(
    path.join(ROOT, "css-mapping-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );

  await browser.close();
})();