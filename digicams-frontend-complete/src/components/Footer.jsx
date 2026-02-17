import { Camera, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Camera className="h-8 w-8 text-primary-400" />
              <span className="text-2xl font-bold">DigiCams</span>
            </div>
            <p className="text-gray-400 mb-4">
              Vaš pouzdan partner za iznajmljivanje i kupovinu profesionalne foto opreme. 
              Kvalitetni fotoaparati i oprema dostupni kada vam zatrebaju.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Brzi Linkovi</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition">
                  Svi Proizvodi
                </Link>
              </li>
              <li>
                <Link to="/products/rent" className="text-gray-400 hover:text-white transition">
                  Iznajmljivanje
                </Link>
              </li>
              <li>
                <Link to="/products/sale" className="text-gray-400 hover:text-white transition">
                  Prodaja
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition">
                  O Nama
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>info@digicams.rs</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+381 11 123 4567</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Beograd, Srbija</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} DigiCams. Sva prava zadržana.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
