import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowRight, Camera } from 'lucide-react';
import { productService } from '../services/api';

const MARQUEE = '— DigiCam — Fotoaparati — Iznajmljivanje — Prodaja — Film Photography — Oprema — Beograd — Analogue — ';

const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    productService.getAll()
      .then(data => setFeatured(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex flex-col justify-between px-6 pt-16 pb-12 max-w-6xl mx-auto">
        <div className="flex flex-col">
          <span className="text-xs tracking-widest uppercase text-[var(--muted)] mb-8 anim-fade-in">
            Platforma za kupovinu i iznajmljivanje opreme
          </span>
          <h1 className="font-display text-[clamp(3.5rem,10vw,8.5rem)] leading-[0.92] tracking-tight text-[var(--charcoal)] anim-fade-up">
            Uhvati<br />
            <span className="text-[var(--clay)] italic">savršen</span><br />
            kadar.
          </h1>
          <p className="mt-8 text-sm text-[var(--muted)] max-w-xs leading-relaxed anim-fade-up-d1">
            Profesionalni fotoaparati dostupni za kupovinu i iznajmljivanje. Pronađi opremu koja ti treba za svaki okidač.
          </p>
          <div className="flex flex-wrap gap-3 mt-8 anim-fade-up-d2">
            <Link to="/products/sale" className="btn-clay">
              Kupi opremu <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/products/rent" className="btn-ghost">
              Iznajmi
            </Link>
          </div>
        </div>

        {/* Floating polaroids */}
        <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 w-72">
          <div className="polaroid rotate-3 mb-4">
            <div className="bg-[var(--card)] h-44 flex items-center justify-center">
              <Camera className="w-16 h-16 text-[var(--border)]" />
            </div>
          </div>
          <div className="polaroid -rotate-2 ml-12">
            <div className="bg-[#e8e0d8] h-32 flex items-center justify-center">
              <Camera className="w-10 h-10 text-[var(--muted)]" />
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="flex flex-wrap gap-10 mt-16 pt-10 border-t border-[var(--border)]">
          {[['15+', 'Fotoaparata u ponudi'], ['2', 'Načina korišćenja'], ['1', 'Prodavac, bez posrednika']].map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-3xl text-[var(--clay)]">{n}</p>
              <p className="text-xs text-[var(--muted)] tracking-wide mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="marquee-wrap bg-[var(--charcoal)] py-3 my-16">
        <div className="marquee-track">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-xs text-[var(--muted)] tracking-widest uppercase whitespace-nowrap px-4">
              {MARQUEE}
            </span>
          ))}
        </div>
      </div>

      {/* ── Featured products ── */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="divider" />
            <h2 className="font-display text-3xl">Iz naše ponude</h2>
          </div>
          <Link to="/products" className="text-xs tracking-widest uppercase text-[var(--muted)] hover:text-[var(--charcoal)] transition-colors flex items-center gap-1">
            Vidi sve <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.length > 0 ? featured.map((p) => (
            <Link to={`/products/detail/${p.id}`} key={p.id} className="product-card group">
              <div className="aspect-square bg-[var(--card)] flex items-center justify-center overflow-hidden">
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} className="object-contain h-full w-full p-6 group-hover:scale-105 transition-transform duration-500" />
                  : <Camera className="w-12 h-12 text-[var(--border)]" />
                }
              </div>
              <div className="p-4">
                <div className="flex gap-1 mb-2">
                  {p.isForSale && <span className="badge badge-sale">Prodaja</span>}
                  {p.isForRent && <span className="badge badge-rent">Rent</span>}
                </div>
                <p className="text-[10px] text-[var(--muted)] tracking-widest uppercase">{p.brand}</p>
                <p className="text-sm font-medium mt-0.5 leading-snug">{p.name}</p>
                <p className="text-[var(--clay)] text-sm mt-2 font-display">
                  {p.isForSale ? `${Number(p.priceSale).toLocaleString()} RSD` : `${Number(p.priceRentPerDay).toLocaleString()} RSD/dan`}
                </p>
              </div>
            </Link>
          )) : (
            [...Array(4)].map((_, i) => (
              <div key={i} className="product-card">
                <div className="aspect-square bg-[var(--card)] animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[var(--card)] animate-pulse w-2/3" />
                  <div className="h-4 bg-[var(--card)] animate-pulse" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-[var(--card)] mt-24 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="divider" />
          <h2 className="font-display text-3xl mb-14">Kako funkcioniše</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { n: '01', title: 'Izaberi opremu', desc: 'Pregledaj katalog fotoaparata, filtriraj po tipu — prodaja ili iznajmljivanje.' },
              { n: '02', title: 'Registruj se', desc: 'Besplatna registracija u par sekundi. Zatim možeš kupovati ili rezervisati.' },
              { n: '03', title: 'Uživaj u fotografiji', desc: 'Preuzmi opremu i stvori nezaboravne kadrove. Jednostavno kao to.' },
            ].map(s => (
              <div key={s.n} className="flex gap-5">
                <span className="font-display text-5xl text-[var(--border)] leading-none flex-shrink-0">{s.n}</span>
                <div>
                  <p className="font-medium text-sm tracking-wide mb-2">{s.title}</p>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <span className="divider" />
          <h2 className="font-display text-4xl leading-tight">
            Spreman za<br />
            <span className="italic text-[var(--clay)]">sledeće snimanje?</span>
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          <Link to="/register" className="btn-clay">Kreiraj nalog besplatno <ArrowRight className="w-3.5 h-3.5" /></Link>
          <Link to="/products" className="btn-ghost text-center justify-center">Istraži katalog</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
