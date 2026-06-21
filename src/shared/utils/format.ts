export function fmtNumber(n: number): string {
  return n.toLocaleString('ru-RU');
}

export function fmtPrice(n: number): string {
  return n.toLocaleString('ru-RU');
}

export function fmtHours(n: number): string {
  return `${n} ч`;
}

export function fmtRating(n: number): string {
  return n % 1 === 0 ? n.toFixed(1) : n.toFixed(1);
}
