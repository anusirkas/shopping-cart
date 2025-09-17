import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import StoreLocator from "./pages/StoreLocator";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Header />
        {/* eemalda p-6 ja kõik marginit */}
        <main className="m-0 p-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/store-locator" element={<StoreLocator />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
