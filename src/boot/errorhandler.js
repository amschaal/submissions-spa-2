import { Notify } from 'quasar'

// Global error safety net.
//
// Vue 3 routes uncaught errors from render, lifecycle hooks, watchers and
// (v-on) event handlers through app.config.errorHandler. Without this, such an
// error leaves the dev-server overlay in development and a silently broken UI
// in production. We log every error centrally and, in production, show a
// non-blocking toast so the user gets feedback instead of a frozen screen.
//
// In development we re-throw so the webpack-dev-server overlay still surfaces
// the full stack — that overlay is how we catch regressions while building.
export default ({ app }) => {
  app.config.errorHandler = (err, instance, info) => {
    // `info` is the Vue-specific phase, e.g. "render" or "mounted hook".
    console.error(`[App error] (${info})`, err)

    Notify.create({
      type: 'negative',
      message: 'An unexpected error occurred.',
      caption: (err && err.message) ? err.message : undefined,
      timeout: 6000,
      // Group identical errors so a repeating failure shows a counter badge
      // rather than spamming a stack of toasts.
      group: (err && err.message) ? err.message : 'app-error',
      actions: [{ icon: 'close', color: 'white', round: true, 'aria-label': 'Dismiss' }]
    })

    if (process.env.DEV) {
      throw err
    }
  }

  // Errors that escape Vue entirely — e.g. an unawaited promise rejection in
  // async code outside a Vue context. Log for visibility; don't toast, to
  // avoid noise from background rejections that are handled elsewhere.
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[Unhandled promise rejection]', event && event.reason)
    })
  }
}
