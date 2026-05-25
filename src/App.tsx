import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import './App.css';
import { Alert, Stats, TokenResponse } from './types';

function App() {
  const [token, setToken] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_alerts: 0,
    suspicious: 0,
    normal: 0,
    suspicious_percentage: 0
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Use your Railway API URL
  const API_URL: string = 'https://web-production-30aa2.up.railway.app';

  // Fetch alerts
  const fetchAlerts = useCallback(async (): Promise<void> => {
    try {
      const response = await axios.get<Alert[]>(`${API_URL}/alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  }, [token]);

  // Fetch stats
  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      const response = await axios.get<Stats>(`${API_URL}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [token]);

  // Delete alert
  const deleteAlert = async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/alerts/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAlerts();
      fetchStats();
      alert('Alert deleted successfully');
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  // Load data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchAlerts();
      fetchStats();
    }
  }, [isLoggedIn, fetchAlerts, fetchStats]);

  // Login function
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post<TokenResponse>(`${API_URL}/token`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      setToken(response.data.access_token);
      setIsLoggedIn(true);
      alert('Login successful!');
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Login failed:', axiosError);
      alert('Login failed. Check your credentials.');
    }
    setLoading(false);
  };

  // Register function
  const handleRegister = async (): Promise<void> => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/register`, {
        username: username,
        password: password
      });
      alert('Registration successful! You can now login.');
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Registration failed:', axiosError);
      alert('Registration failed. Username may already exist.');
    }
    setLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <h1>🔐 Threat Alert Dashboard</h1>
        <div className="login-card">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>
          <hr />
          <button className="register-btn" onClick={handleRegister} disabled={loading}>
            Register New Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="header">
        <h1>🛡️ Threat Alert Dashboard</h1>
        <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>Logout</button>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Alerts</h3>
          <p className="stat-number">{stats.total_alerts}</p>
        </div>
        <div className="stat-card suspicious">
          <h3>🚨 Suspicious</h3>
          <p className="stat-number">{stats.suspicious}</p>
        </div>
        <div className="stat-card normal">
          <h3>✅ Normal</h3>
          <p className="stat-number">{stats.normal}</p>
        </div>
        <div className="stat-card">
          <h3>Suspicious %</h3>
          <p className="stat-number">{stats.suspicious_percentage}%</p>
        </div>
      </div>

      <div className="alerts-section">
        <div className="alerts-header">
          <h2>Recent Alerts</h2>
          <button className="refresh-btn" onClick={() => { fetchAlerts(); fetchStats(); }}>
            Refresh
          </button>
        </div>
        {alerts.length === 0 ? (
          <p className="no-alerts">No alerts found. Create one via API.</p>
        ) : (
          <table className="alerts-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Source IP</th>
                <th>Dest IP</th>
                <th>Port</th>
                <th>Threat Type</th>
                <th>Confidence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert: Alert) => (
                <tr key={alert.id} className={alert.is_suspicious ? 'suspicious-row' : 'normal-row'}>
                  <td>{alert.id}</td>
                  <td>{alert.source_ip}</td>
                  <td>{alert.dest_ip}</td>
                  <td>{alert.port}</td>
                  <td>{alert.threat_type}</td>
                  <td>{(alert.confidence * 100).toFixed(1)}%</td>
                  <td>
                    <button className="delete-btn" onClick={() => deleteAlert(alert.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;