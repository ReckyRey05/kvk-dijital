/**
 * Otomatik Küfür & Hakaret Filtresi (Profanity & Vulgarity Filter)
 * Restoran POS ve müşteri ekranlarında uygunsuz kelimeleri otomatik sansürler.
 */

const PROFANITY_LIST = [
  // Yaygın Türkçe küfür ve hakaret kökleri
  "amk",
  "aq",
  "amına",
  "amını",
  "amkoyim",
  "amina",
  "amini",
  "aminakoyim",
  "sikeyim",
  "sikerim",
  "siktim",
  "siktiğimin",
  "siktigimin",
  "siktir",
  "sik",
  "yarrak",
  "yarram",
  "yarak",
  "yaram",
  "orospu",
  "orospuçocuğu",
  "orospucocugu",
  "kahpe",
  "piç",
  "pic",
  "göt",
  "got",
  "götünü",
  "gotunu",
  "göte",
  "gavat",
  "kavat",
  "pezevenk",
  "ibne",
  "puşt",
  "pust",
  "yavşak",
  "yavsak",
  "taşşak",
  "tassak",
  "taşak",
  "tasak",
  "dalyarak",
  "ananı",
  "anani",
  "bacını",
  "bacini",
  "oç",
  "oc",
];

// Regex builder for exact/partial word boundary matching
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function censorProfanity(text: string): string {
  if (!text) return "";

  let censored = text;

  // Iterate over words
  PROFANITY_LIST.forEach((badWord) => {
    // Match word boundaries or inside compound tokens
    const regex = new RegExp(`(^|[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9])(${escapeRegex(badWord)})([^a-zA-ZçğıöşüÇĞİÖŞÜ0-9]|$)`, "gi");

    censored = censored.replace(regex, (match, p1, p2, p3) => {
      const mask = p2.charAt(0) + "*".repeat(Math.max(1, p2.length - 1));
      return `${p1}${mask}${p3}`;
    });

    // Also match standalone embedded cases
    const simpleRegex = new RegExp(`\\b${escapeRegex(badWord)}\\b`, "gi");
    censored = censored.replace(simpleRegex, (match) => {
      return match.charAt(0) + "*".repeat(Math.max(1, match.length - 1));
    });
  });

  return censored;
}

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return PROFANITY_LIST.some((word) => {
    const regex = new RegExp(`(^|[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9])${escapeRegex(word)}([^a-zA-ZçğıöşüÇĞİÖŞÜ0-9]|$)`, "i");
    return regex.test(lower) || lower.includes(word);
  });
}
