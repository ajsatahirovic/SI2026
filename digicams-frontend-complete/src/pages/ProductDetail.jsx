import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Calendar, Check, X } from 'lucide-react';
import { productService, reservationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore } from 'date-fns';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reservation state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [reservationLoading, setReservationLoading] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (product?.isForRent) {
      loadUnavailableDates();
    }
  }, [product, currentMonth]);

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedStartDate, selectedEndDate, product]);

  const loadProduct = async () => {
    try {
      const data = await productService.getById(id);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnavailableDates = async () => {
    // This would fetch unavailable dates from the API
    // For now, we'll use mock data
    setUnavailableDates([]);
  };

  const calculateTotalPrice = () => {
    if (selectedStartDate && selectedEndDate && product) {
      const days = Math.ceil((selectedEndDate - selectedStartDate) / (1000 * 60 * 60 * 24)) + 1;
      setTotalPrice(days * product.priceRentPerDay);
    } else {
      setTotalPrice(0);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (product.isForSale && product.stockQuantity < quantity) {
      alert('Nema dovoljno proizvoda na stanju');
      return;
    }

    addToCart(product, quantity);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDateClick = (date) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isBefore(date, today)) {
      return; // Can't select past dates
    }

    if (isDateUnavailable(date)) {
      return; // Can't select unavailable dates
    }

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else if (isAfter(date, selectedStartDate)) {
      // Select end date
      setSelectedEndDate(date);
    } else {
      // Clicked before start date, reset
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    }
  };

  const isDateUnavailable = (date) => {
    return unavailableDates.some(d => isSameDay(new Date(d), date));
  };

  const isDateSelected = (date) => {
    if (!selectedStartDate) return false;
    if (!selectedEndDate) return isSameDay(date, selectedStartDate);
    
    return (isSameDay(date, selectedStartDate) || 
            isSameDay(date, selectedEndDate) ||
            (isAfter(date, selectedStartDate) && isBefore(date, selectedEndDate)));
  };

  const handleReservation = async () => {
    if (!selectedStartDate || !selectedEndDate) {
      alert('Molimo odaberite period iznajmljivanja');
      return;
    }

    setReservationLoading(true);
    try {
      await reservationService.create({
        productId: product.id,
        startDate: selectedStartDate.toISOString(),
        endDate: selectedEndDate.toISOString(),
        totalPrice: totalPrice
      });
      alert('Rezervacija uspešno kreirana!');
      navigate('/reservations');
    } catch (error) {
      alert('Greška pri kreiranju rezervacije');
    } finally {
      setReservationLoading(false);
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Prethodni
          </button>
          <h3 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Sledeći →
          </button>
        </div>

        <div className="calendar-grid">
          {['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
          
          {days.map((day, idx) => {
            const isUnavailable = isDateUnavailable(day);
            const isSelected = isDateSelected(day);
            const isPast = isBefore(day, new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={idx}
                onClick={() => !isPast && !isUnavailable && handleDateClick(day)}
                className={`
                  calendar-day
                  ${isUnavailable || isPast ? 'unavailable' : 'available'}
                  ${isSelected ? 'selected' : ''}
                `}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>

        {selectedStartDate && selectedEndDate && (
          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">Period iznajmljivanja</p>
                <p className="font-semibold">
                  {format(selectedStartDate, 'dd.MM.yyyy')} - {format(selectedEndDate, 'dd.MM.yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Ukupna cena</p>
                <p className="text-2xl font-bold text-primary-600">
                  {totalPrice.toFixed(2)} RSD
                </p>
              </div>
            </div>
            <button
              onClick={handleReservation}
              disabled={reservationLoading}
              className="w-full btn-primary"
            >
              {reservationLoading ? 'Rezervacija...' : 'Potvrdi Rezervaciju'}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Proizvod nije pronađen</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
            <Check className="h-5 w-5" />
            Proizvod dodat u korpu!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <img
              src={product.imageUrl || 'https://via.placeholder.com/800x600?text=Camera'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-8 mb-6">
              <div className="flex gap-2 mb-4">
                {product.isForSale && (
                  <span className="badge badge-success">Prodaja</span>
                )}
                {product.isForRent && (
                  <span className="badge badge-info">Iznajmljivanje</span>
                )}
              </div>

              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-xl text-gray-600 mb-6">{product.brand}</p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Opis</h3>
                <p className="text-gray-600">{product.description || 'Nema opisa proizvoda.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {product.resolution && (
                  <div>
                    <p className="text-sm text-gray-600">Rezolucija</p>
                    <p className="font-semibold">{product.resolution}</p>
                  </div>
                )}
                {product.sensorType && (
                  <div>
                    <p className="text-sm text-gray-600">Tip senzora</p>
                    <p className="font-semibold">{product.sensorType}</p>
                  </div>
                )}
              </div>

              {product.isForSale && (
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-3xl font-bold text-primary-600">
                      {product.priceSale?.toFixed(2)} RSD
                    </span>
                    <span className="text-gray-600">
                      Na stanju: {product.stockQuantity}
                    </span>
                  </div>

                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">Količina</label>
                      <input
                        type="number"
                        min="1"
                        max={product.stockQuantity}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Dodaj u korpu
                  </button>
                </div>
              )}

              {product.isForRent && (
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-semibold text-green-600">
                      {product.priceRentPerDay?.toFixed(2)} RSD
                    </span>
                    <span className="text-gray-600">po danu</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reservation Calendar */}
        {product.isForRent && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6">Kalendar Dostupnosti</h2>
            {renderCalendar()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
