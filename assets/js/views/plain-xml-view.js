define([
  "jquery", "underscore", "backbone", "templates/snippet/xml/snippet-xml-templates"
  , "bootstrap"
], function(
  $, _, Backbone, _snippetXmlTemplates

){
  return Backbone.View.extend({
    initialize: function(){
      this.template = _.template(_snippetXmlTemplates[this.model.get("title")])
    }
    , renderXML: function() {
      var that = this;
      return that.template(this.model.attributes);
    }
  });
});
