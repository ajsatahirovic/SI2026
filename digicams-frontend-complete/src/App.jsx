import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import MyReservations from './pages/MyReservations';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ProductForm from './pages/ProductForm';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Product Routes */}
                <Route path="/products" element={<Products />} />
                <Route path="/products/:type" element={<Products />} />
                <Route path="/products/detail/:id" element={<ProductDetail />} />
                
                {/* User Routes */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<MyOrders />} />
                <Route path="/reservations" element={<MyReservations />} />
                <Route path="/profile" element={<Profile />} />
                
                {/* Seller/Admin Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/products/add" element={<ProductForm />} />
                <Route path="/dashboard/products/edit/:id" element={<ProductForm />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
