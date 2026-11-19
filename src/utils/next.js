// Where to send someone after signing in.  The value comes from the URL
// (?next=...), so only a location inside this app is accepted: it is parsed
// the way the browser will parse it and must stay on this origin.  Anything
// else, and the sign-in page itself, becomes '/'.
export function safeNext (value) {
  if (typeof value !== 'string' || value.length === 0) {
    return '/'
  }
  // Browsers drop tabs and newlines from a URL and read "\" as "/", so a value
  // containing them does not go where it appears to.  A plain path has none.
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) <= 0x20 || value[i] === '\\') {
      return '/'
    }
  }
  if (value[0] !== '/' || value[1] === '/') {
    return '/'
  }
  let url
  try {
    url = new URL(value, window.location.origin)
  } catch (e) {
    return '/'
  }
  if (url.origin !== window.location.origin) {
    return '/'
  }
  if (url.pathname === '/login' || url.pathname.indexOf('/login/') === 0) {
    return '/'
  }
  // The parser has resolved "." and ".." segments, which can leave a path that
  // begins with "//"; used as a link that would name another host.
  const path = url.pathname + url.search + url.hash
  if (path[0] !== '/' || path[1] === '/') {
    return '/'
  }
  return path
}
