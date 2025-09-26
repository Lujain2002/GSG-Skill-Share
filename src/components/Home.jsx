import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Stack, Paper, Chip, Grid, Card, CardContent } from '@mui/material';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EmojiPeopleOutlinedIcon from '@mui/icons-material/EmojiPeopleOutlined';

export default function Home({ onStartSignup, onStartLogin }) {
  // Home page palette (requested)
  const ACCENT = '#636573'; // headings, rings, CTA
  const PANEL_DARK = '#222A28'; // dark backgrounds
  const PANEL_MED = '#374036'; // medium backgrounds
  const TEXT_ON_DARK = '#E6ECEC'; // readable text on dark panels
  // Simple scroll-reveal using IntersectionObserver
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return (
    <>
      <Box sx={{
        pt: { xs: 4, md: 6 },
        pb: { xs: 2, md: 4 },
        background: `linear-gradient(180deg, ${PANEL_DARK} 0%, ${PANEL_DARK} 40%, rgba(0,0,0,0) 100%)`,
        color: TEXT_ON_DARK
      }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" sx={{textAlign:'center', fontWeight:800, mb:2}}>
            <Box component="span" sx={{color:ACCENT}}>Learn</Box> by teaching. Teach by <Box component="span" sx={{color:ACCENT}}>learning</Box>.
          </Typography>
          <Typography variant="h6" sx={{textAlign:'center', opacity:.8, mb:3}}>
            Earn points when you teach. Spend them to learn — match with peers instantly.
          </Typography>

          <Stack direction={{xs:'column', sm:'row'}} spacing={1} justifyContent="center" sx={{mb:3}}>
            <Chip label="1:1 Sessions" variant="outlined" sx={{borderColor:ACCENT, color:ACCENT}} />
            <Chip label="Peer Matching" variant="outlined" sx={{borderColor:ACCENT, color:ACCENT}} />
            <Chip label="Points Economy" variant="outlined" sx={{borderColor:ACCENT, color:ACCENT}} />
          </Stack>

          <Stack direction={{xs:'column', sm:'row'}} spacing={2} justifyContent="center">
            <Button size="large" variant="contained" onClick={onStartSignup} sx={{bgcolor:ACCENT, '&:hover':{bgcolor:'#545766'}}}>Get started — it’s free</Button>
            <Button size="large" variant="outlined" href="#features" sx={{borderColor:ACCENT, color:ACCENT, '&:hover':{borderColor:'#545766', bgcolor:'transparent'}}}>See how it works</Button>
          </Stack>
        </Container>
      </Box>

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
              <Card className="how-card reveal" elevation={6} style={{ ['--delay'] : `${i*120}ms` }} sx={{height:'100%', p:2.25, borderRadius:3, minHeight: 160}}>
                <CardContent>
                  <Box sx={{display:'flex', alignItems:'center', gap:1.25, mb:1.25}}>
                    <Box sx={{width:40, height:40, borderRadius:2, display:'grid', placeItems:'center', bgcolor:'#00000022'}}>
                      <s.Icon sx={{color:ACCENT}} />
                    </Box>
                    <Typography variant="h6" sx={{fontWeight:700}}>{s.title}</Typography>
                  </Box>
                  <Typography variant="body1" sx={{opacity:.9, lineHeight:1.65}}>{s.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Feature: Search for skills you want to learn */}
      <Container maxWidth="lg" sx={{pb:5}}>
        <Grid container spacing={{xs:2, md:3}}>
          <Grid item xs={12} md={6}>
            <Paper className="reveal" elevation={6} sx={{
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
            }}>
              <Typography variant="h4" sx={{fontWeight:800, lineHeight:1.1}}>
                <Box component="span" sx={{color:ACCENT}}>Search for skills</Box><br/>you want to learn
              </Typography>
              <Typography variant="body1" sx={{mt:1.5, maxWidth:560, opacity:.95, lineHeight:1.8}}>
                Discover exactly what you need to enhance your toolkit. Use simple filters to find the perfect peer teacher across both campuses.
              </Typography>
              <Box sx={{position:'absolute', left:'50%', bottom:24, transform:'translateX(-50%)', color:ACCENT, bgcolor:PANEL_DARK, borderRadius:'50%', width:56, height:56, display:'grid', placeItems:'center', boxShadow:'0 10px 30px -12px rgba(0,0,0,.5)'}}>
                <EmojiPeopleOutlinedIcon />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper className="reveal" elevation={6} sx={{
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
            }}>
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
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Wide banner: Connect & Exchange Knowledge */}
      <Container maxWidth="lg" sx={{pb:5}}>
        <Paper className="reveal" elevation={4} sx={{
          p:{xs:2.5, md:4},
          borderRadius:4,
          background:PANEL_DARK,
          color: TEXT_ON_DARK
        }}>
          <Typography variant="h4" sx={{fontWeight:900, mb:1}}>
            <Box component="span" sx={{color:ACCENT}}>Connect</Box> & Exchange Knowledge
          </Typography>
          <Typography variant="body1" sx={{opacity:.95, maxWidth:980}}>
            One click connects you directly with your match. Set up a call or meeting, exchange knowledge, and build a connection. No intermediaries, no complications — PURE PEER LEARNING!
          </Typography>
        </Paper>
      </Container>

      <Container maxWidth="lg" sx={{pb:8}}>
  <Paper className="reveal" elevation={0} sx={{p:3, borderRadius:3, background:PANEL_MED, color: TEXT_ON_DARK}}>
          <Typography variant="h6" sx={{mb:2}}>Popular categories</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {['Programming','Design','Marketing','Languages','Music','Career','Math','Science','Art'].map(c=> (
              <Chip key={c} label={c} variant="outlined" sx={{borderColor:ACCENT, color:ACCENT}} />
            ))}
          </Stack>
        </Paper>
      </Container>

      <Container maxWidth="md" sx={{pb:10}}>
  <Paper className="reveal" elevation={4} sx={{p:3, borderRadius:3, background:PANEL_MED, color: TEXT_ON_DARK}}>
          <Typography variant="h6" gutterBottom>Why SkillShare?</Typography>
          <ul style={{margin:0, paddingLeft:'1.1rem', lineHeight:1.6}}>
            <li>Match quickly with people who want what you teach and teach what you want.</li>
            <li>Book 30–60 minute sessions, complete them, and track your points.</li>
            <li>Customize your profile, skills, and theme</li>
          </ul>
        </Paper>
      </Container>

      <Container maxWidth="md" sx={{pb:10, textAlign:'center'}}>
        <Typography variant="h6" sx={{mb:1}}>Ready to start?</Typography>
        <Stack direction={{xs:'column', sm:'row'}} spacing={1.5} justifyContent="center">
          <Button size="large" variant="contained" onClick={onStartSignup} sx={{bgcolor:ACCENT, '&:hover':{bgcolor:'#545766'}}}>Create your free account</Button>
          {onStartLogin && (
            <Button size="large" variant="text" onClick={onStartLogin} sx={{color:ACCENT, '&:hover':{bgcolor:'transparent', color:'#545766'}}}>Already have an account? Log in</Button>
          )}
        </Stack>
      </Container>
    </>
  );
}
