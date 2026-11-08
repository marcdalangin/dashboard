const assert = require("assert");
const fs = require("fs");
const path = require("path");

// 1. Test Scout Name Extractor Logic
function extractFirstName(fullName) {
  if (!fullName) return "";
  let name = fullName.trim();
  if (name.includes(",")) {
    const parts = name.split(",");
    if (parts[1] && parts[1].trim()) {
      const subTokens = parts[1].trim().split(/\s+/);
      return subTokens[0];
    }
  }
  if (name.includes("/")) {
    name = name.split("/")[0].trim();
  }
  name = name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s+/i, "");
  const tokens = name.split(/\s+/);
  return tokens[0] || name;
}

console.log("Running Unit Tests...");

// Assert Name parsing
assert.strictEqual(extractFirstName("Aaron Garcia"), "Aaron");
assert.strictEqual(extractFirstName("Morales, Ignacio"), "Ignacio");
assert.strictEqual(extractFirstName("Chitgar/Carter"), "Chitgar");
assert.strictEqual(extractFirstName("Beck"), "Beck");
assert.strictEqual(extractFirstName("Dr. Aaron Garcia"), "Aaron");
console.log("✓ extractFirstName tests passed.");

// 2. Test Scout Database Integrity
const dataPath = path.join(__dirname, "../public/data/scoutData.json");
assert.ok(fs.existsSync(dataPath), "public/data/scoutData.json must exist");
const scouts = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
assert.ok(scouts.length >= 30000, `Expected >= 30,000 scouts, got ${scouts.length}`);
console.log(`✓ Scout dataset verified with ${scouts.length.toLocaleString()} entries.`);

// 3. Test Prefix & Substring search
function searchScouts(list, query, limit = 20) {
  const q = query.trim().toLowerCase();
  const prefix = [];
  const contains = [];
  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    const l = s.toLowerCase();
    if (l.startsWith(q)) {
      prefix.push(s);
      if (prefix.length >= limit) break;
    } else if (l.includes(q)) {
      if (prefix.length + contains.length < limit * 2) {
        contains.push(s);
      }
    }
  }
  return prefix.concat(contains).slice(0, limit);
}

const startTime = Date.now();
const results = searchScouts(scouts, "aaron", 10);
const duration = Date.now() - startTime;
assert.ok(results.length > 0, "Expected search results for 'aaron'");
assert.ok(duration < 50, `Search should take < 50ms, took ${duration}ms`);
console.log(`✓ Search execution benchmark passed (${duration}ms). Top match: "${results[0]}"`);

// 4. Test Variable Replacement
function interpolate(templateBody, variables) {
  let res = templateBody;
  for (const [key, val] of Object.entries(variables)) {
    res = res.split(`[${key}]`).join(val);
  }
  return res;
}

const tpl = "Hi [Scout Name], match [Match ID] is confirmed at [Time].";
const output = interpolate(tpl, {
  "Scout Name": "Ignacio",
  "Match ID": "TT-4029",
  Time: "19:00",
});
assert.strictEqual(output, "Hi Ignacio, match TT-4029 is confirmed at 19:00.");
console.log("✓ Template interpolation passed.");

console.log("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!");
