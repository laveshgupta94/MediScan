import React from "react";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/hero";
import Howitworks from "./components/HowItWorks/Howitworks";
import Feature from "./components/Feature/Feature";
import Upload from "./components/Upload/Upload";
import Footer from "./components/Footer/Footer";
function App() {
  return (
    <div>
      <Navbar />
      <Hero/>
      <Howitworks/>
      <Feature/>
      <Upload/>
      <Footer/>
    </div>
  );
}

export default App;