import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeaderLogo {
  id: string;
  logo_url: string;
  alt_text: string;
  order_index: number;
  is_active: boolean;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerLogo, setHeaderLogo] = useState<HeaderLogo | null>(null);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Training', href: '/training' },
    { name: 'Indigenous Relations', href: '/indigenous-relations' },
  ];

  const isActiveLink = (href: string) => location.pathname === href;

  // Fetch header logo from Supabase
  useEffect(() => {
    const fetchHeaderLogo = async () => {
      try {
        const { data, error } = await supabase
          .from('header_logo')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching header logo:', error);
          // Use fallback logo if database query fails
          setHeaderLogo({
            id: 'fallback',
            logo_url: '/ATS.png',
            alt_text: 'Aboriginal Training Services',
            order_index: 0,
            is_active: true
          });
        } else {
          setHeaderLogo(data);
        }
      } catch (err) {
        console.error('Header logo fetch error:', err);
        // Use fallback logo
        setHeaderLogo({
          id: 'fallback',
          logo_url: '/ATS.png',
          alt_text: 'Aboriginal Training Services',
          order_index: 0,
          is_active: true
        });
      }
    };

    fetchHeaderLogo();
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          // Scrolling down - hide header by moving it up
          setIsVisible(false);
        } else {
          // Scrolling up - show header
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  return (
    <header className={`bg-white shadow-lg fixed top-0 left-0 right-0 z-50 transition-transform duration-500 ease-in-out ${
      isVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
    }`}>
      {/* Top Contact Bar */}
      <div className="bg-blue-900 text-white py-1 sm:py-2">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="">+1 (587) 524-0275</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="">darcy@abtraining.ca</span>
              </div>
            </div>
            <div className="hidden md:block">
              <span className="text-blue-200 text-xs lg:text-sm">Keepers of the land, keepers of the data, and keepers of the environment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-2 sm:py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              {headerLogo ? (
                <img
                  src={headerLogo.logo_url}
                  alt={headerLogo.alt_text}
                  className="h-12 sm:h-14 md:h-16 w-auto transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    // Fallback to default logo if image fails to load
                    e.currentTarget.src = '/ATS.png';
                    e.currentTarget.alt = 'Aboriginal Training Services';
                  }}
                />
              ) : (
                // Fallback content while loading or if no logo found
                <div className="h-12 sm:h-14 md:h-16 flex items-center">
                  <span className="text-xl font-bold text-blue-700">ATS</span>
                </div>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-4 xl:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 xl:px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActiveLink(item.href)
                    ? 'text-blue-700 bg-blue-50 shadow-md'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/login"
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 xl:px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Student Portal
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-gray-100 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden transition-all duration-300 ease-in-out">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-3 rounded-md text-base font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActiveLink(item.href)
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/login"
              className="block px-3 py-3 rounded-md text-base font-medium bg-blue-700 text-white hover:bg-blue-800 transition-all duration-300 transform hover:scale-105 mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Student Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;