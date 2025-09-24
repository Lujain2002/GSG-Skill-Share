import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Points() {
  const { currentUser, constants } = useAuth();
  const [ledger, setLedger] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchLedger = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `http://localhost:5044/api/Points/ledger/${currentUser.id}`,
          {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          }
        );

        if (!res.ok) throw new Error('Failed to load ledger');

        const data = await res.json();
        setLedger(data.entries);
        setBalance(data.currentBalance);
      } catch (err) {
        console.error('Error loading ledger:', err);
        alert('Failed to load points ledger');
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [currentUser?.id]);

  if (!currentUser) return <div className="card">Loading user…</div>;
  if (loading) return <div className="card">Loading ledger…</div>;

  return (
    <div className="card">
      <h3>Points & Ledger</h3>
      <div style={{ fontSize: '.8rem', marginBottom: '.5rem' }}>
        Current Balance: <strong>{balance}</strong> pts<br/>
        Earn Rate: {constants.EARN_RATE_PER_30} pts / 30 mins taught
      </div>

      <div className="ledger">
        {ledger.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map(l => (
                <tr key={l.id}>
                  <td>{new Date(l.date).toLocaleString()}</td>
                  <td>{l.type}</td>
                  <td style={{ color: l.change >= 0 ? '#4ade80' : '#f87171' }}>
                    {l.change}
                  </td>
                  <td>{l.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="muted">No ledger entries yet</div>
        )}
      </div>
    </div>
  );
}
