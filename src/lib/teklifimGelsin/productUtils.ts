import {
  TeklifimProduct,
  TeklifimProductStatus,
  TeklifimStockStatus,
  TeklifimPriceVisibility,
  TeklifimProductImportReport,
  TeklifimRequest,
  TEKLIFIM_CATEGORIES,
} from "@/types/teklifimGelsin";

export interface TeklifimProductFilters {
  supplierId?: string;
  category?: string;
  subCategory?: string;
  stockStatus?: TeklifimStockStatus;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  priceVisibility?: TeklifimPriceVisibility;
  searchQuery?: string;
  city?: string;
  deliveryRegion?: string;
  status?: TeklifimProductStatus;
  sort?: "newest" | "price_asc" | "price_desc" | "popular" | "min_order";
  limit?: number;
  offset?: number;
}

/**
 * Parses CSV lines handling quotes, semicolons, and commas
 */
export function parseCsv(csvContent: string): { headers: string[]; rows: Record<string, string>[] } {
  if (!csvContent || !csvContent.trim()) {
    return { headers: [], rows: [] };
  }

  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Detect delimiter: comma or semicolon
  const headerLine = lines[0];
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semicolonCount = (headerLine.match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ";" : ",";

  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const rawHeaders = parseLine(headerLine);
  const normalizedHeaders = rawHeaders.map((h) =>
    h.toLowerCase().replace(/['"]/g, "").trim()
  );

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseLine(lines[i]);
    const rowObj: Record<string, string> = {};
    for (let j = 0; j < normalizedHeaders.length; j++) {
      const h = normalizedHeaders[j];
      rowObj[h] = vals[j] !== undefined ? vals[j] : "";
    }
    rows.push(rowObj);
  }

  return { headers: normalizedHeaders, rows };
}

/**
 * Normalizes and maps raw CSV row to TeklifimProduct partial
 */
export function normalizeProductRow(
  row: Record<string, string>,
  rowIndex: number,
  supplierId: string
): {
  isValid: boolean;
  product?: Partial<TeklifimProduct>;
  errors: { row: number; field: string; message: string }[];
} {
  const errors: { row: number; field: string; message: string }[] = [];

  // 1. Title / Name resolution
  const title =
    row["title"] ||
    row["name"] ||
    row["ürün adı"] ||
    row["urun adi"] ||
    row["ürün"] ||
    row["urun"] ||
    row["başlık"] ||
    "";

  if (!title.trim()) {
    errors.push({
      row: rowIndex,
      field: "title",
      message: "Ürün adı / başlık zorunludur.",
    });
  }

  // 2. Category resolution
  const categoryRaw =
    row["category"] ||
    row["kategori"] ||
    row["kategori adı"] ||
    "";

  let category = categoryRaw.trim();
  if (!category) {
    errors.push({
      row: rowIndex,
      field: "category",
      message: "Kategori alanı zorunludur.",
    });
  } else {
    const matchedCategory = TEKLIFIM_CATEGORIES.find(
      (c) => c.toLowerCase() === category.toLowerCase()
    );
    if (matchedCategory) {
      category = matchedCategory;
    } else {
      const partial = TEKLIFIM_CATEGORIES.find((c) =>
        category.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(category.toLowerCase())
      );
      if (partial) {
        category = partial;
      }
    }
  }

  // 3. SubCategory
  const subCategoryRaw =
    row["subcategory"] ||
    row["sub_category"] ||
    row["alt kategori"] ||
    row["alt_kategori"] ||
    "";
  const subCategory = subCategoryRaw.trim();

  // 4. SKU
  const skuRaw =
    row["sku"] ||
    row["stok kodu"] ||
    row["stokkodu"] ||
    row["barkod"] ||
    "";
  const sku = skuRaw.trim() || undefined;

  // 5. Unit
  const unitRaw =
    row["unit"] ||
    row["birim"] ||
    "";
  const unit = unitRaw.trim() || "Adet";

  // 6. Minimum Order
  const minOrderRaw =
    row["minorder"] ||
    row["minimumorder"] ||
    row["min_order"] ||
    row["minimum_order"] ||
    row["minimum sipariş"] ||
    row["asgari sipariş"] ||
    "";
  const minOrder = minOrderRaw.trim() || "1 Koli";
  const minOrderNum = parseInt(minOrder.replace(/\D/g, ""), 10);
  const minimumOrder = !isNaN(minOrderNum) && minOrderNum > 0 ? minOrderNum : 1;

  // 7. Price
  const priceRaw =
    row["price"] ||
    row["fiyat"] ||
    row["estimatedprice"] ||
    row["estimated_price"] ||
    row["birim fiyat"] ||
    "";
  let price: number | undefined = undefined;
  if (priceRaw.trim() !== "") {
    const cleanedPriceStr = priceRaw.replace(/[^0-9.,-]/g, "").replace(",", ".");
    const parsedPrice = parseFloat(cleanedPriceStr);
    if (isNaN(parsedPrice)) {
      errors.push({
        row: rowIndex,
        field: "price",
        message: `Geçersiz fiyat değeri: '${priceRaw}'`,
      });
    } else if (parsedPrice < 0) {
      errors.push({
        row: rowIndex,
        field: "price",
        message: "Fiyat negatif olamaz.",
      });
    } else {
      price = parsedPrice;
    }
  }

  // 8. Currency
  const currencyRaw =
    row["currency"] ||
    row["para birimi"] ||
    "";
  const currency = currencyRaw.trim().toUpperCase() || "TRY";

  // 9. Price Visibility
  const visRaw = (
    row["pricevisibility"] ||
    row["price_visibility"] ||
    row["fiyat görünürlüğü"] ||
    row["fiyat gorunurlugu"] ||
    ""
  ).toLowerCase();
  let priceVisibility: TeklifimPriceVisibility = "public";
  if (visRaw.includes("hidden") || visRaw.includes("gizli")) {
    priceVisibility = "hidden";
  } else if (visRaw.includes("quote") || visRaw.includes("teklif")) {
    priceVisibility = "request_quote";
  }

  // 10. Stock Status & Quantity
  const stockStatusRaw = (
    row["stockstatus"] ||
    row["stock_status"] ||
    row["stok durumu"] ||
    ""
  ).toLowerCase();
  let stockStatus: TeklifimStockStatus = "in_stock";
  if (stockStatusRaw.includes("out") || stockStatusRaw.includes("tukendi") || stockStatusRaw.includes("tükendi")) {
    stockStatus = "out_of_stock";
  } else if (stockStatusRaw.includes("low") || stockStatusRaw.includes("az")) {
    stockStatus = "low_stock";
  } else if (stockStatusRaw.includes("order") || stockStatusRaw.includes("uretim") || stockStatusRaw.includes("üretim")) {
    stockStatus = "made_to_order";
  } else if (stockStatusRaw.includes("unspecified") || stockStatusRaw.includes("belirtilmedi")) {
    stockStatus = "unspecified";
  }

  const stockQtyRaw =
    row["stockquantity"] ||
    row["stock_quantity"] ||
    row["stok adedi"] ||
    row["stok"] ||
    "";
  let stockQuantity: number | undefined = undefined;
  if (stockQtyRaw.trim() !== "") {
    const parsedQty = parseInt(stockQtyRaw.replace(/\D/g, ""), 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      errors.push({
        row: rowIndex,
        field: "stockQuantity",
        message: `Geçersiz stok adedi: '${stockQtyRaw}'`,
      });
    } else {
      stockQuantity = parsedQty;
      if (stockQuantity === 0) {
        stockStatus = "out_of_stock";
      }
    }
  }

  // 11. Lead Time Days
  const leadDaysRaw =
    row["leadtimedays"] ||
    row["lead_time_days"] ||
    row["termin süresi"] ||
    row["hazırlık süresi"] ||
    "";
  let leadTimeDays: number | undefined = undefined;
  if (leadDaysRaw.trim() !== "") {
    const parsedDays = parseInt(leadDaysRaw.replace(/\D/g, ""), 10);
    if (!isNaN(parsedDays) && parsedDays >= 0) {
      leadTimeDays = parsedDays;
    }
  }

  // 12. Description & Image
  const description = (
    row["description"] ||
    row["açıklama"] ||
    row["aciklama"] ||
    ""
  ).trim();

  const imageUrl = (
    row["imageurl"] ||
    row["image_url"] ||
    row["görsel"] ||
    row["resim"] ||
    ""
  ).trim();

  // 13. Delivery Regions
  const regionsRaw =
    row["deliveryregions"] ||
    row["delivery_regions"] ||
    row["teslimat bölgeleri"] ||
    "";
  let deliveryRegions: string[] | undefined = undefined;
  if (regionsRaw.trim()) {
    deliveryRegions = regionsRaw
      .split("|")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const product: Partial<TeklifimProduct> = {
    supplierId,
    name: title,
    title,
    category,
    subCategory: subCategory || undefined,
    sku,
    unit,
    minOrder,
    minimumOrder,
    price,
    estimatedPrice: price,
    currency,
    priceVisibility,
    stockStatus,
    stockQuantity,
    trackStock: stockQuantity !== undefined,
    leadTimeDays,
    description,
    imageUrl: imageUrl || undefined,
    deliveryRegions,
    status: "published",
    isActive: true,
    viewsCount: 0,
    requestsCount: 0,
  };

  return { isValid: true, product, errors: [] };
}

/**
 * Validates full CSV rows, detects duplicate SKUs and field violations
 */
export function validateAndProcessCsvRows(
  rows: Record<string, string>[],
  supplierId: string
): {
  report: TeklifimProductImportReport;
  validProducts: Partial<TeklifimProduct>[];
} {
  const allErrors: { row: number; field: string; message: string }[] = [];
  const validProducts: Partial<TeklifimProduct>[] = [];
  const seenSkus = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2;
    const { isValid, product, errors } = normalizeProductRow(rows[i], rowNum, supplierId);

    if (!isValid || !product) {
      allErrors.push(...errors);
      continue;
    }

    // Check duplicate SKU in the batch
    if (product.sku) {
      if (seenSkus.has(product.sku.toLowerCase())) {
        allErrors.push({
          row: rowNum,
          field: "sku",
          message: `Tekrarlanan stok kodu (SKU): '${product.sku}'. Her ürünün SKU değeri benzersiz olmalıdır.`,
        });
        continue;
      }
      seenSkus.add(product.sku.toLowerCase());
    }

    validProducts.push(product);
  }

  const report: TeklifimProductImportReport = {
    totalRows: rows.length,
    successfulCount: validProducts.length,
    failedCount: allErrors.length > 0 ? rows.length - validProducts.length : 0,
    errors: allErrors,
    importedProductIds: [],
  };

  return { report, validProducts };
}

/**
 * Pure helper for filtering and sorting products
 */
export function filterAndSortProducts(
  products: TeklifimProduct[],
  filters: TeklifimProductFilters
): TeklifimProduct[] {
  let result = [...products];

  // 1. Supplier filter
  if (filters.supplierId) {
    result = result.filter((p) => p.supplierId === filters.supplierId);
  }

  // 2. Status filter
  if (filters.status) {
    result = result.filter((p) => (p.status || (p.isActive ? "published" : "passive")) === filters.status);
  } else {
    result = result.filter((p) => p.status !== "archived" && p.isActive !== false);
  }

  // 3. Category filter
  if (filters.category && filters.category !== "Tümü") {
    result = result.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase());
  }

  // 4. SubCategory filter
  if (filters.subCategory && filters.subCategory !== "Tümü") {
    result = result.filter(
      (p) => p.subCategory && p.subCategory.toLowerCase() === filters.subCategory!.toLowerCase()
    );
  }

  // 5. Stock status filter
  if (filters.stockStatus) {
    result = result.filter((p) => p.stockStatus === filters.stockStatus);
  }

  // 6. In-stock only filter
  if (filters.inStockOnly) {
    result = result.filter(
      (p) =>
        p.stockStatus === "in_stock" ||
        p.stockStatus === "made_to_order" ||
        (p.trackStock && (p.stockQuantity ?? 0) > 0)
    );
  }

  // 7. Price range
  if (typeof filters.minPrice === "number" && !isNaN(filters.minPrice)) {
    result = result.filter((p) => (p.price ?? p.estimatedPrice ?? 0) >= filters.minPrice!);
  }
  if (typeof filters.maxPrice === "number" && !isNaN(filters.maxPrice)) {
    result = result.filter((p) => (p.price ?? p.estimatedPrice ?? 0) <= filters.maxPrice!);
  }

  // 8. Search query
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    result = result.filter((p) => {
      const title = (p.title || p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const sku = (p.sku || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const subCat = (p.subCategory || "").toLowerCase();
      return (
        title.includes(q) ||
        desc.includes(q) ||
        sku.includes(q) ||
        cat.includes(q) ||
        subCat.includes(q)
      );
    });
  }

  // 9. Delivery Region / City
  if (filters.city) {
    const cityLower = filters.city.toLowerCase();
    result = result.filter((p) => {
      if (!p.deliveryRegions || p.deliveryRegions.length === 0) return true;
      return (
        p.deliveryRegions.includes("Tüm Türkiye") ||
        p.deliveryRegions.some((r) => r.toLowerCase().includes(cityLower))
      );
    });
  }

  // 10. Sorting
  if (filters.sort) {
    switch (filters.sort) {
      case "price_asc":
        result.sort((a, b) => (a.price ?? a.estimatedPrice ?? 0) - (b.price ?? b.estimatedPrice ?? 0));
        break;
      case "price_desc":
        result.sort((a, b) => (b.price ?? b.estimatedPrice ?? 0) - (a.price ?? a.estimatedPrice ?? 0));
        break;
      case "popular":
        result.sort((a, b) => (b.viewsCount || 0) + (b.requestsCount || 0) * 3 - ((a.viewsCount || 0) + (a.requestsCount || 0) * 3));
        break;
      case "min_order":
        result.sort((a, b) => (a.minimumOrder || 0) - (b.minimumOrder || 0));
        break;
      case "newest":
      default:
        result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
    }
  } else {
    result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  // 11. Pagination
  if (typeof filters.offset === "number" && filters.offset > 0) {
    result = result.slice(filters.offset);
  }
  if (typeof filters.limit === "number" && filters.limit > 0) {
    result = result.slice(0, filters.limit);
  }

  return result;
}

/**
 * Pure stock decrement logic with out of stock protection
 */
export function decrementProductStock(
  product: TeklifimProduct,
  quantity: number
): {
  updatedProduct: TeklifimProduct;
  outOfStockWarning: boolean;
} {
  const currentQty = product.stockQuantity ?? 0;
  const newQty = Math.max(0, currentQty - quantity);

  let newStatus: TeklifimStockStatus = product.stockStatus || "in_stock";
  let outOfStockWarning = false;

  if (product.trackStock) {
    if (newQty === 0) {
      newStatus = "out_of_stock";
      outOfStockWarning = true;
    } else if (newQty <= 10) {
      newStatus = "low_stock";
    }
  }

  const updatedProduct: TeklifimProduct = {
    ...product,
    stockQuantity: product.trackStock ? newQty : product.stockQuantity,
    stockStatus: newStatus,
    updatedAt: Date.now(),
  };

  return { updatedProduct, outOfStockWarning };
}

/**
 * Pure price comparison for re-order warnings
 */
export function compareReorderPrice(
  currentPrice: number,
  originalPrice: number
): {
  hasChanged: boolean;
  originalPrice: number;
  currentPrice: number;
  priceDifference: number;
  percentChange: number;
} {
  const diff = currentPrice - originalPrice;
  const hasChanged = Math.abs(diff) > 0.001;
  const percentChange = originalPrice > 0 ? (diff / originalPrice) * 100 : 0;

  return {
    hasChanged,
    originalPrice,
    currentPrice,
    priceDifference: Math.round(diff * 100) / 100,
    percentChange: Math.round(percentChange * 10) / 10,
  };
}

/**
 * Checks if supplier catalog contains matching products for a buyer request
 * Grants +15 bonus points in match score
 */
export function checkCatalogProductMatch(
  request: TeklifimRequest,
  supplierProducts: TeklifimProduct[]
): {
  hasMatch: boolean;
  matchingProducts: TeklifimProduct[];
} {
  if (!supplierProducts || supplierProducts.length === 0) {
    return { hasMatch: false, matchingProducts: [] };
  }

  const reqTitleLower = request.title.toLowerCase();
  const catLower = request.category.toLowerCase();
  const subCatLower = (request.subCategory || "").toLowerCase();
  const words = reqTitleLower.split(" ").filter((w) => w.length > 3);

  const matchingProducts = supplierProducts.filter((p) => {
    if (p.status === "archived" || p.isActive === false) return false;
    const pTitle = (p.title || p.name || "").toLowerCase();
    const pCat = (p.category || "").toLowerCase();
    const pSubCat = (p.subCategory || "").toLowerCase();
    const pDesc = (p.description || "").toLowerCase();

    return (
      (catLower && pCat === catLower) ||
      (subCatLower && pSubCat === subCatLower) ||
      words.some((w) => pTitle.includes(w) || pDesc.includes(w))
    );
  });

  return {
    hasMatch: matchingProducts.length > 0,
    matchingProducts,
  };
}

/**
 * Generates CSV string from products
 */
export function exportProductsToCsv(products: TeklifimProduct[]): string {
  const headers = [
    "id",
    "sku",
    "title",
    "category",
    "subCategory",
    "unit",
    "minimumOrder",
    "price",
    "currency",
    "priceVisibility",
    "stockStatus",
    "stockQuantity",
    "leadTimeDays",
    "deliveryRegions",
    "description",
  ];

  const escapeVal = (val: any): string => {
    if (val === undefined || val === null) return "";
    const str = Array.isArray(val) ? val.join("|") : String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes(";")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.join(",")];

  for (const p of products) {
    const row = [
      escapeVal(p.id),
      escapeVal(p.sku || ""),
      escapeVal(p.title || p.name || ""),
      escapeVal(p.category),
      escapeVal(p.subCategory || ""),
      escapeVal(p.unit || "Adet"),
      escapeVal(p.minOrder || p.minimumOrder || "1"),
      escapeVal(p.price ?? p.estimatedPrice ?? ""),
      escapeVal(p.currency || "TRY"),
      escapeVal(p.priceVisibility || "public"),
      escapeVal(p.stockStatus || "in_stock"),
      escapeVal(p.stockQuantity !== undefined ? p.stockQuantity : ""),
      escapeVal(p.leadTimeDays !== undefined ? p.leadTimeDays : ""),
      escapeVal(p.deliveryRegions || []),
      escapeVal(p.description || ""),
    ];
    lines.push(row.join(","));
  }

  return lines.join("\n");
}
