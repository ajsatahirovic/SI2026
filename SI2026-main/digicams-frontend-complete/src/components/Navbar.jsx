import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Menu, X, User } from 'lucide-react';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin, isSeller } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = getCartCount();

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`text-xs tracking-widest uppercase transition-colors ${
        location.pathname === to || location.pathname.startsWith(to + '/')
          ? 'text-[var(--clay)]' : 'text-[var(--muted)] hover:text-[var(--charcoal)]'
      }`}
    >{label}</Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-[var(--warm-white)] border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="font-display text-xl tracking-tight text-[var(--charcoal)] flex items-center gap-1">
          <span className="text-[var(--clay)] italic">Di</span>giCam
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLink('/products', 'Katalog')}
          {navLink('/products/sale', 'Prodaja')}
          {navLink('/products/rent', 'Iznajmljivanje')}
        </div>

        {/* Right icons */}
        <div className="hidden md:flex items-center gap-5">
          {isAuthenticated() ? (
            <>
              {(isAdmin() || isSeller()) && (
                <Link to="/dashboard" className="text-xs tracking-widest uppercase text-[var(--muted)] hover:text-[var(--charcoal)] transition-colors">
                  Panel
                </Link>
              )}
              <div className="relative group">
                <button className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-[var(--muted)] hover:text-[var(--charcoal)] transition-colors">
                  <User className="w-3.5 h-3.5" />
                  {user?.firstName || 'Profil'}
                </button>
                <div className="absolute right-0 top-full mt-3 w-44 bg-[var(--warm-white)] border border-[var(--border)] shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/profile" className="block px-4 py-3 text-xs tracking-wide text-[var(--muted)] hover:text-[var(--charcoal)] hover:bg-[var(--card)] transition-colors">Moj profil</Link>
                  <Link to="/orders" className="block px-4 py-3 text-xs tracking-wide text-[var(--muted)] hover:text-[var(--charcoal)] hover:bg-[var(--card)] transition-colors">Porudžbine</Link>
                  <Link to="/reservations" className="block px-4 py-3 text-xs tracking-wide text-[var(--muted)] hover:text-[var(--charcoal)] hover:bg-[var(--card)] transition-colors">Rezervacije</Link>
                  <div className="border-t border-[var(--border)]" />
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-xs tracking-wide text-[var(--clay)] hover:bg-[var(--card)] transition-colors">Odjavi se</button>
                </div>
              </div>
              <Link to="/cart" className="relative text-[var(--muted)] hover:text-[var(--charcoal)] transition-colors">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--clay)] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-xs tracking-widest uppercase text-[var(--muted)] hover:text-[var(--charcoal)] transition-colors">Prijava</Link>
              <Link to="/register" className="btn-clay py-2 px-4 text-[10px]">Registracija</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-[var(--charcoal)]">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[var(--warm-white)] border-t border-[var(--border)] px-6 py-6 space-y-5">
          {navLink('/products', 'Katalog')}
          {navLink('/products/sale', 'Prodaja')}
          {navLink('/products/rent', 'Iznajmljivanje')}
          {isAuthenticated() ? (
            <>
              {navLink('/cart', `Korpa (${cartCount})`)}
              {navLink('/profile', 'Profil')}
              {navLink('/orders', 'Porudžbine')}
              {navLink('/reservations', 'Rezervacije')}
              {(isAdmin() || isSeller()) && navLink('/dashboard', 'Panel')}
              <button onClick={handleLogout} className="text-xs tracking-widest uppercase text-[var(--clay)]">Odjavi se</button>
            </>
          ) : (
            <>
              {navLink('/login', 'Prijava')}
              {navLink('/register', 'Registracija')}
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
