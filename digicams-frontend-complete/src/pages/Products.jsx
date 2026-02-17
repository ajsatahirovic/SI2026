import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { productService } from '../services/api';

const Products = () => {
  const { type } = useParams(); // 'rent' or 'sale'
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    minPrice: '',
    maxPrice: '',
    sensorType: ''
  });

  useEffect(() => {
    loadProducts();
  }, [type]);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      let data;
      if (type === 'rent') {
        data = await productService.getForRent();
      } else if (type === 'sale') {
        data = await productService.getForSale();
      } else {
        data = await productService.getAll();
      }
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Brand filter
    if (filters.brand) {
      filtered = filtered.filter(p => p.brand === filters.brand);
    }

    // Price filter
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      filtered = filtered.filter(p => {
        const price = type === 'rent' ? p.priceRentPerDay : p.priceSale;
        return price >= min;
      });
    }

    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      filtered = filtered.filter(p => {
        const price = type === 'rent' ? p.priceRentPerDay : p.priceSale;
        return price <= max;
      });
    }

    // Sensor type filter
    if (filters.sensorType) {
      filtered = filtered.filter(p => p.sensorType === filters.sensorType);
    }

    setFilteredProducts(filtered);
  };

  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  const sensorTypes = [...new Set(products.map(p => p.sensorType).filter(Boolean))];

  const getTitle = () => {
    if (type === 'rent') return 'Iznajmljivanje';
    if (type === 'sale') return 'Prodaja';
    return 'Svi Proizvodi';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">{getTitle()}</h1>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pretraži proizvode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <select
                value={filters.brand}
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                className="input-field"
              >
                <option value="">Svi brendovi</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Sensor Type Filter */}
            <div>
              <select
                value={filters.sensorType}
                onChange={(e) => setFilters({ ...filters, sensorType: e.target.value })}
                className="input-field"
              >
                <option value="">Svi tipovi senzora</option>
                {sensorTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min cena"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="input-field"
              />
              <input
                type="number"
                placeholder="Max cena"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>{filteredProducts.length} proizvoda pronađeno</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ brand: '', minPrice: '', maxPrice: '', sensorType: '' });
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Obriši filtere
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">Nema proizvoda koji odgovaraju vašim kriterijumima</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
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
                  <div className="flex gap-2 mb-2">
                    {product.isForSale && (
                      <span className="badge badge-success">Prodaja</span>
                    )}
                    {product.isForRent && (
                      <span className="badge badge-info">Iznajmljivanje</span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-2">{product.brand}</p>
                  {product.resolution && (
                    <p className="text-sm text-gray-500 mb-4">{product.resolution}</p>
                  )}
                  <div className="flex justify-between items-end">
                    {product.isForSale && (
                      <div>
                        <span className="text-2xl font-bold text-primary-600">
                          {product.priceSale?.toFixed(2)} RSD
                        </span>
                        {product.stockQuantity && (
                          <p className="text-xs text-gray-500">Na stanju: {product.stockQuantity}</p>
                        )}
                      </div>
                    )}
                    {product.isForRent && (
                      <div>
                        <span className="text-xl font-semibold text-green-600">
                          {product.priceRentPerDay?.toFixed(2)} RSD
                        </span>
                        <span className="text-sm text-gray-500">/dan</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
