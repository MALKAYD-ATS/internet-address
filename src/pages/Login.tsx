import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface HeaderLogo {
  logo_url: string;
  alt_text?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [headerLogo, setHeaderLogo] = useState<HeaderLogo | null>(null);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  React.useEffect(() => {
    const fetchHeaderLogo = async () => {
      try {
        const { data, error } = await supabase
          .from('header_logo')
          .select('logo_url, alt_text')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
          .limit(1)
          .single();

        if (data && !error) {
          setHeaderLogo(data);
        }
      } catch (err) {
        console.error('Error fetching header logo:', err);
      }
    };

    fetchHeaderLogo();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/portal');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full opacity-20"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full opacity-15"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-white rounded-full opacity-10"></div>
        <div className="absolute bottom-40 right-10 w-20 h-20 bg-white rounded-full opacity-25"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <img
            src={headerLogo?.logo_url || "/ATS.png"}
            alt={headerLogo?.alt_text || "Aboriginal Training Services"}
            className="h-20 w-auto mx-auto mb-4"
            onError={(e) => {
              e.currentTarget.src = '/ATS.png';
              e.currentTarget.alt = 'Aboriginal Training Services';
            }}
          />
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Student Portal</h2>
          <p className="mt-2 text-blue-100">Sign in to access your courses</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/#contact"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Contact Us to Enroll
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;