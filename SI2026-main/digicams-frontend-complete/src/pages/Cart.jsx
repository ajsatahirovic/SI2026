import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleOrder = async () => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    setOrdering(true);
    try {
      await orderService.create({
        totalAmount: getCartTotal(),
        orderItems: cartItems.map(i => ({ productId: i.id, quantity: i.quantity, priceAtTime: i.priceSale }))
      });
      clearCart(); setDone(true);
    } catch { setError('Greška pri kreiranju porudžbine.'); }
    finally { setOrdering(false); }
  };

  if (done) return (
    <div className="max-w-lg mx-auto px-6 py-28 text-center">
      <span className="divider mx-auto mb-6" />
      <h2 className="font-display text-4xl mb-4">Porudžbina potvrđena</h2>
      <p className="text-sm text-[var(--muted)] mb-8">Hvala na kupovini. Možeš pratiti status u Moim porudžbinama.</p>
      <div className="flex gap-3 justify-center">
        <Link to="/orders" className="btn-clay">Moje porudžbine</Link>
        <Link to="/products" className="btn-ghost">Nastavi kupovinu</Link>
      </div>
    </div>
  );

  if (cartItems.length === 0) return (
    <div className="max-w-lg mx-auto px-6 py-28 text-center">
      <ShoppingBag className="w-10 h-10 text-[var(--border)] mx-auto mb-5" />
      <h2 className="font-display text-3xl text-[var(--muted)] mb-3">Korpa je prazna</h2>
      <p className="text-xs text-[var(--muted)] tracking-wide mb-8">Dodaj neke fotoaparate i vrati se.</p>
      <Link to="/products/sale" className="btn-clay">Vidi ponudu za prodaju</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <span className="divider" />
      <h1 className="font-display text-4xl mb-10">Moja Korpa</h1>

      {error && <div className="border border-[var(--clay)] text-[var(--clay)] px-4 py-3 text-xs tracking-wide mb-6">{error}</div>}

      <div className="space-y-px mb-10">
        {cartItems.map(item => (
          <div key={item.id} className="flex items-center gap-5 py-5 border-b border-[var(--border)]">
            <div className="w-16 h-16 bg-[var(--card)] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.name} className="object-contain h-full w-full p-1" />
                : <ShoppingBag className="w-6 h-6 text-[var(--border)]" />
              }
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-[10px] text-[var(--muted)] tracking-widest uppercase">{item.brand}</p>
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="font-display text-[var(--clay)] mt-0.5">{Number(item.priceSale).toLocaleString()} RSD</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center border border-[var(--border)] hover:border-[var(--charcoal)] transition-colors">
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm w-6 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center border border-[var(--border)] hover:border-[var(--charcoal)] transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm font-medium w-24 text-right hidden sm:block">
              {(Number(item.priceSale) * item.quantity).toLocaleString()} RSD
            </p>
            <button onClick={() => removeFromCart(item.id)} className="text-[var(--muted)] hover:text-[var(--clay)] transition-colors ml-2">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-end gap-5">
        <div className="flex justify-between w-full max-w-xs">
          <span className="text-xs tracking-widest uppercase text-[var(--muted)]">Ukupno</span>
          <span className="font-display text-2xl text-[var(--clay)]">{getCartTotal().toLocaleString()} RSD</span>
        </div>
        <button onClick={handleOrder} disabled={ordering} className="btn-clay disabled:opacity-50">
          {ordering ? 'Obrada...' : 'Potvrdi porudžbinu'}
        </button>
      </div>
    </div>
  );
};
export default Cart;
