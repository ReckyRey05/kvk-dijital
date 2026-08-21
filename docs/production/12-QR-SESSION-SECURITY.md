# FAZ 12 — QR & SESSION SECURITY SPECIFICATION

## 1. QR THREAT MODEL & ARCHITECTURAL INVARIANTS

### 1.1. Core Invariant: QR Is Discovery, Not Authority
- **QR Code = Discovery URI Only** (`/qr/aura-bistro/m-4`).
- A QR code contains NO secret keys, NO administrative privileges, NO payment authorizations, and NO permanent identity claims.
- Possessing a photo, screenshot, or URL of a table QR code does NOT allow an adversary to place orders without an active, server-approved table session.

---

## 2. ADVERSARIAL QR ATTACK MATRIX

| Attack Vector | Attacker Action | Server Defense | Result |
|---|---|---|---|
| QR Photo / Remote Scan | Attacker scans QR from photo at home | Table is either EMPTY (requires physical presence) or OCCUPIED (guest join requires host approval). | Blocked / Quarantined in PENDING_APPROVAL |
| QR After Payment / Close | Attacker scans QR on previously paid table | Server detects closed table, starts fresh isolated session with 0 TL bill. Past session state never leaks. | Fresh Session Created (Zero Leak) |
| Altered Table / Restaurant ID | Attacker modifies URL parameters (`/qr/fake-rest/m-999`) | TenantGuard validates restaurant and table existence in canonical repository. | 404 / 400 Bad Request |
| Malicious QR Replay | Attacker replays old QR link with old session token in LocalStorage | Server validates token against active sessions. Stale/closed tokens return `SESSION_INVALID`. | 403 Forbidden |

---

## 3. SESSION LIFECYCLE STATE MACHINE

```
[ QR DISCOVERY ] ──> Server Checks Active Table Session
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
 [ NO ACTIVE SESSION ]               [ ACTIVE SESSION EXISTS ]
         │                                   │
 Generate Fresh Session ID           Join as Guest (PENDING_APPROVAL)
 Set Table Status: OCCUPIED                  │
 Assign Host Role (👑 Masa Reisi)     Host Approves ──> APPROVED
         │                                   │
         └─────────────────┬─────────────────┘
                           ▼
                    [ ACTIVE SESSION ]
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
[ 15-Min Expiry Timeout ]           [ Cashier Bill Close ]
         │                                   │
    EXPIRED                             CLOSED
 (Session Token Purged)             (Table -> EMPTY, Clients -> Finished)
```
