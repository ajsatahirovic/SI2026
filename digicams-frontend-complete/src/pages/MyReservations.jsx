import { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { reservationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const data = await reservationService.getMyReservations();
      setReservations(data);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Da li ste sigurni da želite da otkažete ovu rezervaciju?')) {
      return;
    }

    try {
      await reservationService.cancel(id);
      loadReservations();
      alert('Rezervacija je otkazana');
    } catch (error) {
      alert('Greška pri otkazivanju rezervacije');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Aktivna';
      case 'confirmed':
        return 'Potvrđena';
      case 'pending':
        return 'Na čekanju';
      case 'cancelled':
        return 'Otkazana';
      default:
        return status || 'Nepoznato';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Moje Rezervacije</h1>

        {reservations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Calendar className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Nemate aktivnih rezervacija
            </h2>
            <p className="text-gray-600 mb-8">
              Rezervišite opremu za iznajmljivanje
            </p>
            <button
              onClick={() => navigate('/products/rent')}
              className="btn-primary"
            >
              Pregledaj Opremu za Iznajmljivanje
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <img
                  src={reservation.product?.imageUrl || 'https://via.placeholder.com/400x200?text=Camera'}
                  alt={reservation.product?.name}
                  className="w-full h-48 object-cover"
                />

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{reservation.product?.name}</h3>
                    <span className={`badge ${getStatusColor(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{reservation.product?.brand}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {format(new Date(reservation.startDate), 'dd.MM.yyyy')} - 
                        {format(new Date(reservation.endDate), 'dd.MM.yyyy')}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Ukupna cena: </span>
                      <span className="text-xl font-bold text-primary-600">
                        {reservation.totalPrice.toFixed(2)} RSD
                      </span>
                    </div>
                  </div>

                  {reservation.status?.toLowerCase() !== 'cancelled' && (
                    <button
                      onClick={() => handleCancel(reservation.id)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Otkaži Rezervaciju
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
