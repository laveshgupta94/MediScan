import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Clock, Pill, Calendar, ChevronRight, Search, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Could not load your history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-container">
          <div className="loader-container" style={{ textAlign: 'center', padding: '100px' }}>
            <div className="loader"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-container">
        <header className="history-header">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1>Scan History</h1>
            <p>Access your previous medicine scans and AI reports</p>
          </motion.div>
        </header>

        {error ? (
          <div className="error-message">{error}</div>
        ) : history.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="empty-history"
          >
            <Search size={48} color="var(--text-muted)" />
            <p>No scans found yet. Start by scanning your first medication!</p>
            <Link to="/analyze" className="btn-primary btn-scan-now">
              <span>Scan Now</span>
              <Activity size={20} />
            </Link>
          </motion.div>
        ) : (
          <div className="history-list">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="history-item"
                onClick={() => navigate('/analyze', { state: { result: item.data } })}
              >
                <div className="history-main-info">
                  <div className="history-icon">
                    <Pill size={28} />
                  </div>
                  <div className="med-details">
                    <h3>{item.medicine_name}</h3>
                    <p>{item.generic_name || 'Generic details unavailable'}</p>
                  </div>
                </div>
                
                <div className="history-meta">
                  <span className="scan-date">
                    <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    {formatDate(item.timestamp)}
                  </span>
                  <span className={`confidence-badge confidence-${item.confidence}`}>
                    {item.confidence} match
                  </span>
                  <ChevronRight size={20} style={{ marginLeft: '16px', verticalAlign: 'middle', color: 'var(--text-muted)' }} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
