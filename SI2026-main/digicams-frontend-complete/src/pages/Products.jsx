import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { Camera, Search, SlidersHorizontal, ShoppingBag, ArrowRight } from 'lucide-react';

const Products = () => {
  const { type } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [toast, setToast] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    const fetch = type === 'sale'
      ? productService.getForSale()
      : type === 'rent'
        ? productService.getForRent()
        : productService.getAll();
    fetch.then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, [type]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const filtered = products
    .filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'price-asc') return (a.priceSale || a.priceRentPerDay || 0) - (b.priceSale || b.priceRentPerDay || 0);
      if (sort === 'price-desc') return (b.priceSale || b.priceRentPerDay || 0) - (a.priceSale || a.priceRentPerDay || 0);
      if (sort === 'name') return a.name?.localeCompare(b.name);
      return 0;
    });

  const pageTitle = type === 'sale' ? 'Prodaja' : type === 'rent' ? 'Iznajmljivanje' : 'Katalog';

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">

      {/* Header */}
      <div className="mb-10">
        <span className="text-xs tracking-widest uppercase text-[var(--muted)]">DigiCam /</span>
        <span className="divider mt-3" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h1 className="font-display text-5xl text-[var(--charcoal)]">{pageTitle}</h1>
          <p className="text-xs text-[var(--muted)] tracking-wide">
            {loading ? '—' : `${filtered.length} ${filtered.length === 1 ? 'proizvod' : 'proizvoda'}`}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-10 pb-6 border-b border-[var(--border)]">

        {/* Type tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { to: '/products', label: 'Sve', active: !type },
            { to: '/products/sale', label: 'Prodaja', active: type === 'sale' },
            { to: '/products/rent', label: 'Iznajmljivanje', active: type === 'rent' },
          ].map(t => (
            <Link key={t.to} to={t.to} className={`tab-pill ${t.active ? 'active' : ''}`}>{t.label}</Link>
          ))}
        </div>

        {/* Search + sort */}
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pretraži..."
              className="w-full pl-9 pr-4 py-2 border border-[var(--border)] bg-transparent text-sm focus:outline-none focus:border-[var(--clay)] transition-colors"
            />
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border border-[var(--border)] bg-transparent text-xs tracking-wide px-3 py-2 focus:outline-none focus:border-[var(--clay)] text-[var(--muted)] cursor-pointer"
          >
            <option value="default">Sortiraj</option>
            <option value="price-asc">Cena ↑</option>
            <option value="price-desc">Cena ↓</option>
            <option value="name">Naziv</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="product-card">
              <div className="aspect-square bg-[var(--card)] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-2 bg-[var(--card)] animate-pulse w-1/2" />
                <div className="h-3 bg-[var(--card)] animate-pulse" />
                <div className="h-3 bg-[var(--card)] animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-28">
          <Camera className="w-10 h-10 text-[var(--border)] mx-auto mb-4" />
          <p className="font-display text-2xl text-[var(--muted)] mb-2">Nema rezultata</p>
          <p className="text-xs text-[var(--muted)] tracking-wide">Pokušaj sa drugom pretragom ili provjeri bazu podataka.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((p, idx) => (
            <div key={p.id} className="product-card group" style={{ animationDelay: `${idx * 0.05}s` }}>
              <Link to={`/products/detail/${p.id}`}>
                <div className="aspect-square bg-[var(--card)] flex items-center justify-center overflow-hidden relative">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="object-contain h-full w-full p-5 group-hover:scale-105 transition-transform duration-500" />
                    : <Camera className="w-10 h-10 text-[var(--border)]" />
                  }
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {p.isForSale && <span className="badge badge-sale">Prodaja</span>}
                    {p.isForRent && <span className="badge badge-rent">Rent</span>}
                  </div>
                </div>
              </Link>
              <div className="p-4">
                <p className="text-[10px] text-[var(--muted)] tracking-widest uppercase mb-0.5">{p.brand}</p>
                <Link to={`/products/detail/${p.id}`}>
                  <p className="text-sm font-medium leading-snug hover:text-[var(--clay)] transition-colors">{p.name}</p>
                </Link>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    {p.isForSale && p.priceSale && (
                      <p className="font-display text-base text-[var(--clay)]">{Number(p.priceSale).toLocaleString()} <span className="text-xs">RSD</span></p>
                    )}
                    {p.isForRent && p.priceRentPerDay && (
                      <p className="text-xs text-[var(--slate)]">{Number(p.priceRentPerDay).toLocaleString()} RSD/dan</p>
                    )}
                  </div>
                  {p.isForSale ? (
                    <button
                      onClick={() => { addToCart(p); showToast(`${p.name} dodat u korpu`); }}
                      className="w-8 h-8 flex items-center justify-center border border-[var(--border)] hover:border-[var(--clay)] hover:bg-[var(--clay)] hover:text-white text-[var(--muted)] transition-all"
                      title="Dodaj u korpu"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link to={`/products/detail/${p.id}`} className="w-8 h-8 flex items-center justify-center border border-[var(--border)] hover:border-[var(--slate)] hover:bg-[var(--slate)] hover:text-white text-[var(--muted)] transition-all" title="Rezerviši">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default Products;
