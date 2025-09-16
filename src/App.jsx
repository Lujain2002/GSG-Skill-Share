import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthTabs from './components/AuthTabs';
import Home from './components/Home';
import NavBar from './components/NavBar';
import SkillEditor from './components/SkillEditor';
import Profile from './components/Profile';
import Matches from './components/Matches';
import Sessions from './components/Sessions';
import Points from './components/Points';
import Dashboard from './components/Dashboard';
import BookSessionModal from './components/BookSessionModal';

function InnerApp() {
  const { currentUser } = useAuth();
  const [tab,setTab] = useState('dashboard');
  const [bookFor,setBookFor] = useState(null);
  const [route,setRoute] = useState('home'); // 'home' | 'auth' for logged-out
  if (!currentUser) {
    if (route==='auth') {
      return (
        <div className="container" style={{marginTop:'2.5rem'}}>
          <h1 style={{textAlign:'center'}}>Join SkillShare</h1>
          <p style={{textAlign:'center'}} className="muted">Create an account to teach and learn with peers.</p>
          <AuthTabs defaultTab={1} />
          <div style={{textAlign:'center', marginTop:'1rem'}}>
            <button className="link" onClick={()=>setRoute('home')}>Back to home</button>
          </div>
        </div>
      );
    }
    return <Home onStartSignup={()=>setRoute('auth')} />;
  }
  return (
    <>
      <NavBar active={tab} onChange={setTab} />
      <div className="container">
  {tab==='dashboard' && <Dashboard />}
  {tab==='profile' && <Profile />}
        {tab==='skills' && <SkillEditor />}
        {tab==='matches' && <Matches onBook={(u)=>setBookFor(u)} />}
        {tab==='sessions' && <Sessions />}
        {tab==='points' && <Points />}
      </div>
      {bookFor && <BookSessionModal teacher={bookFor} onClose={()=>setBookFor(null)} />}
      <footer>SkillShare Phase 1 Prototype · LocalStorage · {new Date().getFullYear()}</footer>
    </>
  );
}

export default function App() {
  return <AuthProvider><InnerApp /></AuthProvider>;
}
