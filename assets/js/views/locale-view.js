define([
       "jquery", "underscore", "backbone"
       , "models/locale-model", "helper/pubsub", "text!templates/app/locale-template.html"
], function(
  $, _, Backbone
  , LocaleModel, PubSub, _localeTemplate
){
  return Backbone.View.extend({    
    el: "#localeInput",
    initialize: function() {
      this.localeTemplate = _.template(_localeTemplate);
    },
    render: function(locale) {
      this.$el.append(this.localeTemplate(this.model.attributes));
    }, 
    events:{
      "click .languageRemovalButton": "localeRemove"
    },
    localeRemove: function(e) {
      var id = $(e.currentTarget).data("id");
      if (id == "remove" + this.model.attributes.value) {
        this.model.destroy();
      }

      // Todo - Update collection
    }
  });
});
