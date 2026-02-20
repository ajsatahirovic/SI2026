import { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { Package } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderService.getMyOrders()
      .then(setOrders)
      .catch(() => setError('Greška pri učitavanju.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-14"><div className="space-y-px">{[...Array(3)].map((_,i)=><div key={i} className="h-20 bg-[var(--card)] animate-pulse mb-1"/>)}</div></div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <span className="divider" />
      <h1 className="font-display text-4xl mb-10">Moje Porudžbine</h1>

      {error && <div className="border border-[var(--clay)] text-[var(--clay)] px-4 py-3 text-xs tracking-wide mb-6">{error}</div>}

      {orders.length === 0 && !error ? (
        <div className="text-center py-20">
          <Package className="w-10 h-10 text-[var(--border)] mx-auto mb-4" />
          <p className="font-display text-2xl text-[var(--muted)] mb-2">Nema porudžbina</p>
          <p className="text-xs text-[var(--muted)] tracking-wide">Tvoje buduće kupovine će se pojaviti ovdje.</p>
        </div>
      ) : (
        <div className="space-y-px">
          {orders.map(order => (
            <div key={order.id} className="border border-[var(--border)] p-6 hover:border-[var(--muted)] transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-[var(--muted)]">Porudžbina #{order.id}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{new Date(order.orderDate).toLocaleDateString('sr-RS', { day:'numeric', month:'long', year:'numeric' })}</p>
                </div>
                <p className="font-display text-xl text-[var(--clay)]">{Number(order.totalAmount).toLocaleString()} RSD</p>
              </div>
              {order.orderItems?.length > 0 && (
                <div className="border-t border-[var(--border)] pt-4 space-y-2">
                  {order.orderItems.map(item => (
                    <div key={item.id} className="flex justify-between text-xs text-[var(--muted)]">
                      <span>{item.product?.name || `Proizvod #${item.productId}`} × {item.quantity}</span>
                      <span>{Number(item.priceAtTime).toLocaleString()} RSD</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyOrders;
