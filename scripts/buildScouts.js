const fs = require("fs");
const path = require("path");

const rawFile = path.join(__dirname, "../data/scoutData.js");
const code = fs.readFileSync(rawFile, "utf-8");
const match = code.match(/window\.PRELOADED_SCOUTS\s*=\s*(\[[\s\S]*?\]);/);

if (match) {
  const list = JSON.parse(match[1]);
  const outDir = path.join(__dirname, "../public/data");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "scoutData.json"), JSON.stringify(list));
  fs.copyFileSync(path.join(__dirname, "../data/Scout list.txt"), path.join(outDir, "Scout list.txt"));
  console.log(`Generated public/data/scoutData.json with ${list.length} scouts.`);
} else {
  console.error("Failed to parse scouts.");
}
