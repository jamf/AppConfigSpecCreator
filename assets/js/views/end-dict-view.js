define([
  "jquery", "underscore", "backbone"
  , "bootstrap", "text!templates/app/end-dict-template.html"
], function(
  $, _, Backbone, EndDictTemplate
){
  return Backbone.View.extend({
    tagName: "div"
    , className: "component" 
    , initialize: function(){
      this.template = _.template(EndDictTemplate)
    }
    , renderXML: function() {
      var that = this;
      return that.template();
    }
  });
});
