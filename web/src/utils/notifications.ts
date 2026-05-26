export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function calculateProfileLevel(user: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}): { level: number; label: string } {
  const fields = [user.name, user.email, user.phone, user.address].filter(Boolean).length;
  const pct = Math.round((fields / 4) * 100);
  if (pct <= 25) return { level: 1, label: 'Beginner' };
  if (pct <= 50) return { level: 2, label: 'Intermediate' };
  if (pct <= 75) return { level: 3, label: 'Advanced' };
  return { level: 4, label: 'Complete' };
}
