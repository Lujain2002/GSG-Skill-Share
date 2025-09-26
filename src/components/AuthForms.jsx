import React, { useState } from 'react';
import AuthCtx from '../context/AuthContext';
const { useAuth } = AuthCtx;
import { TextField, Button, Alert, Stack, Box, Typography, Paper } from '@mui/material';
import { validateEmail, validatePassword, validateName } from '../utils/validation';

const cardSx = {
  p: { xs: 3.25, sm: 4 },
  borderRadius: 3,
  background: (theme) => theme.palette.mode === 'dark'
    ? 'linear-gradient(155deg, rgba(22,28,36,0.92) 0%, rgba(34,42,40,0.94) 100%)'
    : 'linear-gradient(150deg, rgba(247,249,253,0.96) 0%, rgba(231,236,244,0.92) 100%)',
  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(99,101,115,0.35)' : 'rgba(138,150,168,0.28)'}`,
  boxShadow: (theme) => theme.palette.mode === 'dark'
    ? '0 28px 68px -36px rgba(0,0,0,0.68)'
    : '0 24px 52px -32px rgba(110,117,138,0.32)',
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)',
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 2.5, sm: 3 },
  maxWidth: 420,
  width: '100%',
  mx: 'auto'
};

const compactShellSx = {
  width: '100%',
  maxWidth: 420,
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 2, sm: 2.4 },
  mx: 'auto'
};

const fieldSx = {
  '& .MuiFilledInput-root': (theme) => ({
    borderRadius: 2,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15,17,21,0.78)' : 'rgba(245,247,252,0.9)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(99,101,115,0.32)' : 'rgba(138,150,168,0.28)'}`,
    transition: 'background-color .3s ease, border-color .3s ease, box-shadow .3s ease',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15,17,21,0.86)' : '#ffffff',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(99,101,115,0.4)' : 'rgba(110,117,138,0.36)'
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.08)',
      borderColor: '#2563eb',
      boxShadow: '0 0 0 3px rgba(37,99,235,0.18)'
    }
  }),
  '& .MuiFilledInput-input': {
    padding: '16px 16px 14px',
    fontSize: { xs: '0.94rem', sm: '0.98rem' }
  },
  '& .MuiFormLabel-root': {
    fontWeight: 600,
    letterSpacing: '0.03em'
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    fontSize: '0.78rem',
    letterSpacing: '0.04em'
  }
};

const buttonSx = {
  mt: 0.5,
  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#636573' : '#374036',
  px: { xs: 2.6, md: 3.2 },
  py: { xs: 1.1, md: 1.22 },
  fontSize: { xs: '0.95rem', md: '1.02rem' },
  fontWeight: 700,
  letterSpacing: '0.05em',
  borderRadius: 2.5,
  textTransform: 'none',
  boxShadow: '0 18px 32px -20px rgba(37,99,235,0.45)',
  '&:hover': {
    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#545766' : '#2f352d'
  }
};

const subtleButtonSx = {
  mt: 0.5,
  px: { xs: 2.4, md: 3 },
  py: { xs: 1, md: 1.1 },
  fontSize: { xs: '0.9rem', md: '0.98rem' },
  fontWeight: 600,
  letterSpacing: '0.04em',
  borderRadius: 2.5,
  textTransform: 'none'
};

export function LoginForm({ compact }) {
  const { login } = useAuth();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [touched,setTouched] = useState({ email:false, password:false });
  const [submitted,setSubmitted] = useState(false);

  const emailErr = validateEmail(email);
  const passErr = (() => {
    if (!password) return 'Password required';
    if (password.length < 6) return 'Min 6 characters';
    return '';
  })();
  const showEmailErr = (touched.email || submitted) && !!emailErr;
  const showPassErr  = (touched.password || submitted) && !!passErr;
  const disabled = !!emailErr || !!passErr;

  const submit = async e => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ email:true, password:true });
    if (disabled) return;

    try {
      await login(email,password);    //  API
    } catch(err) {
      setError(err.message);
    }
  };

  const formStack = (
    <Stack component="form" onSubmit={submit} noValidate spacing={2.2} sx={{ width: '100%' }}>
      <TextField
        label="Email"
        value={email}
        onChange={e=>setEmail(e.target.value)}
        onBlur={()=>setTouched(t=>({...t,email:true}))}
        error={showEmailErr}
        helperText={showEmailErr ? emailErr : ' '}
        autoComplete="email"
        required
        variant="filled"
        InputProps={{ disableUnderline: true }}
        sx={fieldSx}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={e=>setPassword(e.target.value)}
        onBlur={()=>setTouched(t=>({...t,password:true}))}
        error={showPassErr}
        helperText={showPassErr ? passErr : ' '}
        autoComplete="current-password"
        required
        variant="filled"
        InputProps={{ disableUnderline: true }}
        sx={fieldSx}
      />
      {error && (
        <Alert
          severity="error"
          variant="filled"
          sx={{ borderRadius: 2, fontSize: '0.88rem', letterSpacing: '0.02em', px: 1.25, py: 0.75 }}
        >
          {error}
        </Alert>
      )}
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={disabled}
        disableElevation
        fullWidth
        sx={buttonSx}
      >
        Login
      </Button>
    </Stack>
  );

  const inner = (
    <Stack spacing={compact ? 2 : 2.6} sx={{ width: '100%' }}>
      {!compact && (
        <Box>
          <Typography variant="overline" sx={{ letterSpacing: '0.18em', opacity: 0.7 }}>
            Welcome back
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Log in to continue
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75, maxWidth: 320 }}>
            Sign in to keep sharing skills and earning points with peers.
          </Typography>
        </Box>
      )}
      {formStack}
    </Stack>
  );

  return compact
    ? <Box sx={compactShellSx}>{inner}</Box>
    : <Paper elevation={0} sx={cardSx}>{inner}</Paper>;
}

export function RegisterForm({ compact }) {
  const { register } = useAuth();
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [success,setSuccess] = useState('');
  const [touched,setTouched] = useState({ name:false, email:false, password:false });
  const [submitted,setSubmitted] = useState(false);

  const nameErr = validateName(name);
  const emailErr = validateEmail(email);
  const passErr = validatePassword(password);
  const showNameErr = (touched.name || submitted) && !!nameErr;
  const showEmailErr = (touched.email || submitted) && !!emailErr;
  const showPassErr  = (touched.password || submitted) && !!passErr;
  const disabled = !!nameErr || !!emailErr || !!passErr;

  const submit = async e => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ name:true, email:true, password:true });
    if (disabled) return;

    try {
      setError('');
      setSuccess('');
      await register(name,email,password); // ← استدعاء API
      setSuccess('Account created! You can log in now.');
      setName('');
      setEmail('');
      setPassword('');
      setTouched({ name:false, email:false, password:false });
      setSubmitted(false);
    } catch(err) {
      setError(err.message);
      setSuccess('');
    }
  };

  const formStack = (
    <Stack component="form" onSubmit={submit} noValidate spacing={2.2} sx={{ width: '100%' }}>
      <TextField
        label="Name"
        value={name}
        onChange={e=>{ setName(e.target.value); if (success) setSuccess(''); }}
        onBlur={()=>setTouched(t=>({...t,name:true}))}
        error={showNameErr}
        helperText={showNameErr ? nameErr : ' '}
        required
        variant="filled"
        InputProps={{ disableUnderline: true }}
        sx={fieldSx}
      />
      <TextField
        label="Email"
        value={email}
        onChange={e=>{ setEmail(e.target.value); if (success) setSuccess(''); }}
        onBlur={()=>setTouched(t=>({...t,email:true}))}
        error={showEmailErr}
        helperText={showEmailErr ? emailErr : ' '}
        autoComplete="email"
        required
        variant="filled"
        InputProps={{ disableUnderline: true }}
        sx={fieldSx}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={e=>{ setPassword(e.target.value); if (success) setSuccess(''); }}
        onBlur={()=>setTouched(t=>({...t,password:true}))}
        error={showPassErr}
        helperText={showPassErr ? passErr : ' '}
        autoComplete="new-password"
        required
        variant="filled"
        InputProps={{ disableUnderline: true }}
        sx={fieldSx}
      />
      {error && (
        <Alert
          severity="error"
          variant="filled"
          sx={{ borderRadius: 2, fontSize: '0.88rem', letterSpacing: '0.02em', px: 1.25, py: 0.75 }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          variant="filled"
          sx={{ borderRadius: 2, fontSize: '0.86rem', letterSpacing: '0.02em', px: 1.25, py: 0.75 }}
        >
          {success}
        </Alert>
      )}
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={disabled}
        disableElevation
        fullWidth
        sx={buttonSx}
      >
        Register
      </Button>
    </Stack>
  );

  const inner = (
    <Stack spacing={compact ? 2 : 2.6} sx={{ width: '100%' }}>
      {!compact && (
        <Box>
          <Typography variant="overline" sx={{ letterSpacing: '0.18em', opacity: 0.7 }}>
            Join the community
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Create your account
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75, maxWidth: 320 }}>
            Unlock peer matching, track your skills, and start exchanging knowledge.
          </Typography>
        </Box>
      )}
      {formStack}
    </Stack>
  );

  return compact
    ? <Box sx={compactShellSx}>{inner}</Box>
    : <Paper elevation={0} sx={cardSx}>{inner}</Paper>;
}
