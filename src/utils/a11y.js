// Accessibility helpers.
//
// Quasar's QEditor renders its toolbar buttons (bold, italic, undo, …) as
// icon-only controls with no accessible name, which fails WCAG 4.1.2
// (axe: aria-command-name). There is no per-button config for the built-in
// commands, so we label them after render from their material-icon name.
//
// Usage: add v-editor-a11y to a <q-editor>. Registered globally in
// boot/filters.js.

const ICON_LABELS = {
  format_bold: 'Bold',
  format_italic: 'Italic',
  strikethrough_s: 'Strikethrough',
  format_underlined: 'Underline',
  vertical_align_bottom: 'Subscript',
  vertical_align_top: 'Superscript',
  format_quote: 'Quote',
  format_list_bulleted: 'Bulleted list',
  format_list_numbered: 'Numbered list',
  format_indent_decrease: 'Decrease indent',
  format_indent_increase: 'Increase indent',
  format_clear: 'Clear formatting',
  remove: 'Horizontal rule',
  undo: 'Undo',
  redo: 'Redo',
  fullscreen: 'Toggle fullscreen',
  fullscreen_exit: 'Exit fullscreen',
  code: 'View source',
  link: 'Insert link',
  print: 'Print'
}

// The visible text of a button, excluding any icon ligature text. Empty means
// the button is icon-only and needs an accessible name.
function labelText (btn) {
  const clone = btn.cloneNode(true)
  clone.querySelectorAll('.q-icon, i.material-icons').forEach((i) => i.remove())
  return clone.textContent.trim()
}

function labelToolbarButtons (el) {
  el.querySelectorAll('.q-editor__toolbar .q-btn').forEach((btn) => {
    if (btn.getAttribute('aria-label') || labelText(btn)) {
      return
    }
    const icon = btn.querySelector('.q-icon')
    const name = icon && icon.textContent.trim()
    if (name && ICON_LABELS[name]) {
      // Some editor buttons render as a roleless <a>, where aria-label is
      // prohibited. They are buttons functionally, so give them the role too.
      if (!btn.hasAttribute('role')) {
        btn.setAttribute('role', 'button')
      }
      btn.setAttribute('aria-label', ICON_LABELS[name])
    }
  })
}

export const editorA11y = {
  mounted (el) {
    // The toolbar renders with the editor; defer a frame so it's in the DOM.
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => labelToolbarButtons(el))
    } else {
      labelToolbarButtons(el)
    }
  },
  updated (el) {
    labelToolbarButtons(el)
  }
}

export default editorA11y
