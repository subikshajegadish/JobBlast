import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from './lib/auth';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(formData.username, formData.password, formData.email);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message ||
        'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-gray-500">Start tracking your job applications</p>
        </div>

        {/* Card */}
        <div className="notion-card p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="notion-input"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="notion-input"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="notion-input"
                placeholder="At least 8 characters"
              />
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="notion-input"
                placeholder="Re-enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="notion-button-primary w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-gray-900 font-medium hover:text-gray-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
