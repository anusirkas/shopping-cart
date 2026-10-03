import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import Link from "next/link";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import "./globals.css";

const sans = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: "Auro — Considered clothing", template: "%s — Auro" },
  description:
    "Auro is a demo fashion store by Anu Sirkas: a full-stack Next.js shop with digital product passports, a measurement-based fit finder and technical-flat product imagery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <CartProvider>
          <div className="demo-banner">
            Portfolio demo by <a href="https://portfolio-anu-sirkas-projects.vercel.app">Anu Sirkas</a> · no real orders are placed
            <span className="demo-banner-extra">
              <span className="demo-banner-sep"> · </span>
              <Link href="/admin">Try the back office →</Link>
            </span>
          </div>
          <Header />
          <main>{children}</main>
          <footer className="footer">
            <div className="footer-grid">
              <div>
                <p className="brand brand-small">Auro</p>
                <p className="muted">Considered clothing with a passport for every piece.</p>
              </div>
              <div>
                <h3>Shop</h3>
                <Link href="/shop?category=knitwear">Knitwear</Link>
                <Link href="/shop?category=outerwear">Outerwear</Link>
                <Link href="/shop?sort=newest">New in</Link>
              </div>
              <div>
                <h3>Transparency</h3>
                <Link href="/passport">Product passports</Link>
                <Link href="/shop?fibre=Recycled+wool">Recycled fibres</Link>
                <Link href="/stores">Stores & repairs</Link>
              </div>
              <div>
                <h3>About this demo</h3>
                <a href="https://github.com/anusirkas/shopping-cart">Source on GitHub</a>
                <a href="https://portfolio-anu-sirkas-projects.vercel.app/work/auro">Case study</a>
                <Link href="/admin">Back office (demo)</Link>
              </div>
            </div>
            <p className="muted footer-note">
              © {new Date().getFullYear()} Auro is a fictional brand. Footprint figures are illustrative estimates.
            </p>
          </footer>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
