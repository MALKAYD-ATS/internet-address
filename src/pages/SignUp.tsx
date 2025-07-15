import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    consent_to_terms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.consent_to_terms) {
      setError('You must consent to the terms to sign up.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('student_signups')
        .insert([
          {
            full_name: formData.full_name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || null,
            consent_to_terms: formData.consent_to_terms,
          },
        ]);

      if (error) {
        console.error('Error inserting signup:', error);
        throw error;
      }

      setSuccess(true);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        consent_to_terms: false,
      });

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Submit error:', err);
      setError('There was a problem submitting your sign-up. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {success ? (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Sign-up successful!
            </h2>
            <p className="text-gray-600 mb-4">
              We have received your information. We will contact you soon.
            </p>
            <Link
              to="/login"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Sign Up
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center bg-red-50 border border-red-200 text-red-800 text-sm rounded p-2">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="consent_to_terms"
                  checked={formData.consent_to_terms}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  I agree to the terms and privacy policy.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded text-white font-medium transition ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Submitting...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SignUp;
