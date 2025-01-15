import schema from '../assets/schema/schema.js'
import { boot } from 'quasar/wrappers'
export default boot(({ app }) => {
  app.config.globalProperties.$schema = schema
})
export { schema }
