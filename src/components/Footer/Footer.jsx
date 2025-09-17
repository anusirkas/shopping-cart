import "./Footer.css";
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter, FaTiktok, FaMapMarkerAlt } from "react-icons/fa";
import { useState } from "react";

function Footer() {
  const [shippingOpen, setShippingOpen] = useState(false);

  return (
    <footer className="footer">
      {/* Top cols */}
      <div className="footer-top">
        <div className="footer-col">
          <h4>Follow Us</h4>
          <div className="footer-social">
            <FaFacebookF />
            <FaInstagram />
            <FaYoutube />
            <FaTwitter />
            <FaTiktok />
          </div>
        </div>

        <div className="footer-col">
          <h4>Help</h4>
          <ul>
            <li><a href="#">Order status</a></li>
            <li><a href="#">Register a return</a></li>
            <li><a href="#">FAQs</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Client Services</h4>
          <ul>
            <li><a href="#">Account</a></li>
            <li><a href="#">Find a store</a></li>
            <li><a href="#">Product care</a></li>
            <li><a href="#">Gift Cards</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Press</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Sustainability</a></li>
            <li><a href="#">Legal & Privacy</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom row all in one line */}
      <div className="footer-line">
        <p>© 2025 Auro</p>
        <p className="disclaimer">
          *Some products may ship from EU warehouses due to stock availability. Import duties included.
        </p>
        <div className="footer-actions">
          <a href="/store-locator" className="locator"><FaMapMarkerAlt /> Store Locator</a>
          <button onClick={() => setShippingOpen(!shippingOpen)} className="shipping-btn">
            Shipping to: Rest of Europe (English)
          </button>
        </div>
      </div>

      {/* Shipping popup */}
      {shippingOpen && (
        <div className="shipping-popup">
          <h4>Select your region</h4>
          <ul>
            <li><button>United States (English)</button></li>
            <li><button>United Kingdom (English)</button></li>
            <li><button>France (Français)</button></li>
            <li><button>Germany (Deutsch)</button></li>
            <li><button>Estonia (Eesti)</button></li>
          </ul>
        </div>
      )}
    </footer>
  );
}

export default Footer;
