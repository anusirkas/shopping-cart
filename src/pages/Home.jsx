import React from "react";
import "./Home.css";
import News from "../components/News";
import Newsletter from "../components/Newsletter";

function Home() {
  return (
    <>
      {/* Hero + sticky logo */}
      <div className="sticky-wrapper">
        <div className="sticky-logo">Auro</div>

        <section className="hero-block img1"></section>
        <section className="hero-block img2"></section>
        <section className="hero-block img3"></section>
        <section className="hero-block img4"></section>
      </div>

      {/* Pärast hero-blokke – tavaline sisu */}
      <div className="content">
        <section className="intro-text">
          <h2>A Story of Modern Craft</h2>
          <p>
            We design collections with timeless elegance, combining minimalist
            aesthetics and premium details.
          </p>
        </section>

        <News />
        <Newsletter />
      </div>
    </>
  );
}

export default Home;
