var { readFileSync, readdirSync } = require("fs");
var { JSDOM } = require("jsdom");

var failed = false;
var files = readdirSync(".").filter((f) => f.endsWith(".html"));
var images = readdirSync("images").filter((f) => f.endsWith(".png"));
var links = [];

for (var file of files) {
  var doc = new JSDOM(readFileSync(file, "utf8")).window.document;
  doc.querySelectorAll("a").forEach((a) => {
    var href = a.getAttribute("href");
    if (href && !href.startsWith("http") && !href.startsWith("/") && !href.startsWith("#") && !href.startsWith("mailto:")) {
      console.log(`${file} has broken link "${a.textContent.trim()}" to ${href}`);
      failed = true;
    }
    if (href && href.startsWith("/")) {
      links.push(href.slice(1));
      if (!files.some((f) => f === href.slice(1))) {
        console.log(`${file} has broken link "${a.textContent.trim()}" to ${href}`);
        failed = true;
      }
      if (file === href.slice(1)) {
        console.log(`${file} refers itself with "${a.textContent.trim()}" link`);
        failed = true;
      }
    }
  });

  doc.querySelectorAll("img").forEach((img) => {
    var src = img.getAttribute("src");
    if (src && !src.startsWith("http") && !src.startsWith("/")) {
      console.log(`${file} has broken image with wrong "${src}" src`);
      failed = true;
    }
    if (src && src.startsWith("/")) {
      if (!images.some((f) => `/images/${f}` === src)) {
        console.log(`${file} has broken image with not exists "${src}" src`);
        failed = true;
      }
    }
  });
}

for (const file of files.filter((files) => !links.includes(files))) {
  failed = true;
  // console.log(`there is no links to ${file}`);
}

if (failed) {
  process.exit(1);
}
