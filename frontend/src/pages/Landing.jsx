import React from "react";
import Hero from "../components/Hero/Hero";
import Howitworks from "../components/Howitworks/Howitworks";
import Feature from "../components/Feature/Feature";

const Landing = () => {
  return (
    <div className="landing-page">
      <Hero />
      <div id="how-it-works">
        <Howitworks />
      </div>
      <div id="features">
        <Feature />
      </div>
    </div>
  );
};

export default Landing;
