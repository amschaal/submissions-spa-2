import schema from '../assets/schema/schema.js'

export default ({ app }) => {
  app.config.globalProperties.$schema = schema
}

export { schema }
