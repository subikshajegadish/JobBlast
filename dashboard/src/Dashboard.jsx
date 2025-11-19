import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { logout, getUsername } from './lib/auth';
import { Plus, Edit, Trash2, Search, X, ExternalLink, LogOut } from 'lucide-react';
import { cn } from './lib/utils';

// Simple auth check
const checkAuth = () => {
  try {
    const token = localStorage.getItem('access_token');
    return !!token;
  } catch {
    return false;
  }
};

function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [formData, setFormData] = useState({
    job_title: '',
    company: '',
    location: '',
    job_link: '',
    date_applied: new Date().toISOString().split('T')[0],
    status: 'Applied',
    notes: '',
  });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  useEffect(() => {
    // Check authentication
    if (!checkAuth()) {
      navigate('/login');
      return;
    }
    fetchApplications();
  }, [navigate, filters]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/api/applications/?${params}`);
      setApplications(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingApp) {
        await api.put(`/api/applications/${editingApp.id}/`, formData);
      } else {
        await api.post('/api/applications/', formData);
      }
      setShowModal(false);
      setEditingApp(null);
      resetForm();
      fetchApplications();
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Error saving application');
    }
  };

  const handleEdit = (app) => {
    setEditingApp(app);
    setFormData({
      job_title: app.job_title,
      company: app.company,
      location: app.location || '',
      job_link: app.job_link,
      date_applied: app.date_applied,
      status: app.status,
      notes: app.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await api.delete(`/api/applications/${id}/`);
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Error deleting application');
    }
  };

  const resetForm = () => {
    setFormData({
      job_title: '',
      company: '',
      location: '',
      job_link: '',
      date_applied: new Date().toISOString().split('T')[0],
      status: 'Applied',
      notes: '',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Applied: 'bg-blue-100 text-blue-700 border-blue-200',
      Interview: 'bg-amber-100 text-amber-700 border-amber-200',
      Offer: 'bg-green-100 text-green-700 border-green-200',
      Rejected: 'bg-red-100 text-red-700 border-red-200',
      Ghosted: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || colors.Applied;
  };

  const getStatusRowColor = (status) => {
    const colors = {
      Applied: 'hover:bg-blue-50/50 border-l-blue-400',
      Interview: 'hover:bg-amber-50/50 border-l-amber-400',
      Offer: 'hover:bg-green-50/50 border-l-green-400',
      Rejected: 'hover:bg-red-50/50 border-l-red-400',
      Ghosted: 'hover:bg-gray-50/50 border-l-gray-400',
    };
    return colors[status] || 'hover:bg-gray-50/50';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                Job Applications
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Welcome back, {getUsername()}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Filters and Actions */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applications..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="notion-input pl-9"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="notion-input w-full sm:w-auto"
            >
              <option value="">All statuses</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Ghosted">Ghosted</option>
            </select>
            <button
              onClick={() => {
                resetForm();
                setEditingApp(null);
                setShowModal(true);
              }}
              className="notion-button-primary flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              New application
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="notion-card p-12 text-center">
            <p className="text-gray-500 mb-4">No applications found</p>
            <button
              onClick={() => {
                resetForm();
                setEditingApp(null);
                setShowModal(true);
              }}
              className="notion-button-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add your first application
            </button>
          </div>
        ) : (
          <div className="notion-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className={cn(
                        'transition-colors border-l-4 border-transparent',
                        getStatusRowColor(app.status)
                      )}
                    >
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{app.job_title}</div>
                        {app.notes && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {app.notes.substring(0, 60)}...
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{app.company}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-500">{app.location || '—'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-500">
                          {new Date(app.date_applied).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border',
                            getStatusColor(app.status)
                          )}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={app.job_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
                            title="View job posting"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleEdit(app)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="notion-overlay" onClick={() => {
          setShowModal(false);
          setEditingApp(null);
          resetForm();
        }}>
          <div className="notion-modal p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingApp ? 'Edit application' : 'New application'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingApp(null);
                  resetForm();
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="notion-input"
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="notion-input"
                    placeholder="e.g. Google"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="notion-input"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date Applied <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date_applied}
                    onChange={(e) => setFormData({ ...formData, date_applied: e.target.value })}
                    className="notion-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Job Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.job_link}
                    onChange={(e) => setFormData({ ...formData, job_link: e.target.value })}
                    className="notion-input"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="notion-input"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Ghosted">Ghosted</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="4"
                  className="notion-input resize-none"
                  placeholder="Add any notes about this application..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingApp(null);
                    resetForm();
                  }}
                  className="notion-button-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="notion-button-primary">
                  {editingApp ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
