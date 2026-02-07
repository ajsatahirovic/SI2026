import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

// --- STILOVI (Retro & Clean) ---
const styles = {
  body: { margin: 0, fontFamily: '"Helvetica Neue", sans-serif', backgroundColor: '#fff' },
  navbar: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', borderBottom: '1px solid #eee', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1000 },
  logo: { fontSize: '3rem', fontWeight: '900', letterSpacing: '8px', color: '#000', textDecoration: 'none', marginBottom: '20px' },
  navLinks: { display: 'flex', gap: '40px', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '2px' },
  link: { textDecoration: 'none', color: '#000', cursor: 'pointer' },
  
  main: { maxWidth: '1400px', margin: '0 auto', padding: '60px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '10px' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '50px' },
  card: { cursor: 'pointer', transition: '0.3s' },
  imageBox: { height: '450px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', marginBottom: '15px' },
  badge: { position: 'absolute', top: '15px', left: '15px', backgroundColor: '#000', color: '#fff', padding: '5px 12px', fontSize: '0.7rem', fontWeight: 'bold' },
  
  info: { textAlign: 'left' },
  productName: { fontSize: '1.1rem', fontWeight: '700', textTransform: 'uppercase', margin: '5px 0' },
  productBrand: { fontSize: '0.9rem', color: '#888', marginBottom: '10px' },
  price: { fontSize: '1.1rem', fontWeight: '500' },
  
  button: { marginTop: '15px', width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px' }
};

// --- KOMPONENTE ---

function Navbar({ user }) {
  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.logo}>DIGICAMS</Link>
      <div style={styles.navLinks}>
        <Link to="/" style={styles.link}>SHOP ALL</Link>
        <Link to="/rentals" style={styles.link}>RENTALS</Link>
        {user.role === 'Admin' && <Link to="/admin" style={{...styles.link, color: 'red'}}>ADMIN PANEL</Link>}
        <Link to="/login" style={styles.link}>{user.role === 'Guest' ? 'ACCOUNT' : 'LOGOUT'}</Link>
      </div>
    </nav>
  );
}

function ProductCard({ p, user }) {
  // Ovo radimo da bi kôd radio i ako backend pošalje malo ili veliko slovo
  const name = p.Name || p.name;
  const brand = p.Brand || p.brand;
  const price = p.PriceSale || p.priceSale || p.Price || p.price;
  const isForRent = p.IsForRent || p.isForRent;

  return (
    <div style={styles.card}>
      <div style={styles.imageBox}>
        {isForRent && <span style={styles.badge}>RENTAL AVAILABLE</span>}
        
        {/* Pošto ti je ImageUrl u bazi NULL, ovde stavljamo zamensku sliku */}
        {p.ImageUrl || p.imageUrl ? (
          <img src={p.ImageUrl || p.imageUrl} alt={name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <span style={{fontSize: '4rem', color: '#ddd'}}>📷</span>
        )}
      </div>
      <div style={styles.info}>
        <p style={styles.productBrand}>{brand || 'Unknown Brand'}</p>
        <h3 style={styles.productName}>{name || 'Unnamed Product'}</h3>
        <p style={styles.price}>€{price || '0.00'}</p>
        
        <button style={styles.button}>POGLEDAJ DETALJE</button>
      </div>
    </div>
  );
}
function Home({ user }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Ovde Axios vuče tvoje podatke iz C# Backenda
    axios.get('https://localhost:7226/api/Products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Proveri da li je Backend upaljen!", err));
  }, []);

  return (
    <div style={styles.main}>
      <header style={styles.header}>
        <h2 style={{margin: 0, fontWeight: '800'}}>COLLECTIONS</h2>
        <p style={{margin: 0, fontWeight: '600'}}>{products.length} PRODUCTS</p>
      </header>
      
      <div style={styles.grid}>
        {products.length > 0 ? (
          products.map(p => <ProductCard key={p.Id} p={p} user={user} />)
        ) : (
          <p>Učitavanje proizvoda iz baze... Proveri da li radi Backend (F5 u Visual Studio).</p>
        )}
      </div>
    </div>
  );
}

// --- GLAVNA APLIKACIJA ---

export default function App() {
  // Simulacija korisnika (Kasnije ćemo povezati sa Loginom)
  const [user, setUser] = useState({ role: 'Guest' }); 

  return (
    <Router>
      <div style={styles.body}>
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/rentals" element={<div style={styles.main}><h1>Rentals Collection</h1></div>} />
          <Route path="/admin" element={<div style={styles.main}><h1>Admin Control Panel</h1></div>} />
          <Route path="/login" element={<div style={styles.main}><h1>Login / Register</h1></div>} />
        </Routes>
      </div>
    </Router>
  );
}