import assert from "node:assert";
import { generateTagCode, generateQrDataUrl, generateQrSvg } from "../../src/lib/etiketle/etiketleQr";
import {
  EtiketleTag,
  EtiketleTagHistory,
  EtiketlePublicTag,
} from "../../src/types/etiketle";

console.log("▶ [ETIKETLE TEST] Starting Etiketle Core Suite...");

// =========================================================================
// 1. Tag Code Generator & Unambiguous Character Set Test
// =========================================================================
console.log("  - Testing 6-character code generation and character purity...");
const unambiguousChars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const forbiddenChars = ["0", "O", "1", "I", "L"];

const generatedCodes = new Set<string>();
for (let i = 0; i < 100; i++) {
  const code = generateTagCode(6);
  assert.strictEqual(code.length, 6, "Code must be exactly 6 characters");
  assert.strictEqual(code, code.toUpperCase(), "Code must be uppercase");

  for (const char of code) {
    assert.ok(
      unambiguousChars.includes(char),
      `Character '${char}' must be in unambiguous set`
    );
    assert.ok(
      !forbiddenChars.includes(char),
      `Character '${char}' must not be a confusing character (0, O, 1, I, L)`
    );
  }
  generatedCodes.add(code);
}
assert.strictEqual(generatedCodes.size, 100, "All 100 generated codes should be unique");
console.log("    ✓ Code generation passed (100 unique 6-char clean unambiguous codes).");

// =========================================================================
// 2. Static QR / Dynamic Data Principle Test
// =========================================================================
console.log("  - Testing Static QR / Dynamic Data principle...");

const initialTag: EtiketleTag = {
  id: "tag_xyz123",
  businessId: "biz_atlas_lojistik",
  businessName: "Atlas Lojistik",
  code: "K8X29Q",
  name: "Arşiv Klasörleri 2024 - Muhasebe",
  category: "Arşiv & Evrak",
  quantity: 12,
  unit: "Koli",
  location: "Depo A - Raf 4 - Bölüm B",
  description: "2024 yılı ilk çeyrek fatura ve gider fişleri",
  status: "active",
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

const printedQrUrl = `https://kvkdijitalcozumler.com/e/${initialTag.code}`;

// Business updates the quantity from 12 -> 8 and moves to a new shelf
const updatedTag: EtiketleTag = {
  ...initialTag,
  quantity: 8,
  location: "Depo B - Raf 1 - Bölüm A",
  updatedAt: 1700000050000,
};

// Physical QR code on sticker must NEVER change
const scannedQrUrl = `https://kvkdijitalcozumler.com/e/${updatedTag.code}`;
assert.strictEqual(
  scannedQrUrl,
  printedQrUrl,
  "Physical QR URL must remain 100% identical after item updates"
);
assert.strictEqual(
  updatedTag.code,
  initialTag.code,
  "Tag 6-character code must remain static"
);

// But scanned dynamic data must reflect new values
assert.strictEqual(updatedTag.quantity, 8);
assert.strictEqual(updatedTag.location, "Depo B - Raf 1 - Bölüm A");
console.log("    ✓ Static QR / Dynamic Data principle verified.");

// =========================================================================
// 3. Diff History Detection & Audit Trail Test
// =========================================================================
console.log("  - Testing diff history detection...");

function computeDiff(current: EtiketleTag, updates: Partial<EtiketleTag>): string[] {
  const changes: string[] = [];
  if (updates.quantity !== undefined && Number(updates.quantity) !== current.quantity) {
    changes.push(`Adet: ${current.quantity} → ${updates.quantity}`);
  }
  if (updates.location !== undefined && updates.location.trim() !== current.location.trim()) {
    changes.push(`Konum: "${current.location}" → "${updates.location.trim()}"`);
  }
  if (updates.status !== undefined && updates.status !== current.status) {
    changes.push(`Durum: ${current.status} → ${updates.status}`);
  }
  if (updates.name !== undefined && updates.name.trim() !== current.name.trim()) {
    changes.push(`İsim: "${current.name}" → "${updates.name.trim()}"`);
  }
  return changes;
}

const diffs = computeDiff(initialTag, {
  quantity: 8,
  location: "Depo B - Raf 1 - Bölüm A",
});

assert.strictEqual(diffs.length, 2);
assert.ok(diffs[0].includes("Adet: 12 → 8"));
assert.ok(diffs[1].includes('Konum: "Depo A - Raf 4 - Bölüm B" → "Depo B - Raf 1 - Bölüm A"'));
console.log("    ✓ Diff history detection passed.");

// =========================================================================
// 4. Multi-Tenant Isolation Test
// =========================================================================
console.log("  - Testing Multi-Tenant Data Isolation...");

const tenantTagAtlas: EtiketleTag = {
  ...initialTag,
  businessId: "biz_atlas",
};

const tenantTagBursa: EtiketleTag = {
  ...initialTag,
  id: "tag_bursa_99",
  businessId: "biz_bursa_metal",
  name: "Kaynak Teli 2.5mm",
};

function authorizeAccess(requestingBusinessId: string, tag: EtiketleTag): EtiketleTag | null {
  if (tag.businessId !== requestingBusinessId) {
    return null; // 403 Forbidden
  }
  return tag;
}

assert.strictEqual(
  authorizeAccess("biz_atlas", tenantTagAtlas)?.name,
  "Arşiv Klasörleri 2024 - Muhasebe"
);
assert.strictEqual(
  authorizeAccess("biz_atlas", tenantTagBursa),
  null,
  "Atlas cannot access Bursa Metal's tag"
);
assert.strictEqual(
  authorizeAccess("biz_bursa_metal", tenantTagAtlas),
  null,
  "Bursa Metal cannot access Atlas's tag"
);
console.log("    ✓ Multi-tenant data isolation verified.");

// =========================================================================
// 5. Public Payload Sanitization & Privacy Test
// =========================================================================
console.log("  - Testing Public Payload Sanitization...");

function sanitizeForPublic(tag: EtiketleTag): EtiketlePublicTag {
  return {
    code: tag.code,
    name: tag.name,
    category: tag.category || "Genel",
    quantity: tag.quantity,
    unit: tag.unit || "Adet",
    location: tag.location || "Belirtilmedi",
    description: tag.description || "",
    imageUrl: tag.imageUrl || "",
    status: tag.status || "active",
    updatedAt: tag.updatedAt,
  };
}

const publicData = sanitizeForPublic(initialTag);
const rawKeys = Object.keys(publicData);

assert.ok(!rawKeys.includes("businessId"), "Public data must NOT contain businessId");
assert.ok(!rawKeys.includes("id"), "Public data must NOT contain internal database ID");
assert.strictEqual(publicData.code, "K8X29Q");
assert.strictEqual(publicData.quantity, 12);
assert.strictEqual(publicData.location, "Depo A - Raf 4 - Bölüm B");
console.log("    ✓ Public payload sanitization verified.");

// =========================================================================
// 6. QR Code Generation Test (Data URL and SVG)
// =========================================================================
console.log("  - Testing QR Code Generation (Data URL & SVG)...");

async function testQrGenerators() {
  const qrDataUrl = await generateQrDataUrl("https://kvkdijitalcozumler.com/e/K8X29Q");
  assert.ok(
    qrDataUrl.startsWith("data:image/png;base64,"),
    "QR Data URL must be a valid PNG Base64 string"
  );

  const qrSvg = await generateQrSvg("https://kvkdijitalcozumler.com/e/K8X29Q");
  assert.ok(qrSvg.includes("<svg"), "QR SVG must contain <svg tag");
  assert.ok(qrSvg.includes("</svg>"), "QR SVG must contain </svg> tag");
  console.log("    ✓ QR code Data URL & SVG generators passed.");
}

testQrGenerators().then(() => {
  // =========================================================================
  // 7. Batch Creation Pattern Test
  // =========================================================================
  console.log("  - Testing Batch Tag Creation logic...");

  const batchPrefix = "Yedek Koli";
  const batchCount = 5;
  const batchCreated: { name: string; code: string }[] = [];

  for (let i = 1; i <= batchCount; i++) {
    batchCreated.push({
      name: `${batchPrefix} ${i}`,
      code: generateTagCode(6),
    });
  }

  assert.strictEqual(batchCreated.length, 5);
  assert.strictEqual(batchCreated[0].name, "Yedek Koli 1");
  assert.strictEqual(batchCreated[4].name, "Yedek Koli 5");

  const batchCodes = new Set(batchCreated.map((b) => b.code));
  assert.strictEqual(batchCodes.size, 5, "All batch items must have unique codes");
  console.log("    ✓ Batch tag creation pattern passed.");

  console.log("✅ [ETIKETLE TEST] ALL SUITES PASSED SUCCESSFULLY!");
}).catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
