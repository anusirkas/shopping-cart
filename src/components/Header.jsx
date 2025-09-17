// src/components/Header.jsx
import React, { useState } from "react";
import "./Header.css";
import { FaSearch, FaUser, FaHeart, FaShoppingBag } from "react-icons/fa";
import { Link } from "react-router-dom";

function Header() {
  const [activePopup, setActivePopup] = useState(null);

  const togglePopup = (type) => {
    setActivePopup(activePopup === type ? null : type);
  };

  return (
    <>
      <header className="header">
        {/* Vasak */}
        <div className="header-left">
          <Link to="/" className="brand">
            Auro
          </Link>
        </div>

        {/* Keskel */}
        <nav className="header-center">
          <a href="/shop" className="shop-link">Shop All</a>
          <a href="/shop">Gifts</a>
          <a href="/shop">Women</a>
          <a href="/shop">Men</a>
          <a href="/shop">Bags</a>
          <a href="/shop">Fine Jewelry</a>
          <a href="/shop">Home</a>
          <a href="/shop">Perfumes & Beauty</a>
          <a href="/news">AuroSphere</a>
        </nav>

        {/* Parem */}
        <div className="header-right">
          <FaSearch onClick={() => togglePopup("search")} />
          <FaUser onClick={() => togglePopup("account")} />
          <FaHeart onClick={() => togglePopup("wishlist")} />
          <FaShoppingBag onClick={() => togglePopup("cart")} />
        </div>
      </header>

      {/* Backdrop */}
      {activePopup && (
        <div
          className="popup-backdrop"
          onClick={() => setActivePopup(null)}
        ></div>
      )}

      {/* Popupid */}
      {activePopup === "account" && (
        <div className="popup-box slide-down">
          <h3>Welcome to Auro</h3>
          <p>
            Enjoy a unique shopping experience with your personal account.
            Monitor orders, create a wishlist, and get tailored assistance.
          </p>
          <button className="btn">Log In</button>
          <button className="btn-outline">Register</button>
        </div>
      )}

      {activePopup === "cart" && (
        <div className="popup-box slide-down">
          <h3>Your Shopping Bag</h3>
          <p>Your bag is empty.</p>
        </div>
      )}

      {activePopup === "wishlist" && (
        <div className="popup-box slide-down">
          <h3>Your Wishlist</h3>
          <p>Your wishlist is empty.</p>
        </div>
      )}

      {activePopup === "search" && (
        <div className="popup-box slide-down">
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      )}
    </>
  );
}

export default Header;
