// High-performance Scout Directory & Parser Service

let cachedScouts: string[] = [];
let isLoaded = false;
let loadPromise: Promise<string[]> | null = null;

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

function decodeHtmlEntities(str: string): string {
  if (!str || !str.includes("&")) return str;
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&Aacute;/g, "Á")
    .replace(/&aacute;/g, "á")
    .replace(/&Eacute;/g, "É")
    .replace(/&eacute;/g, "é")
    .replace(/&Iacute;/g, "Í")
    .replace(/&iacute;/g, "í")
    .replace(/&Oacute;/g, "Ó")
    .replace(/&oacute;/g, "ó")
    .replace(/&Uacute;/g, "Ú")
    .replace(/&uacute;/g, "ú")
    .replace(/&Ntilde;/g, "Ñ")
    .replace(/&ntilde;/g, "ñ");
}

export async function initScoutService(): Promise<string[]> {
  if (isLoaded && cachedScouts.length > 0) {
    return cachedScouts;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      const res = await fetch("/data/scoutData.json");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          cachedScouts = data;
          isLoaded = true;
          return cachedScouts;
        }
      }
    } catch {
      // Fetch failed, try reading Scout list.txt fallback
    }

    try {
      const res = await fetch("/data/Scout list.txt");
      if (res.ok) {
        const text = await res.text();
        const lines = text.split(/\r?\n/);
        const set = new Set<string>();
        const list: string[] = [];

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
          cachedScouts = list;
          isLoaded = true;
          return cachedScouts;
        }
      }
    } catch {
      // Offline fallback
    }

    cachedScouts = FALLBACK_SCOUTS;
    isLoaded = true;
    return cachedScouts;
  })();

  return loadPromise;
}

export function getAllScouts(): string[] {
  return cachedScouts.length > 0 ? cachedScouts : FALLBACK_SCOUTS;
}

export function getScoutCount(): number {
  return cachedScouts.length > 0 ? cachedScouts.length : FALLBACK_SCOUTS.length;
}

/**
 * Intelligent First-Name Extractor
 * Handles:
 * - "Aaron Garcia" -> "Aaron"
 * - "Morales, Ignacio" -> "Ignacio"
 * - "Chitgar/Carter" -> "Chitgar"
 * - "Beck" -> "Beck"
 * - "L.M Parvath Mayur" -> "L.M"
 */
export function extractFirstName(fullName: string): string {
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

  // Strip leading honorifics/initials like "Dr. ", "Mr. "
  name = name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s+/i, "");

  const tokens = name.split(/\s+/);
  return tokens[0] || name;
}

export function formatScoutName(fullName: string, useFirstNameOnly: boolean): string {
  if (!fullName) return "";
  return useFirstNameOnly ? extractFirstName(fullName) : fullName;
}

/**
 * Ultra-fast Search over 30,000+ entries.
 * Prioritizes prefix matches over substring matches.
 */
export function searchScouts(query: string, limit = 20): string[] {
  const list = getAllScouts();
  if (!query || !query.trim()) {
    return list.slice(0, limit);
  }

  const q = query.trim().toLowerCase();
  const prefixMatches: string[] = [];
  const containsMatches: string[] = [];

  for (let i = 0; i < list.length; i++) {
    const scout = list[i];
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

  return prefixMatches.concat(containsMatches).slice(0, limit);
}
