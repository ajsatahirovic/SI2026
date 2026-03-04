import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

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

                {/* JAVNE RUTE - Guest moze pristupiti */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:type" element={<Products />} />
                <Route path="/products/detail/:id" element={<ProductDetail />} />

                {/* KORISNICKE RUTE - ulogovani korisnik (User, Seller, Admin) */}
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                } />
                <Route path="/reservations" element={
                  <ProtectedRoute>
                    <MyReservations />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                {/* PRODAVAC / ADMIN RUTE */}
                <Route path="/dashboard" element={
                  <ProtectedRoute roles={["Seller", "Admin"]}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/products/add" element={
                  <ProtectedRoute roles={["Seller", "Admin"]}>
                    <ProductForm />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/products/edit/:id" element={
                  <ProtectedRoute roles={["Seller", "Admin"]}>
                    <ProductForm />
                  </ProtectedRoute>
                } />

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
