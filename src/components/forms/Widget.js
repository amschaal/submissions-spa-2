import _ from 'lodash'

export class Widget {
  defaultValue = null
  constructor (variable, options) {
    this.variable = variable
    this.options = options || {}
  }
  static schema = [
    // {'variable': 'test', 'label': 'Test', 'type': 'text'}
  ]
  static name = null
  static description = null
  /*
  static schema = {
                      'required': [
                        'organism'
                      ],
                      'order': [
                        'organism',
                        'extra_pipeline'
                      ],
                      'properties': {
                        'extra_pipeline': {
                          'validators': [],
                          'unique': false,
                          'enum': [
                            'Special pipeline A',
                            'Special pipeline B',
                            'Special pipeline C'
                          ],
                          'type': 'string',
                          'title': 'Pipeline'
                        },
                        'organism': {
                          'unique': false,
                          'type': 'string',
                          'title': 'Organism name'
                        }
                      }
                    }
  */
  getType () {
    return this.type
  }
  validate () {
    // TODO: use JSON schema to validate this.options against schema
    return true
  }
  getOptions () {
    // return _.merge(this.options, {'stack-label': this.variable.schema.title || this.variable.variable})
    return _.merge(this.options, {})
  }
  getDefault () {
    return this.defaultValue
  }
  formatValue (value, defaultValue) {
    if (value instanceof Array) {
      return value.join(', ')
    }
    return !value && defaultValue ? defaultValue : value
  }
  validateOptions (options, field, schema) {
    console.log('validateOptions', options, field, schema)
    return {} // return dictionary of errors for options
  }
}

export class WidgetFactory {
  constructor (widgets, enumDefault, multipleDefault) {
    this.widgets = widgets
    this.type_lookup = {}
    this.defaults = {}
    this.lookup = {}
    var self = this
    widgets.forEach(function (widget, index) {
      if (!self.type_lookup[widget.type]) {
        self.type_lookup[widget.type] = []
      }
      self.type_lookup[widget.type].push(widget)
      self.lookup[widget.id] = widget
      if (widget.default) {
        self.defaults[widget.type] = widget
      }
    })
    if (enumDefault) {
      self.defaults['enum'] = enumDefault
    }
    if (multipleDefault) {
      self.defaults['multiple'] = multipleDefault
    }
  }
  getWidgetSchema (id) {
    return this.lookup[id] ? this.lookup[id].schema : {}
  }
  getWidget (id, type, definition) {
    // console.log('getWidget', id, type, this.lookup, definition)
    if (id && this.lookup[id]) {
      return this.lookup[id]
    }
    if (definition && definition.enum) {
      if (definition.multiple && this.defaults['multiple']) {
        return this.defaults['multiple']
      }
      if (this.defaults['enum']) {
        return this.defaults['enum']
      }
    }
    if (type && this.defaults[type]) {
      return this.defaults[type]
    }
    return this.defaults['string']
  }
  getWidgets (type) {
    if (!type || !this.type_lookup[type]) {
      return []
    }
    return this.type_lookup[type].map(widget => ({ label: widget.name, value: widget.id }))
  }
}
