import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

function Shop() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then(res => res.json())
      .then(data => setProducts(data.slice(0, 6))) // ainult 6 toodet
      .catch(err => console.error("API fetch error:", err));
  }, []);

  return (
    <section className="p-6 md:p-12 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 tracking-tight">
            Our Curated Selection
        </h2>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
            <div key={p.id} className={`${i === 0 ? "md:col-span-2 lg:col-span-3" : ""}`}>
                <ProductCard product={p} spotlight={i === 0} />
            </div>
            ))}
        </div>
    </section>

  );
}

export default Shop;
