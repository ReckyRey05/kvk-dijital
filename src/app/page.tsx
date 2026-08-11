import Hero from "@/components/Hero";
import TechStack from "@/components/TechStack";
import About from "@/components/About";
import Services from "@/components/Services";
import Projects from "@/components/Projects";
import Process from "@/components/Process";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";

export const dynamic = 'force-static';
export const revalidate = 3600; // Her saat başı arka planda yeniler

export default async function Home() {
  // Fetch services
  const servicesRef = collection(db, "services");
  const servicesQuery = query(servicesRef, orderBy("createdAt", "asc"));
  const servicesSnapshot = await getDocs(servicesQuery).catch(() => null);
  const services = servicesSnapshot ? servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)) : [];

  // Fetch projects
  const projectsRef = collection(db, "projects");
  const projectsQuery = query(projectsRef, orderBy("createdAt", "desc"));
  const projectsSnapshot = await getDocs(projectsQuery).catch(() => null);
  const projects = projectsSnapshot ? projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)) : [];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden">
      <Hero />
      <TechStack />
      <About />
      <Services services={services || []} />
      <Projects projects={projects || []} />
      <Process />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
