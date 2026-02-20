import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await login({ email, password }); navigate('/'); }
    catch { setError('Pogrešan email ili lozinka.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-display text-4xl mb-2"><span className="text-[var(--clay)] italic">Di</span>giCam</p>
          <p className="text-xs text-[var(--muted)] tracking-widest uppercase">Prijava na nalog</p>
        </div>

        {error && (
          <div className="border border-[var(--clay)] text-[var(--clay)] px-4 py-3 text-xs tracking-wide mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-[var(--muted)] mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="input-line" placeholder="tvoj@email.com" />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-[var(--muted)] mb-2">Lozinka</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="input-line" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-clay w-full justify-center disabled:opacity-50">
            {loading ? 'Prijavljivanje...' : 'Prijavi se'}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--muted)] tracking-wide mt-8">
          Nemaš nalog?{' '}
          <Link to="/register" className="text-[var(--charcoal)] underline hover:text-[var(--clay)] transition-colors">
            Registruj se
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Login;
