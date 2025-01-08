import _ from 'lodash'
import {Widget, WidgetFactory} from './Widget.js'
import DateComponent from '../editors/DateComponent.vue'
import TextAreaComponent from '../editors/TextAreaComponent.vue'

class TextWidget extends Widget {
  static type = 'string'
  static id = 'input'
  static component = 'q-input'
  static name = 'Text input'
  static default = true
}

class TextAreaWidget extends Widget {
  // @TODO: wrap this in another component as in the guide https://quasar-framework.org/components/autocomplete.html
  static type = 'string'
  static id = 'textarea'
  static component = TextAreaComponent
  static name = 'Text Area'
}

class WYSIWYGWidget extends Widget {
  static type = 'string'
  static id = 'wysiwyg'
  static component = 'q-editor'
  static name = 'WYSIWYG'
  defaultValue = ''
}

class DateWidget extends Widget {
  // @TODO: wrap this in another component as in the guide https://quasar-framework.org/components/autocomplete.html
  static type = 'string'
  static id = 'date'
  static component = DateComponent
  static name = 'Date'
  static schema =
    [
      {'variable': 'foo', 'label': 'Foo', 'type': 'text'},
      {'variable': 'bar', 'label': 'Bar', 'type': 'text', 'options': [{'label': 'One', 'value': 1}, {'label': 'Two', 'value': 2}]}
    ]
}

class CheckboxWidget extends Widget {
  static type = 'boolean'
  static id = 'checkbox'
  static component = 'q-checkbox'
  static name = 'Checkbox'
  static default = true
  defaultValue = false
}

class EnumWidget extends Widget {
  defaultValue = []
  getOptions () {
    return _.merge(this.options, this.getSelectOptions())
  }
  getSelectOptions () {
    const options = this.variable.schema.enum || []
    return {options: options.map(function (val) { return {'label': val, 'value': val} })}
  }
}

class ChipsWidget extends EnumWidget {
  static type = 'string'
  static id = 'chips'
  static component = 'q-select'
  static name = 'Chips Input'

  getOptions () {
    return _.merge(this.options, this.getSelectOptions(), {label: 'radio', 'use-input': true, 'use-chips': true, multiple: true, 'hide-dropdown-icon': true, 'input-debounce': '0', 'new-value-mode': 'add'})
  }
}
class SelectWidget extends EnumWidget {
  static type = 'string'
  static id = 'select'
  static component = 'q-select'
  static name = 'Select Input'
  // static schema = {
  // }
  getOptions () {
    return _.merge(this.options, this.getSelectOptions(), {clearable: true, outlined: true})
  }
}
class RadioWidget extends EnumWidget {
  defaultValue = null
  static type = 'string'
  static id = 'radio'
  static component = 'q-option-group'
  static name = 'Radio Select'
  // static schema = {
  // }
  getOptions () {
    return _.merge(this.options, this.getSelectOptions(), {type: 'radio', inline: true})
  }
}
class MultiCheckboxWidget extends RadioWidget {
  defaultValue = []
  static id = 'multicheck'
  static name = 'Multi Checkbox'
  // static schema = {
  // }
  getOptions () {
    return _.merge(this.options, this.getSelectOptions(), {type: 'checkbox', inline: true})
  }
}

// class AutocompleteWidget extends EnumWidget {
//   // @TODO: wrap this in another component as in the guide https://quasar-framework.org/components/autocomplete.html
//   static type = 'string'
//   static id = 'autocomplete'
//   static component = 'q-autocomplete'
//   static name = 'Autocomplete'
//   // static schema = {
//   // }
//   getStaticData () {
//     var staticData = this.variable.schema.enum || []
//     return {field: 'value', list: staticData.map(function (val) { return {'label': val, 'value': val} })}
//   }
//   getOptions () {
//     return _.merge(this.options, {'static-data': this.getStaticData(), clearable: true})
//   }
// }
class MultiSelectWidget extends SelectWidget {
  static id = 'multi-select'
  static component = 'q-select'
  static name = 'MultiSelect'
  getOptions () {
    return _.merge(this.options, this.getSelectOptions(), {multiple: true, clearable: true})
  }
}

// class VocabularyWidget extends Widget {
//   // @TODO: wrap this in another component as in the guide https://quasar-framework.org/components/autocomplete.html
//   static type = 'string'
//   static id = 'vocabulary'
//   static component = VocabularyComponent
//   static name = 'Vocabulary Autocomplete'
//   static description = 'Auto complete terms based on a configured vocabulary.'
//   static schema =
//   [
//     {'variable': 'vocabulary', 'label': 'Vocabulary ID', 'type': 'text'},
//     {'variable': 'vocabulary_variable', 'label': 'Variable specifying vocabulary', 'type': 'text'}
//     // {'variable': 'bar', 'label': 'Bar', 'type': 'text', 'options': [{'label': 'One', 'value': 1}, {'label': 'Two', 'value': 2}]}
//   ]
//   static getSchema (schema, vue) {
//     console.log('getSchema', schema, vue, this.schema)
//     var _schema = this.schema
//     if (vue) {
//       _schema[0].enum = vue.$store.getters.vocabularies
//     }
//     return _schema
//   }
//   validateOptions (options, field, schema) {
//     console.log('hello!!!', options, field, schema)
//     var errors = {}
//     if (options.vocabulary_variable && !schema.properties[options.vocabulary_variable]) {
//       errors['vocabulary_variable'] = [`Variable "${options.vocabulary_variable}" does not exist.`]
//     }
//     if (!options.vocabulary_variable && !options.vocabulary) {
//       errors['vocabulary_variable'] = errors['vocabulary'] = ['You must enter either a vocabulary id, or a variable name where the vocabulary id will be selected.']
//     }
//     return errors
//   }
//   getOptions () {
//     return _.merge(this.options, this.getSelectOptions())
//   }
//   getSelectOptions () {
//     var options = this.variable.schema.enum || []
//     return {options: options.map(function (val) { return {'label': val, 'value': val} })}
//   }
// }

const widgetFactory = new WidgetFactory([TextWidget, TextAreaWidget, WYSIWYGWidget, ChipsWidget, SelectWidget, MultiSelectWidget, CheckboxWidget, RadioWidget, MultiCheckboxWidget, DateWidget], SelectWidget, MultiSelectWidget)
// export {MultiSelectWidget}
export default widgetFactory
