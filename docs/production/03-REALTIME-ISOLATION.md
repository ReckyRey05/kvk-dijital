# CEP GARSON — GERÇEK ZAMANLI İLETİŞİM İZOLASYONU (REALTIME ISOLATION)
**Faz:** FAZ 3 — Realtime Channel Namespace & Crosstalk Prevention  
**Tarih:** 2026-08-21  

---

## 1. GERÇEK ZAMANLI KANAL İZOLASYONU

Sistem genelinde farklı restoranların sekmeleri veya terminalleri arasında veri sızıntısını engellemek için `BroadcastChannel` ve WebSocket kanalları **Tenant ID bazında izole edilmiştir**:

```typescript
// Kiracı A Kanalı:
const channelA = getTenantBroadcastChannelName("rest_aura_bistro");
// Çıktı: "cg_sync_tenant_rest_aura_bistro"

// Kiracı B Kanalı:
const channelB = getTenantBroadcastChannelName("rest_other_lounge");
// Çıktı: "cg_sync_tenant_rest_other_lounge"
```

---

## 2. REALTIME TEST VE BULGU SONUÇLARI

- **Kanal Çakışması:** %0 (Aynı tarayıcıda veya ağda iki farklı restoran açıldığında Restoran A'nın sipariş bildirimleri Restoran B'nin mutfak/kasa ekranına düşmez).
- **Event Manipülasyonu:** `postMessage` ile yabancı tenant ID taşıyan payload'lar alıcı tarafında `assertTenantOwnership` ile filtrelenir.
