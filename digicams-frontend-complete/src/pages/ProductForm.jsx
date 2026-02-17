import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { productService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSeller, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    imageUrl: '',
    isForSale: false,
    priceSale: '',
    stockQuantity: '',
    isForRent: false,
    priceRentPerDay: '',
    resolution: '',
    sensorType: ''
  });

  useEffect(() => {
    if (!isSeller() && !isAdmin()) {
      navigate('/');
      return;
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await productService.getById(id);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        brand: data.brand || '',
        imageUrl: data.imageUrl || '',
        isForSale: data.isForSale || false,
        priceSale: data.priceSale || '',
        stockQuantity: data.stockQuantity || '',
        isForRent: data.isForRent || false,
        priceRentPerDay: data.priceRentPerDay || '',
        resolution: data.resolution || '',
        sensorType: data.sensorType || ''
      });
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Greška pri učitavanju proizvoda');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.isForSale && !formData.isForRent) {
      setError('Proizvod mora biti dostupan za prodaju ili iznajmljivanje');
      setLoading(false);
      return;
    }

    try {
      const productData = {
        ...formData,
        priceSale: formData.priceSale ? parseFloat(formData.priceSale) : null,
        priceRentPerDay: formData.priceRentPerDay ? parseFloat(formData.priceRentPerDay) : null,
        stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : null
      };

      if (id) {
        await productService.update(id, productData);
      } else {
        await productService.create(productData);
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Greška pri čuvanju proizvoda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            {id ? 'Uredi Proizvod' : 'Dodaj Proizvod'}
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naziv proizvoda *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Canon EOS R5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brend
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="input-field"
                placeholder="Canon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opis
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input-field"
                placeholder="Detaljan opis proizvoda..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL slike
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="input-field"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Technical Specs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rezolucija
                </label>
                <input
                  type="text"
                  name="resolution"
                  value={formData.resolution}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="45 MP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tip senzora
                </label>
                <input
                  type="text"
                  name="sensorType"
                  value={formData.sensorType}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Full Frame"
                />
              </div>
            </div>

            {/* Sale Options */}
            <div className="border-t pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isForSale"
                  name="isForSale"
                  checked={formData.isForSale}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isForSale" className="ml-2 block text-sm font-medium text-gray-700">
                  Dostupno za prodaju
                </label>
              </div>

              {formData.isForSale && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cena (RSD)
                    </label>
                    <input
                      type="number"
                      name="priceSale"
                      step="0.01"
                      value={formData.priceSale}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="150000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Količina na stanju
                    </label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rent Options */}
            <div className="border-t pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isForRent"
                  name="isForRent"
                  checked={formData.isForRent}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isForRent" className="ml-2 block text-sm font-medium text-gray-700">
                  Dostupno za iznajmljivanje
                </label>
              </div>

              {formData.isForRent && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cena po danu (RSD)
                  </label>
                  <input
                    type="number"
                    name="priceRentPerDay"
                    step="0.01"
                    value={formData.priceRentPerDay}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="5000"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? 'Čuvanje...' : id ? 'Sačuvaj Izmene' : 'Dodaj Proizvod'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 btn-secondary"
              >
                Otkaži
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
