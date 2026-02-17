import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';
import { useState } from 'react';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated()) {
    navigate('/login');
    return null;
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Korpa je prazna');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          priceAtTime: item.priceSale
        })),
        totalAmount: getCartTotal()
      };

      await orderService.create(orderData);
      clearCart();
      alert('Porudžbina uspešno kreirana!');
      navigate('/orders');
    } catch (error) {
      alert('Greška pri kreiranju porudžbine');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Korpa je prazna</h2>
            <p className="text-gray-600 mb-8">
              Dodajte proizvode u korpu da nastavite sa kupovinom
            </p>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary"
            >
              Pregledaj Proizvode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Korpa</h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          {cartItems.map((item) => (
            <div key={item.id} className="border-b last:border-b-0 p-6">
              <div className="flex gap-6">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/150?text=Camera'}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-4">{item.brand}</p>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 border rounded-lg hover:bg-gray-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 border rounded-lg hover:bg-gray-100"
                        disabled={item.quantity >= item.stockQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-auto text-red-600 hover:text-red-700 flex items-center gap-2"
                    >
                      <Trash2 className="h-5 w-5" />
                      Ukloni
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">
                    {(item.priceSale * item.quantity).toFixed(2)} RSD
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.priceSale.toFixed(2)} RSD x {item.quantity}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Pregled</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Proizvodi ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
              <span>{getCartTotal().toFixed(2)} RSD</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Dostava</span>
              <span>Besplatna</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-2xl font-bold">
                <span>Ukupno</span>
                <span className="text-primary-600">{getCartTotal().toFixed(2)} RSD</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full btn-primary text-lg py-4"
          >
            {loading ? 'Procesiranje...' : 'Naruči'}
          </button>

          <button
            onClick={() => navigate('/products')}
            className="w-full mt-4 btn-secondary"
          >
            Nastavi kupovinu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
