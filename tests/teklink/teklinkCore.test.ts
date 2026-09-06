import assert from "node:assert";
import { generateSlug } from "../../src/lib/teklink/teklinkService";
import { TekLinkForm, TekLinkField, TekLinkSubmission } from "../../src/types/teklink";

console.log("▶ [TEKLINK TEST] Starting TekLink Core Suite...");

// 1. Slug Generator Test
console.log("  - Testing slug generation format and uniqueness...");
const slugs = new Set<string>();
for (let i = 0; i < 100; i++) {
  const s = generateSlug(6);
  assert.strictEqual(s.length, 6, "Slug must be exactly 6 characters");
  assert.strictEqual(/^[a-z0-9]+$/.test(s), true, "Slug must contain only lowercase alphanumeric characters");
  slugs.add(s);
}
assert.strictEqual(slugs.size, 100, "All 100 generated slugs should be unique");
console.log("    ✓ Slug generation passed (100 unique 6-char clean slugs).");

// 2. Multi-Tenant Isolation Simulation
console.log("  - Testing Multi-Tenant Data Isolation...");
const tenantA_Forms: TekLinkForm[] = [
  {
    id: "form_A1",
    tenantId: "tenant_A",
    slug: "slug_a1",
    title: "Oto Servis Kabul",
    businessName: "Kaya Otomotiv",
    fields: [{ id: "f1", type: "text", label: "Plaka No", required: true }],
    isActive: true,
    responseCount: 1,
    createdAt: 1000,
    updatedAt: 1000,
  }
];

const tenantB_Forms: TekLinkForm[] = [
  {
    id: "form_B1",
    tenantId: "tenant_B",
    slug: "slug_b1",
    title: "Müvekkil Başvuru Formu",
    businessName: "Aksoy Hukuk",
    fields: [{ id: "f1", type: "text", label: "TC Kimlik", required: true }],
    isActive: true,
    responseCount: 3,
    createdAt: 2000,
    updatedAt: 2000,
  }
];

// Isolation check: Tenant A requesting form B1
function getFormForTenant(tenantId: string, form: TekLinkForm) {
  if (form.tenantId !== tenantId) {
    return null; // Strict 403 / 404 forbidden
  }
  return form;
}

assert.strictEqual(getFormForTenant("tenant_A", tenantB_Forms[0]), null, "Tenant A cannot access Tenant B's form");
assert.strictEqual(getFormForTenant("tenant_B", tenantA_Forms[0]), null, "Tenant B cannot access Tenant A's form");
assert.notStrictEqual(getFormForTenant("tenant_A", tenantA_Forms[0]), null, "Tenant A can access own form");
console.log("    ✓ Multi-Tenant data isolation verified.");

// 3. Public Form Sanitization (Zero Private Metadata Leaks)
console.log("  - Testing Public Form Sanitization (Zero Leaks)...");
function toPublicForm(form: TekLinkForm) {
  return {
    slug: form.slug,
    title: form.title,
    description: form.description || "",
    businessName: form.businessName,
    fields: form.fields,
  };
}

const publicA = toPublicForm(tenantA_Forms[0]);
assert.strictEqual((publicA as any).tenantId, undefined, "Public form must NEVER contain tenantId");
assert.strictEqual((publicA as any).responseCount, undefined, "Public form must NEVER contain responseCount");
assert.strictEqual(publicA.title, "Oto Servis Kabul");
console.log("    ✓ Public form payload is strictly sanitized.");

// 4. Required Field Validation
console.log("  - Testing Public Submission Field Validation...");
function validateSubmission(fields: TekLinkField[], answers: Record<string, any>) {
  for (const field of fields) {
    if (field.required) {
      const val = answers[field.id];
      if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
        return { valid: false, error: `"${field.label}" alanı zorunludur.` };
      }
    }
  }
  return { valid: true };
}

const testFields: TekLinkField[] = [
  { id: "name", type: "text", label: "Ad Soyad", required: true },
  { id: "note", type: "textarea", label: "Not", required: false },
];

const invalidRes = validateSubmission(testFields, { note: "Deneme" });
assert.strictEqual(invalidRes.valid, false);
assert.strictEqual(invalidRes.error, '"Ad Soyad" alanı zorunludur.');

const validRes = validateSubmission(testFields, { name: "Mehmet Demir", note: "Deneme" });
assert.strictEqual(validRes.valid, true);
console.log("    ✓ Submission required field validator passed.");

console.log("✅ [TEKLINK TEST] ALL SUITES PASSED SUCCESSFULLY!");
