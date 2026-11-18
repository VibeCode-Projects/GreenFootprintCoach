export function formatCarbon(kg) {
  if (kg === null || kg === undefined) return '0.00 kg';
  const val = Number(kg);
  if (val >= 1000) {
    return `${(val / 1000).toFixed(2)} t`; // tons
  }
  return `${val.toFixed(2)} kg`;
}

export function formatEcoPoints(pts) {
  if (!pts) return '0 pts';
  return `${Number(pts).toLocaleString()} pts`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getEcoScoreColor(score) {
  if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  if (score >= 60) return { text: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' };
  if (score >= 40) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
  return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' };
}
