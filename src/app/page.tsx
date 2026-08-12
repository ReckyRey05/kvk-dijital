import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { getAdminDb } from "@/lib/firebase/admin";

// Fold altındaki ağır bileşenler lazy yükleniyor
// Bu sayede Hero (LCP) önce render ediliyor, framer-motion dahil kütüphaneler sonra
const TechStack = nextDynamic(() => import("@/components/TechStack"), { ssr: true });
const About = nextDynamic(() => import("@/components/About"), { ssr: true });
const Services = nextDynamic(() => import("@/components/Services"), { ssr: true });
const Projects = nextDynamic(() => import("@/components/Projects"), { ssr: true });
const Process = nextDynamic(() => import("@/components/Process"), { ssr: true });
const FAQ = nextDynamic(() => import("@/components/FAQ"), { ssr: true });
const Contact = nextDynamic(() => import("@/components/Contact"), { ssr: true });

export const dynamic = 'force-static';
export const revalidate = 3600; // Her saat başı arka planda yeniler

export default async function Home() {
  let services: any[] = [];
  let projects: any[] = [];

  try {
    const db = getAdminDb();

    // Fetch services
    const servicesSnap = await db.collection("services").orderBy("createdAt", "asc").get();
    services = servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch projects
    const projectsSnap = await db.collection("projects").orderBy("createdAt", "desc").get();
    projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch {
    // Admin SDK credentials missing in local dev → fallback to empty
    services = [];
    projects = [];
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden">
      {/* Hero is NOT lazy — it's the LCP element */}
      <Hero />
      
      {/* Below-the-fold sections are lazy-loaded but still SSR'd */}
      <Suspense fallback={null}>
        <TechStack />
      </Suspense>
      <Suspense fallback={null}>
        <About />
      </Suspense>
      <Suspense fallback={null}>
        <Services services={services} />
      </Suspense>
      <Suspense fallback={null}>
        <Projects projects={projects} />
      </Suspense>
      <Suspense fallback={null}>
        <Process />
      </Suspense>
      <Suspense fallback={null}>
        <FAQ />
      </Suspense>
      <Suspense fallback={null}>
        <Contact />
      </Suspense>
      <Footer />
    </main>
  );
}
