import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ApiKeySetup from "@/components/ApiKeySetup";
import ResearchDashboard from "@/components/ResearchDashboard";
import Footer from "@/components/Footer";
import { firecrawl } from "@/lib/firecrawl-client";

const Index = () => {
  const [connected, setConnected] = useState(firecrawl.hasKey());

  useEffect(() => {
    setConnected(firecrawl.hasKey());
  }, []);

  const handleDisconnect = () => {
    firecrawl.removeKey();
    setConnected(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <div id="dashboard">
          {connected ? (
            <ResearchDashboard onDisconnect={handleDisconnect} />
          ) : (
            <ApiKeySetup onKeySet={() => setConnected(true)} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
