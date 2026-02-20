import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService, orderService, reservationService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Camera } from 'lucide-react';

const Dashboard = () => {
  const { isAdmin, isSeller, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('products');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    Promise.all([
      productService.getAll().then(setProducts),
      orderService.getAll().then(setOrders).catch(()=>{}),
      reservationService.getAll().then(setReservations).catch(()=>{}),
      isAdmin() ? userService.getAll().then(setUsers).catch(()=>{}) : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Obriši ovaj proizvod?')) return;
    await productService.delete(id);
    setProducts(p => p.filter(x => x.id !== id));
  };

  const tabs = [
    { key:'products', label:'Proizvodi', count: products.length },
    { key:'orders',   label:'Porudžbine', count: orders.length },
    { key:'reservations', label:'Rezervacije', count: reservations.length },
    ...(isAdmin() ? [{ key:'users', label:'Korisnici', count: users.length }] : []),
  ];

  const STATUS_RES = { Pending:'Na čekanju', Confirmed:'Potvrđeno', Cancelled:'Otkazano' };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-6 py-14 space-y-4">
      {[...Array(5)].map((_,i)=><div key={i} className="h-12 bg-[var(--card)] animate-pulse"/>)}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="divider" />
          <h1 className="font-display text-4xl">Upravljanje</h1>
        </div>
        <Link to="/dashboard/products/add" className="btn-clay">
          <Plus className="w-3.5 h-3.5" /> Novi proizvod
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`p-5 text-left border transition-colors ${tab===t.key ? 'border-[var(--clay)] bg-[#fae8e2]' : 'border-[var(--border)] hover:border-[var(--muted)]'}`}>
            <p className={`font-display text-3xl ${tab===t.key ? 'text-[var(--clay)]' : 'text-[var(--charcoal)]'}`}>{t.count}</p>
            <p className="text-[10px] tracking-widest uppercase text-[var(--muted)] mt-1">{t.label}</p>
          </button>
        ))}
      </div>

      {/* Tab label */}
      <p className="text-[10px] tracking-widest uppercase text-[var(--muted)] mb-4 pb-4 border-b border-[var(--border)]">
        {tabs.find(t=>t.key===tab)?.label} — {tabs.find(t=>t.key===tab)?.count} stavki
      </p>

      {/* PRODUCTS TAB */}
      {tab === 'products' && (
        <div>
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Camera className="w-10 h-10 text-[var(--border)] mx-auto mb-3" />
              <p className="text-[var(--muted)] text-sm">Nema proizvoda. Dodaj prvi!</p>
            </div>
          ) : (
            <div className="space-y-px">
              {products.map(p => (
                <div key={p.id} className="flex items-center gap-4 py-4 border-b border-[var(--border)] hover:bg-[var(--card)] px-2 transition-colors group">
                  <div className="w-12 h-12 bg-[var(--card)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {p.imageUrl ? <img src={p.imageUrl} alt="" className="object-contain w-full h-full p-1" /> : <Camera className="w-5 h-5 text-[var(--border)]" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-[10px] text-[var(--muted)] tracking-widest uppercase">{p.brand}</p>
                    <p className="text-sm font-medium truncate">{p.name}</p>
                  </div>
                  <div className="hidden md:flex gap-1 flex-shrink-0">
                    {p.isForSale && <span className="badge badge-sale">Prodaja</span>}
                    {p.isForRent && <span className="badge badge-rent">Rent</span>}
                  </div>
                  <p className="text-sm text-[var(--muted)] w-32 text-right hidden md:block">
                    {p.isForSale ? `${Number(p.priceSale).toLocaleString()} RSD` : `${Number(p.priceRentPerDay).toLocaleString()} RSD/d`}
                  </p>
                  <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/dashboard/products/edit/${p.id}`} className="w-7 h-7 flex items-center justify-center border border-[var(--border)] hover:border-[var(--slate)] hover:text-[var(--slate)] transition-colors">
                      <Edit2 className="w-3 h-3" />
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="w-7 h-7 flex items-center justify-center border border-[var(--border)] hover:border-[var(--clay)] hover:text-[var(--clay)] transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ORDERS TAB */}
      {tab === 'orders' && (
        <div className="space-y-px">
          {orders.length === 0 ? <p className="text-center py-16 text-[var(--muted)] text-sm">Nema porudžbina.</p> : orders.map(o => (
            <div key={o.id} className="flex items-center justify-between py-4 border-b border-[var(--border)] hover:bg-[var(--card)] px-2 transition-colors">
              <div>
                <p className="text-[10px] text-[var(--muted)] tracking-widest"># {o.id}</p>
                <p className="text-sm">{o.user ? `${o.user.firstName} ${o.user.lastName}` : `Korisnik #${o.userId}`}</p>
                <p className="text-xs text-[var(--muted)]">{new Date(o.orderDate).toLocaleDateString('sr-RS')}</p>
              </div>
              <p className="font-display text-xl text-[var(--clay)]">{Number(o.totalAmount).toLocaleString()} RSD</p>
            </div>
          ))}
        </div>
      )}

      {/* RESERVATIONS TAB */}
      {tab === 'reservations' && (
        <div className="space-y-px">
          {reservations.length === 0 ? <p className="text-center py-16 text-[var(--muted)] text-sm">Nema rezervacija.</p> : reservations.map(r => (
            <div key={r.id} className="flex items-center justify-between py-4 border-b border-[var(--border)] hover:bg-[var(--card)] px-2 transition-colors">
              <div>
                <p className="text-sm font-medium">{r.product?.name || `#${r.productId}`}</p>
                <p className="text-xs text-[var(--muted)]">
                  {new Date(r.startDate).toLocaleDateString('sr-RS')} — {new Date(r.endDate).toLocaleDateString('sr-RS')}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-[10px] tracking-widest uppercase mb-1 ${r.status==='Confirmed'?'text-green-600':r.status==='Cancelled'?'text-[var(--clay)]':'text-yellow-600'}`}>
                  {STATUS_RES[r.status] || r.status}
                </p>
                <p className="font-display text-lg text-[var(--slate)]">{Number(r.totalPrice).toLocaleString()} RSD</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* USERS TAB */}
      {tab === 'users' && (
        <div className="space-y-px">
          {users.length === 0 ? <p className="text-center py-16 text-[var(--muted)] text-sm">Nema korisnika.</p> : users.map(u => (
            <div key={u.id} className="flex items-center justify-between py-4 border-b border-[var(--border)] hover:bg-[var(--card)] px-2 transition-colors">
              <div>
                <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                <p className="text-xs text-[var(--muted)]">{u.email}</p>
              </div>
              <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${u.role==='Admin'?'bg-purple-100 text-purple-700':u.role==='Seller'?'badge-sale':'badge-rent'}`}>
                {u.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Dashboard;
