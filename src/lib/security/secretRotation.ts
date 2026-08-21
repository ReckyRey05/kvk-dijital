/**
 * CEP GARSON — VERSIONED SECRET ROTATION & ZERO-DOWNTIME KEY ENGINE
 * 
 * CORE RESPONSIBILITIES:
 * 1. Dual-Key rotation architecture (Primary Key + Grace-Period Secondary Key).
 * 2. Instant secret revocation upon compromise.
 * 3. Graceful token validation during active key rotation transitions.
 */

import crypto from "crypto";

export interface VersionedKeyRing {
  currentKeyVersion: number;
  primaryKey: string;
  previousKey?: string;
  previousKeyExpiresAt?: number;
}

export class SecretKeyRingManager {
  private keyRing: VersionedKeyRing;

  constructor(initialSecret: string = "cg_initial_prod_secret_2026") {
    this.keyRing = {
      currentKeyVersion: 1,
      primaryKey: initialSecret,
    };
  }

  /**
   * Rotates to a new secret key, keeping the old key active for a grace period (e.g. 1 hour).
   */
  public rotateSecret(newSecret: string, gracePeriodMs: number = 60 * 60 * 1000): void {
    this.keyRing = {
      currentKeyVersion: this.keyRing.currentKeyVersion + 1,
      primaryKey: newSecret,
      previousKey: this.keyRing.primaryKey,
      previousKeyExpiresAt: Date.now() + gracePeriodMs,
    };
  }

  /**
   * Immediately revokes the previous key (e.g. in case of compromise).
   */
  public emergencyRevokePreviousKey(): void {
    this.keyRing.previousKey = undefined;
    this.keyRing.previousKeyExpiresAt = undefined;
  }

  /**
   * Validates a signature against the primary key, falling back to previous key if within grace period.
   */
  public verifySignature(payloadStr: string, signature: string): { valid: boolean; keyVersionUsed: number } {
    // 1. Try Primary Key
    const primaryExpected = crypto
      .createHmac("sha256", this.keyRing.primaryKey)
      .update(payloadStr)
      .digest("base64url");

    if (primaryExpected === signature) {
      return { valid: true, keyVersionUsed: this.keyRing.currentKeyVersion };
    }

    // 2. Try Previous Key if within grace period
    if (this.keyRing.previousKey && this.keyRing.previousKeyExpiresAt && Date.now() <= this.keyRing.previousKeyExpiresAt) {
      const prevExpected = crypto
        .createHmac("sha256", this.keyRing.previousKey)
        .update(payloadStr)
        .digest("base64url");

      if (prevExpected === signature) {
        return { valid: true, keyVersionUsed: this.keyRing.currentKeyVersion - 1 };
      }
    }

    return { valid: false, keyVersionUsed: 0 };
  }

  public getPrimaryKey(): string {
    return this.keyRing.primaryKey;
  }
}
