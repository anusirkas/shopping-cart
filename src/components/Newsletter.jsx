import "./Newsletter.css";

function Newsletter() {
  return (
    <section className="newsletter">
      <h2>Stay in the know</h2>
      <p>Receive news about Lux collections, journal articles, events and sales.</p>
      <form>
        <input type="email" placeholder="Enter your email" className="newsletter-input" />
        <button type="submit" className="newsletter-button">Subscribe</button>
      </form>
    </section>
  );
}

export default Newsletter;
