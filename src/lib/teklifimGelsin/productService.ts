import { getAdminDb } from "@/lib/firebase/admin";
import {
  TeklifimProduct,
  TeklifimProductStatus,
  TeklifimStockStatus,
  TeklifimPriceVisibility,
  TeklifimProductImportReport,
  TeklifimProductFavorite,
  TeklifimRequest,
  TEKLIFIM_CATEGORIES,
  SUBCATEGORY_MAPPING,
} from "@/types/teklifimGelsin";

function getDb() {
  return getAdminDb();
}

export * from "./productUtils";
import {
  TeklifimProductFilters,
  filterAndSortProducts,
  parseCsv,
  validateAndProcessCsvRows,
  exportProductsToCsv,
  decrementProductStock,
  compareReorderPrice,
} from "./productUtils";


/* =========================================================================
 * FIRESTORE DATABASE SERVICE METHODS
 * ========================================================================= */

/**
 * Creates a new product in Firestore
 */
export async function createProduct(
  supplierId: string,
  data: Partial<TeklifimProduct>
): Promise<TeklifimProduct> {
  const db = getDb();
  const ref = db.collection("teklifim_products").doc();
  const now = Date.now();

  const title = data.title || data.name || "İsimsiz Ürün";
  const price = typeof data.price === "number" ? data.price : (typeof data.estimatedPrice === "number" ? data.estimatedPrice : undefined);
  const status: TeklifimProductStatus = data.status || "published";

  const newProduct: TeklifimProduct = {
    id: ref.id,
    supplierId, // Strict tenant isolation
    supplierName: data.supplierName,
    supplierCity: data.supplierCity,
    supplierLogoUrl: data.supplierLogoUrl,
    supplierVerified: data.supplierVerified,
    name: title,
    title,
    category: data.category || "Genel",
    subCategory: data.subCategory || undefined,
    sku: data.sku || undefined,
    description: data.description || "",
    imageUrl: data.imageUrl || (data.images && data.images[0]) || "",
    images: data.images || (data.imageUrl ? [data.imageUrl] : []),
    minOrder: data.minOrder || `${data.minimumOrder || 1} Adet`,
    minimumOrder: data.minimumOrder || 1,
    unit: data.unit || "Adet",
    price,
    estimatedPrice: price,
    currency: data.currency || "TRY",
    priceVisibility: data.priceVisibility || "public",
    stockStatus: data.stockStatus || "in_stock",
    stockQuantity: data.stockQuantity,
    trackStock: data.trackStock ?? (data.stockQuantity !== undefined),
    leadTimeDays: data.leadTimeDays,
    deliveryRegions: data.deliveryRegions || ["Tüm Türkiye"],
    status,
    isActive: status === "published",
    viewsCount: 0,
    requestsCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(newProduct);
  return newProduct;
}

/**
 * Updates an existing product with strict supplier tenant check
 */
export async function updateProduct(
  productId: string,
  supplierId: string,
  updates: Partial<TeklifimProduct>
): Promise<TeklifimProduct> {
  const db = getDb();
  const ref = db.collection("teklifim_products").doc(productId);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error(`Ürün bulunamadı: ${productId}`);
  }

  const existing = snap.data() as TeklifimProduct;
  if (existing.supplierId !== supplierId) {
    throw new Error("Bu ürünü güncelleme yetkiniz bulunmuyor (Yetkisiz Erişim).");
  }

  const now = Date.now();
  const safeUpdates: Partial<TeklifimProduct> = {
    ...updates,
    updatedAt: now,
  };

  // Prevent modifying immutable fields
  delete safeUpdates.id;
  delete safeUpdates.supplierId;
  delete safeUpdates.createdAt;

  if (updates.title) {
    safeUpdates.name = updates.title;
  } else if (updates.name) {
    safeUpdates.title = updates.name;
  }

  if (updates.status) {
    safeUpdates.isActive = updates.status === "published";
  }

  // Stock status auto-adjustment if trackStock
  if (typeof updates.stockQuantity === "number") {
    if (updates.stockQuantity === 0) {
      safeUpdates.stockStatus = "out_of_stock";
    } else if (updates.stockQuantity <= 10 && existing.stockStatus === "in_stock") {
      safeUpdates.stockStatus = "low_stock";
    }
  }

  await ref.update(safeUpdates);

  const updatedDoc = await ref.get();
  return updatedDoc.data() as TeklifimProduct;
}

/**
 * Soft-archives or hard-deletes a product
 */
export async function deleteOrArchiveProduct(
  productId: string,
  supplierId: string,
  hardDelete: boolean = false
): Promise<boolean> {
  const db = getDb();
  const ref = db.collection("teklifim_products").doc(productId);
  const snap = await ref.get();

  if (!snap.exists) return false;

  const data = snap.data() as TeklifimProduct;
  if (data.supplierId !== supplierId) {
    throw new Error("Bu ürünü silme yetkiniz bulunmuyor.");
  }

  if (hardDelete) {
    await ref.delete();
  } else {
    await ref.update({
      status: "archived",
      isActive: false,
      updatedAt: Date.now(),
    });
  }

  return true;
}

/**
 * Fetches single product by ID, optionally increments viewsCount
 */
export async function getProductById(
  productId: string,
  incrementView: boolean = false
): Promise<TeklifimProduct | null> {
  const db = getDb();
  const ref = db.collection("teklifim_products").doc(productId);
  const snap = await ref.get();

  if (!snap.exists) return null;

  const product = snap.data() as TeklifimProduct;

  if (incrementView) {
    // Fire and forget view counter increment
    ref.update({ viewsCount: (product.viewsCount || 0) + 1 }).catch(() => {});
  }

  return product;
}

/**
 * Lists products from Firestore based on filters
 */
export async function listProducts(
  filters: TeklifimProductFilters
): Promise<{ products: TeklifimProduct[]; total: number }> {
  const db = getDb();
  let query: FirebaseFirestore.Query = db.collection("teklifim_products");

  if (filters.supplierId) {
    query = query.where("supplierId", "==", filters.supplierId);
  }

  const snap = await query.get();
  const allProducts: TeklifimProduct[] = [];
  snap.forEach((doc) => allProducts.push(doc.data() as TeklifimProduct));

  const filtered = filterAndSortProducts(allProducts, filters);
  return {
    products: filtered,
    total: allProducts.length,
  };
}

/**
 * Imports products from CSV string with bulk validation & tenant isolation
 */
export async function importProductsFromCsv(
  supplierId: string,
  csvContent: string
): Promise<TeklifimProductImportReport> {
  const { rows } = parseCsv(csvContent);
  const { report, validProducts } = validateAndProcessCsvRows(rows, supplierId);

  if (validProducts.length === 0) {
    return report;
  }

  const db = getDb();
  const batch = db.batch();
  const now = Date.now();
  const createdIds: string[] = [];

  for (const p of validProducts) {
    const docRef = db.collection("teklifim_products").doc();
    createdIds.push(docRef.id);

    const fullProduct: TeklifimProduct = {
      ...p,
      id: docRef.id,
      supplierId,
      name: p.name || p.title || "Ürün",
      title: p.title || p.name || "Ürün",
      category: p.category || "Genel",
      minOrder: p.minOrder || "1 Adet",
      unit: p.unit || "Adet",
      currency: p.currency || "TRY",
      priceVisibility: p.priceVisibility || "public",
      stockStatus: p.stockStatus || "in_stock",
      status: "published",
      isActive: true,
      viewsCount: 0,
      requestsCount: 0,
      createdAt: now,
      updatedAt: now,
    } as TeklifimProduct;

    batch.set(docRef, fullProduct);
  }

  await batch.commit();
  report.importedProductIds = createdIds;
  report.successfulCount = createdIds.length;

  return report;
}

/**
 * Exports all products of a supplier to CSV
 */
export async function exportSupplierProductsToCsv(supplierId: string): Promise<string> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_products")
    .where("supplierId", "==", supplierId)
    .get();

  const products: TeklifimProduct[] = [];
  snap.forEach((doc) => products.push(doc.data() as TeklifimProduct));

  return exportProductsToCsv(products);
}

/**
 * Toggles product favorite for a user
 */
export async function toggleProductFavorite(
  userId: string,
  productId: string
): Promise<{ isFavorited: boolean }> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_product_favorites")
    .where("userId", "==", userId)
    .where("productId", "==", productId)
    .get();

  if (!snap.empty) {
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    return { isFavorited: false };
  }

  // Fetch product to store denormalized snapshot
  const productDoc = await db.collection("teklifim_products").doc(productId).get();
  const product = productDoc.data() as TeklifimProduct | undefined;

  const favRef = db.collection("teklifim_product_favorites").doc();
  const fav: TeklifimProductFavorite = {
    id: favRef.id,
    userId,
    productId,
    productName: product?.title || product?.name || "Ürün",
    productCategory: product?.category || "Genel",
    productImageUrl: product?.imageUrl || "",
    productPrice: product?.price ?? product?.estimatedPrice,
    productCurrency: product?.currency || "TRY",
    supplierId: product?.supplierId || "",
    supplierName: product?.supplierName || "Tedarikçi",
    createdAt: Date.now(),
  };

  await favRef.set(fav);
  return { isFavorited: true };
}

/**
 * Fetches all product favorites for a user
 */
export async function getUserFavoriteProducts(userId: string): Promise<TeklifimProductFavorite[]> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_product_favorites")
    .where("userId", "==", userId)
    .get();

  const list: TeklifimProductFavorite[] = [];
  snap.forEach((doc) => list.push(doc.data() as TeklifimProductFavorite));
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Checks if a user has favorited a product
 */
export async function isProductFavorited(userId: string, productId: string): Promise<boolean> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_product_favorites")
    .where("userId", "==", userId)
    .where("productId", "==", productId)
    .limit(1)
    .get();

  return !snap.empty;
}

/**
 * Decrements product stock on order creation/completion
 */
export async function decrementProductStockOnOrder(
  productId: string,
  quantity: number
): Promise<TeklifimProduct | null> {
  const db = getDb();
  const ref = db.collection("teklifim_products").doc(productId);
  const snap = await ref.get();

  if (!snap.exists) return null;

  const product = snap.data() as TeklifimProduct;
  const { updatedProduct } = decrementProductStock(product, quantity);

  await ref.update({
    stockQuantity: updatedProduct.stockQuantity,
    stockStatus: updatedProduct.stockStatus,
    updatedAt: updatedProduct.updatedAt,
  });

  return updatedProduct;
}

/**
 * Checks for price changes for re-ordering
 */
export async function checkProductPriceChangeForReorder(
  productId: string,
  originalUnitPrice: number
): Promise<{
  hasChanged: boolean;
  originalPrice: number;
  currentPrice: number;
  priceDifference: number;
  percentChange: number;
}> {
  const product = await getProductById(productId);
  if (!product) {
    return {
      hasChanged: false,
      originalPrice: originalUnitPrice,
      currentPrice: originalUnitPrice,
      priceDifference: 0,
      percentChange: 0,
    };
  }

  const currentPrice = product.price ?? product.estimatedPrice ?? originalUnitPrice;
  return compareReorderPrice(currentPrice, originalUnitPrice);
}

/**
 * Computes supplier catalog dashboard statistics
 */
export async function getSupplierProductStats(supplierId: string): Promise<{
  total: number;
  published: number;
  lowStock: number;
  outOfStock: number;
  draft: number;
}> {
  const db = getDb();
  const snap = await db
    .collection("teklifim_products")
    .where("supplierId", "==", supplierId)
    .get();

  let total = 0;
  let published = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let draft = 0;

  snap.forEach((doc) => {
    const p = doc.data() as TeklifimProduct;
    total++;
    if (p.status === "draft") draft++;
    if (p.status === "published" || p.isActive) published++;
    if (p.stockStatus === "low_stock") lowStock++;
    if (p.stockStatus === "out_of_stock") outOfStock++;
  });

  return { total, published, lowStock, outOfStock, draft };
}
