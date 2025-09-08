import { useCart } from "../context/CartContext";

function Cart() {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();

  if (cart.length === 0) {
    return <p className="p-6 text-gray-600">Your cart is empty 🛒</p>;
  }

  return (
    <section className="p-6 space-y-6">
      <h2 className="text-3xl font-bold">Your Cart</h2>

      {/* Ostukorvi esemed */}
      <div className="space-y-4">
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between bg-white shadow rounded p-4">
            <div className="flex items-center space-x-4">
              <img src={item.image} alt={item.title} className="h-16 w-16 object-contain" />
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-gray-600">${item.price.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                className="px-2 py-1 border rounded"
              >-</button>
              <span>{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="px-2 py-1 border rounded"
              >+</button>
            </div>

            <div className="text-right">
              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

        {/* Kokkuvõte */}
        <div className="bg-white p-8 rounded-xl shadow-lg text-right max-w-md ml-auto">
        <p className="text-lg mb-2">
            Subtotal: <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
        </p>
        <p className="text-2xl font-bold tracking-tight mb-4">
            Total: ${getCartTotal().toFixed(2)}
        </p>
        <button className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
            Proceed to Checkout
        </button>
        </div>

    </section>
  );
}

export default Cart;
