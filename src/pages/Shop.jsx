import { useEffect, useState } from "react";
import "./Shop.css";
import MinimalProductCard from "../components/MinimalProductCard";

function Shop() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then(res => res.json())
      .then(data => {
        // võta ainult riided + ehted (täpne kategooria nimetus!)
        const filtered = data
          .filter(
            p => p.category === "men's clothing" || 
                p.category === "women's clothing" || 
                p.category === "jewelery"
          )
          // eemalda konkreetne T-särk
          .filter(p =>
            !p.title.toLowerCase().includes("danvouy") && // eemaldab konkreetse T-särgi
            !p.title.toLowerCase().includes("fjallraven") // eemaldab koti
          )

        // Sorteeri: ehted enne riideid
        filtered.sort((a, b) => {
          if (a.category === "jewelery" && b.category !== "jewelery") return -1;
          if (a.category !== "jewelery" && b.category === "jewelery") return 1;
          return 0;
        });

        setProducts(filtered);
      })
      .catch(err => console.error("API fetch error:", err));
  }, []);


  return (
    <div className="shop-page">
      {/* Top navigation */}
      <div className="shop-nav">
        <div className="shop-categories">
          <span className="active">View All</span>
          <span>Dresses</span>
          <span>Knitwear</span>
          <span>Outerwear</span>
          <span>T-Shirts</span>
          <span>Skirts</span>
          <span>Bags</span>
        </div>
        <div className="shop-filters">
          <span>Filters</span> | <span>Sort by: Suggested</span>
        </div>
      </div>

      {/* Category title */}
      <div className="shop-header">
        <h2>READY TO WEAR</h2>
        <p>{products.length} PRODUCTS</p>
      </div>

      {/* Product grid */}
      <div className="product-grid">
        {products.map((p, i) => (
          <>
            <MinimalProductCard key={p.id} product={p} />
            {i === 2 && ( // pärast 3. toodet
              <div key="filler" className="filler-card">
                <img src="https://picsum.photos/id/21/3008/2008" alt="Mood" />
              </div>
            )}
          </>
        ))}
      </div>

    </div>
  );
}

export default Shop;
