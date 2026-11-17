// Where to send someone after signing in.  The value comes from the URL
// (?next=...), so only a path inside this app is accepted: it must start
// with a single "/" and may not point back at the sign-in page.
export function safeNext (value) {
  if (typeof value !== 'string' || value.length === 0) {
    return '/'
  }
  if (value[0] !== '/' || value[1] === '/' || value[1] === '\\') {
    return '/'
  }
  if (value === '/login' || value.startsWith('/login?') || value.startsWith('/login/')) {
    return '/'
  }
  return value
}
