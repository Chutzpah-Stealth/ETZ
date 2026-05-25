import Nav from "../../components/Nav";
import BusinessHero from "../../components/business/BusinessHero";
import BusinessFeatures from "../../components/business/BusinessFeatures";
import BusinessTiers from "../../components/business/BusinessTiers";
import Security from "../../components/Security";
import BusinessCTA from "../../components/business/BusinessCTA";
import Footer from "../../components/Footer";

export const metadata = {
  title: "ETZ Business — Inteligência Corporativa",
  description:
    "Plataforma de inteligência de dados para grandes empresas: gestão de riscos, prevenção de fraudes, compliance e inteligência competitiva.",
};

export default function BusinessPage() {
  return (
    <>
      <Nav variant="business" />
      <main>
        <BusinessHero />
        <BusinessFeatures />
        <BusinessTiers />
        <Security />
        <BusinessCTA />
      </main>
      <Footer variant="business" />
    </>
  );
}
