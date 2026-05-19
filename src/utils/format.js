export function formatVisitors(n) {
  if (!n) return '-';
  const man = n / 10000;
  return `${man % 1 === 0 ? man : man.toFixed(1)}만 명`;
}

export function shortAddress(address) {
  if (!address) return '';
  const parts = address.split(' ');
  const result = [parts[0]];
  for (let i = 1; i < Math.min(parts.length, 4); i++) {
    if (/[시군구읍면]$/.test(parts[i])) result.push(parts[i]);
    else break;
  }
  return result.join(' ');
}
