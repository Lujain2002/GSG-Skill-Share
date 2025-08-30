const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function validateEmail(v){
  if(!v) return 'Email required';
  if(!EMAIL_RE.test(v)) return 'Invalid email format';
  return '';
}
export function validatePassword(v){
  if(!v) return 'Password required';
  if(v.length < 6) return 'Min 6 characters';
  if(!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Use letters & numbers';
  return '';
}
export function validateName(v){
  if(!v) return 'Name required';
  if(v.trim().length < 2) return 'Too short';
  return '';
}
export function validateSkill(v){
  if(!v) return 'Skill required';
  if(v.length > 40) return 'Max 40 chars';
  return '';
}
