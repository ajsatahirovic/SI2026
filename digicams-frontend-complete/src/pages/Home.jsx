import { Link } from 'react-router-dom';
import { Camera, ShoppingBag, Calendar, Award } from 'lucide-react';
import { useEffect, useState } from 'react';
import { productService } from '../services/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const products = await productService.getAll();
      setFeaturedProducts(products.slice(0, 6));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Camera className="h-12 w-12 text-primary-600" />,
      title: 'Vrhunska Oprema',
      description: 'Najnoviji modeli profesionalnih fotoaparata i objektiva vodećih brendova.'
    },
    {
      icon: <Calendar className="h-12 w-12 text-primary-600" />,
      title: 'Fleksibilno Iznajmljivanje',
      description: 'Iznajmite opremu na period koji vam odgovara, od jednog dana do mesec dana.'
    },
    {
      icon: <ShoppingBag className="h-12 w-12 text-primary-600" />,
      title: 'Kupovina',
      description: 'Kupite novu ili polovno korišćenu opremu po povoljnim cenama.'
    },
    {
      icon: <Award className="h-12 w-12 text-primary-600" />,
      title: 'Garancija Kvaliteta',
      description: 'Sva oprema je testirana i u odličnom stanju, sa garancijom.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Dobrodošli u DigiCams
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Profesionalna foto oprema dostupna za iznajmljivanje i kupovinu
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products/rent" className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition">
                Iznajmi Opremu
              </Link>
              <Link to="/products/sale" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition">
                Pregledaj Prodaju
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Zašto DigiCams?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Izdvajamo</h2>
            <p className="text-gray-600">Najpopularnija oprema u našoj ponudi</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loader"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="card product-card"
                >
                  <div className="overflow-hidden bg-gray-200 h-64">
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/400x300?text=Camera'}
                      alt={product.name}
                      className="w-full h-full object-cover product-image"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4">{product.brand}</p>
                    <div className="flex justify-between items-center">
                      {product.isForSale && (
                        <div>
                          <span className="text-2xl font-bold text-primary-600">
                            {product.priceSale?.toFixed(2)} RSD
                          </span>
                          <span className="text-sm text-gray-500 ml-2">Prodaja</span>
                        </div>
                      )}
                      {product.isForRent && (
                        <div>
                          <span className="text-xl font-semibold text-green-600">
                            {product.priceRentPerDay?.toFixed(2)} RSD
                          </span>
                          <span className="text-sm text-gray-500 ml-1">/dan</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/products" className="btn-primary">
              Vidi Sve Proizvode
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Spremni da počnete?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Registrujte se danas i otkrijte našu kompletnu ponudu
          </p>
          <Link to="/register" className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition inline-block">
            Kreiraj Nalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
