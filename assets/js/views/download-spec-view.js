define([
       "jquery", "underscore", "backbone"
       , "helper/pubsub", "text!templates/app/download-spec-template.html"
], function(
  $, _, Backbone
  , PubSub, _downloadSpecTemplate
){
  return Backbone.View.extend({    
    tagName: "div",
    el: "#downloadSpec",
    initialize: function() {
      this.downloadSpecTemplate = _.template(_downloadSpecTemplate);
      this.render();
    },
    render: function(locale) {
      this.$el.append(this.downloadSpecTemplate());
    }, 
    events:{
      "click #downloadSpecButton": "downloadSpec"
    },
    downloadSpec: function() {
      PubSub.trigger("downloadSpec");
    }
    
  });
});
