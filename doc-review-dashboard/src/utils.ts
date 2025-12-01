
export function fmtDate(s?: string | null) {
  if (!s) return '-'
  try { return new Date(s).toLocaleString() } catch { return String(s) }
}

export function cls(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(' ')
}
