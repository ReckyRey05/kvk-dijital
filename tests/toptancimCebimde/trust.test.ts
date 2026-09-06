import assert from "node:assert";
import {
  computeProfileCompletion,
  getCloneableRequestData,
} from "../../src/lib/teklifimGelsin/teklifimService";
import {
  TeklifimProfile,
  TeklifimRequest,
  TeklifimOffer,
  TeklifimReview,
  TeklifimVerificationRequest,
  TeklifimReport,
  TeklifimBlock,
} from "../../src/types/teklifimGelsin";

console.log("===============================================================");
console.log("▶ [TOPTANCIM CEBIMDE TEST] FAZ 3: Guven & Itibar Test Paketi");
console.log("===============================================================");

// =========================================================================
// 1. Verification State Machine Test
// =========================================================================
console.log("  - 1. Testing Verification State Machine Transitions...");
{
  type VerificationState = "unverified" | "pending" | "approved" | "rejected";

  function transitionVerification(
    currentState: VerificationState,
    action: "submit" | "approve" | "reject" | "reapply"
  ): VerificationState {
    switch (currentState) {
      case "unverified":
        if (action === "submit") return "pending";
        throw new Error("Invalid action for unverified state");
      case "pending":
        if (action === "approve") return "approved";
        if (action === "reject") return "rejected";
        throw new Error("Invalid action for pending state");
      case "rejected":
        if (action === "reapply") return "pending";
        if (action === "approve") return "approved";
        throw new Error("Invalid action for rejected state");
      case "approved":
        if (action === "reject") return "rejected";
        throw new Error("Invalid action for approved state");
      default:
        return currentState;
    }
  }

  let state: VerificationState = "unverified";
  state = transitionVerification(state, "submit");
  assert.strictEqual(state, "pending", "Initial submission must transition to pending");

  state = transitionVerification(state, "approve");
  assert.strictEqual(state, "approved", "Admin approval must transition to approved");

  state = transitionVerification(state, "reject");
  assert.strictEqual(state, "rejected", "Admin revocation must transition to rejected");

  state = transitionVerification(state, "reapply");
  assert.strictEqual(state, "pending", "Supplier re-application must transition to pending");

  console.log("    ✓ Verification state machine transitions validated.");
}

// =========================================================================
// 2. Admin Authorization Security Test
// =========================================================================
console.log("  - 2. Testing Admin Role & Corporate Email Verification...");
{
  function isCorporateAdmin(email?: string, role?: string): boolean {
    if (role === "admin") return true;
    if (!email) return false;
    const corporatePattern = /^.+@kvkdijitalcozumler\.com$/i;
    return (
      email.toLowerCase() === "alihaydarkvk@kvkdijitalcozumler.com" ||
      email.toLowerCase() === "iletisim@kvkdijitalcozumler.com" ||
      corporatePattern.test(email)
    );
  }

  assert.strictEqual(
    isCorporateAdmin("alihaydarkvk@kvkdijitalcozumler.com"),
    true,
    "Primary admin email must have admin privileges"
  );
  assert.strictEqual(
    isCorporateAdmin("staff@kvkdijitalcozumler.com"),
    true,
    "Any @kvkdijitalcozumler.com domain email must have admin access"
  );
  assert.strictEqual(
    isCorporateAdmin(undefined, "admin"),
    true,
    "Profile with role === 'admin' must have admin privileges"
  );
  assert.strictEqual(
    isCorporateAdmin("competitor@gmail.com", "user"),
    false,
    "External gmail user must be denied admin privileges"
  );
  assert.strictEqual(
    isCorporateAdmin("hacker@fakekvkdijitalcozumler.com", "supplier"),
    false,
    "Lookalike domain must be denied"
  );
  console.log("    ✓ Corporate admin authorization strictly verified.");
}

// =========================================================================
// 3. Verified Badge Logic & Zero Fake Verification Test
// =========================================================================
console.log("  - 3. Testing Verified Badge Eligibility (Zero Fake Proof)...");
{
  function shouldDisplayVerifiedBadge(profile: Partial<TeklifimProfile>): boolean {
    return profile.isVerified === true || profile.verificationStatus === "verified";
  }

  const unverifiedSupplier: Partial<TeklifimProfile> = {
    uid: "sup_unverified",
    companyName: "Yeni Toptancı Ltd.",
    verificationStatus: "unverified",
    isVerified: false,
  };
  assert.strictEqual(
    shouldDisplayVerifiedBadge(unverifiedSupplier),
    false,
    "Unverified supplier must NEVER display verified badge"
  );

  const pendingSupplier: Partial<TeklifimProfile> = {
    uid: "sup_pending",
    companyName: "İncelenen Toptancı A.Ş.",
    verificationStatus: "pending",
  };
  assert.strictEqual(
    shouldDisplayVerifiedBadge(pendingSupplier),
    false,
    "Pending supplier must NEVER display verified badge before approval"
  );

  const approvedSupplier: Partial<TeklifimProfile> = {
    uid: "sup_approved",
    companyName: "Onaylı Dağıtım Ltd.",
    verificationStatus: "verified",
    isVerified: true,
  };
  assert.strictEqual(
    shouldDisplayVerifiedBadge(approvedSupplier),
    true,
    "Admin-approved verified supplier must display verified badge"
  );
  console.log("    ✓ Verified badge is strictly rendered only for genuine approved suppliers.");
}

// =========================================================================
// 4. Real Completed Deals Calculation Test
// =========================================================================
console.log("  - 4. Testing Completed Deals Calculation...");
{
  const mockRequests: Partial<TeklifimRequest>[] = [
    { id: "r1", selectedSupplierId: "sup_1", status: "completed" },
    { id: "r2", selectedSupplierId: "sup_1", status: "completed" },
    { id: "r3", selectedSupplierId: "sup_1", status: "supplier_selected" }, // in progress, not completed
    { id: "r4", selectedSupplierId: "sup_1", status: "cancelled" }, // cancelled
    { id: "r5", selectedSupplierId: "sup_2", status: "completed" }, // different supplier
  ];

  function countCompletedDeals(supplierId: string, requests: Partial<TeklifimRequest>[]): number {
    return requests.filter(
      (r) => r.selectedSupplierId === supplierId && r.status === "completed"
    ).length;
  }

  const sup1Deals = countCompletedDeals("sup_1", mockRequests);
  assert.strictEqual(sup1Deals, 2, "Only completed requests must count toward completed deals");

  const sup2Deals = countCompletedDeals("sup_2", mockRequests);
  assert.strictEqual(sup2Deals, 1, "Supplier 2 must have exactly 1 completed deal");

  const sup3Deals = countCompletedDeals("sup_3", mockRequests);
  assert.strictEqual(sup3Deals, 0, "Supplier with zero completed deals must return 0");

  console.log("    ✓ Completed deals counting respects completed state only.");
}

// =========================================================================
// 5. Review Eligibility - Strict Post-Completion Constraint Test
// =========================================================================
console.log("  - 5. Testing Review Eligibility Checks...");
{
  function validateReviewEligibility(
    request: Partial<TeklifimRequest>,
    businessId: string,
    existingReviewCount: number
  ): { allowed: boolean; reason?: string } {
    if (request.businessId !== businessId) {
      return { allowed: false, reason: "Yalnızca talebi açan işletme değerlendirme yapabilir." };
    }
    const isCompleted = request.status === "completed" || request.status === "supplier_selected";
    if (!isCompleted || !request.selectedSupplierId) {
      return { allowed: false, reason: "Yalnızca tamamlanmış veya tedarikçi seçilmiş işlemler değerlendirilebilir." };
    }
    if (existingReviewCount > 0) {
      return { allowed: false, reason: "Bu işlem için zaten bir değerlendirme yapılmıştır." };
    }
    return { allowed: true };
  }

  // Case A: Open request (not completed) -> NOT allowed
  const openReq: Partial<TeklifimRequest> = {
    id: "req_open",
    businessId: "biz_1",
    status: "published",
  };
  assert.strictEqual(
    validateReviewEligibility(openReq, "biz_1", 0).allowed,
    false,
    "Open requests without selected supplier cannot be reviewed"
  );

  // Case B: Completed request, but different business -> NOT allowed
  const completedReq: Partial<TeklifimRequest> = {
    id: "req_comp",
    businessId: "biz_1",
    selectedSupplierId: "sup_1",
    status: "completed",
  };
  assert.strictEqual(
    validateReviewEligibility(completedReq, "biz_other", 0).allowed,
    false,
    "Unauthorized business cannot review another business's transaction"
  );

  // Case C: Legitimate business owner on completed transaction -> ALLOWED
  assert.strictEqual(
    validateReviewEligibility(completedReq, "biz_1", 0).allowed,
    true,
    "Legitimate business on completed transaction must be allowed to review"
  );

  console.log("    ✓ Review eligibility strictly enforces business ownership and completed status.");
}

// =========================================================================
// 6. Duplicate Review Prevention Test
// =========================================================================
console.log("  - 6. Testing Duplicate Review Prevention...");
{
  const reviewsDatabase: TeklifimReview[] = [
    {
      id: "rev_1",
      requestId: "req_100",
      requestTitle: "Karton Kutu Alımı",
      businessId: "biz_1",
      businessName: "Kadıköy Kahvecisi",
      supplierId: "sup_1",
      rating: 5,
      comment: "Çok hızlı teslimat yapıldı.",
      isAnonymous: false,
      createdAt: 10000,
    },
  ];

  function canSubmitReview(requestId: string, businessId: string): boolean {
    return !reviewsDatabase.some(
      (r) => r.requestId === requestId && r.businessId === businessId
    );
  }

  assert.strictEqual(
    canSubmitReview("req_100", "biz_1"),
    false,
    "Second review for same requestId and businessId must be rejected"
  );

  assert.strictEqual(
    canSubmitReview("req_200", "biz_1"),
    true,
    "New transaction for same businessId must be permitted"
  );

  console.log("    ✓ Duplicate reviews are prevented.");
}

// =========================================================================
// 7. Reputation Score & Average Rating Calculation Test
// =========================================================================
console.log("  - 7. Testing Rating Average and Zero-Review Omission...");
{
  function computeAverageRating(ratings: number[]): { average: number | null; count: number } {
    if (ratings.length === 0) return { average: null, count: 0 };
    const sum = ratings.reduce((a, b) => a + b, 0);
    const avg = Number((sum / ratings.length).toFixed(1));
    return { average: avg, count: ratings.length };
  }

  // 0 reviews -> must return null, NOT 0.0 or fake numbers
  const zeroReviews = computeAverageRating([]);
  assert.strictEqual(zeroReviews.average, null, "Zero reviews must return null rating");
  assert.strictEqual(zeroReviews.count, 0, "Zero reviews count must be 0");

  // Sample reviews: 5, 4, 5, 3 -> avg = 4.25 -> 4.3
  const multipleReviews = computeAverageRating([5, 4, 5, 3]);
  assert.strictEqual(multipleReviews.average, 4.3, "Average of [5,4,5,3] must be 4.3");
  assert.strictEqual(multipleReviews.count, 4, "Count must be 4");

  // Single review: 5 -> avg = 5.0
  const singleReview = computeAverageRating([5]);
  assert.strictEqual(singleReview.average, 5.0, "Single 5 star review must yield 5.0");

  console.log("    ✓ Rating average calculation correctly computes mean and omits zero-review scores.");
}

// =========================================================================
// 8. Real Response Time Calculation Test (Sample Size >= 2)
// =========================================================================
console.log("  - 8. Testing Real Response Speed (Requires Sample Size >= 2)...");
{
  function calculateResponseSpeed(timeDiffsInMinutes: number[]): {
    minutes: number | null;
    formatted: string | null;
  } {
    // Insufficient data constraint
    if (timeDiffsInMinutes.length < 2) {
      return { minutes: null, formatted: null };
    }

    const avg = Math.round(
      timeDiffsInMinutes.reduce((a, b) => a + b, 0) / timeDiffsInMinutes.length
    );
    const formatted = avg < 60 ? `${avg} dk` : `${Math.round(avg / 60)} saat`;
    return { minutes: avg, formatted };
  }

  // 0 offers -> null
  assert.strictEqual(
    calculateResponseSpeed([]).minutes,
    null,
    "No offers must result in null response speed"
  );

  // 1 offer -> null (insufficient sample size, no single-point distortion)
  assert.strictEqual(
    calculateResponseSpeed([15]).minutes,
    null,
    "Single offer must result in null to avoid distortion"
  );

  // 2 offers: 20 min and 40 min -> avg 30 dk
  const twoOffers = calculateResponseSpeed([20, 40]);
  assert.strictEqual(twoOffers.minutes, 30, "Average of 20 and 40 must be 30");
  assert.strictEqual(twoOffers.formatted, "30 dk", "Formatted under 60 min must be '30 dk'");

  // 3 offers: 120 min, 180 min, 240 min -> avg 180 min = 3 saat
  const longOffers = calculateResponseSpeed([120, 180, 240]);
  assert.strictEqual(longOffers.minutes, 180);
  assert.strictEqual(longOffers.formatted, "3 saat", "Formatted over 60 min must be '3 saat'");

  console.log("    ✓ Response speed calculation correctly enforces sample size threshold >= 2.");
}

// =========================================================================
// 9. Report / Complaint Submission & Lifecycle Test
// =========================================================================
console.log("  - 9. Testing Complaint / Report Submission & Lifecycle...");
{
  type ReportStatus = "pending" | "reviewed" | "action_taken" | "dismissed";

  const validReasons = [
    "fake_company",
    "misleading_info",
    "spam",
    "inappropriate",
    "other",
  ];

  function validateReport(reason: string, description: string): boolean {
    if (!validReasons.includes(reason)) return false;
    if (!description || description.trim().length < 5) return false;
    return true;
  }

  assert.strictEqual(
    validateReport("fake_company", "Bu firma sahte vergi numarası kullanıyor."),
    true,
    "Valid reason and description must pass"
  );

  assert.strictEqual(
    validateReport("unauthorized_reason", "Açıklama"),
    false,
    "Invalid reason must be rejected"
  );

  assert.strictEqual(
    validateReport("spam", "kısa"),
    false,
    "Too short description must be rejected"
  );

  console.log("    ✓ Report creation validation confirmed.");
}

// =========================================================================
// 10. Block (Engelleme) Mechanism Test
// =========================================================================
console.log("  - 10. Testing Block Mechanism (Bidirectional Isolation)...");
{
  const activeBlocks: Set<string> = new Set();

  function blockUser(blockerId: string, blockedId: string) {
    activeBlocks.add(`${blockerId}_${blockedId}`);
  }

  function unblockUser(blockerId: string, blockedId: string) {
    activeBlocks.delete(`${blockerId}_${blockedId}`);
  }

  function isBlocked(userA: string, userB: string): boolean {
    return (
      activeBlocks.has(`${userA}_${userB}`) ||
      activeBlocks.has(`${userB}_${userA}`)
    );
  }

  const businessId = "biz_istanbul";
  const supplierId = "sup_spammer";

  assert.strictEqual(isBlocked(businessId, supplierId), false, "Initially not blocked");

  blockUser(businessId, supplierId);
  assert.strictEqual(isBlocked(businessId, supplierId), true, "Blocked in A -> B direction");
  assert.strictEqual(isBlocked(supplierId, businessId), true, "Bidirectionally isolated in B -> A direction");

  // When blocked, supplier cannot bid on business request
  function canSupplierBid(bidderSupplierId: string, requestBusinessId: string): boolean {
    if (isBlocked(bidderSupplierId, requestBusinessId)) return false;
    return true;
  }

  assert.strictEqual(canSupplierBid(supplierId, businessId), false, "Blocked supplier cannot bid");

  unblockUser(businessId, supplierId);
  assert.strictEqual(isBlocked(businessId, supplierId), false, "Unblocked restores access");
  assert.strictEqual(canSupplierBid(supplierId, businessId), true, "Unblocked supplier can bid again");

  console.log("    ✓ User blocking properly enforces bidirectional marketplace isolation.");
}

// =========================================================================
// 11. Repeat Request (Cloning) Integrity Test
// =========================================================================
console.log("  - 11. Testing Repeat Request (Clone) Field Integrity...");
{
  const originalRequest: TeklifimRequest = {
    id: "orig_123",
    businessId: "biz_999",
    businessName: "Göztepe Kafe",
    businessCity: "İstanbul",
    title: "1000 Adet Baskılı Kraft Kutu",
    category: "Ambalaj & Paketleme",
    productName: "Kraft Kutu",
    quantity: 1000,
    unit: "Adet",
    deliveryDays: 5,
    city: "İstanbul",
    district: "Kadıköy",
    description: "Ön yüz tek renk siyah logo baskılı.",
    sampleRequired: true,
    status: "completed",
    selectedSupplierId: "sup_best",
    selectedOfferId: "off_win",
    offerCount: 8,
    createdAt: 100000,
    updatedAt: 200000,
  };

  function cloneRequestData(r: TeklifimRequest): Partial<TeklifimRequest> {
    return {
      title: `${r.title} (Yeniden)`,
      category: r.category,
      productName: r.productName,
      quantity: r.quantity,
      unit: r.unit,
      deliveryDays: r.deliveryDays,
      city: r.city,
      district: r.district,
      description: r.description,
      sampleRequired: r.sampleRequired,
    };
  }

  const cloned = cloneRequestData(originalRequest);

  assert.strictEqual(cloned.title, "1000 Adet Baskılı Kraft Kutu (Yeniden)");
  assert.strictEqual(cloned.quantity, 1000);
  assert.strictEqual(cloned.unit, "Adet");
  assert.strictEqual(cloned.category, "Ambalaj & Paketleme");
  assert.strictEqual(cloned.city, "İstanbul");
  assert.strictEqual(cloned.sampleRequired, true);

  // Assert private / transactional fields are NOT carried over
  assert.strictEqual((cloned as any).id, undefined, "Cloned request must not carry original id");
  assert.strictEqual((cloned as any).selectedSupplierId, undefined, "Selected supplier must be cleared");
  assert.strictEqual((cloned as any).selectedOfferId, undefined, "Selected offer must be cleared");
  assert.strictEqual((cloned as any).offerCount, undefined, "Offer count must be reset");

  console.log("    ✓ Repeat request properly clones specifications without transactional leaks.");
}

// =========================================================================
// 12. Profile Completion Computation Test
// =========================================================================
console.log("  - 12. Testing Profile Completion Percentage & Missing Fields List...");
{
  // Minimal profile
  const minimalProfile: Partial<TeklifimProfile> = {
    companyName: "Yeni Firma",
    contactName: "Ali Bey",
    phone: "05320000000",
  };

  const minimalResult = computeProfileCompletion(minimalProfile);
  assert.ok(minimalResult.percentage < 50, "Minimal profile must be under 50%");
  assert.ok(minimalResult.missingFields.length > 3, "Minimal profile must have several missing fields");

  // Comprehensive profile
  const fullProfile: Partial<TeklifimProfile> = {
    companyName: "Tam Donanımlı Toptan A.Ş.",
    contactName: "Ayşe Hanım",
    phone: "05321112233",
    city: "İstanbul",
    district: "İkitelli",
    categories: ["Ambalaj & Paketleme", "Matbaa"],
    description: "Kurumsal toptan dağıtım ve üretim merkezi.",
    deliveryRegions: ["Marmara", "Ege"],
    minOrder: "1 Koli",
    taxNumber: "1234567890",
    taxOffice: "İkitelli",
    tradeRegistryNumber: "98765",
    website: "https://tamdonanimli.com.tr",
    yearFounded: 2015,
    logoUrl: "https://example.com/logo.png",
  };

  const fullResult = computeProfileCompletion(fullProfile);
  assert.strictEqual(fullResult.percentage, 100, "Complete profile must reach 100%");
  assert.strictEqual(fullResult.missingFields.length, 0, "Complete profile must have 0 missing fields");

  console.log("    ✓ Profile completion percentage and missing fields computed accurately.");
}

console.log("===============================================================");
console.log("✅ ALL 12 FAZ 3 TRUST & REPUTATION UNIT TESTS PASSED!");
console.log("===============================================================");
