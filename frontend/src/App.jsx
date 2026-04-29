import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Howitworks from "./components/Howitworks/Howitworks";
import Feature from "./components/Feature/Feature";
import Upload from "./components/Upload/Upload";
import Chat from "./components/Chat/Chat";
import Footer from "./components/Footer/Footer";

function App() {
  const [scanResult, setScanResult] = useState(null);

  return (
    <div>
      <Navbar />
      <Hero />
      <Howitworks />
      <Feature />
      <Upload onScanResult={setScanResult} />
      <Chat medicineContext={scanResult} />
      <Footer />
    </div>
  );
}

export default App;