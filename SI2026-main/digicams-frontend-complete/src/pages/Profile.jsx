import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    userService.getProfile()
      .then(d => setForm({ firstName: d.firstName||'', lastName: d.lastName||'', email: d.email||'' }))
      .catch(() => { if (user) setForm({ firstName: user.firstName||'', lastName: user.lastName||'', email: user.email||'' }); })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await userService.updateProfile(form); setToast('Sačuvano'); setTimeout(() => setToast(''), 2500); }
    catch { setToast('Greška pri čuvanju'); setTimeout(() => setToast(''), 2500); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="max-w-sm mx-auto px-6 py-14 space-y-4">{[...Array(3)].map((_,i)=><div key={i} className="h-10 bg-[var(--card)] animate-pulse"/>)}</div>;

  return (
    <div className="max-w-sm mx-auto px-6 py-14">
      <span className="divider" />
      <div className="mb-10">
        <h1 className="font-display text-4xl">Moj Profil</h1>
        {user?.role && <p className="text-[10px] tracking-widest uppercase text-[var(--muted)] mt-1">{user.role}</p>}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-[var(--muted)] mb-2">Ime</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} className="input-line" />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-[var(--muted)] mb-2">Prezime</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} className="input-line" />
          </div>
        </div>
        <div>
          <label className="block text-[10px] tracking-widest uppercase text-[var(--muted)] mb-2">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="input-line" />
        </div>
        <button type="submit" disabled={saving} className="btn-clay w-full justify-center disabled:opacity-50">
          {saving ? 'Čuvanje...' : 'Sačuvaj izmjene'}
        </button>
      </form>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};
export default Profile;
