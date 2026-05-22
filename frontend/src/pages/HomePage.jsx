import Hero from '../components/Hero/Hero';
import {
  AboutSection,
  ServicesSection,
  DepartmentsSection,
  DoctorsSection,
  ContactSection,
  Footer,
} from '../components/Sections/Sections';

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <ServicesSection />
      <DepartmentsSection />
      <DoctorsSection />
      <ContactSection />
      <Footer />
    </>
  );
}
