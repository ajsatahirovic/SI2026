import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-[var(--charcoal)] text-[var(--muted)] mt-24">
    <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
      <div>
        <p className="font-display text-2xl text-white mb-4">
          <span className="text-[var(--clay)] italic">Di</span>giCam
        </p>
        <p className="text-xs leading-relaxed tracking-wide max-w-xs">
          Najvažnije trenutke u životu sačuvaj na film. Profesionalna oprema za fotografe svih nivoa.
        </p>
      </div>
      <div>
        <p className="text-xs tracking-widest uppercase text-white mb-5">Navigacija</p>
        <div className="space-y-3">
          {[['/', 'Početna'], ['/products', 'Katalog'], ['/products/sale', 'Prodaja'], ['/products/rent', 'Iznajmljivanje']].map(([to, label]) => (
            <Link key={to} to={to} className="block text-xs tracking-wide hover:text-white transition-colors">{label}</Link>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs tracking-widest uppercase text-white mb-5">Kontakt</p>
        <div className="space-y-2 text-xs tracking-wide">
          <p>info@digicam.rs</p>
          <p>+381 11 123 4567</p>
          <p>Beograd, Srbija</p>
        </div>
      </div>
    </div>
    <div className="border-t border-white/10 py-5 px-6 flex flex-col md:flex-row justify-between items-center gap-3">
      <p className="text-xs tracking-wide">© {new Date().getFullYear()} DigiCam</p>
      <p className="text-xs tracking-wide">Film cameras & equipment</p>
    </div>
  </footer>
);

export default Footer;
