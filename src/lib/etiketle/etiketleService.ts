import { getAdminDb } from "@/lib/firebase/admin";
import QRCode from "qrcode";
import {
  EtiketleTag,
  EtiketleTagHistory,
  EtiketlePublicTag,
} from "@/types/etiketle";

function getDb() {
  return getAdminDb();
}

import { generateTagCode, generateQrDataUrl, generateQrSvg } from "./etiketleQr";
export { generateTagCode, generateQrDataUrl, generateQrSvg };

/**
 * Create a new tag for a business
 */
export async function createEtiketleTag(
  businessId: string,
  businessName: string,
  data: Partial<EtiketleTag>
): Promise<EtiketleTag> {
  const db = getDb();
  const ref = db.collection("etiketle_tags").doc();
  const now = Date.now();

  let code = generateTagCode(6);
  // Ensure code uniqueness
  const existingWithCode = await db
    .collection("etiketle_tags")
    .where("code", "==", code)
    .limit(1)
    .get();

  if (!existingWithCode.empty) {
    code = generateTagCode(6) + "X";
  }

  const newTag: EtiketleTag = {
    id: ref.id,
    businessId,
    businessName: businessName || "İşletme",
    code,
    name: (data.name || "Yeni Etiket").trim(),
    category: data.category || "Ekipman",
    quantity: data.quantity !== undefined ? Number(data.quantity) : 1,
    unit: data.unit || "Adet",
    location: (data.location || "Belirtilmedi").trim(),
    description: (data.description || "").trim(),
    imageUrl: data.imageUrl || "",
    status: data.status || "active",
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(newTag);

  // Create initial history record
  try {
    const histRef = db.collection("etiketle_history").doc();
    await histRef.set({
      id: histRef.id,
      tagId: ref.id,
      businessId,
      changeSummary: `Etiket oluşturuldu (${newTag.quantity} ${newTag.unit} • ${newTag.location})`,
      newQuantity: newTag.quantity,
      newLocation: newTag.location,
      timestamp: now,
    });
  } catch {}

  return newTag;
}

/**
 * Get all tags for an authenticated business
 */
export async function getBusinessTags(businessId: string): Promise<EtiketleTag[]> {
  const db = getDb();
  const snap = await db
    .collection("etiketle_tags")
    .where("businessId", "==", businessId)
    .get();

  const list: EtiketleTag[] = [];
  snap.forEach((d) => list.push(d.data() as EtiketleTag));
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Get single tag details with its audit history ensuring tenant ownership
 */
export async function getTagById(
  businessId: string,
  tagId: string
): Promise<{ tag: EtiketleTag; history: EtiketleTagHistory[] } | null> {
  const db = getDb();
  const tagDoc = await db.collection("etiketle_tags").doc(tagId).get();

  if (!tagDoc.exists) return null;
  const tagData = tagDoc.data() as EtiketleTag;

  // Strict tenant security
  if (tagData.businessId !== businessId) return null;

  // Get history
  const histSnap = await db
    .collection("etiketle_history")
    .where("tagId", "==", tagId)
    .where("businessId", "==", businessId)
    .get();

  const history: EtiketleTagHistory[] = [];
  histSnap.forEach((d) => history.push(d.data() as EtiketleTagHistory));
  history.sort((a, b) => b.timestamp - a.timestamp);

  return { tag: tagData, history };
}

/**
 * Update tag and record audit history
 * Crucial rule: The QR code and URL remain constant!
 */
export async function updateTagWithHistory(
  businessId: string,
  tagId: string,
  updates: Partial<Pick<EtiketleTag, "name" | "category" | "quantity" | "unit" | "location" | "description" | "imageUrl" | "status">>
): Promise<EtiketleTag | null> {
  const db = getDb();
  const tagRef = db.collection("etiketle_tags").doc(tagId);
  const tagDoc = await tagRef.get();

  if (!tagDoc.exists) return null;
  const current = tagDoc.data() as EtiketleTag;

  // Strict tenant security
  if (current.businessId !== businessId) return null;

  const now = Date.now();
  const changes: string[] = [];

  if (updates.quantity !== undefined && Number(updates.quantity) !== current.quantity) {
    changes.push(`Adet: ${current.quantity} → ${updates.quantity}`);
  }
  if (updates.location !== undefined && updates.location.trim() !== current.location) {
    changes.push(`Konum: ${current.location} → ${updates.location.trim()}`);
  }
  if (updates.status && updates.status !== current.status) {
    changes.push(`Durum: ${current.status} → ${updates.status}`);
  }
  if (updates.name && updates.name.trim() !== current.name) {
    changes.push(`Ad: ${current.name} → ${updates.name.trim()}`);
  }

  const updatedTag: EtiketleTag = {
    ...current,
    ...updates,
    updatedAt: now,
  };

  await tagRef.update({
    ...updates,
    updatedAt: now,
  });

  // Log history if meaningful change occurred
  if (changes.length > 0) {
    try {
      const histRef = db.collection("etiketle_history").doc();
      await histRef.set({
        id: histRef.id,
        tagId,
        businessId,
        changeSummary: changes.join(", "),
        previousQuantity: current.quantity,
        newQuantity: updates.quantity !== undefined ? Number(updates.quantity) : current.quantity,
        previousLocation: current.location,
        newLocation: updates.location || current.location,
        timestamp: now,
      });
    } catch (hErr) {
      console.warn("Notice recording history:", hErr);
    }
  }

  return updatedTag;
}

/**
 * Delete a tag and cascade delete its history
 */
export async function deleteEtiketleTag(businessId: string, tagId: string): Promise<boolean> {
  const db = getDb();
  const tagRef = db.collection("etiketle_tags").doc(tagId);
  const tagDoc = await tagRef.get();

  if (!tagDoc.exists) return false;
  if (tagDoc.data()?.businessId !== businessId) return false;

  await tagRef.delete();

  // Cascade delete history
  try {
    const histSnap = await db
      .collection("etiketle_history")
      .where("tagId", "==", tagId)
      .get();
    const batch = db.batch();
    histSnap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch {}

  return true;
}

/**
 * Public tag scan lookup (Zero authentication, strict data sanitization)
 */
export async function getPublicTagByCode(code: string): Promise<EtiketlePublicTag | null> {
  const db = getDb();
  const snap = await db
    .collection("etiketle_tags")
    .where("code", "==", code.toUpperCase().trim())
    .limit(1)
    .get();

  if (snap.empty) return null;

  const data = snap.docs[0].data() as EtiketleTag;

  // Sanitized public payload: absolutely NO businessId, internal IDs or private metadata
  return {
    code: data.code,
    name: data.name,
    category: data.category || "Genel",
    quantity: data.quantity,
    unit: data.unit || "Adet",
    location: data.location || "Belirtilmedi",
    description: data.description || "",
    imageUrl: data.imageUrl || "",
    status: data.status || "active",
    updatedAt: data.updatedAt,
  };
}

/**
 * Batch create tags (e.g. Kutu 1, Kutu 2, Kutu 3)
 */
export async function createBatchEtiketleTags(
  businessId: string,
  businessName: string,
  names: string[],
  category: string,
  location: string
): Promise<EtiketleTag[]> {
  const db = getDb();
  const batch = db.batch();
  const now = Date.now();
  const created: EtiketleTag[] = [];

  for (const name of names) {
    if (!name.trim()) continue;
    const ref = db.collection("etiketle_tags").doc();
    const code = generateTagCode(6);

    const tag: EtiketleTag = {
      id: ref.id,
      businessId,
      businessName,
      code,
      name: name.trim(),
      category: category || "Kutu & Koli",
      quantity: 1,
      unit: "Adet",
      location: location || "Depo",
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    batch.set(ref, tag);
    created.push(tag);
  }

  await batch.commit();
  return created;
}
