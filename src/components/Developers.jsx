import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Container, Box, Typography, Stack, Card, CardContent, Button, Chip, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionStack = motion(Stack);
const MotionButton = motion(Button);

const developers = [
  {
    name: 'Lujain Alhaj Ali',
    role: 'Backend Engineer',
    focus: ['API Architecture', 'Data Modeling', 'Security'],
    description: 'Orchestrates scalable services, resilient pipelines, and reliable data flows.',
    github: 'https://github.com/Lujain2002',
    email: 'mailto:lujain.alhajali2002@gmail.com'
  },
  {
    name: 'Yazed Hasan',
    role: 'Frontend Engineer',
    focus: ['Design Systems', 'Motion UI', 'DX Tooling'],
    description: 'Shapes expressive interfaces and ensures every interaction feels delightful.',
    github: 'https://github.com/Yazed-Hasan',
    email: 'mailto:yazed.hasan.dev@gmail.com'
  }
];

const glowPalette = ['#6366f1', '#22d3ee', '#f59e0b'];

const floatingVariant = delay => ({
  animate: {
    y: [0, -18, 0],
    rotate: [0, 2.5, -1, 0],
    transition: {
      duration: 18,
      delay,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
});

const pulseVariant = {
  animate: {
    opacity: [0.04, 0.18, 0.04],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

const panelVariants = {
  initial: { opacity: 0, y: 32, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 32, scale: 0.96 }
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

export default function Developers({ open, onClose }) {
  const [activeDev, setActiveDev] = useState(null);
  const bodyStyleSnapshot = useRef(null);
  const shapes = useMemo(() => ([
    { size: 420, top: '-120px', right: '-140px', delay: 0.2, color: glowPalette[0] },
    { size: 320, bottom: '-110px', left: '-90px', delay: 1.1, color: glowPalette[1] },
    { size: 260, top: '30%', left: '50%', delay: 2.2, color: glowPalette[2] }
  ]), []);

  useEffect(() => {
    if (!open) {
      setActiveDev(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || typeof window === 'undefined') {
      return undefined;
    }

    const { style } = document.body;
    const scrollY = window.scrollY || window.pageYOffset;

    bodyStyleSnapshot.current = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      width: style.width,
      scrollY
    };

    style.overflow = 'hidden';
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.width = '100%';

    return () => {
      if (!bodyStyleSnapshot.current) return;
      const previous = bodyStyleSnapshot.current;
      style.overflow = previous.overflow;
      style.position = previous.position;
      style.top = previous.top;
      style.width = previous.width;
      window.scrollTo(0, previous.scrollY || 0);
    };
  }, [open]);

  const handleClose = () => {
    setActiveDev(null);
    if (onClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <MotionBox
          key="developers-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
          sx={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(10,12,18,0.65), rgba(11,13,20,0.75))',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1500,
            p: { xs: 2.5, md: 4 }
          }}
          onClick={handleClose}
        >
          <MotionBox
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
            onClick={e => e.stopPropagation()}
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: { xs: '96vw', md: '980px' },
              maxHeight: { xs: '90vh', md: '86vh' },
              borderRadius: { xs: 3, md: 4 },
              overflow: 'hidden',
              background: theme => theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 5% 10%, rgba(99,102,241,0.12), transparent 55%), radial-gradient(circle at 95% 15%, rgba(34,211,238,0.1), transparent 60%), linear-gradient(165deg, rgba(15,17,21,0.92) 0%, rgba(19,22,29,0.96) 55%, rgba(24,26,34,0.98) 100%)'
                : 'radial-gradient(circle at 5% 10%, rgba(79,70,229,0.16), transparent 55%), radial-gradient(circle at 95% 15%, rgba(14,165,233,0.12), transparent 60%), linear-gradient(165deg, rgba(248,250,252,0.95) 0%, rgba(241,245,249,0.98) 50%, rgba(226,232,240,1) 100%)',
              color: theme => theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a',
              px: { xs: 2.2, md: 4 },
              py: { xs: 5.5, md: 7 },
              boxShadow: '0 40px 80px -40px rgba(4,9,25,0.9)',
              overflowY: 'auto'
            }}
          >
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                top: { xs: 12, md: 18 },
                right: { xs: 12, md: 18 },
                color: 'inherit',
                bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(15,17,21,0.6)' : 'rgba(248,250,252,0.6)',
                '&:hover': {
                  bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(23,26,34,0.75)' : 'rgba(226,232,240,0.7)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>

            {shapes.map((shape, index) => (
              <MotionBox
                key={index}
                variants={floatingVariant(shape.delay)}
                animate="animate"
                sx={{
                  position: 'absolute',
                  width: shape.size,
                  height: shape.size,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${shape.color}35 0%, transparent 70%)`,
                  filter: 'blur(2px)',
                  top: shape.top,
                  left: shape.left,
                  right: shape.right,
                  bottom: shape.bottom,
                  pointerEvents: 'none'
                }}
              />
            ))}

            <MotionBox
              variants={pulseVariant}
              animate="animate"
              sx={{
                position: 'absolute',
                inset: '-30% -25%',
                background: 'radial-gradient(circle at 40% 50%, rgba(99,102,241,0.14), transparent 60%)',
                pointerEvents: 'none'
              }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: 0 }}>
              <Stack spacing={{ xs: 4, md: 6 }} alignItems="center">
                <MotionStack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={{ xs: 2, md: 6 }}
                  alignItems={{ xs: 'stretch', md: 'flex-end' }}
                  justifyContent="space-between"
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                  sx={{ width: '100%' }}
                >
                  <Box sx={{ maxWidth: { xs: '100%', md: '460px' } }}>
                    <Typography variant="overline" sx={{ letterSpacing: '0.3em', opacity: 0.65 }}>
                      makers behind skillshare
                    </Typography>
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 800,
                        lineHeight: 1.05,
                        fontSize: { xs: '2.4rem', md: '3.2rem' },
                        mt: 1
                      }}
                    >
                      Meet the developers crafting the future of peer learning.
                    </Typography>
                 
                  </Box>
                  <MotionStack
                    direction="row"
                    spacing={1.5}
                    justifyContent="center"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6 }}
                  >
                 
                  </MotionStack>
                </MotionStack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} sx={{ width: '100%' }}>
                  {developers.map((dev, index) => (
                    <MotionCard
                      key={dev.github}
                      elevation={0}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.45 }}
                      transition={{ delay: index * 0.1, duration: 0.65, ease: [0.19, 1, 0.22, 1] }}
                      whileHover={{
                        translateY: -12,
                        boxShadow: '0 28px 64px -32px rgba(99,102,241,0.55)'
                      }}
                      sx={{
                        flex: 1,
                        borderRadius: 4,
                        overflow: 'hidden',
                        backdropFilter: 'blur(18px)',
                        background: theme => theme.palette.mode === 'dark'
                          ? 'linear-gradient(155deg, rgba(24,29,41,0.85), rgba(36,42,56,0.92))'
                          : 'linear-gradient(155deg, rgba(255,255,255,0.95), rgba(241,245,255,0.98))',
                        border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(148,163,184,0.18)' : 'rgba(79,70,229,0.18)'}`,
                        '&:hover': {
                          background: theme => theme.palette.mode === 'dark'
                            ? 'linear-gradient(155deg, rgba(26,32,46,0.95), rgba(40,46,60,0.96))'
                            : 'linear-gradient(155deg, rgba(255,255,255,0.98), rgba(229,239,255,0.98))'
                        }
                      }}
                    >
                      <CardContent sx={{ p: { xs: 3, md: 3.75 }, display: 'flex', flexDirection: 'column', gap: 2.4 }}>
                        <Box>
                          <Typography variant="overline" sx={{ letterSpacing: '0.25em', opacity: 0.55 }}>
                            {dev.role}
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.8 }}>
                            {dev.name}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ opacity: 0.75, lineHeight: 1.75 }}>
                          {dev.description}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {dev.focus.map(area => (
                            <Chip
                              key={area}
                              label={area}
                              sx={{
                                borderColor: 'transparent',
                                background: 'rgba(99,102,241,0.16)',
                                color: 'inherit',
                                letterSpacing: '0.04em'
                              }}
                            />
                          ))}
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                          <MotionButton
                            variant="contained"
                            startIcon={<GitHubIcon />}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              letterSpacing: '0.05em',
                              borderRadius: 2.5
                            }}
                            onClick={() => setActiveDev(dev)}
                          >
                            GitHub
                          </MotionButton>
                          <MotionButton
                            component="a"
                            href={dev.email}
                            variant="outlined"
                            startIcon={<EmailIcon />}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 600,
                              letterSpacing: '0.04em',
                              borderRadius: 2.5
                            }}
                          >
                            Email
                          </MotionButton>
                        </Stack>
                      </CardContent>
                    </MotionCard>
                  ))}
                </Stack>
              </Stack>
            </Container>

            <AnimatePresence>
              {activeDev && (
                <MotionBox
                  key="dev-modal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  sx={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(10,12,18,0.65)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    display: 'grid',
                    placeItems: 'center',
                    zIndex: 1600
                  }}
                  onClick={() => setActiveDev(null)}
                >
                  <MotionBox
                    variants={modalVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                    onClick={e => e.stopPropagation()}
                    sx={{
                      width: { xs: '88%', sm: 420 },
                      borderRadius: 4,
                      overflow: 'hidden',
                      background: theme => theme.palette.mode === 'dark'
                        ? 'linear-gradient(155deg, rgba(19,23,34,0.92), rgba(34,39,52,0.96))'
                        : 'linear-gradient(155deg, rgba(255,255,255,0.98), rgba(229,239,255,0.98))',
                      border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(148,163,184,0.18)' : 'rgba(79,70,229,0.24)'}`,
                      boxShadow: '0 28px 68px -32px rgba(0,0,0,0.7)'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3.2, pt: 2.6 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {activeDev.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setActiveDev(null)}
                        sx={{ color: 'inherit' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ px: 3.2, pb: 3.2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                        <Box
                          component="img"
                          src={`${activeDev.github}.png`}
                          alt={`${activeDev.name} avatar`}
                          sx={{ width: 62, height: 62, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.35)' }}
                        />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{activeDev.role}</Typography>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>{activeDev.focus.join(' • ')}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ lineHeight: 1.7, opacity: 0.78 }}>
                        {activeDev.description}
                      </Typography>
                      <MotionButton
                        component="a"
                        href={activeDev.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        startIcon={<GitHubIcon />}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        sx={{
                          alignSelf: 'flex-start',
                          textTransform: 'none',
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          borderRadius: 2.5
                        }}
                      >
                        View on GitHub
                      </MotionButton>
                    </Box>
                  </MotionBox>
                </MotionBox>
              )}
            </AnimatePresence>
          </MotionBox>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}
