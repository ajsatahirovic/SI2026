import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Users, Calendar, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { productService, orderService, reservationService, userService } from '../services/api';

const Dashboard = () => {
  const { user, isAdmin, isSeller } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (!isAdmin() && !isSeller()) {
      navigate('/');
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const data = await productService.getAll();
        setProducts(data);
      } else if (activeTab === 'orders') {
        const data = await orderService.getAll();
        setOrders(data);
      } else if (activeTab === 'reservations') {
        const data = await reservationService.getAll();
        setReservations(data);
      } else if (activeTab === 'users' && isAdmin()) {
        const data = await userService.getAll();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?')) {
      return;
    }

    try {
      await productService.delete(id);
      loadData();
    } catch (error) {
      alert('Greška pri brisanju proizvoda');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) {
      return;
    }

    try {
      await userService.delete(id);
      loadData();
    } catch (error) {
      alert('Greška pri brisanju korisnika');
    }
  };

  const tabs = [
    { id: 'products', name: 'Proizvodi', icon: Package },
    { id: 'orders', name: 'Porudžbine', icon: ShoppingBag },
    { id: 'reservations', name: 'Rezervacije', icon: Calendar },
  ];

  if (isAdmin()) {
    tabs.push({ id: 'users', name: 'Korisnici', icon: Users });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Dobrodošli, {user?.firstName} {user?.lastName}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loader"></div>
            </div>
          ) : (
            <>
              {/* Products Tab */}
              {activeTab === 'products' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Proizvodi</h2>
                    <button
                      onClick={() => navigate('/dashboard/products/add')}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      Dodaj Proizvod
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Naziv</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Brend</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Cena (Prodaja)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Cena (Rent/dan)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Stanje</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Akcije</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{product.name}</td>
                            <td className="px-4 py-3">{product.brand}</td>
                            <td className="px-4 py-3">
                              {product.isForSale ? `${product.priceSale?.toFixed(2)} RSD` : '-'}
                            </td>
                            <td className="px-4 py-3">
                              {product.isForRent ? `${product.priceRentPerDay?.toFixed(2)} RSD` : '-'}
                            </td>
                            <td className="px-4 py-3">{product.stockQuantity || 0}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => navigate(`/dashboard/products/edit/${product.id}`)}
                                className="text-blue-600 hover:text-blue-700 mr-3"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Porudžbine</h2>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">Porudžbina #{order.id}</p>
                            <p className="text-sm text-gray-600">
                              Korisnik: {order.user?.firstName} {order.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Email: {order.user?.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary-600">
                              {order.totalAmount.toFixed(2)} RSD
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.orderDate && new Date(order.orderDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.orderItems?.length || 0} proizvoda
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reservations Tab */}
              {activeTab === 'reservations' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Rezervacije</h2>
                  <div className="space-y-4">
                    {reservations.map((reservation) => (
                      <div key={reservation.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{reservation.product?.name}</p>
                            <p className="text-sm text-gray-600">
                              Korisnik: {reservation.user?.firstName} {reservation.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Email: {reservation.user?.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              Period: {new Date(reservation.startDate).toLocaleDateString()} - 
                              {new Date(reservation.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`badge ${
                              reservation.status === 'Active' ? 'badge-success' : 'badge-warning'
                            }`}>
                              {reservation.status}
                            </span>
                            <p className="text-xl font-bold text-primary-600 mt-2">
                              {reservation.totalPrice.toFixed(2)} RSD
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Tab (Admin Only) */}
              {activeTab === 'users' && isAdmin() && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Korisnici</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Ime</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Uloga</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Akcije</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              {u.firstName} {u.lastName}
                            </td>
                            <td className="px-4 py-3">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`badge ${
                                u.role === 'Admin' ? 'badge-danger' :
                                u.role === 'Seller' ? 'badge-info' : 'badge-success'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-red-600 hover:text-red-700"
                                disabled={u.id === user?.id}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
