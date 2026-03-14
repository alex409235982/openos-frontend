import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';

export default function Admin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [importData, setImportData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await apiRequest('/api/admin/verify', {
        method: 'POST',
        body: { password }
      });
      
      if (res.success) {
        setIsAuthenticated(true);
      }
    } catch (err) {
      setError('Invalid password');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      let distributions;
      eval(`distributions = ${importData}`);
      
      const res = await apiRequest('/api/admin/distros/import', {
        method: 'POST',
        body: { password, distributions }
      });
      
      setResult(res);
      setImportData('');
    } catch (err) {
      setError(err.message || 'Failed to import distributions');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
          <h1 className="h1">Admin Access</h1>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleVerify}>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div style={{ height: 16 }} />
            <button type="submit" className="btn" style={{ width: '100%' }}>
              Verify
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="h1">Operating System Import</h1>
          <button 
            onClick={() => setIsAuthenticated(false)} 
            className="btn secondary"
          >
            Logout
          </button>
        </div>
        <p className="p">This imports an OS to MongoDB.</p>
      </div>

      <div className="card">
        <form onSubmit={handleImport}>
          <label className="label">Distributions Array</label>
          <textarea
            className="input"
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            rows={15}
            style={{ fontFamily: 'monospace', fontSize: 14, resize: 'vertical' }}
            required
          />
          <div style={{ height: 16 }} />
          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Importing...' : 'Import Distributions'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 20 }}>
            <div className="error">{error}</div>
          </div>
        )}

        {result && (
          <div style={{ marginTop: 20 }}>
            <div className="success">{result.message}</div>
            
            {result.results && result.results.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 className="h2" style={{ fontSize: 18 }}>Results:</h3>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {result.results.map((item, i) => (
                    <div key={i} style={{ 
                      padding: 8, 
                      background: 'rgba(139, 255, 179, 0.1)', 
                      borderRadius: 6,
                      marginBottom: 4,
                      fontSize: 14
                    }}>
                      {item.name}: <span style={{ color: '#8bffb3' }}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {result.errors && result.errors.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 className="h2" style={{ fontSize: 18, color: '#ff8b8b' }}>Errors:</h3>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {result.errors.map((item, i) => (
                    <div key={i} style={{ 
                      padding: 8, 
                      background: 'rgba(255, 139, 139, 0.1)', 
                      borderRadius: 6,
                      marginBottom: 4,
                      fontSize: 14,
                      color: '#ff8b8b'
                    }}>
                      {item.name}: {item.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}