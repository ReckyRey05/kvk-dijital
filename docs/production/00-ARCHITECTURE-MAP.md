# CEP GARSON — MİMARİ HARİTASI (ARCHITECTURE MAP)
**Faz:** FAZ 0 — Architecture Mapping  
**Tarih:** 2026-08-21  

---

## 1. KATMANLI MİMARİ ŞEMASI (LAYERED ARCHITECTURE)

```mermaid
graph TD
    subgraph Client Layer ["1. İSTEMCİ KATMANI (CLIENT LAYER)"]
        QR_Client["Müşteri QR Menü (/qr/slug/tableId)"]
        POS_Client["Kasa Terminali (/restoran/slug/kasa)"]
        KDS_Client["Mutfak Terminali (/restoran/slug/mutfak)"]
        Boss_Client["Yönetim Paneli (/restoran/slug/yonetim)"]
    end

    subgraph Sync Layer ["2. REALTIME & SENKRONİZASYON"]
        BC["BroadcastChannel ('cep_garson_realtime_sync')"]
        LocalStore["Browser LocalStorage (cg_*)"]
    end

    subgraph API Layer ["3. SERVERLESS API KATMANI (NEXT.JS ROUTE HANDLERS)"]
        API_Order["POST /api/restaurant/order"]
        API_Session["POST /api/restaurant/session"]
        API_Waiter["POST /api/restaurant/waiter-call"]
        API_Webhook["POST /api/restaurant/pos-webhook"]
        API_Admin["GET/POST /api/admin/* (Corporate CMS)"]
    end

    subgraph Backend Services ["4. SERVİS & GÜVENLİK KATMANI"]
        SessionMgr["Session Validator (session.ts)"]
        RateLimiter["Sliding Window RateLimiter (rateLimit.ts)"]
        Sanitizer["Payload Byte Limiter & HTML Sanitizer"]
        AdminAuth["Firebase Admin Auth (serverAuth.ts)"]
        PosBridge["POS Bridge Hub (posBridge.ts)"]
    end

    subgraph Persistence Layer ["5. VERİ VE KALICILIK (PERSISTENCE)"]
        MemoryMap["In-Memory Maps (activeSessions, store)"]
        FirestoreDB["Google Cloud Firestore (Blog, Projects, Messages)"]
    end

    QR_Client <--> BC
    POS_Client <--> BC
    KDS_Client <--> BC
    Boss_Client <--> BC

    BC <--> LocalStore

    QR_Client --> API_Session
    QR_Client --> API_Order
    QR_Client --> API_Waiter

    API_Session --> SessionMgr
    API_Order --> SessionMgr
    API_Order --> PosBridge
    API_Admin --> AdminAuth
    AdminAuth --> FirestoreDB
    SessionMgr --> MemoryMap
```

---

## 2. BİLEŞEN VE DİZİN YAPISI

| Katman | Dizin / Dosya | Sorumluluk |
| :--- | :--- | :--- |
| **QR Client** | `src/app/qr/[restaurantSlug]/[tableId]/page.tsx` | Menü listeleme, ortak sepet, garson çağırma, hesap bölme |
| **Kasa POS** | `src/app/restoran/[restaurantSlug]/kasa/page.tsx` | Masa salon planı, adisyon kapama, e-fatura, acil alarmlar |
| **Mutfak KDS** | `src/app/restoran/[restaurantSlug]/mutfak/page.tsx` | İstasyon bazlı sipariş hazırlığı, timer, sesli ikaz |
| **Yönetim Boss** | `src/app/restoran/[restaurantSlug]/yonetim/page.tsx` | Reçete/maliyet kâr matrisi, personel PIN/2FA, Z raporu |
| **Store** | `src/lib/restaurant/store.ts` | Reaktif state yönetimi, cross-tab BroadcastChannel sync |
| **Session** | `src/lib/restaurant/session.ts` | 15 dakikalık masa token üretimi ve doğrulama |
| **API Endpoints** | `src/app/api/restaurant/*` | Sipariş kabulü, oturum yenileme, webhook alımı |
| **Güvenlik** | `src/lib/security/*` | Sliding window rate limit, byte stream limit, sanitize |

---

## 3. MİMARİ BAĞIMLILIKLAR VE RİSK MATRİSİ

```mermaid
pie title Mimari Risk Dağılımı
    "Serverless Memory Kaybı (Critical)" : 35
    "Fiyatın İstemciden Alınması (Critical)" : 25
    "Merkezi DB Eksikliği (Critical)" : 20
    "Webhook İmza Doğrulaması Yok (High)" : 10
    "Cross-Device Realtime Eksikliği (High)" : 10
```
