
/**
 *  class Dataset.Table < Dataset.Base
 *  includes Krang.Mixin.Configurable
**/
Dataset.Table = Class.create(Dataset.Base, Krang.Mixin.Configurable, {
  /**
   *  new Dataset.Table(element, options)
  **/
  initialize: function($super, name, element, options) {
    $super(name);
    this.element = $(element);
    this.setOptions(options);
    var opt = this.options;
    
    if (opt.hideTable) this.element.hide();
    
    this.labels = this.element.select(opt.labels).map( function(node) {
      return opt.labelFilter(node.innerHTML);
    });
    this.values = this.element.select(opt.values).map( function(node) {
      return opt.valueFilter(node.innerHTML);
    });    
  }
});


Object.extend(Dataset.Table, {
  DEFAULT_OPTIONS: {
    hideTable: true,
    
    labels: 'tbody > tr > td:first-child',
    values: 'tbody > tr > td:last-child',
    
    labelFilter: function(text) {
      return text.strip();
    },
    valueFilter: function(text) {
      return Number(text.strip());
    }
  }
});