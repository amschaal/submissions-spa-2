import DOMPurify from 'dompurify'

// Force external links opened from sanitized HTML to be safe: add
// target="_blank" + rel="noopener noreferrer" so admin-authored content can't
// reverse-tabnab or hijack the opener.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('href')) {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

// Allowlist tuned to what the q-editor (lab/institution home pages, submission
// help, schema help) and the jsondiffpatch formatter produce: text formatting,
// links, lists, tables, images. Scripts, event handlers, iframes/embeds, and
// <style>/<form> are stripped (USE_PROFILES.html already excludes them, and we
// do not add them back).
const config = {
  ALLOWED_TAGS: [
    'a', 'b', 'i', 'u', 's', 'em', 'strong', 'small', 'sub', 'sup', 'mark',
    'p', 'br', 'hr', 'div', 'span', 'blockquote', 'pre', 'code',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    'img', 'figure', 'figcaption'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'target', 'rel',
    'src', 'alt', 'width', 'height',
    'class', 'style', 'colspan', 'rowspan', 'align'
  ],
  // Only allow http(s), mailto and data:image URLs (no javascript: etc.)
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i
}

export function sanitize (html) {
  if (html === undefined || html === null) {
    return ''
  }
  return DOMPurify.sanitize(String(html), config)
}

// Vue 3 custom directive: a drop-in replacement for v-html that sanitizes
// first. Use as v-safe-html="someHtmlString".
export const safeHtml = {
  mounted (el, binding) {
    el.innerHTML = sanitize(binding.value)
  },
  updated (el, binding) {
    if (binding.value !== binding.oldValue) {
      el.innerHTML = sanitize(binding.value)
    }
  }
}

export default sanitize
