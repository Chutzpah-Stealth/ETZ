import Nav from "../../components/Nav";
import Hero from "../../components/Hero";
import Features from "../../components/Features";
import AccessTiers from "../../components/AccessTiers";
import Security from "../../components/Security";
import CTABanner from "../../components/CTABanner";
import Footer from "../../components/Footer";

export const metadata = {
  title: "ETZ Defense — Inteligência para Segurança Pública",
  description:
    "Plataforma de inteligência estratégica para forças de segurança pública e órgãos de defesa nacional.",
};

export default function DefensePage() {
  return (
    <>
      <Nav variant="defense" />
      <main>
        <Hero />
        <Features />
        <AccessTiers />
        <Security />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
