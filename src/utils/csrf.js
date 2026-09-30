// Django's CSRF token, read from the csrftoken cookie that /api/get_user/
// (ensure_csrf_cookie) sets when the app boots.  The axios instance sends it
// on its own; this is for requests that bypass axios (native form posts,
// QUploader).
export function getCsrfToken () {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}
