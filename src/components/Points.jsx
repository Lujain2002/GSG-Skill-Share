import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Points() {
  const { currentUser, ledger, constants } = useAuth();
  return (
    <div className="card">
      <h3>Points & Ledger</h3>
      <div style={{fontSize:'.8rem',marginBottom:'.5rem'}}>Current Balance: <strong>{currentUser.points}</strong> pts<br/>Earn Rate: {constants.EARN_RATE_PER_30} pts / 30 mins taught</div>
      <div className="ledger">
        <table>
          <thead>
            <tr><th>When</th><th>Type</th><th>Amount</th><th>Reason</th></tr>
          </thead>
          <tbody>
            {ledger.map(l => (
              <tr key={l.id}>
                <td>{new Date(l.timestamp).toLocaleString()}</td>
                <td>{l.type}</td>
                <td style={{color: l.amount>=0? '#4ade80':'#f87171'}}>{l.amount}</td>
                <td>{l.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {ledger.length === 0 && <div className="muted">No ledger entries yet</div>}
      </div>
    </div>
  );
}
