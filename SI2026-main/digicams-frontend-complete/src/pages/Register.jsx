import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register(form); navigate('/login'); }
    catch { setError('Greška pri registraciji. Email možda već postoji.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-display text-4xl mb-2"><span className="text-[var(--clay)] italic">Di</span>giCam</p>
          <p className="text-xs text-[var(--muted)] tracking-widest uppercase">Kreiraj nalog</p>
        </div>

        {error && (
          <div className="border border-[var(--clay)] text-[var(--clay)] px-4 py-3 text-xs tracking-wide mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-[var(--muted)] mb-2">Ime</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required className="input-line" placeholder="Ime" />
            </div>
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-[var(--muted)] mb-2">Prezime</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required className="input-line" placeholder="Prezime" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-[var(--muted)] mb-2">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="input-line" placeholder="tvoj@email.com" />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-[var(--muted)] mb-2">Lozinka</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required className="input-line" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-clay w-full justify-center disabled:opacity-50">
            {loading ? 'Kreiranje...' : 'Registruj se'}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--muted)] tracking-wide mt-8">
          Već imaš nalog?{' '}
          <Link to="/login" className="text-[var(--charcoal)] underline hover:text-[var(--clay)] transition-colors">Prijavi se</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;
