// Basic matching algorithm (Phase 1)
// Score based on intersection of my wantLearn with their canTeach and vice versa
export function computeMatchScore(current, other) {
  if (!current || !other || current.id === other.id) return 0;
  const wl = new Set(current.wantLearn.map(s => s.skill.toLowerCase()));
  const ct = new Set(current.canTeach.map(s => s.skill.toLowerCase()));
  let score = 0;
  other.canTeach.forEach(s => { if (wl.has(s.skill.toLowerCase())) score += 5; });
  other.wantLearn.forEach(s => { if (ct.has(s.skill.toLowerCase())) score += 2; });
  // slight boost if categories overlap (future extension)
  const myTeachCats = new Set(current.canTeach.map(s=>s.category).filter(Boolean));
  const theirTeachCats = new Set(other.canTeach.map(s=>s.category).filter(Boolean));
  for (const c of theirTeachCats) { if (myTeachCats.has(c)) { score += 1; break; } }
  return score;
}

export function getMatches(current, users) {
  return users
    .filter(u => u.id !== current.id)
    .map(u => ({ user: u, score: computeMatchScore(current, u) }))
    .filter(m => m.score > 0)
    .sort((a,b) => b.score - a.score);
}
