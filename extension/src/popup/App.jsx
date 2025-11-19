import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [formData, setFormData] = useState({
    job_title: '',
    company: '',
    location: '',
    job_link: '',
    date_applied: new Date().toISOString().split('T')[0],
    status: 'Applied',
    notes: '',
  });
  const [message, setMessage] = useState('');

  const fetchJobInfo = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const url = tabs[0].url;
        setMessage('Detecting job information...');
        
        // Try to get job info with retry logic
        const tryGetJobInfo = (attempts = 3) => {
          chrome.tabs.sendMessage(
            tabs[0].id, 
            { action: 'getJobInfo' }, 
            (response) => {
              if (chrome.runtime.lastError) {
                console.error('Error:', chrome.runtime.lastError.message);
                // Content script might not be loaded yet, try again
                if (attempts > 0) {
                  setTimeout(() => tryGetJobInfo(attempts - 1), 500);
                } else {
                  setFormData(prev => ({ ...prev, job_link: url || prev.job_link }));
                  setMessage('Could not detect job info. Please fill manually.');
                  setTimeout(() => setMessage(''), 3000);
                }
                return;
              }

              if (response && response.jobInfo) {
                const info = response.jobInfo;
                console.log('Received job info:', info);
                setFormData(prev => ({
                  ...prev,
                  job_title: info.job_title || prev.job_title,
                  company: info.company || prev.company,
                  location: info.location || prev.location,
                  job_link: url || prev.job_link,
                }));
                
                // Show success message if we got good data
                if (info.job_title && info.company) {
                  setMessage('✓ Job information detected!');
                  setTimeout(() => setMessage(''), 3000);
                } else if (info.job_title || info.company) {
                  setMessage('Partial info detected. Please fill remaining fields.');
                  setTimeout(() => setMessage(''), 3000);
                } else {
                  setMessage('Could not auto-detect. Please fill manually.');
                  setTimeout(() => setMessage(''), 3000);
                }
              } else {
                setFormData(prev => ({ ...prev, job_link: url || prev.job_link }));
                setMessage('Could not detect job info. Please fill manually.');
                setTimeout(() => setMessage(''), 3000);
              }
            }
          );
        };
        
        tryGetJobInfo();
      }
    });
  };

  useEffect(() => {
    // Check if user is authenticated
    chrome.storage.local.get(['access_token', 'refresh_token', 'user_id'], (result) => {
      if (result.access_token) {
        setToken(result.access_token);
        setIsAuthenticated(true);
      }
    });

    // Fetch job info when popup opens
    fetchJobInfo();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
      const response = await fetch(`${API_BASE_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { access, refresh } = data;
        
        // Decode token to get user_id
        const tokenParts = access.split('.');
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            // Try different possible field names for user_id
            const userId = payload.user_id || payload.userId || payload.id;
            
            // Store tokens and user info
            chrome.storage.local.set({
              access_token: access,
              refresh_token: refresh,
              user_id: userId || '',
              username: username,
            }, () => {
              setToken(access);
              setIsAuthenticated(true);
              setMessage('Login successful!');
            });
          } catch (e) {
            console.error('Error decoding token:', e);
            setMessage('Error processing token');
          }
        } else {
          setMessage('Invalid token received');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.detail || errorData.message || 'Invalid credentials';
        setMessage(`Login failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage(`Error connecting to server. Make sure the backend is running at ${API_BASE_URL.replace('/api', '')}`);
    }
  };

  const handleLogout = () => {
    chrome.storage.local.remove(['access_token', 'refresh_token', 'user_id', 'username'], () => {
      setToken(null);
      setIsAuthenticated(false);
      setMessage('Logged out successfully');
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage('Please login first');
      return;
    }

    // Get fresh token from storage
    chrome.storage.local.get(['access_token'], async (result) => {
      const accessToken = result.access_token || token;
      
      try {
        const response = await fetch(`${API_BASE_URL}/applications/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setMessage('Application saved successfully!');
          setFormData({
            job_title: '',
            company: '',
            location: '',
            job_link: '',
            date_applied: new Date().toISOString().split('T')[0],
            status: 'Applied',
            notes: '',
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Server error:', errorData);
          // Show more detailed error information
          let errorMsg = errorData.detail || errorData.message;
          if (errorData.non_field_errors) {
            errorMsg = errorData.non_field_errors.join(', ');
          } else if (Object.keys(errorData).length > 0) {
            // Show field-specific errors
            const fieldErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('; ');
            errorMsg = fieldErrors || `HTTP ${response.status}: Failed to save application`;
          } else {
            errorMsg = `HTTP ${response.status}: Failed to save application`;
          }
          setMessage(`Error: ${errorMsg}`);
          // If token is invalid, logout
          if (response.status === 401) {
            chrome.storage.local.remove(['access_token', 'refresh_token', 'user_id', 'username'], () => {
              setToken(null);
              setIsAuthenticated(false);
            });
          }
        }
      } catch (error) {
        console.error('Save error:', error);
        setMessage(`Error connecting to server: ${error.message}. Make sure the backend is running at ${API_BASE_URL.replace('/api', '')}`);
      }
    });
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isAuthenticated) {
    return (
      <div style={{ width: '400px', padding: '20px' }}>
        <h2>Job Application Tracker</h2>
        <p>Please login to track applications</p>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </form>
        {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}
      </div>
    );
  }

  return (
    <div style={{ width: '400px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Add Job Application</h2>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            type="button"
            onClick={fetchJobInfo}
            style={{
              padding: '5px 10px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
            title="Refresh job information from page"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '5px 10px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="job_title"
            placeholder="Job Title *"
            value={formData.job_title}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="company"
            placeholder="Company *"
            value={formData.company}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="url"
            name="job_link"
            placeholder="Job Link *"
            value={formData.job_link}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="date"
            name="date_applied"
            value={formData.date_applied}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            <option value="Ghosted">Ghosted</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Save Application
        </button>
      </form>

      {message && (
        <p style={{ color: message.includes('Error') ? 'red' : 'green', marginTop: '10px' }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default App;

