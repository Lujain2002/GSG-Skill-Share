## SkillShare Phase 1 (Prototype)

Local-first React (Vite) prototype implementing Phase 1 core features:

Features:
- User registration / login (stored in localStorage; NOT secure, for demo only)
- Skill management (can teach, want to learn lists with levels)
- Basic skill matching (score by overlapping teach/learn skills)
- Points economy (initial grant, spend when booking, earn when completing teaching)
- Session booking (book, complete, cancel) & ledger

Tech stack:
- React 18 + Vite
- No backend (localStorage persistence)

### Run Dev Server

```cmd
npm install
npm run dev
```

Open the shown localhost URL.

### Usage Tips
1. Register first user (e.g. Alice) – add skills she can teach and wants to learn.
2. Logout, register a second user (Bob) with complementary skills.
3. Login as a learner, open Matches, book a session with a teacher.
4. Switch to teacher account, complete session to earn points.

### Points Rules
- Start: 10 points on registration.
- Earn: 5 points per 30 minutes taught.
- Spend: same rate when booking (deduct at booking time).
- Cancel: refunds learner if not completed.

### Roadmap (Next)
- Real backend (auth, persistence, realtime)
- Availability scheduling & calendar integration
- Ratings & reviews
- Chat & notifications
- Enhanced matching algorithm (availability, preferences)

### Disclaimer
Prototype only; do not use for production or store real credentials.
