import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService, reservationService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ShoppingBag, Calendar, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

/* ── Mini Calendar Component ────────────── */
const MiniCalendar = ({ onRangeSelect }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const MONTHS = ['Januar','Februar','Mart','April','Maj','Jun','Jul','Avgust','Septembar','Oktobar','Novembar','Decembar'];
  const DAYS = ['Po','Ut','Sr','Če','Pe','Su','Ne'];

  const toKey = d => d ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : null;

  const handleDay = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    if (d < today && toKey(d) !== toKey(today)) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(d); setEndDate(null);
    } else {
      if (d < startDate) { setStartDate(d); setEndDate(null); }
      else { setEndDate(d); onRangeSelect && onRangeSelect(startDate, d); }
    }
  };

  const isSelected = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    return (startDate && toKey(d) === toKey(startDate)) || (endDate && toKey(d) === toKey(endDate));
  };
  const isInRange = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    const end = endDate || hoveredDate;
    if (!startDate || !end) return false;
    return d > startDate && d < end;
  };
  const isDisabled = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    return d < today && toKey(d) !== toKey(today);
  };
  const isToday = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    return toKey(d) === toKey(today);
  };

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y => y-1); setViewMonth(11); } else setViewMonth(m => m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y => y+1); setViewMonth(0); } else setViewMonth(m => m+1); };

  const formatDate = d => d ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : '—';
  const nights = startDate && endDate ? Math.round((endDate - startDate) / 86400000) : 0;

  return (
    <div className="border border-[var(--border)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center hover:bg-[var(--card)] transition-colors">
          <ChevronLeft className="w-4 h-4 text-[var(--muted)]" />
        </button>
        <p className="text-xs tracking-widest uppercase font-medium">{MONTHS[viewMonth]} {viewYear}</p>
        <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center hover:bg-[var(--card)] transition-colors">
          <ChevronRight className="w-4 h-4 text-[var(--muted)]" />
        </button>
      </div>
      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => <div key={d} className="cal-day cal-disabled text-[10px] tracking-wider uppercase font-medium">{d}</div>)}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7">
        {[...Array(offset)].map((_, i) => <div key={`e-${i}`} />)}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const d = new Date(viewYear, viewMonth, day);
          return (
            <div
              key={day}
              className={`cal-day ${isSelected(day) ? 'cal-selected' : ''} ${isInRange(day) ? 'cal-range' : ''} ${isDisabled(day) ? 'cal-disabled' : ''} ${isToday(day) ? 'cal-today' : ''}`}
              onClick={() => handleDay(day)}
              onMouseEnter={() => { if (startDate && !endDate) setHoveredDate(d); }}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {day}
            </div>
          );
        })}
      </div>
      {/* Selection info */}
      <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-[var(--muted)]">Od:</span>
          <span className="font-medium">{formatDate(startDate)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[var(--muted)]">Do:</span>
          <span className="font-medium">{formatDate(endDate)}</span>
        </div>
        {nights > 0 && (
          <div className="flex justify-between text-xs mt-2 pt-2 border-t border-[var(--border)]">
            <span className="text-[var(--muted)]">Noći:</span>
            <span className="font-display text-[var(--clay)]">{nights}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── ProductDetail ──────────────────────── */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });
  const [reserving, setReserving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    productService.getById(id)
      .then(setProduct)
      .catch(() => setError('Proizvod nije pronađen.'))
      .finally(() => setLoading(false));
  }, [id]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleRangeSelect = (start, end) => setSelectedDates({ start, end });

  const nights = selectedDates.start && selectedDates.end
    ? Math.round((selectedDates.end - selectedDates.start) / 86400000) : 0;

  const totalRentPrice = nights > 0 && product?.priceRentPerDay
    ? (nights * Number(product.priceRentPerDay)).toLocaleString() : null;

  const handleReserve = async () => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    if (!selectedDates.start || !selectedDates.end) { showToast('Odaberi datume na kalendaru'); return; }
    setReserving(true);
    try {
      await reservationService.create({
        productId: Number(id),
        startDate: selectedDates.start.toISOString(),
        endDate: selectedDates.end.toISOString(),
      });
      showToast('✓ Rezervacija uspješno kreirana');
    } catch {
      showToast('Greška pri rezervaciji — pokušaj ponovo');
    } finally {
      setReserving(false);
    }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-[var(--card)] animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 bg-[var(--card)] animate-pulse w-3/4" />
          <div className="h-4 bg-[var(--card)] animate-pulse" />
          <div className="h-4 bg-[var(--card)] animate-pulse w-1/2" />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-6xl mx-auto px-6 py-14 text-center">
      <p className="text-[var(--muted)]">{error}</p>
      <button onClick={() => navigate(-1)} className="btn-ghost mt-6">Nazad</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--charcoal)] tracking-wide transition-colors mb-10 uppercase">
        <ArrowLeft className="w-3.5 h-3.5" /> Nazad
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

        {/* Left — Image */}
        <div>
          <div className="aspect-square bg-[var(--card)] flex items-center justify-center overflow-hidden">
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.name} className="object-contain h-full w-full p-10" />
              : <Camera className="w-20 h-20 text-[var(--border)]" />
            }
          </div>
          {/* Specs */}
          {(product.resolution || product.sensorType) && (
            <div className="mt-5 border border-[var(--border)] divide-y divide-[var(--border)]">
              <p className="px-5 py-3 text-[10px] tracking-widest uppercase text-[var(--muted)]">Specifikacije</p>
              {product.resolution && (
                <div className="px-5 py-3 flex justify-between text-xs">
                  <span className="text-[var(--muted)]">Rezolucija</span>
                  <span className="font-medium">{product.resolution}</span>
                </div>
              )}
              {product.sensorType && (
                <div className="px-5 py-3 flex justify-between text-xs">
                  <span className="text-[var(--muted)]">Tip senzora</span>
                  <span className="font-medium">{product.sensorType}</span>
                </div>
              )}
              {product.stockQuantity != null && product.isForSale && (
                <div className="px-5 py-3 flex justify-between text-xs">
                  <span className="text-[var(--muted)]">Na stanju</span>
                  <span className={`font-medium ${product.stockQuantity > 0 ? 'text-green-700' : 'text-[var(--clay)]'}`}>
                    {product.stockQuantity > 0 ? `${product.stockQuantity} kom` : 'Rasprodato'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — Info + Actions */}
        <div>
          <div className="flex gap-2 mb-4">
            {product.isForSale && <span className="badge badge-sale">Prodaja</span>}
            {product.isForRent && <span className="badge badge-rent">Iznajmljivanje</span>}
          </div>
          <p className="text-xs text-[var(--muted)] tracking-widest uppercase mb-1">{product.brand}</p>
          <h1 className="font-display text-4xl text-[var(--charcoal)] leading-tight mb-4">{product.name}</h1>
          {product.description && (
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-8">{product.description}</p>
          )}

          {/* BUY section */}
          {product.isForSale && (
            <div className="mb-8 pb-8 border-b border-[var(--border)]">
              <p className="text-xs tracking-widest uppercase text-[var(--muted)] mb-2">Cijena za kupovinu</p>
              <p className="font-display text-4xl text-[var(--clay)] mb-5">
                {Number(product.priceSale).toLocaleString()}&thinsp;<span className="text-lg">RSD</span>
              </p>
              <button
                onClick={() => { addToCart(product); showToast(`${product.name} dodat u korpu`); }}
                className="btn-clay w-full justify-center"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Dodaj u korpu
              </button>
            </div>
          )}

          {/* RENT section */}
          {product.isForRent && (
            <div>
              <p className="text-xs tracking-widest uppercase text-[var(--muted)] mb-2">Iznajmljivanje</p>
              <p className="font-display text-3xl text-[var(--slate)] mb-5">
                {Number(product.priceRentPerDay).toLocaleString()}&thinsp;<span className="text-sm">RSD / dan</span>
              </p>

              <MiniCalendar onRangeSelect={handleRangeSelect} />

              {totalRentPrice && (
                <div className="mt-4 flex justify-between items-center text-sm">
                  <span className="text-[var(--muted)]">{nights} {nights === 1 ? 'noć' : 'noći'}</span>
                  <span className="font-display text-xl text-[var(--clay)]">{totalRentPrice} RSD</span>
                </div>
              )}

              <button
                onClick={handleReserve}
                disabled={reserving || !selectedDates.end}
                className="btn-clay w-full justify-center mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Calendar className="w-3.5 h-3.5" />
                {reserving ? 'Rezervisanje...' : 'Rezerviši'}
              </button>
              {!isAuthenticated() && (
                <p className="text-[10px] text-center text-[var(--muted)] mt-2 tracking-wide">
                  <Link to="/login" className="underline hover:text-[var(--clay)]">Prijavi se</Link> da rezervišeš
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default ProductDetail;
