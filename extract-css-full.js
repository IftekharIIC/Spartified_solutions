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

  let headerCSS = "";
  let footerCSS = "";

  for (const html of PAGES) {
    await page.goto("file://" + path.join(ROOT, html), {
      waitUntil: "networkidle0"
    });

    const matches = await page.evaluate(() => {
      const result = {
        header: new Set(),
        footer: new Set(),
        page: new Set()
      };

      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (!rule.selectorText) continue;

            try {
              if (document.querySelector(`header ${rule.selectorText}`))
                result.header.add(rule.selectorText);
              else if (document.querySelector(`footer ${rule.selectorText}`))
                result.footer.add(rule.selectorText);
              else if (document.querySelector(rule.selectorText))
                result.page.add(rule.selectorText);
            } catch {}
          }
        } catch {}
      }

      return {
        header: [...result.header],
        footer: [...result.footer],
        page: [...result.page]
      };
    });

    let pageCSS = "";

    ast.walkRules(rule => {
  if (!rule.selector) return;

  const sel = rule.selector;

  const isHeader =
    sel.includes(".header") ||
    sel.includes(".navbar") ||
    sel.includes(".nav-") ||
    sel.includes(".menu") ||
    sel.includes(".logo");

  const isFooter =
    sel.includes(".footer") ||
    sel.includes(".footer-") ||
    sel.includes(".copyright") ||
    sel.includes(".social") ||
    sel.includes(".links");

  if (isHeader) {
    headerCSS += rule.toString() + "\n\n";
  }

  if (isFooter) {
    footerCSS += rule.toString() + "\n\n";
  }
});

    const out = path.join(ROOT, "css", html.replace(".html", ".css"));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, pageCSS, "utf8");

    console.log(`✔ ${html} → CSS generated`);
  }

  fs.writeFileSync(path.join(ROOT, "css/header.css"), headerCSS, "utf8");
  fs.writeFileSync(path.join(ROOT, "css/footer.css"), footerCSS, "utf8");

  await browser.close();
})();