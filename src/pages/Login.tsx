import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, verifySession } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Plane, Shield, Award, Users } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, user } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    const checkExistingSession = async () => {
      if (user) {
        console.log('User already logged in, redirecting to portal');
        navigate('/portal', { replace: true });
        return;
      }
      
      // Double-check with session verification
      try {
        const session = await verifySession();
        if (session) {
          console.log('Valid session found, redirecting to portal');
          navigate('/portal', { replace: true });
        }
      } catch (error) {
        console.log('No valid session found, staying on login page');
      }
    };

    checkExistingSession();
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login for:', email);
      
      const { error } = await signIn(email, password);

      if (error) {
        console.error('Login error:', error);
        
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before logging in.');
        } else if (error.message.includes('Too many requests')) {
          setError('Too many login attempts. Please wait a few minutes before trying again.');
        } else {
          setError(error.message || 'An error occurred during login. Please try again.');
        }
        return;
      }

      console.log('Login successful, redirecting to portal');
      
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        navigate('/portal', { replace: true });
      }, 100);
      
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Back to Home Button */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Logo and Header */}
          <div className="mb-8">
            <img
              src="/ATS.png"
              alt="Aboriginal Training Services"
              className="h-12 w-auto mb-6"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h2 className="text-3xl font-bold text-gray-900">
              Log in to your Account
            </h2>
            <p className="mt-2 text-gray-600">
              Welcome to the ATS Student Portal:
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?
            </p>
            <Link
              to="/sign-up"
              className="mt-2 inline-block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-center"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Brand/Marketing Content */}
      <div className="hidden lg:block relative flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-4 h-4 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-white rounded-full animate-bounce"></div>
          <div className="absolute bottom-40 left-20 w-3 h-3 bg-white rounded-full animate-ping"></div>
          <div className="absolute bottom-20 right-10 w-5 h-5 bg-white rounded-full animate-pulse"></div>
        </div>

        {/* Content */}
        <div className="relative flex flex-col justify-center h-full px-12 xl:px-16">
          <div className="text-center text-white">
            {/* Floating Icons */}
            <div className="flex justify-center space-x-8 mb-12">
              <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
                <Plane className="h-8 w-8 text-white" />
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
                <Award className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Main Content */}
            <h1 className="text-4xl font-bold mb-6">
              Access Your Training Portal
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Everything you need for professional RPAS certification and training in one easily accessible dashboard.
            </p>

            {/* Features List */}
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-2 mr-4">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <span className="text-blue-100">Track your certification progress</span>
              </div>
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-2 mr-4">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-blue-100">Connect with instructors and peers</span>
              </div>
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-2 mr-4">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-blue-100">Access course materials securely</span>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center space-x-2 mt-12">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white bg-opacity-50 rounded-full"></div>
              <div className="w-2 h-2 bg-white bg-opacity-50 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>
    </div>
  );
};

export default Login;