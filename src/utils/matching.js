// Basic matching algorithm (Phase 1)
// Score based on intersection of my wantLearn with their canTeach and vice versa
export function computeMatchScore(current, other) {
  if (!current || !other || current.id === other.id) return 0;
  const currentWant = Array.isArray(current.wantLearn) ? current.wantLearn : [];
  const currentTeach = Array.isArray(current.canTeach) ? current.canTeach : [];
  const otherTeach = Array.isArray(other.canTeach) ? other.canTeach : [];
  const otherWant = Array.isArray(other.wantLearn) ? other.wantLearn : [];

  const wl = new Set(currentWant.map(s => (s?.skill || '').toLowerCase()).filter(Boolean));
  const ct = new Set(currentTeach.map(s => (s?.skill || '').toLowerCase()).filter(Boolean));
  let score = 0;
  otherTeach.forEach(s => { const name = (s?.skill || '').toLowerCase(); if (name && wl.has(name)) score += 5; });
  otherWant.forEach(s => { const name = (s?.skill || '').toLowerCase(); if (name && ct.has(name)) score += 2; });
  // slight boost if categories overlap (future extension)
  const myTeachCats = new Set(currentTeach.map(s=>s.category).filter(Boolean));
  const theirTeachCats = new Set(otherTeach.map(s=>s.category).filter(Boolean));
  for (const c of theirTeachCats) { if (myTeachCats.has(c)) { score += 1; break; } }
  return score;
}

export function getMatches(current, users = []) {
  if (!current || !Array.isArray(users)) return [];
  // Prefer enriched current user from the users directory (includes skills) if available
  const currentEnriched = users.find(u => u && u.id === current.id) || current;
  return users
    .filter(u => u && u.id !== currentEnriched.id)
    .map(u => ({ user: u, score: computeMatchScore(currentEnriched, u) }))
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);
}
