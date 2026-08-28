// Helpers for exporting a table (list-of-objects) to xlsx via
// /api/tables/template/. Shared by the samplesheet grid's "Export xlsx"
// button (which sends the live schema + in-progress rows) and the
// submission view's standalone "Export" link (which sends just the
// submission id + table variable and lets the server use the saved rows).

function sanitize (part) {
  return String(part).replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '')
}

function timestamp () {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

const EXTENSIONS = { xlsx: 'xlsx', csv: 'csv', tsv: 'tsv' }

// table_<SUBMISSION_ID>_<PROJECT_ID>_<TABLE_VARIABLE>_<TIMESTAMP>.<ext>
// Submission id and project id (internal_id) are omitted when absent (an
// unsaved draft, or a project id not yet assigned). The table name falls back
// through variable -> schema title -> type name; when none is known it is
// dropped so the name never degrades to "table_table_...".
export function tableExportFilename ({ submission, variable, title, typeName, format } = {}) {
  const tableName = variable || title || typeName || null
  const parts = [
    'table',
    submission && submission.id,
    submission && submission.internal_id,
    tableName,
    timestamp()
  ]
  return parts.filter(Boolean).map(sanitize).join('_') + '.' + (EXTENSIONS[format] || 'xlsx')
}

// The three supported formats, for building menu items in the UI.
export const TABLE_FORMATS = [
  { format: 'xlsx', label: 'Excel (.xlsx)', accept: '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { format: 'csv', label: 'CSV (.csv)', accept: '.csv,text/csv' },
  { format: 'tsv', label: 'TSV (.tsv)', accept: '.tsv,text/tab-separated-values,text/plain' }
]

// Trigger a browser download of a Blob under the given filename.
export function downloadBlob (blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
