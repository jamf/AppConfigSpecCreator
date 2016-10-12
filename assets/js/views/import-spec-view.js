define([
       "jquery", "underscore", "backbone"
       , "helper/pubsub", "text!templates/app/import-spec-template.html"
], function(
  $, _, Backbone
  , PubSub, _importSpecTemplate
){
  return Backbone.View.extend({    
    tagName: "div",
    el: "#importSpec",
    initialize: function() {
      this.importSpecTemplate = _.template(_importSpecTemplate);
      this.render();
    },
    render: function(locale) {
      this.$el.append(this.importSpecTemplate());
      $("#specImport").change(function(){
        importFile(this);
      });
      function importFile(input) {
        if (input.files && input.files[0]) {
          var reader = new FileReader();
          reader.onload = function (e) {
              PubSub.trigger("initForm", e.target.result);
          }
          reader.readAsText(input.files[0]);
        }
      }
    }, 
    events:{
      "click #importSpecButton": "importFile"
    },
    importFile: function() {
      PubSub.trigger("importFile");
    }
    
  });
});
