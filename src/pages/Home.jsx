import { motion } from "framer-motion";

function Home() {
  return (
    <section className="relative h-[80vh] flex items-center justify-center bg-gray-100">
      {/* Taustapilt */}
      <img
        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80"
        alt="Luxury"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />

      {/* Tekst + CTA */}
      <div className="relative text-center max-w-2xl px-6">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl font-serif font-bold mb-6 text-gray-900"
        >
          Timeless Luxury
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-lg md:text-xl text-gray-700 mb-8 font-sans"
        >
          Discover carefully curated pieces that define modern elegance.
        </motion.p>

        <motion.a
          href="/shop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="inline-block bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition text-lg"
        >
          Shop Now
        </motion.a>
      </div>
    </section>
  );
}

export default Home;
