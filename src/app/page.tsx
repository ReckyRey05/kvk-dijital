import Hero from "@/components/Hero";
import dynamic from "next/dynamic";

const TechStack = dynamic(() => import("@/components/TechStack"));
const About = dynamic(() => import("@/components/About"));
const Services = dynamic(() => import("@/components/Services"));
const Projects = dynamic(() => import("@/components/Projects"));
const Process = dynamic(() => import("@/components/Process"));
const FAQ = dynamic(() => import("@/components/FAQ"));
const Contact = dynamic(() => import("@/components/Contact"));
const Footer = dynamic(() => import("@/components/Footer"));
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";

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
