// UC Davis Finjector (https://finjector.ucdavis.edu) looks up and builds Aggie Enterprise chartstrings.
// Its script adds window.Finjector.findChartSegmentString(), which opens Finjector in a popup and
// resolves with {status: 'success', data: <chartstring>} once one is chosen.
const SCRIPT_URL = 'https://finjector.ucdavis.edu/finjector.js?v=1'
let loading = null

export function loadFinjector () {
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SCRIPT_URL
      script.onload = () => resolve(window.Finjector)
      script.onerror = () => {
        script.remove()
        loading = null // try again next time
        reject(new Error('Unable to load Finjector'))
      }
      document.head.appendChild(script)
    })
  }
  return loading
}
