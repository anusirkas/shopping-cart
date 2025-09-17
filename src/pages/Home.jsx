import React, { useEffect, useRef, useState } from "react";
import "./Home.css";
import News from "../components/News";
import Newsletter from "../components/Newsletter";

function Home() {
  const lastBlockRef = useRef(null);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAtEnd(entry.isIntersecting);
      },
      { threshold: 0.9 } // kui viimane pilt on 90% nähtav
    );

    if (lastBlockRef.current) {
      observer.observe(lastBlockRef.current);
    }

    return () => {
      if (lastBlockRef.current) {
        observer.unobserve(lastBlockRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Logo */}
      <div className={`sticky-logo ${atEnd ? "at-end" : ""}`}>Auro</div>

      {/* Pildid */}
      <section className="hero-block img1"></section>
      <section className="hero-block img2"></section>
      <section className="hero-block img3"></section>
      <section ref={lastBlockRef} className="hero-block img4"></section>

      {/* Sisu */}
      <section className="intro-text">
        <h2>A Story of Modern Craft</h2>
        <p>
          We design collections with timeless elegance, combining minimalist
          aesthetics and premium details.
        </p>
      </section>

      <News />
      <Newsletter />
    </>
  );
}

export default Home;
