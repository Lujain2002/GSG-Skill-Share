import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BookSessionModal from './BookSessionModal';

export default function Matches() {
  const { currentUser } = useAuth();          
  const [categories, setCategories] = useState([]);  
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5044/api/Categories');
        if (!res.ok) throw new Error('Failed to load categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        let url;
        if (categoryFilter === 'All') {
          url = 'http://localhost:5044/api/Matches/matches/by-category/0';
        } else {
          url = `http://localhost:5044/api/Matches/matches/by-category/${categoryFilter}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch matches');
        const data = await res.json();

        const filtered = currentUser
          ? data.filter(m => m.id !== currentUser.id)
          : data;

        setMatches(filtered);
      } catch (err) {
        console.error('Error loading matches:', err);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [categoryFilter, currentUser]);

  const handleBookSession = (teacher) => {
    setSelectedTeacher(teacher);
  };

  const handleCloseModal = () => {
    setSelectedTeacher(null);
  };

  return (
    <div className="card">
      <h3>Matches</h3>

      <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap', marginBottom:'.75rem' }}>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="All">All Categories</option>
          {categories.map(c => (
            <option key={c.categoryId} value={c.categoryId}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="muted">Loading...</div>}
      {!loading && matches.length === 0 && (
        <div className="muted">No matches yet. Add more skills.</div>
      )}

      <div className="panels" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))' }}>
        {matches.map(m => (
          <div key={m.id} className="card" style={{ borderColor:'#263240' }}>
            <strong>{m.userName}</strong>
            <div style={{ fontSize:'.7rem' }}>Score: {m.score}</div>
            <div style={{ fontSize:'.7rem' }}>
              Teaches: {m.teaches.map(s => `${s.skill} (${s.level})`).join(', ') || '—'}<br/>
              Wants: {m.wants.map(s => `${s.skill} (${s.category})`).join(', ') || '—'}
            </div>
            <button onClick={() => handleBookSession(m)}>Book Session</button>
          </div>
        ))}
      </div>

      {selectedTeacher && (
        <BookSessionModal 
          teacher={selectedTeacher} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
}