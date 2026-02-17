import { useState, useEffect } from 'react';
import { Package, Calendar } from 'lucide-react';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-4xl font-bold mb-8">Moje Porudžbine</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Package className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Nemate porudžbina
            </h2>
            <p className="text-gray-600 mb-8">
              Kada kupite proizvod, pojavice se ovde
            </p>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary"
            >
              Pregledaj Proizvode
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 bg-gray-50 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Porudžbina #{order.id}</p>
                      <p className="text-lg font-semibold">
                        {order.orderDate && format(new Date(order.orderDate), 'dd.MM.yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Ukupno</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {order.totalAmount.toFixed(2)} RSD
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold mb-4">Proizvodi</h3>
                  <div className="space-y-4">
                    {order.orderItems?.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <img
                          src={item.product?.imageUrl || 'https://via.placeholder.com/80?text=Camera'}
                          alt={item.product?.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{item.product?.name}</p>
                          <p className="text-gray-600 text-sm">{item.product?.brand}</p>
                          <p className="text-sm text-gray-500">Količina: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {(item.priceAtTime * item.quantity).toFixed(2)} RSD
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.priceAtTime.toFixed(2)} RSD x {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
