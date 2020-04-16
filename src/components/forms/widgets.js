import _ from 'lodash'
import {Widget, WidgetFactory} from './Widget.js'
import DateComponent from '../editors/DateComponent.vue'

class TextWidget extends Widget {
  static type = 'string'
  static id = 'input'
  static component = 'q-input'
  static name = 'Text input'
  static default = true
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
    var options = this.variable.schema.enum || []
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
    return _.merge(this.options, this.getSelectOptions(), {clearable: true})
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

var widgetFactory = new WidgetFactory([TextWidget, WYSIWYGWidget, ChipsWidget, SelectWidget, MultiSelectWidget, CheckboxWidget, RadioWidget, MultiCheckboxWidget, DateWidget], SelectWidget, MultiSelectWidget)
// export {MultiSelectWidget}
export default widgetFactory
