import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { ArrowLeft } from 'lucide-react';

const empty = { name:'', description:'', brand:'', imageUrl:'', isForSale:false, priceSale:'', stockQuantity:'', isForRent:false, priceRentPerDay:'', resolution:'', sensorType:'' };

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[10px] tracking-widest uppercase text-[var(--muted)] mb-2">{label}</label>
    {children}
  </div>
);

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    productService.getById(id)
      .then(d => setForm({ ...d, priceSale:d.priceSale??'', stockQuantity:d.stockQuantity??'', priceRentPerDay:d.priceRentPerDay??'', isForSale:d.isForSale??false, isForRent:d.isForRent??false }))
      .catch(() => setError('Ne mogu učitati proizvod.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = {
        ...form,
        priceSale:       form.isForSale ? Number(form.priceSale) : null,
        stockQuantity:   form.isForSale ? Number(form.stockQuantity) : null,
        priceRentPerDay: form.isForRent ? Number(form.priceRentPerDay) : null,
      };
      if (isEdit) await productService.update(Number(id), { id: Number(id), ...payload });
      else await productService.create(payload);
      navigate('/dashboard');
    } catch { setError('Greška pri čuvanju — provjeri sva polja.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="max-w-lg mx-auto px-6 py-14 space-y-4">{[...Array(4)].map((_,i)=><div key={i} className="h-10 bg-[var(--card)] animate-pulse"/>)}</div>;

  return (
    <div className="max-w-lg mx-auto px-6 py-14">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--charcoal)] tracking-wide uppercase transition-colors mb-10">
        <ArrowLeft className="w-3.5 h-3.5" /> Nazad
      </button>
      <span className="divider" />
      <h1 className="font-display text-4xl mb-10">{isEdit ? 'Uredi Proizvod' : 'Novi Proizvod'}</h1>

      {error && <div className="border border-[var(--clay)] text-[var(--clay)] px-4 py-3 text-xs tracking-wide mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Field label="Naziv *">
          <input name="name" value={form.name} onChange={handleChange} required className="input-line" />
        </Field>
        <Field label="Brend">
          <input name="brand" value={form.brand||''} onChange={handleChange} className="input-line" />
        </Field>
        <Field label="Opis">
          <textarea name="description" value={form.description||''} onChange={handleChange} rows={3} className="input-line resize-none" />
        </Field>
        <Field label="URL slike">
          <input name="imageUrl" value={form.imageUrl||''} onChange={handleChange} className="input-line" placeholder="https://..." />
        </Field>
        <div className="grid grid-cols-2 gap-6">
          <Field label="Rezolucija">
            <input name="resolution" value={form.resolution||''} onChange={handleChange} className="input-line" placeholder="npr. 24MP" />
          </Field>
          <Field label="Tip senzora">
            <input name="sensorType" value={form.sensorType||''} onChange={handleChange} className="input-line" placeholder="Full Frame" />
          </Field>
        </div>

        {/* Sale block */}
        <div className="border border-[var(--border)] p-5">
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input type="checkbox" name="isForSale" checked={form.isForSale} onChange={handleChange} className="accent-[var(--clay)] w-4 h-4" />
            <span className="text-xs tracking-widest uppercase">Na prodaju</span>
          </label>
          {form.isForSale && (
            <div className="grid grid-cols-2 gap-5">
              <Field label="Cijena (RSD)">
                <input type="number" name="priceSale" value={form.priceSale} onChange={handleChange} min="0" className="input-line" />
              </Field>
              <Field label="Količina">
                <input type="number" name="stockQuantity" value={form.stockQuantity} onChange={handleChange} min="0" className="input-line" />
              </Field>
            </div>
          )}
        </div>

        {/* Rent block */}
        <div className="border border-[var(--border)] p-5">
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input type="checkbox" name="isForRent" checked={form.isForRent} onChange={handleChange} className="accent-[var(--slate)] w-4 h-4" />
            <span className="text-xs tracking-widest uppercase">Za iznajmljivanje</span>
          </label>
          {form.isForRent && (
            <Field label="Cijena po danu (RSD)">
              <input type="number" name="priceRentPerDay" value={form.priceRentPerDay} onChange={handleChange} min="0" className="input-line" />
            </Field>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn-clay w-full justify-center disabled:opacity-50">
          {saving ? 'Čuvanje...' : isEdit ? 'Sačuvaj izmjene' : 'Dodaj Proizvod'}
        </button>
      </form>
    </div>
  );
};
export default ProductForm;
