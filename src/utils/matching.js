// Basic matching algorithm (Phase 1)
// Score based on intersection of my wantLearn with their canTeach and vice versa
export function computeMatchScore(current, other) {
  if (!current || !other || !current.id || !other.id || current.id === other.id) return 0;
  const wantLearn = Array.isArray(current.wantLearn) ? current.wantLearn : [];
  const canTeach = Array.isArray(current.canTeach) ? current.canTeach : [];
  const otherTeach = Array.isArray(other.canTeach) ? other.canTeach : [];
  const otherLearn = Array.isArray(other.wantLearn) ? other.wantLearn : [];

  const wl = new Set(wantLearn.map(s => (s?.skill||'').toLowerCase()).filter(Boolean));
  const ct = new Set(canTeach.map(s => (s?.skill||'').toLowerCase()).filter(Boolean));
  let score = 0;
  otherTeach.forEach(s => { const k = (s?.skill||'').toLowerCase(); if (k && wl.has(k)) score += 5; });
  otherLearn.forEach(s => { const k = (s?.skill||'').toLowerCase(); if (k && ct.has(k)) score += 2; });
  // slight boost if categories overlap (future extension)
  const myTeachCats = new Set(canTeach.map(s=>s?.category).filter(Boolean));
  const theirTeachCats = new Set(otherTeach.map(s=>s?.category).filter(Boolean));
  for (const c of theirTeachCats) { if (myTeachCats.has(c)) { score += 1; break; } }
  return score;
}

export function getMatches(current, users) {
  if (!current || !Array.isArray(users) || users.length === 0) return [];
  return users
    .filter(u => u && u.id && u.id !== current.id)
    .map(u => ({ user: u, score: computeMatchScore(current, u) }))
    .filter(m => m.score > 0)
    .sort((a,b) => b.score - a.score);
}
