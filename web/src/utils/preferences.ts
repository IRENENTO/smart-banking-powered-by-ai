export type Theme = 'dark' | 'light';
export type Lang = 'EN' | 'FR' | 'RW';

export function getTheme(): Theme {
  return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
}

export function setTheme(next: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', next === 'dark');
  root.classList.toggle('light', next === 'light');
  localStorage.setItem('theme', next);
  window.dispatchEvent(new CustomEvent('pref:theme', { detail: next }));
}

export function getLang(): Lang {
  const raw = localStorage.getItem('lang');
  if (raw === 'FR' || raw === 'RW' || raw === 'EN') return raw;
  return 'EN';
}

export function setLang(next: Lang) {
  localStorage.setItem('lang', next);
  window.dispatchEvent(new CustomEvent('pref:lang', { detail: next }));
}

