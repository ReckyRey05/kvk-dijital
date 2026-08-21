# FAZ 12 — CLOUD FIRESTORE & FIREBASE CONFIGURATION SECURITY

## 1. INFRASTRUCTURE & CREDENTIAL MANAGEMENT
- **Project ID:** `cep-garson-prod`
- **Environment Management:** Credentials loaded via secure server-side environment variables (`FIREBASE_SERVICE_ACCOUNT_KEY`).
- **Settings:** `_db.settings({ ignoreUndefinedProperties: true })` enforced across all Admin SDK instances.
- **Zero Secrets Leak:** Zero private keys, service account JSON files, or database credentials are committed to git or exposed in client bundles.

---

## 2. ATOMIC TRANSACTIONS & NON-DESTRUCTIVE TESTING
- All financial state changes, stock decrements, and session closes execute inside ACID atomic transactions (`db.runTransaction`).
- Automated tests run exclusively inside the isolated namespace:
  `_internal/production-readiness-tests/`
  with deterministic teardown ensuring zero residual data.
