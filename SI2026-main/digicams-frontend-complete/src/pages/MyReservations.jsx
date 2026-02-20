import { useState, useEffect } from 'react';
import { reservationService } from '../services/api';
import { Calendar } from 'lucide-react';

const STATUS = {
  Pending:   { label:'Na čekanju', cls:'bg-[#fef9c3] text-yellow-700' },
  Confirmed: { label:'Potvrđeno',  cls:'bg-[#dcfce7] text-green-700' },
  Cancelled: { label:'Otkazano',   cls:'bg-[#fee2e2] text-red-700' },
};

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reservationService.getMyReservations()
      .then(setReservations)
      .catch(() => setError('Greška pri učitavanju.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Otkaži ovu rezervaciju?')) return;
    try {
      await reservationService.cancel(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'Cancelled' } : r));
    } catch { alert('Greška pri otkazivanju.'); }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-14 space-y-1">{[...Array(3)].map((_,i)=><div key={i} className="h-24 bg-[var(--card)] animate-pulse"/>)}</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <span className="divider" />
      <h1 className="font-display text-4xl mb-10">Moje Rezervacije</h1>

      {error && <div className="border border-[var(--clay)] text-[var(--clay)] px-4 py-3 text-xs tracking-wide mb-6">{error}</div>}

      {reservations.length === 0 && !error ? (
        <div className="text-center py-20">
          <Calendar className="w-10 h-10 text-[var(--border)] mx-auto mb-4" />
          <p className="font-display text-2xl text-[var(--muted)] mb-2">Nema rezervacija</p>
          <p className="text-xs text-[var(--muted)] tracking-wide">Tvoje buduće rezervacije će se pojaviti ovdje.</p>
        </div>
      ) : (
        <div className="space-y-px">
          {reservations.map(res => {
            const s = STATUS[res.status] || { label: res.status, cls: 'bg-gray-100 text-gray-600' };
            const nights = Math.round((new Date(res.endDate) - new Date(res.startDate)) / 86400000);
            return (
              <div key={res.id} className="border border-[var(--border)] p-6 hover:border-[var(--muted)] transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <p className="font-medium text-sm">{res.product?.name || `Proizvod #${res.productId}`}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(res.startDate).toLocaleDateString('sr-RS')} — {new Date(res.endDate).toLocaleDateString('sr-RS')}
                      </p>
                      <span className="text-[10px] text-[var(--muted)]">({nights} {nights===1?'noć':'noći'})</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                    <span className={`text-[10px] px-2 py-0.5 tracking-widest uppercase ${s.cls}`}>{s.label}</span>
                    <p className="font-display text-lg text-[var(--slate)]">{Number(res.totalPrice).toLocaleString()} RSD</p>
                  </div>
                </div>
                {res.status === 'Pending' && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <button onClick={() => handleCancel(res.id)} className="text-[10px] tracking-widest uppercase text-[var(--clay)] border border-[var(--clay)] px-3 py-1.5 hover:bg-[var(--clay)] hover:text-white transition-colors">
                      Otkaži rezervaciju
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default MyReservations;
