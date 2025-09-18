import { Link } from "react-router-dom";
import "../pages/Shop.css";

function MinimalProductCard({ product }) {
  return (
    <div className="minimal-card">
      <Link to={`/product/${product.id}`}>
        <img
          src={product.image}
          alt={product.title}
          className="minimal-img"
        />
      </Link>
      <div className="minimal-info">
        <span className="minimal-title">{product.title}</span>
        <span className="minimal-price">€ {product.price}</span>
      </div>
    </div>
  );
}

export default MinimalProductCard;
