import React from 'react';
import { Helmet } from 'react-helmet-async';
import FeatureShowcase from '../components/Home-sections/FeatureShowcase';
import FeaturesSection from '../components/Home-sections/FeaturesSection';

export default function FeaturesPage() {
  return (
    <>
      <Helmet>
        <title>Relyce AI Features – Secure Chat, RAG & Custom AI Personalities</title>
        <meta
          name="description"
          content="Explore Relyce AI features including private chat, document AI (RAG), and fully customizable AI personalities."
        />
        <link rel="canonical" href="https://relyceai.com/features" />
      </Helmet>
      
      <main className="bg-[#05060a] min-h-screen text-white pt-10">
        <h1 className="visually-hidden">Relyce AI Features</h1>
        <FeaturesSection />
        <FeatureShowcase />
      </main>
    </>
  );
}
