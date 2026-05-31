import Navbar from "../../components/landing/Navbar";
import Hero from "../../components/landing/Hero";
import TrustStrip from "../../components/landing/TrustStrip";
import Modules from "../../components/landing/Modules";
import AccessLevels from "../../components/landing/AccessLevels";
import Analysis from "../../components/landing/Analysis";
import Workflow from "../../components/landing/Workflow";
import Security from "../../components/landing/Security";
import CtaBand from "../../components/landing/CtaBand";
import LandingFooter from "../../components/landing/LandingFooter";

export const metadata = {
  title: "ETZ Defense — Inteligência no combate ao crime organizado",
  description:
    "Plataforma de inteligência estratégica para Polícias, Forças de Segurança e órgãos de defesa nacional.",
};

export default function DefensePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <Modules />
        <AccessLevels />
        <Analysis />
        <Workflow />
        <Security />
        <CtaBand />
      </main>
      <LandingFooter />
    </>
  );
}
