import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TextField, Button, Alert, Stack } from '@mui/material';
import { validateEmail, validatePassword, validateName } from '../utils/validation';

export function LoginForm({ compact }) {
  const { login } = useAuth();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [touched,setTouched] = useState({ email:false, password:false });
  const [submitted,setSubmitted] = useState(false);
  const emailErr = validateEmail(email);
  // Simpler rule for login: only require presence & length (no complexity enforcement)
  const passErr = (() => { if(!password) return 'Password required'; if(password.length < 6) return 'Min 6 characters'; return ''; })();
  const showEmailErr = (touched.email || submitted) && !!emailErr;
  const showPassErr  = (touched.password || submitted) && !!passErr;
  const disabled = !!emailErr || !!passErr;
  const submit = e => { 
    e.preventDefault();
    setSubmitted(true);
    setTouched({ email:true, password:true });
    if(disabled) return; 
    try { login(email,password); } catch(err){ setError(err.message); }
  };
  const inner = (
    <>
      {!compact && <h3>Log In</h3>}
      <form onSubmit={submit} noValidate>
        <Stack spacing={1.4}>
          <TextField size="small" label="Email" value={email}
            onChange={e=>setEmail(e.target.value)}
            onBlur={()=>setTouched(t=>({...t,email:true}))}
            error={showEmailErr}
            helperText={showEmailErr ? emailErr : ' '}
            autoComplete="email" required />
          <TextField size="small" label="Password" type="password" value={password}
            onChange={e=>setPassword(e.target.value)}
            onBlur={()=>setTouched(t=>({...t,password:true}))}
            error={showPassErr}
            helperText={showPassErr ? passErr : ' '}
            autoComplete="current-password" required />
          {error && <Alert severity="error" variant="filled">{error}</Alert>}
          <Button variant="contained" type="submit" disabled={disabled}>Login</Button>
        </Stack>
      </form>
    </>
  );
  return compact ? inner : <div className="card">{inner}</div>;
}

export function RegisterForm({ compact }) {
  const { register } = useAuth();
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [touched,setTouched] = useState({ name:false, email:false, password:false });
  const [submitted,setSubmitted] = useState(false);
  const nameErr = validateName(name);
  const emailErr = validateEmail(email);
  const passErr = validatePassword(password);
  const showNameErr = (touched.name || submitted) && !!nameErr;
  const showEmailErr = (touched.email || submitted) && !!emailErr;
  const showPassErr  = (touched.password || submitted) && !!passErr;
  const disabled = !!nameErr || !!emailErr || !!passErr;
  const submit = e => { 
    e.preventDefault();
    setSubmitted(true);
    setTouched({ name:true, email:true, password:true });
    if(disabled) return; 
    try { register(name,email,password); } catch(err){ setError(err.message); }
  };
  const inner = (
    <>
      {!compact && <h3>Create Account</h3>}
      <form onSubmit={submit} noValidate>
        <Stack spacing={1.4}>
          <TextField size="small" label="Name" value={name}
            onChange={e=>setName(e.target.value)} onBlur={()=>setTouched(t=>({...t,name:true}))}
            error={showNameErr} helperText={showNameErr ? nameErr : ' '} required />
          <TextField size="small" label="Email" value={email}
            onChange={e=>setEmail(e.target.value)} onBlur={()=>setTouched(t=>({...t,email:true}))}
            error={showEmailErr} helperText={showEmailErr ? emailErr : ' '} autoComplete="email" required />
          <TextField size="small" label="Password" type="password" value={password}
            onChange={e=>setPassword(e.target.value)} onBlur={()=>setTouched(t=>({...t,password:true}))}
            error={showPassErr} helperText={showPassErr ? passErr : ' '} autoComplete="new-password" required />
          {error && <Alert severity="error" variant="filled">{error}</Alert>}
          <Button variant="contained" type="submit" disabled={disabled}>Register</Button>
        </Stack>
      </form>
    </>
  );
  return compact ? inner : <div className="card">{inner}</div>;
}
