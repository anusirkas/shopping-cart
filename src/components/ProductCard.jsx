import { useState } from "react";
import { useCart } from "../context/CartContext";

function ProductCard({ product, spotlight = false }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col transition hover:shadow-lg ${
        spotlight ? "md:flex-row md:h-96" : ""
      }`}
    >
      <img
        src={product.image}
        alt={product.title}
        className={`object-contain bg-gray-50 ${
          spotlight ? "md:w-1/2 h-full" : "h-64 w-full"
        }`}
      />

      <div className="p-6 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-xl mb-2 line-clamp-2">{product.title}</h3>
          <p className="text-gray-600 mb-4">${product.price.toFixed(2)}</p>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="px-2 py-1 border rounded"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="w-12 text-center border rounded"
          />
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="px-2 py-1 border rounded"
          >
            +
          </button>
        </div>

        <button
          onClick={() => addToCart(product, quantity)}
          className="bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
