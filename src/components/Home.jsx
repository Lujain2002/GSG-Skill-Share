import React, { useMemo } from 'react';
import { Box, Container, Typography, Button, Stack, Paper, Chip, Grid, Card, CardContent } from '@mui/material';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EmojiPeopleOutlinedIcon from '@mui/icons-material/EmojiPeopleOutlined';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionContainer = motion(Container);
const MotionStack = motion(Stack);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);
const MotionButtonWrapper = motion.div;

const revealVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.215, 0.61, 0.355, 1],
      delay: i * 0.12
    }
  })
};

const floatVariants = (offset = 0) => ({
  animate: {
    y: [0, -15, 0],
    rotate: [0, 1.5, -1.5, 0],
    transition: {
      duration: 12 + offset,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
});

const pulseVariants = {
  animate: {
    opacity: [0.05, 0.18, 0.05],
    scale: [1, 1.08, 1],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export default function Home({ onStartSignup, onStartLogin }) {
  // Home page palette (requested)
  const ACCENT = '#636573'; // headings, rings, CTA
  const PANEL_DARK = '#222A28'; // dark backgrounds
  const PANEL_MED = '#374036'; // medium backgrounds
  const TEXT_ON_DARK = '#E6ECEC'; // readable text on dark panels
  const floatingShapes = useMemo(() => ([
    { size: 260, top: '-90px', left: '-80px', delay: 0 },
    { size: 320, top: '40%', left: '-120px', delay: 1.2 },
    { size: 220, bottom: '15%', right: '10%', delay: 2.4 },
    { size: 280, top: '-120px', right: '-60px', delay: 0.6 }
  ]), []);

  return (
    <MotionBox
      component="section"
      initial={{ backgroundPosition: '0% 50%' }}
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
      sx={{
        position:'relative',
        minHeight:'100vh',
        width:'100%',
        overflow:'hidden',
        display:'flex',
        flexDirection:'column',
        justifyContent:'flex-start',
        background: `radial-gradient(circle at 15% 15%, ${ACCENT}25, transparent 45%), radial-gradient(circle at 85% 25%, ${ACCENT}18, transparent 48%), linear-gradient(180deg, ${PANEL_DARK} 0%, ${PANEL_DARK} 45%, rgba(0,0,0,0.1) 100%)`,
        color: TEXT_ON_DARK
      }}
    >
      <Box sx={{
        pt: { xs: 4, md: 6 },
        pb: { xs: 2, md: 4 },
        position: 'relative',
        flexGrow: 1,
        display: 'flex',
        flexDirection:'column'
      }}>
        <MotionBox
          variants={pulseVariants}
          animate="animate"
          sx={{
            position: 'absolute',
            inset: '-30% -25% auto -25%',
            height: '140%',
            background: `radial-gradient(circle at 20% 20%, ${ACCENT}35, transparent 60%)`,
            zIndex: 0,
            filter: 'blur(0.5px)'
          }}
        />
        <MotionBox
          variants={pulseVariants}
          animate="animate"
          sx={{
            position: 'absolute',
            inset: 'auto -30% -35% -30%',
            height: '150%',
            background: `radial-gradient(circle at 80% 80%, ${ACCENT}25, transparent 65%)`,
            zIndex: 0,
            mixBlendMode: 'screen'
          }}
          transition={{ delay: 2.5 }}
        />
        {floatingShapes.map((shape, idx) => (
          <MotionBox
            key={idx}
            variants={floatVariants(shape.delay)}
            animate="animate"
            sx={{
              position: 'absolute',
              width: shape.size,
              height: shape.size,
              top: shape.top,
              left: shape.left,
              right: shape.right,
              bottom: shape.bottom,
              background: `linear-gradient(135deg, ${ACCENT}33, ${ACCENT}11)` ,
              borderRadius: '50%',
              filter: 'blur(2px)',
              zIndex: 0,
              boxShadow: '0 40px 90px -60px rgba(0,0,0,.7)'
            }}
            transition={{ delay: shape.delay }}
          />
        ))}
        <MotionContainer
          maxWidth="md"
          initial="hidden"
          animate="visible"
          variants={revealVariants}
          custom={0}
          sx={{ position: 'relative', zIndex: 1, flexGrow: 1, display:'flex', flexDirection:'column', justifyContent:'center', pb:{ xs:6, md:8 } }}
        >
          <Typography
            variant="h3"
            component={motion.h1}
            initial="hidden"
            animate="visible"
            variants={revealVariants}
            custom={0}
            sx={{textAlign:'center', fontWeight:800, mb:2}}
          >
            <Box component={motion.span} sx={{color:ACCENT}} variants={revealVariants} custom={0.1}>Learn</Box> by teaching. Teach by <Box component={motion.span} sx={{color:ACCENT}} variants={revealVariants} custom={0.15}>learning</Box>.
          </Typography>
          <Typography
            variant="h6"
            component={motion.p}
            initial="hidden"
            animate="visible"
            variants={revealVariants}
            custom={0.25}
            sx={{textAlign:'center', opacity:.8, mb:3}}
          >
            Earn points when you teach. Spend them to learn — match with peers instantly.
          </Typography>

          <MotionStack
            direction={{xs:'column', sm:'row'}}
            spacing={1}
            justifyContent="center"
            sx={{mb:3}}
            initial="hidden"
            animate="visible"
            variants={revealVariants}
            custom={0.35}
          >
            {['1:1 Sessions','Peer Matching','Points Economy'].map((label, idx) => (
              <Chip
                key={label}
                label={label}
                variant="outlined"
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1, duration: 0.45, ease: 'easeOut' }}
                sx={{borderColor:ACCENT, color:ACCENT}}
              />
            ))}
          </MotionStack>

          <Stack direction={{xs:'column', sm:'row'}} spacing={2} justifyContent="center">
            <MotionButtonWrapper
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5, ease: 'easeOut' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button size="large" variant="contained" onClick={onStartSignup} sx={{bgcolor:ACCENT, '&:hover':{bgcolor:'#545766'}}}>Get started — it’s free</Button>
            </MotionButtonWrapper>
            <MotionButtonWrapper
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.5, ease: 'easeOut' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button size="large" variant="outlined" href="#features" sx={{borderColor:ACCENT, color:ACCENT, '&:hover':{borderColor:'#545766', bgcolor:'transparent'}}}>See how it works</Button>
            </MotionButtonWrapper>
          </Stack>
        </MotionContainer>
      </Box>

      <Box component="footer" sx={{ position:'relative' }}>
        {/* Following sections (feature grid, banners, etc.) */}
      <Container id="features" maxWidth="lg" sx={{pb:5}}>
        <Typography variant="h4" sx={{mb:2, textAlign:'center', fontWeight:800, letterSpacing:.3}}>How it works</Typography>
        <Grid container spacing={{xs:2, md:3}}>
          {[{
            title: 'Set your skills',
            desc: 'List what you can teach and what you want to learn. Add levels and categories.',
            Icon: SettingsSuggestIcon
          },{
            title: 'Match with peers',
            desc: 'We score overlap so you find the best people to learn from and teach.',
            Icon: PeopleAltIcon
          },{
            title: 'Book a session',
            desc: 'Schedule 30–60 minute sessions. Earn points teaching, spend points learning.',
            Icon: EventAvailableIcon
          }].map((s, i)=> (
            <Grid key={i} item xs={12} md={4}>
              <MotionCard
                className="how-card"
                elevation={6}
                sx={{height:'100%', p:2.25, borderRadius:3, minHeight: 160}}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={revealVariants}
                custom={i * 0.2}
                whileHover={{ translateY: -8, boxShadow: '0 20px 40px -24px rgba(0,0,0,0.35)' }}
              >
                <CardContent>
                  <Box sx={{display:'flex', alignItems:'center', gap:1.25, mb:1.25}}>
                    <Box sx={{width:40, height:40, borderRadius:2, display:'grid', placeItems:'center', bgcolor:'#00000022'}}>
                      <s.Icon sx={{color:ACCENT}} />
                    </Box>
                    <Typography variant="h6" sx={{fontWeight:700}}>{s.title}</Typography>
                  </Box>
                  <Typography variant="body1" sx={{opacity:.9, lineHeight:1.65}}>{s.desc}</Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Feature: Search for skills you want to learn */}
      <Container maxWidth="lg" sx={{pb:5}}>
        <Grid container spacing={{xs:2, md:3}}>
          <Grid item xs={12} md={6}>
            <MotionPaper className="reveal" elevation={6} sx={{
              p:{ xs:2.5, md:4 },
              borderRadius:3,
              position:'relative',
              overflow:'hidden',
              minHeight: { xs: 280, md: 320 },
              background:PANEL_MED,
              color: TEXT_ON_DARK,
              '&::after':{
                content:'""',
                position:'absolute',
                left:'50%',
                bottom:-40,
                width:560,
                height:560,
                transform:'translateX(-50%)',
                background:`repeating-radial-gradient(circle at 50% 80%, transparent 0 22px, ${ACCENT}22 22px 26px)`,
                opacity:.9,
                pointerEvents:'none'
              }
            }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={revealVariants}
            >
              <Typography variant="h4" sx={{fontWeight:800, lineHeight:1.1}}>
                <Box component="span" sx={{color:ACCENT}}>Search for skills</Box><br/>you want to learn
              </Typography>
              <Typography variant="body1" sx={{mt:1.5, maxWidth:560, opacity:.95, lineHeight:1.8}}>
                Discover exactly what you need to enhance your toolkit. Use simple filters to find the perfect peer teacher across both campuses.
              </Typography>
              <Box sx={{position:'absolute', left:'50%', bottom:24, transform:'translateX(-50%)', color:ACCENT, bgcolor:PANEL_DARK, borderRadius:'50%', width:56, height:56, display:'grid', placeItems:'center', boxShadow:'0 10px 30px -12px rgba(0,0,0,.5)'}}>
                <EmojiPeopleOutlinedIcon />
              </Box>
            </MotionPaper>
          </Grid>
          <Grid item xs={12} md={6}>
            <MotionPaper className="reveal" elevation={6} sx={{
              p:{ xs:2.5, md:4 },
              borderRadius:3,
              position:'relative',
              overflow:'hidden',
              minHeight: { xs: 280, md: 320 },
              background:PANEL_MED,
              color: TEXT_ON_DARK,
              '&::before':{
                content:'""',
                position:'absolute',
                right:-80,
                top:-80,
                width:380,
                height:380,
                borderRadius:'50%',
                background:`radial-gradient(closest-side, ${ACCENT}22, transparent 70%)`
              }
            }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={revealVariants}
              custom={0.2}
            >
              <Typography variant="h4" sx={{fontWeight:800, lineHeight:1.1}}>
                <Box component="span" sx={{color:ACCENT}}>Schedule</Box> and collaborate fast
              </Typography>
              <Typography variant="body1" sx={{mt:1.5, maxWidth:560, opacity:.95, lineHeight:1.8}}>
                Pick a time, confirm the session, and jump in. Your points balance updates automatically when sessions are completed.
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{mt:2}}>
                <Chip label="30–60 min" sx={{borderColor:ACCENT, color:ACCENT}} variant="outlined" />
                <Chip label="Instant matches" sx={{borderColor:ACCENT, color:ACCENT}} variant="outlined" />
              </Stack>
            </MotionPaper>
          </Grid>
        </Grid>
      </Container>

      {/* Wide banner: Connect & Exchange Knowledge */}
      <Container maxWidth="lg" sx={{pb:5}}>
        <MotionPaper className="reveal" elevation={4} sx={{
          p:{xs:2.5, md:4},
          borderRadius:4,
          background:PANEL_DARK,
          color: TEXT_ON_DARK
        }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={revealVariants}
        >
          <Typography variant="h4" sx={{fontWeight:900, mb:1}}>
            <Box component="span" sx={{color:ACCENT}}>Connect</Box> & Exchange Knowledge
          </Typography>
          <Typography variant="body1" sx={{opacity:.95, maxWidth:980}}>
            One click connects you directly with your match. Set up a call or meeting, exchange knowledge, and build a connection. No intermediaries, no complications — PURE PEER LEARNING!
          </Typography>
        </MotionPaper>
      </Container>

      <Container maxWidth="lg" sx={{pb:8}}>
  <MotionPaper className="reveal" elevation={0} sx={{p:3, borderRadius:3, background:PANEL_MED, color: TEXT_ON_DARK}}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.5 }}
    variants={revealVariants}
  >
          <Typography variant="h6" sx={{mb:2}}>Popular categories</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {['Programming','Design','Marketing','Languages','Music','Career','Math','Science','Art'].map(c=> (
              <Chip key={c} label={c} variant="outlined" sx={{borderColor:ACCENT, color:ACCENT}}
                component={motion.div}
                whileHover={{ y: -4, boxShadow: '0 15px 30px -20px rgba(0,0,0,.45)' }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              />
            ))}
          </Stack>
        </MotionPaper>
      </Container>

      <Container maxWidth="md" sx={{pb:10}}>
  <MotionPaper className="reveal" elevation={4} sx={{p:3, borderRadius:3, background:PANEL_MED, color: TEXT_ON_DARK}}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.45 }}
    variants={revealVariants}
  >
          <Typography variant="h6" gutterBottom>Why SkillShare?</Typography>
          <ul style={{margin:0, paddingLeft:'1.1rem', lineHeight:1.6}}>
            <li>Match quickly with people who want what you teach and teach what you want.</li>
            <li>Book 30–60 minute sessions, complete them, and track your points.</li>
            <li>Customize your profile, skills, and theme</li>
          </ul>
        </MotionPaper>
      </Container>

      <Container maxWidth="md" sx={{pb:10, textAlign:'center'}}>
        <Typography variant="h6" sx={{mb:1}}>Ready to start?</Typography>
        <MotionStack
          direction={{xs:'column', sm:'row'}}
          spacing={1.5}
          justifyContent="center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={revealVariants}
        >
          <MotionButtonWrapper
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
          >
            <Button size="large" variant="contained" onClick={onStartSignup} sx={{bgcolor:ACCENT, '&:hover':{bgcolor:'#545766'}}}>Create your free account</Button>
          </MotionButtonWrapper>
          {onStartLogin && (
            <MotionButtonWrapper
              whileHover={{ x: 2, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            >
              <Button size="large" variant="text" onClick={onStartLogin} sx={{color:ACCENT, '&:hover':{bgcolor:'transparent', color:'#545766'}}}>Already have an account? Log in</Button>
            </MotionButtonWrapper>
          )}
        </MotionStack>
      </Container>
      </Box>
    </MotionBox>
  );
}
