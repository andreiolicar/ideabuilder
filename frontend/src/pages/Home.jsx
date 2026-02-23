import { useEffect, useState } from "react";
import LandingFooter from "../components/landing/LandingFooter.jsx";
import LandingNavbar from "../components/landing/LandingNavbar.jsx";
import DocsSection from "../components/landing/DocsSection.jsx";
import FaqSection from "../components/landing/FaqSection.jsx";
import GenerationSection from "../components/landing/GenerationSection.jsx";
import HeroSection from "../components/landing/HeroSection.jsx";
import PricingSection from "../components/landing/PricingSection.jsx";
import useAuth from "../context/useAuth.js";
import "./Home.css";

function Home() {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".lp-home .reveal"));
    if (!elements.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lp-home">
      <LandingNavbar isAuthenticated={isAuthenticated} />
      <HeroSection isAuthenticated={isAuthenticated} />
      <DocsSection />
      <GenerationSection />
      <PricingSection />
      <FaqSection
        openIndex={openFaq}
        onToggle={(index) => setOpenFaq((current) => (current === index ? -1 : index))}
      />
      <LandingFooter />
    </div>
  );
}

export default Home;
