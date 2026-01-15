const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const safeParser = require("postcss-safe-parser");
const { JSDOM } = require("jsdom");

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

const cssText = fs.readFileSync(STYLE, "utf8");
const ast = postcss.parse(cssText, { parser: safeParser });

function extractSelectorsFromHTML(htmlFile) {
  const html = fs.readFileSync(path.join(ROOT, htmlFile), "utf8");
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const classes = new Set();
  const ids = new Set();

  doc.querySelectorAll("*").forEach(el => {
    el.classList.forEach(c => classes.add(c));
    if (el.id) ids.add(el.id);
  });

  return { classes, ids };
}

for (const html of PAGES) {
  const { classes, ids } = extractSelectorsFromHTML(html);
  let output = "";

  ast.walkRules(rule => {
    if (!rule.selector) return;

    const selectors = rule.selector.split(",").map(s => s.trim());

    selectors.forEach(sel => {
      for (const cls of classes) {
        if (sel.includes("." + cls)) {
          output += rule.toString() + "\n\n";
          return;
        }
      }
      for (const id of ids) {
        if (sel.includes("#" + id)) {
          output += rule.toString() + "\n\n";
          return;
        }
      }
    });
  });

  const outFile = path.join(ROOT, "css", html.replace(".html", ".css"));
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, output, "utf8");

  console.log(`✔ CSS generated for ${html}`);
}