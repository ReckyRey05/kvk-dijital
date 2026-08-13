"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Building, 
  MapPin, 
  Home, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Filter, 
  Search, 
  X, 
  ArrowRight, 
  Info,
  PhoneCall,
  CheckCircle2
} from "lucide-react";

interface Property {
  id: string;
  code: string;
  title: string;
  type: "Daire" | "Villa" | "Ofis" | "Penthouse";
  status: "Satılık" | "Kiralık";
  price: string;
  priceNum: number;
  location: string;
  sqm: number;
  rooms: string;
  bathrooms: number;
  floor: string;
  image: string;
  features: string[];
  description: string;
}

const mockProperties: Property[] = [
  {
    id: "p1",
    code: "VIZ-101",
    title: "Pendik Sahil Hattında Deniz Manzaralı Lüks 3+1 Residance",
    type: "Daire",
    status: "Satılık",
    price: "8.750.000 ₺",
    priceNum: 8750000,
    location: "Pendik / Marina Bölgesi",
    sqm: 165,
    rooms: "3+1",
    bathrooms: 2,
    floor: "12. Kat",
    image: "/images/demos/vizyon-gayrimenkul/hero.jpg",
    features: ["Deniz Manzarası", "Akıllı Ev Sistemi", "Kapalı Otopark", "7/24 Güvenlik"],
    description: "Pendik marina ve sahil şeridine yürüme mesafesinde, geniş cam cepheli ve yüksek tavanlı panoramik deniz manzaralı konsept residance dairesi."
  },
  {
    id: "p2",
    code: "VIZ-102",
    title: "Tuzla Mercan Koyu Müstakil Havuzlu Özel Mimari Villa",
    type: "Villa",
    status: "Satılık",
    price: "24.500.000 ₺",
    priceNum: 24500000,
    location: "Tuzla / Mercan",
    sqm: 420,
    rooms: "5+2",
    bathrooms: 4,
    floor: "Müstakil Villa",
    image: "/images/demos/vizyon-gayrimenkul/villa.jpg",
    features: ["Özel Yüzme Havuzu", "Geniş Peyzaj Bahçe", "Müstakil Garaj", "Yerden Isıtma"],
    description: "Doğa ile iç içe, müstakil yüzme havuzu ve peyzajlı özel bahçesi bulunan modern mimarili lüks villa."
  },
  {
    id: "p3",
    code: "VIZ-103",
    title: "Kartal Dragos Sahilde Şehir & Deniz Manzaralı Kiralık Daire",
    type: "Daire",
    status: "Kiralık",
    price: "42.000 ₺ / ay",
    priceNum: 42000,
    location: "Kartal / Dragos",
    sqm: 125,
    rooms: "2+1",
    bathrooms: 2,
    floor: "8. Kat",
    image: "/images/demos/vizyon-gayrimenkul/apartment.jpg",
    features: ["Geniş Balkon", "Ankastre Mutfak", "Spor Salonu", "Resepsiyon Hizmeti"],
    description: "Dragos tepesi eteklerinde, ferah yaşam alanına ve geniş balkona sahip kiralık daire."
  },
  {
    id: "p4",
    code: "VIZ-104",
    title: "Kadıköy Bağdat Caddesi Yakını Prestijli Kurumsal Ofis",
    type: "Ofis",
    status: "Satılık",
    price: "16.800.000 ₺",
    priceNum: 16800000,
    location: "Kadıköy / Caddebostan",
    sqm: 210,
    rooms: "4+1 Düzen",
    bathrooms: 2,
    floor: "3. Kat",
    image: "/images/demos/vizyon-gayrimenkul/office.jpg",
    features: ["Metroya Yürüme Mesafesi", "Fiber İnternet", "VRF İklimlendirme", "Jeneratör"],
    description: "Kurumsal firmalar ve hukuk/danışmanlık ofisleri için hazır bölmeli, yüksek prestijli Caddebostan lokasyonlu ticari mülk."
  },
  {
    id: "p5",
    code: "VIZ-105",
    title: "Maltepe Yalı Mahallesi Panoramik Teraslı Dubleks Penthouse",
    type: "Penthouse",
    status: "Satılık",
    price: "14.200.000 ₺",
    priceNum: 14200000,
    location: "Maltepe / Yalı Mahallesi",
    sqm: 280,
    rooms: "4+2",
    bathrooms: 3,
    floor: "Çatı Dubleks",
    image: "/images/demos/vizyon-gayrimenkul/penthouse.jpg",
    features: ["100 m² Açık Teras", "Jakuzi Tesisatı", "Özel Asansör Çıkışı", "Ada Manzarası"],
    description: "Adalar manzarasına hakim 100 m² geniş açık teraslı, özel asansör erişimli çatı dubleksi residance."
  },
  {
    id: "p6",
    code: "VIZ-106",
    title: "Pendik Çamlık Bölgesinde Bahçe Kullanımlı Kiralık Daire",
    type: "Daire",
    status: "Kiralık",
    price: "35.000 ₺ / ay",
    priceNum: 35000,
    location: "Pendik / Çamlık",
    sqm: 140,
    rooms: "3+1",
    bathrooms: 2,
    floor: "Bahçe Katı",
    image: "/images/demos/vizyon-gayrimenkul/garden-house.jpg",
    features: ["Tahsisli Özel Bahçe", "Site İçi Çocuk Parkı", "7/24 Güvenlik", "Açık Otopark"],
    description: "Aile yaşamına uygun, site içerisinde özel bahçe kullanım alanına sahip kiralık daire."
  }
];

export default function DemoEmlakClient() {
  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>("Tümü");
  const [typeFilter, setTypeFilter] = useState<string>("Tümü");
  const [locationFilter, setLocationFilter] = useState<string>("Tümü");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Computed Filtered Properties
  const filteredProperties = useMemo(() => {
    return mockProperties.filter(p => {
      if (statusFilter !== "Tümü" && p.status !== statusFilter) return false;
      if (typeFilter !== "Tümü" && p.type !== typeFilter) return false;
      if (locationFilter !== "Tümü" && !p.location.includes(locationFilter)) return false;
      return true;
    });
  }, [statusFilter, typeFilter, locationFilter]);

  const triggerToast = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg("Bu bir konsept demo çalışmadır. Gerçek gayrimenkul ofisiniz için ilan takip, Sahibinden XML aktarımı ve doğrudan Danışman WhatsApp bağlantısı kurulur.");
    setTimeout(() => setToastMsg(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#0b1a18] text-[#f9f8f5] flex flex-col font-sans selection:bg-[#d19c53]/30 selection:text-white">
      
      {/* Fixed Floating Bottom Right Demo Badge */}
      <div className="fixed bottom-6 right-6 z-50 hidden sm:flex items-center gap-3 p-3 rounded-full bg-[#061211]/95 border border-[#d19c53]/60 text-white text-xs shadow-2xl backdrop-blur-md">
        <Info className="w-4 h-4 text-[#d19c53] shrink-0" />
        <span className="text-[11px] text-[#8ca8a4]">Konsept Demo — <strong>KvK Dijital</strong></span>
        <Link href="/#iletisim" className="px-3 py-1 rounded bg-[#d19c53] text-[#0b1a18] font-bold text-[10px] uppercase tracking-wider hover:bg-[#e0ad66] transition-colors">
          Teklif Al
        </Link>
      </div>

      {/* 2. REAL ESTATE MARKETPLACE SEARCH HEADER (INTEGRATED SEARCH BOX IN BAR) */}
      <header className="sticky top-0 z-40 bg-[#0b1a18]/95 backdrop-blur-md border-b border-[#183632]">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-6">
          
          {/* Left Brand & Return Button */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="px-3 py-1.5 rounded-full border border-[#1f4742] text-xs font-semibold text-[#8ca8a4] hover:text-[#d19c53] hover:border-[#d19c53] transition-all inline-flex items-center gap-1.5">
              ← KvK Sitesine Dön
            </Link>
            <span className="text-[#183632]">|</span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg font-bold tracking-wider text-[#f9f8f5]">VİZYON</span>
              <span className="text-[10px] uppercase tracking-widest text-[#d19c53] font-semibold hidden sm:inline">Gayrimenkul</span>
            </div>
          </div>

          {/* Center Integrated Quick Property Search Bar Input */}
          <div className="hidden lg:flex flex-grow max-w-md items-center relative">
            <a 
              href="#search"
              className="w-full px-4 py-2 bg-[#061211] border border-[#1f4742] rounded-full text-xs text-[#8ca8a4] flex items-center justify-between hover:border-[#d19c53] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#d19c53]" />
                <span>Pendik, Kartal, Maltepe bölgesinde mülk arayın...</span>
              </div>
              <span className="px-2 py-0.5 bg-[#d19c53]/20 text-[#d19c53] rounded text-[10px] font-mono">Filtrele</span>
            </a>
          </div>

          {/* Right Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <a 
              href="#contact"
              className="px-5 py-2.5 bg-[#d19c53] text-[#0b1a18] font-bold text-xs tracking-widest uppercase hover:bg-[#e0ad66] transition-all shadow-lg shadow-[#d19c53]/10"
            >
              Danışmanla Görüş
            </a>
          </div>

        </div>
      </header>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-5 bg-[#0e2421] border border-[#d19c53] text-[#f9f8f5] text-xs leading-relaxed shadow-2xl flex items-start gap-3 rounded-lg">
          <Info className="w-5 h-5 text-[#d19c53] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#d19c53] mb-1">Demo Bilgilendirmesi</p>
            <p>{toastMsg}</p>
          </div>
        </div>
      )}

      {/* 3. HERO WITH EMBEDDED REAL-TIME SEARCH BAR */}
      <section id="search" className="py-20 md:py-24 border-b border-[#183632] relative overflow-hidden bg-gradient-to-b from-[#0b1a18] to-[#0d2220]">
        <div className="container mx-auto px-6 max-w-6xl">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#122e2a] border border-[#1f4742] text-[#d19c53] text-[11px] tracking-widest uppercase font-semibold">
              <Building className="w-3.5 h-3.5 text-[#d19c53]" />
              Emlak & Gayrimenkul Web Sitesi Konsepti
            </span>

            <h1 className="font-serif text-4xl sm:text-6xl font-light text-[#f9f8f5] leading-tight">
              Hayalinizdeki Yaşam Alanını <br />
              <em className="italic font-serif text-[#d19c53] font-normal">Güvenle Keşfedin.</em>
            </h1>

            <p className="text-sm sm:text-base text-[#9ebcb8] max-w-xl mx-auto leading-relaxed font-light">
              Gayrimenkul alım, satım ve kiralama süreçlerinde şeffaf danışmanlık ve filtrelenebilir dijital portföy deneyimi.
            </p>
          </div>

          {/* EMBEDDED SEARCH & FILTER ENGINE */}
          <div className="p-6 sm:p-8 bg-[#102624] border border-[#1f4742] shadow-2xl rounded-sm">
            
            {/* Status Tabs */}
            <div className="flex items-center gap-3 mb-6 border-b border-[#1f4742] pb-4">
              {["Tümü", "Satılık", "Kiralık"].map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    statusFilter === status 
                      ? "bg-[#d19c53] text-[#0b1a18] shadow-md shadow-[#d19c53]/20" 
                      : "bg-[#0b1a18] text-[#8ca8a4] hover:text-white border border-[#183632]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Filter Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Property Type */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-[#d19c53] mb-2 font-semibold">Mülk Türü</label>
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0b1a18] border border-[#183632] text-[#f9f8f5] text-xs focus:outline-none focus:border-[#d19c53] cursor-pointer"
                >
                  <option value="Tümü">Tüm Türler (Daire, Villa, Ofis)</option>
                  <option value="Daire">Daire</option>
                  <option value="Villa">Villa</option>
                  <option value="Ofis">Ofis</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-[#d19c53] mb-2 font-semibold">Bölge / Lokasyon</label>
                <select 
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0b1a18] border border-[#183632] text-[#f9f8f5] text-xs focus:outline-none focus:border-[#d19c53] cursor-pointer"
                >
                  <option value="Tümü">Tüm Bölgeler (Anadolu Yakası)</option>
                  <option value="Pendik">Pendik</option>
                  <option value="Tuzla">Tuzla</option>
                  <option value="Kartal">Kartal</option>
                  <option value="Kadıköy">Kadıköy</option>
                  <option value="Maltepe">Maltepe</option>
                </select>
              </div>

              {/* Action */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => { setStatusFilter("Tümü"); setTypeFilter("Tümü"); setLocationFilter("Tümü"); }}
                  className="w-full py-3 bg-[#183632] text-[#8ca8a4] hover:text-white font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer border border-[#25524c]"
                >
                  Filtreleri Sıfırla
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. FILTERED PROPERTY PORTFOLIO LISTING GRID */}
      <section id="featured" className="py-24 border-b border-[#183632]">
        <div className="container mx-auto px-6 max-w-7xl">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[#d19c53] text-xs font-semibold tracking-widest uppercase block mb-2">Güncel Portföyümüz</span>
              <h2 className="font-serif text-3xl font-light text-[#f9f8f5]">Konsept İlan Listesi</h2>
            </div>
            <div className="text-xs text-[#8ca8a4] font-mono">
              Filtreye Uygun: <strong className="text-[#d19c53]">{filteredProperties.length} İlan Bulundu</strong>
            </div>
          </div>

          {/* Zero State Handling */}
          {filteredProperties.length === 0 ? (
            <div className="p-16 border border-[#183632] bg-[#102624] text-center space-y-4 max-w-xl mx-auto">
              <Search className="w-10 h-10 text-[#d19c53] mx-auto opacity-60" />
              <h3 className="font-serif text-xl text-[#f9f8f5]">Aradığınız Kriterlere Uygun Konsept İlan Bulunamadı</h3>
              <p className="text-xs text-[#8ca8a4]">Lütfen mülk türü veya bölge filtrelerinizi değiştirerek tekrar deneyiniz.</p>
              <button
                type="button"
                onClick={() => { setStatusFilter("Tümü"); setTypeFilter("Tümü"); setLocationFilter("Tümü"); }}
                className="px-6 py-2.5 bg-[#d19c53] text-[#0b1a18] font-bold text-xs uppercase tracking-widest"
              >
                Tüm İlanları Göster
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map(property => (
                <div 
                  key={property.id}
                  onClick={() => setSelectedProperty(property)}
                  className="group bg-[#102624] border border-[#1f4742] overflow-hidden transition-all duration-300 hover:border-[#d19c53] cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-64 overflow-hidden bg-black/40">
                    <img 
                      src={property.image} 
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                      width={800}
                      height={600}
                    />
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                      <span className="px-3 py-1 bg-[#0b1a18]/90 text-[#d19c53] border border-[#d19c53]/40 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                        {property.status}
                      </span>
                      <span className="px-3 py-1 bg-black/70 text-white text-[10px] font-medium uppercase tracking-wider backdrop-blur-md">
                        {property.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-[#8ca8a4]">
                        <MapPin className="w-3.5 h-3.5 text-[#d19c53] shrink-0" />
                        <span>{property.location}</span>
                      </div>
                      <h3 className="font-serif text-lg text-[#f9f8f5] group-hover:text-[#d19c53] transition-colors leading-snug">
                        {property.title}
                      </h3>
                    </div>

                    <div className="pt-4 border-t border-[#183632] flex items-center justify-between text-xs text-[#8ca8a4]">
                      <div className="flex items-center gap-3 font-mono">
                        <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3 text-[#d19c53]" /> {property.sqm} m²</span>
                        <span className="flex items-center gap-1"><BedDouble className="w-3 h-3 text-[#d19c53]" /> {property.rooms}</span>
                      </div>
                      <span className="font-serif text-lg font-bold text-[#d19c53]">{property.price}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 5. INTERACTIVE PROPERTY DETAIL MODAL */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
          <div className="bg-[#102624] border border-[#d19c53] max-w-3xl w-full p-6 sm:p-8 relative text-[#f9f8f5] space-y-6 shadow-2xl my-8">
            
            <button 
              type="button"
              onClick={() => setSelectedProperty(null)}
              className="absolute top-4 right-4 p-2 text-[#8ca8a4] hover:text-white bg-[#0b1a18] border border-[#183632] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#d19c53] text-[#0b1a18] font-bold text-[10px] uppercase tracking-widest">
                {selectedProperty.status} — {selectedProperty.type}
              </span>
              <span className="text-xs font-mono text-[#8ca8a4]">İlan No: {selectedProperty.code}</span>
            </div>

            <h2 className="font-serif text-2xl text-[#f9f8f5] leading-snug">{selectedProperty.title}</h2>

            <div className="h-72 w-full bg-black/40 overflow-hidden border border-[#1f4742]">
              <img src={selectedProperty.image} alt={selectedProperty.title} className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#0b1a18] border border-[#183632] text-xs font-mono">
              <div><span className="text-[#8ca8a4] block text-[10px]">FİYAT</span><strong className="text-[#d19c53] text-sm">{selectedProperty.price}</strong></div>
              <div><span className="text-[#8ca8a4] block text-[10px]">ALAN</span><strong>{selectedProperty.sqm} m² Net</strong></div>
              <div><span className="text-[#8ca8a4] block text-[10px]">ODA SAYISI</span><strong>{selectedProperty.rooms}</strong></div>
              <div><span className="text-[#8ca8a4] block text-[10px]">BANYO</span><strong>{selectedProperty.bathrooms} Banyo</strong></div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#d19c53]">İlan Açıklaması</h3>
              <p className="text-xs text-[#9ebcb8] leading-relaxed">{selectedProperty.description}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#d19c53]">Öne Çıkan Özellikler</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProperty.features.map(f => (
                  <span key={f} className="text-[11px] bg-[#183632] text-[#f9f8f5] px-3 py-1 border border-[#25524c] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-[#d19c53]" /> {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#183632] flex flex-col sm:flex-row gap-4">
              <button 
                type="button"
                onClick={triggerToast}
                className="w-full py-3.5 bg-[#d19c53] text-[#0b1a18] font-bold text-xs tracking-widest uppercase hover:bg-[#e0ad66] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" /> Danışmanla Görüş (Demo)
              </button>
              <button 
                type="button"
                onClick={() => setSelectedProperty(null)}
                className="w-full py-3.5 border border-[#183632] text-[#8ca8a4] hover:text-white font-semibold text-xs uppercase tracking-widest"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. ABOUT / AGENCY PHILOSOPHY SECTION */}
      <section id="about" className="py-24 bg-[#081412] border-b border-[#183632]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="h-[440px] border border-[#1f4742] relative bg-[#0b1a18] overflow-hidden">
              <img 
                src="/images/demos/vizyon-gayrimenkul/penthouse.jpg" 
                alt="Modern mimari penthouse ve gayrimenkul danışmanlık hizmeti"
                className="w-full h-full object-cover"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>

            <div className="space-y-6">
              <span className="text-[#d19c53] text-xs font-semibold tracking-widest uppercase block">Kurumsal Yaklaşım</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#f9f8f5] leading-tight">
                Şeffaf Değerleme, Güvenli Portföy Yönetimi.
              </h2>
              <p className="text-xs text-[#9ebcb8] leading-relaxed">
                Gayrimenkul yatırımlarınızda doğru fiyat analizi, hukuki sözleşme kontrolü ve yüksek müşteri memnuniyeti odaklı profesyonel danışmanlık sunuyoruz.
              </p>
              <div className="pt-2">
                <a 
                  href="#contact"
                  className="px-6 py-3 border border-[#1f4742] text-[#d19c53] text-xs uppercase tracking-widest font-semibold hover:border-[#d19c53] transition-all inline-flex items-center gap-2"
                >
                  Ofisimizle İletişime Geçin <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. CONTACT & KVK CONVERSION FOOTER */}
      <footer id="contact" className="py-16 bg-[#050c0b] text-center space-y-6 text-[#f9f8f5]">
        <div className="container mx-auto px-6 max-w-3xl space-y-6">
          <h2 className="font-serif text-3xl font-light text-[#f9f8f5]">
            Emlak Ofisiniz Veya İnşaat Projeniz İçin Web Sitesi İster Misiniz?
          </h2>
          <p className="text-xs text-[#8ca8a4] max-w-xl mx-auto leading-relaxed">
            Bu sayfa <strong>KvK Dijital Çözümler</strong> ajansı tarafından emlak ve gayrimenkul işletmelerine özel tasarım konseptini ve filtrelenebilir portföy altyapısını sergilemek amacıyla hazırlanmıştır. Gerçek mülk sahipliği içermez.
          </p>
          <div>
            <Link 
              href="/#iletisim"
              className="px-8 py-3.5 bg-[#d19c53] text-[#0b1a18] font-bold text-xs tracking-widest uppercase hover:bg-[#e0ad66] transition-all inline-flex items-center gap-2"
            >
              KvK Dijital'den Teklif Alın <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="pt-8 border-t border-[#183632] flex items-center justify-center gap-6 text-xs text-[#627d79]">
            <Link href="/" className="hover:text-white transition-colors">KvK Ana Sayfa</Link>
            <Link href="/projeler" className="hover:text-white transition-colors">Tüm Örnek Projeler</Link>
            <Link href="/#iletisim" className="hover:text-white transition-colors">İletişim & Teklif</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
