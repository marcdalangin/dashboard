// ==========================================================================
// Scout Service - Indexing, Fast Autocomplete & First-Name Extraction
// ==========================================================================

let scoutList = [];
let isLoaded = false;

const FALLBACK_SCOUTS = [
  "Aaron Garcia",
  "Morales, Ignacio",
  "Chitgar/Carter",
  "Beck",
  "Berti",
  "Carrucciu",
  "Feroleto Antonio",
  "KAJI",
  "Kamil",
  "Kawano",
  "Krusic/Hassani",
  "L.M Parvath Mayur",
  "Lalaune",
  "Lecce",
  "Leguevaques",
  "Nishimura",
  "Norel",
  "Ogomori",
  "Parada/Silva",
  "Pokorny",
  "Satta",
  "Sulis",
  "Tibor",
  "Toshiyasu Nakamura",
  "Vannecke Dirk",
  "Wariman/Dewi/Sony",
  "Álvaro López Esteban",
  "Aaron Andrew Ranada",
  "Aaron Beveridge",
  "Aaron Clem",
  "Aaron Norris",
  "Aayush Desai",
  "Abbas Abdalov",
  "Abbas Moosavi",
  "Abbas Surve"
];

// Clean HTML entities (e.g. &Aacute; -> Á)
function decodeHtmlEntities(str) {
  if (!str || !str.includes("&")) return str;
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

export async function initScoutService() {
  if (isLoaded && scoutList.length > 0) return scoutList;

  // 1. Check window.PRELOADED_SCOUTS (from data/scoutData.js)
  if (typeof window !== "undefined" && Array.isArray(window.PRELOADED_SCOUTS) && window.PRELOADED_SCOUTS.length > 0) {
    scoutList = window.PRELOADED_SCOUTS;
    isLoaded = true;
    console.log(`[ScoutService] Loaded ${scoutList.length} scouts from preloaded data.`);
    return scoutList;
  }

  // 2. Attempt fetch of data/Scout list.txt
  try {
    const res = await fetch("data/Scout list.txt");
    if (res.ok) {
      const text = await res.text();
      const lines = text.split(/\r?\n/);
      const set = new Set();
      const list = [];

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.startsWith("**") || line.startsWith("#") || line === "? ??" || line === "?? ??") continue;
        line = decodeHtmlEntities(line);
        if (!set.has(line)) {
          set.add(line);
          list.push(line);
        }
      }

      if (list.length > 0) {
        scoutList = list;
        isLoaded = true;
        console.log(`[ScoutService] Loaded ${scoutList.length} scouts from data/Scout list.txt.`);
        return scoutList;
      }
    }
  } catch (err) {
    console.info("[ScoutService] Fetch not available (likely file:// origin). Using fallback/preloaded.");
  }

  // 3. Fallback
  scoutList = FALLBACK_SCOUTS;
  isLoaded = true;
  return scoutList;
}

export function loadCustomScoutText(rawText) {
  const lines = rawText.split(/\r?\n/);
  const set = new Set();
  const list = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line || line.startsWith("**") || line.startsWith("#") || line === "? ??" || line === "?? ??") continue;
    line = decodeHtmlEntities(line);
    if (!set.has(line)) {
      set.add(line);
      list.push(line);
    }
  }

  if (list.length > 0) {
    scoutList = list;
    isLoaded = true;
    return list.length;
  }
  return 0;
}

export function getScoutCount() {
  return scoutList.length;
}

export function getAllScouts() {
  return scoutList;
}

/**
 * Intelligent First-Name Extractor
 * Handles:
 * - "Aaron Garcia" -> "Aaron"
 * - "Morales, Ignacio" -> "Ignacio"
 * - "Chitgar/Carter" -> "Chitgar"
 * - "Beck" -> "Beck"
 * - "L.M Parvath Mayur" -> "Parvath" or "L.M"
 */
export function extractFirstName(fullName) {
  if (!fullName) return "";
  let name = fullName.trim();

  // If format is "Last, First" (comma separated)
  if (name.includes(",")) {
    const parts = name.split(",");
    if (parts[1] && parts[1].trim()) {
      const subTokens = parts[1].trim().split(/\s+/);
      return subTokens[0];
    }
  }

  // If format is "A/B" composite
  if (name.includes("/")) {
    name = name.split("/")[0].trim();
  }

  // Strip leading honorifics/initials if present like "Dr. ", "Mr. "
  name = name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s+/i, "");

  const tokens = name.split(/\s+/);
  return tokens[0] || name;
}

export function formatScoutName(fullName, useFirstNameOnly) {
  if (!fullName) return "";
  return useFirstNameOnly ? extractFirstName(fullName) : fullName;
}

/**
 * Ultra-fast Search over 30,000+ entries.
 * Prioritizes prefix matches over substring matches.
 */
export function searchScouts(query, limit = 20) {
  if (!query || !query.trim()) {
    return scoutList.slice(0, limit);
  }

  const q = query.trim().toLowerCase();
  const prefixMatches = [];
  const containsMatches = [];

  for (let i = 0; i < scoutList.length; i++) {
    const scout = scoutList[i];
    const lower = scout.toLowerCase();

    if (lower.startsWith(q)) {
      prefixMatches.push(scout);
      if (prefixMatches.length >= limit) break;
    } else if (lower.includes(q)) {
      if (prefixMatches.length + containsMatches.length < limit * 2) {
        containsMatches.push(scout);
      }
    }
  }

  const combined = prefixMatches.concat(containsMatches);
  return combined.slice(0, limit);
}
