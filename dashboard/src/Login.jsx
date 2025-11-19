import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login } from './lib/auth';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Show success message if redirected from registration
    if (location.state?.message) {
      // Use a more elegant notification instead of alert
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md shadow-lg z-50';
      notification.textContent = location.state.message;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 4000);
    }
  }, [location]);

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

    try {
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Invalid credentials. Please check your username and password.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
            Job Application Tracker
          </h1>
          <p className="text-sm text-gray-500">Sign in to continue</p>
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
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="notion-input"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="notion-input"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="notion-button-primary w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-gray-900 font-medium hover:text-gray-700 transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
